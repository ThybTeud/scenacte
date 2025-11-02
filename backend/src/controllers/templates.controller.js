import { PrismaClient } from '@prisma/client';
import { validateUUID } from '../utils/validation.js';
import { validateTemplateSettings } from '../services/pdf.service.js';
import { 
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ValidationError 
} from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * GET /api/templates
 * Liste des templates de l'utilisateur connecté
 */
export async function listTemplates(req, res, next) {
  try {
    const userId = req.user.id;
    const { playId } = req.query;

    // Construction du filtre
    const where = {
      OR: [
        { userId }, // Templates de l'utilisateur
        { userId: null, playId: null } // Templates globaux (si on en ajoute plus tard)
      ]
    };

    // Filtre optionnel par pièce
    if (playId) {
      const idValidation = validateUUID(playId);
      if (!idValidation.valid) {
        throw new ValidationError('playId invalide');
      }

      // Vérifier que la pièce appartient à l'utilisateur
      const play = await prisma.play.findUnique({
        where: { id: playId },
        select: { userId: true }
      });

      if (play && play.userId !== userId) {
        throw new ForbiddenError('Accès non autorisé à cette pièce');
      }

      where.playId = playId;
    }

    // Récupération des templates
    const templates = await prisma.exportTemplate.findMany({
      where,
      select: {
        id: true,
        name: true,
        isDefault: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        playId: true,
        play: playId ? {
          select: {
            title: true
          }
        } : false
      },
      orderBy: [
        { isDefault: 'desc' }, // Templates par défaut en premier
        { createdAt: 'desc' }
      ]
    });

    res.json({ templates });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/templates
 * Créer un nouveau template
 */
export async function createTemplate(req, res, next) {
  try {
    const { name, settings, isDefault = false, playId } = req.body;
    const userId = req.user.id;

    // Validation du nom
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Nom du template requis');
    }

    if (name.trim().length > 100) {
      throw new ValidationError('Nom du template trop long (max 100 caractères)');
    }

    // Validation des settings
    if (!validateTemplateSettings(settings)) {
      throw new ValidationError('Configuration du template invalide');
    }

    // Si playId fourni, vérifier que la pièce appartient à l'utilisateur
    if (playId) {
      const idValidation = validateUUID(playId);
      if (!idValidation.valid) {
        throw new ValidationError('playId invalide');
      }

      const play = await prisma.play.findUnique({
        where: { id: playId },
        select: { userId: true }
      });

      if (!play) {
        throw new NotFoundError('Pièce non trouvée');
      }

      if (play.userId !== userId) {
        throw new ForbiddenError('Accès non autorisé à cette pièce');
      }
    }

    // Si isDefault=true, retirer le défaut des autres templates
    if (isDefault) {
      await prisma.exportTemplate.updateMany({
        where: {
          userId,
          playId: playId || null,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    // Création du template
    const template = await prisma.exportTemplate.create({
      data: {
        userId,
        playId: playId || null,
        name: name.trim(),
        settings,
        isDefault
      }
    });

    res.status(201).json({ 
      template,
      message: 'Template créé avec succès'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/templates/:id
 * Récupérer un template spécifique
 */
export async function getTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Récupération du template
    const template = await prisma.exportTemplate.findUnique({
      where: { id },
      include: {
        play: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!template) {
      throw new NotFoundError('Template non trouvé');
    }

    // Vérification ownership (templates globaux accessibles à tous)
    if (template.userId && template.userId !== userId) {
      throw new ForbiddenError('Accès non autorisé à ce template');
    }

    res.json({ template });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/templates/:id
 * Modifier un template
 */
export async function updateTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const { name, settings, isDefault } = req.body;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Vérifier que le template existe et appartient à l'utilisateur
    const existingTemplate = await prisma.exportTemplate.findUnique({
      where: { id },
      select: { id: true, userId: true, playId: true }
    });

    if (!existingTemplate) {
      throw new NotFoundError('Template non trouvé');
    }

    if (existingTemplate.userId !== userId) {
      throw new ForbiddenError('Accès non autorisé à ce template');
    }

    // Données à mettre à jour
    const updateData = {};

    // Mise à jour du nom
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new ValidationError('Nom du template invalide');
      }

      if (name.trim().length > 100) {
        throw new ValidationError('Nom du template trop long (max 100 caractères)');
      }

      updateData.name = name.trim();
    }

    // Mise à jour des settings
    if (settings !== undefined) {
      if (!validateTemplateSettings(settings)) {
        throw new ValidationError('Configuration du template invalide');
      }

      updateData.settings = settings;
    }

    // Mise à jour du défaut
    if (isDefault !== undefined) {
      if (typeof isDefault !== 'boolean') {
        throw new ValidationError('isDefault doit être un booléen');
      }

      // Si on met ce template en défaut, retirer le défaut des autres
      if (isDefault === true) {
        await prisma.exportTemplate.updateMany({
          where: {
            userId,
            playId: existingTemplate.playId,
            isDefault: true,
            id: { not: id } // Exclure le template actuel
          },
          data: {
            isDefault: false
          }
        });
      }

      updateData.isDefault = isDefault;
    }

    // Si aucune donnée à mettre à jour
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('Aucune modification fournie');
    }

    // Mise à jour
    const updatedTemplate = await prisma.exportTemplate.update({
      where: { id },
      data: updateData
    });

    res.json({
      template: updatedTemplate,
      message: 'Template mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/templates/:id
 * Supprimer un template
 */
export async function deleteTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Vérifier que le template existe et appartient à l'utilisateur
    const template = await prisma.exportTemplate.findUnique({
      where: { id },
      select: { id: true, userId: true, name: true }
    });

    if (!template) {
      throw new NotFoundError('Template non trouvé');
    }

    if (template.userId !== userId) {
      throw new ForbiddenError('Accès non autorisé à ce template');
    }

    // Suppression
    await prisma.exportTemplate.delete({
      where: { id }
    });

    console.log('[TEMPLATE] Template supprimé:', template.name, 'par', req.user.username);

    res.json({
      message: 'Template supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
}