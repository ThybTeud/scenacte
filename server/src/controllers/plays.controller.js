import { PrismaClient } from '@prisma/client';
import { 
  validateTitle, 
  validateContent, 
  validateUUID,
  validatePlayStatus,
  validatePagination,
  validateStatistics
} from '../utils/validation.js';
import { 
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ValidationError 
} from '../middleware/errorHandler.js';
import { config } from '../config/env.js';

const prisma = new PrismaClient();

/**
 * GET /api/plays
 * Liste des pièces de l'utilisateur connecté (paginée)
 */
export async function listPlays(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user.id;

    // Validation de la pagination
    const paginationValidation = validatePagination(page, limit);
    if (!paginationValidation.valid) {
      throw new ValidationError(paginationValidation.message);
    }

    const validatedPage = paginationValidation.page;
    const validatedLimit = paginationValidation.limit;

    // Construction du filtre
    const where = { userId };
    
    if (status) {
      const statusValidation = validatePlayStatus(status);
      if (!statusValidation.valid) {
        throw new ValidationError(statusValidation.message);
      }
      where.status = status;
    }

    // Récupération des pièces avec pagination
    const [plays, total] = await Promise.all([
      prisma.play.findMany({
        where,
        select: {
          id: true,
          title: true,
          subtitle: true,
          status: true,
          contentVersion: true,
          createdAt: true,
          updatedAt: true,
          lastEditedAt: true,
          statistics: {
            select: {
              wordCount: true,
              totalActs: true,
              totalScenes: true,
              totalCharacters: true,
              totalLines: true,
              estimatedDurationMinutes: true
            }
          }
        },
        orderBy: { lastEditedAt: 'desc' },
        skip: (validatedPage - 1) * validatedLimit,
        take: validatedLimit
      }),
      prisma.play.count({ where })
    ]);

    res.json({
      plays: plays.map(play => ({
        ...play,
        statistics: play.statistics || null
      })),
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages: Math.ceil(total / validatedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/plays
 * Créer une nouvelle pièce
 */
export async function createPlay(req, res, next) {
  try {
    const { title, subtitle, rawContent, htmlContent, statistics } = req.body;
    const userId = req.user.id;

    // Validation du titre
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      throw new ValidationError(titleValidation.message);
    }

    // Validation des contenus
    const rawValidation = validateContent(rawContent || '', config.limits.maxContentSizeBytes);
    if (!rawValidation.valid) {
      throw new ValidationError(`rawContent: ${rawValidation.message}`);
    }

    const htmlValidation = validateContent(htmlContent || '', config.limits.maxContentSizeBytes);
    if (!htmlValidation.valid) {
      throw new ValidationError(`htmlContent: ${htmlValidation.message}`);
    }

    // Validation des statistiques (optionnelles à la création)
    const stats = statistics || {
      totalActs: 0,
      totalScenes: 0,
      totalCharacters: 0,
      totalLines: 0,
      wordCount: 0,
      estimatedDurationMinutes: 0
    };

    const statsValidation = validateStatistics(stats);
    if (!statsValidation.valid) {
      throw new ValidationError(statsValidation.message);
    }

    // Calcul de la taille du fichier pour la version initiale
    const fileSizeBytes = Buffer.byteLength(rawContent || '', 'utf8') + 
                         Buffer.byteLength(htmlContent || '', 'utf8');

    // Transaction atomique : création play + version initiale + statistiques
    const play = await prisma.$transaction(async (tx) => {
      // 1. Créer la pièce
      const newPlay = await tx.play.create({
        data: {
          userId,
          title: title.trim(),
          subtitle: subtitle?.trim() || null,
          rawContent: rawContent || '',
          htmlContent: htmlContent || '',
          contentVersion: 1,
          status: 'draft',
          lastEditedAt: new Date()
        }
      });

      // 2. Créer la version initiale
      await tx.playVersion.create({
        data: {
          playId: newPlay.id,
          versionNumber: 1,
          title: newPlay.title,
          rawContent: newPlay.rawContent,
          htmlContent: newPlay.htmlContent,
          versionType: 'manual',
          manualLabel: 'Version initiale',
          fileSizeBytes,
          preservedReason: 'manual'
        }
      });

      // 3. Créer les statistiques
      await tx.playStatistics.create({
        data: {
          playId: newPlay.id,
          ...stats,
          contentVersion: 1
        }
      });

      return newPlay;
    });

    // Récupérer la pièce complète avec stats
    const fullPlay = await prisma.play.findUnique({
      where: { id: play.id },
      include: {
        statistics: true
      }
    });

    res.status(201).json({ play: fullPlay });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/plays/:id
 * Récupérer une pièce spécifique
 */
export async function getPlay(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Récupération de la pièce
    const play = await prisma.play.findUnique({
      where: { id },
      include: {
        statistics: true
      }
    });

    if (!play) {
      throw new NotFoundError('Pièce non trouvée');
    }

    // Vérification que la pièce appartient à l'utilisateur
    if (play.userId !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    res.json({ play });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/plays/:id
 * Sauvegarder (mettre à jour) une pièce
 * Crée automatiquement une nouvelle version
 */
export async function savePlay(req, res, next) {
  try {
    const { id } = req.params;
    const { title, subtitle, rawContent, htmlContent, statistics, versionType = 'auto', manualLabel } = req.body;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const existingPlay = await prisma.play.findUnique({
      where: { id },
      select: { id: true, userId: true, contentVersion: true }
    });

    if (!existingPlay) {
      throw new NotFoundError('Pièce non trouvée');
    }

    if (existingPlay.userId !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Validation du titre
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      throw new ValidationError(titleValidation.message);
    }

    // Validation des contenus
    const rawValidation = validateContent(rawContent, config.limits.maxContentSizeBytes);
    if (!rawValidation.valid) {
      throw new ValidationError(`rawContent: ${rawValidation.message}`);
    }

    const htmlValidation = validateContent(htmlContent, config.limits.maxContentSizeBytes);
    if (!htmlValidation.valid) {
      throw new ValidationError(`htmlContent: ${htmlValidation.message}`);
    }

    // Validation des statistiques
    const statsValidation = validateStatistics(statistics);
    if (!statsValidation.valid) {
      throw new ValidationError(statsValidation.message);
    }

    // Calcul de la taille
    const fileSizeBytes = Buffer.byteLength(rawContent, 'utf8') + 
                         Buffer.byteLength(htmlContent, 'utf8');

    // Récupérer le prochain numéro de version
    const maxVersion = await prisma.playVersion.aggregate({
      where: { playId: id },
      _max: { versionNumber: true }
    });

    const nextVersionNumber = (maxVersion._max.versionNumber || 0) + 1;
    const newContentVersion = existingPlay.contentVersion + 1;

    // Transaction atomique : update play + create version + upsert statistics + create version_statistics
    const updatedPlay = await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour la pièce (version courante)
      const play = await tx.play.update({
        where: { id },
        data: {
          title: title.trim(),
          subtitle: subtitle?.trim() || null,
          rawContent,
          htmlContent,
          contentVersion: newContentVersion,
          lastEditedAt: new Date()
        }
      });

      // 2. Créer une nouvelle version dans l'historique
      const version = await tx.playVersion.create({
        data: {
          playId: id,
          versionNumber: nextVersionNumber,
          title: play.title,
          rawContent,
          htmlContent,
          versionType,
          manualLabel: versionType === 'manual' ? (manualLabel || null) : null,
          fileSizeBytes,
          preservedReason: versionType === 'manual' ? 'manual' : null
        }
      });

      // 3. Upsert des statistiques de la version courante
      await tx.playStatistics.upsert({
        where: { playId: id },
        update: {
          ...statistics,
          contentVersion: newContentVersion,
          calculatedAt: new Date()
        },
        create: {
          playId: id,
          ...statistics,
          contentVersion: newContentVersion
        }
      });

      // 4. Créer les statistiques pour cette version
      await tx.versionStatistics.create({
        data: {
          versionId: version.id,
          ...statistics,
          calculatedAt: new Date()
        }
      });

      return play;
    });

    // Récupérer la pièce complète avec stats
    const fullPlay = await prisma.play.findUnique({
      where: { id },
      include: {
        statistics: true
      }
    });

    res.json({ 
      play: fullPlay,
      versionNumber: nextVersionNumber,
      message: 'Pièce sauvegardée avec succès'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/plays/:id
 * Supprimer une pièce
 */
export async function deletePlay(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const play = await prisma.play.findUnique({
      where: { id },
      select: { id: true, userId: true, title: true }
    });

    if (!play) {
      throw new NotFoundError('Pièce non trouvée');
    }

    if (play.userId !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Suppression (CASCADE supprimera automatiquement versions et stats)
    await prisma.play.delete({
      where: { id }
    });

    console.log('[PLAY] Pièce supprimée:', play.title, 'par', req.user.username);

    res.json({
      message: 'Pièce supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/plays/:id/status
 * Changer le statut d'une pièce
 */
export async function updatePlayStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Validation du statut
    const statusValidation = validatePlayStatus(status);
    if (!statusValidation.valid) {
      throw new ValidationError(statusValidation.message);
    }

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const play = await prisma.play.findUnique({
      where: { id },
      select: { id: true, userId: true }
    });

    if (!play) {
      throw new NotFoundError('Pièce non trouvée');
    }

    if (play.userId !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Mise à jour du statut
    const updatedPlay = await prisma.play.update({
      where: { id },
      data: { status },
      include: {
        statistics: true
      }
    });

    res.json({
      play: updatedPlay,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
}