import { PrismaClient } from '@prisma/client';
import { 
  validateUUID,
  validatePagination,
  validateStatistics
} from '../utils/validation.js';
import { 
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ValidationError 
} from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * GET /api/plays/:id/versions
 * Liste des versions d'une pièce (paginée)
 */
export async function listVersions(req, res, next) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Validation de la pagination
    const paginationValidation = validatePagination(page, limit);
    if (!paginationValidation.valid) {
      throw new ValidationError(paginationValidation.message);
    }

    const validatedPage = paginationValidation.page;
    const validatedLimit = paginationValidation.limit;

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

    // Construction du filtre
    const where = { playId: id };
    
    if (type) {
      if (type !== 'auto' && type !== 'manual') {
        throw new ValidationError('Type invalide (auto ou manual uniquement)');
      }
      where.versionType = type;
    }

    // Récupération des versions avec pagination
    const [versions, total] = await Promise.all([
      prisma.playVersion.findMany({
        where,
        select: {
          id: true,
          versionNumber: true,
          title: true,
          versionType: true,
          manualLabel: true,
          fileSizeBytes: true,
          preservedReason: true,
          createdAt: true,
          statistics: {
            select: {
              totalActs: true,
              totalScenes: true,
              totalCharacters: true,
              totalLines: true,
              wordCount: true,
              estimatedDurationMinutes: true
            }
          }
        },
        orderBy: { versionNumber: 'desc' },
        skip: (validatedPage - 1) * validatedLimit,
        take: validatedLimit
      }),
      prisma.playVersion.count({ where })
    ]);

    res.json({
      versions: versions.map(version => ({
        ...version,
        statistics: version.statistics || null
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
 * GET /api/plays/:id/versions/:versionId
 * Récupérer une version spécifique (avec le contenu complet)
 */
export async function getVersion(req, res, next) {
  try {
    const { id, versionId } = req.params;
    const userId = req.user.id;

    // Validation UUIDs
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    const versionIdValidation = validateUUID(versionId);
    if (!versionIdValidation.valid) {
      throw new ValidationError('ID de version invalide');
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

    // Récupérer la version complète
    const version = await prisma.playVersion.findUnique({
      where: { id: versionId },
      include: {
        statistics: true
      }
    });

    if (!version) {
      throw new NotFoundError('Version non trouvée');
    }

    // Vérifier que la version appartient bien à cette pièce
    if (version.playId !== id) {
      throw new ForbiddenError('Cette version n\'appartient pas à cette pièce');
    }

    res.json({ version });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/plays/:id/versions/restore
 * Restaurer une version (crée une nouvelle version manuelle)
 */
export async function restoreVersion(req, res, next) {
  try {
    const { id } = req.params;
    const { versionId } = req.body;
    const userId = req.user.id;

    // Validation UUIDs
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    if (!versionId) {
      throw new BadRequestError('versionId requis');
    }

    const versionIdValidation = validateUUID(versionId);
    if (!versionIdValidation.valid) {
      throw new ValidationError('ID de version invalide');
    }

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const play = await prisma.play.findUnique({
      where: { id },
      select: { id: true, userId: true, contentVersion: true }
    });

    if (!play) {
      throw new NotFoundError('Pièce non trouvée');
    }

    if (play.userId !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Récupérer la version à restaurer
    const versionToRestore = await prisma.playVersion.findUnique({
      where: { id: versionId },
      include: {
        statistics: true
      }
    });

    if (!versionToRestore) {
      throw new NotFoundError('Version à restaurer non trouvée');
    }

    // Vérifier que la version appartient bien à cette pièce
    if (versionToRestore.playId !== id) {
      throw new ForbiddenError('Cette version n\'appartient pas à cette pièce');
    }

    // Récupérer le prochain numéro de version
    const maxVersion = await prisma.playVersion.aggregate({
      where: { playId: id },
      _max: { versionNumber: true }
    });

    const nextVersionNumber = (maxVersion._max.versionNumber || 0) + 1;
    const newContentVersion = play.contentVersion + 1;

    // Calcul de la taille
    const fileSizeBytes = Buffer.byteLength(versionToRestore.rawContent, 'utf8') + 
                         Buffer.byteLength(versionToRestore.htmlContent, 'utf8');

    // Label automatique pour la restauration
    const manualLabel = `Restauré depuis version ${versionToRestore.versionNumber}`;

    // Transaction atomique : restore play + create new version + upsert stats
    const restoredPlay = await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour la pièce avec le contenu restauré
      const updatedPlay = await tx.play.update({
        where: { id },
        data: {
          title: versionToRestore.title,
          rawContent: versionToRestore.rawContent,
          htmlContent: versionToRestore.htmlContent,
          contentVersion: newContentVersion,
          lastEditedAt: new Date()
        }
      });

      // 2. Créer une nouvelle version manuelle
      const newVersion = await tx.playVersion.create({
        data: {
          playId: id,
          versionNumber: nextVersionNumber,
          title: versionToRestore.title,
          rawContent: versionToRestore.rawContent,
          htmlContent: versionToRestore.htmlContent,
          versionType: 'manual',
          manualLabel,
          fileSizeBytes,
          preservedReason: 'manual'
        }
      });

      // 3. Upsert des statistiques de la version courante
      if (versionToRestore.statistics) {
        await tx.playStatistics.upsert({
          where: { playId: id },
          update: {
            totalActs: versionToRestore.statistics.totalActs,
            totalScenes: versionToRestore.statistics.totalScenes,
            totalCharacters: versionToRestore.statistics.totalCharacters,
            totalLines: versionToRestore.statistics.totalLines,
            wordCount: versionToRestore.statistics.wordCount,
            estimatedDurationMinutes: versionToRestore.statistics.estimatedDurationMinutes,
            contentVersion: newContentVersion,
            calculatedAt: new Date()
          },
          create: {
            playId: id,
            totalActs: versionToRestore.statistics.totalActs,
            totalScenes: versionToRestore.statistics.totalScenes,
            totalCharacters: versionToRestore.statistics.totalCharacters,
            totalLines: versionToRestore.statistics.totalLines,
            wordCount: versionToRestore.statistics.wordCount,
            estimatedDurationMinutes: versionToRestore.statistics.estimatedDurationMinutes,
            contentVersion: newContentVersion
          }
        });

        // 4. Créer les statistiques pour la nouvelle version
        await tx.versionStatistics.create({
          data: {
            versionId: newVersion.id,
            totalActs: versionToRestore.statistics.totalActs,
            totalScenes: versionToRestore.statistics.totalScenes,
            totalCharacters: versionToRestore.statistics.totalCharacters,
            totalLines: versionToRestore.statistics.totalLines,
            wordCount: versionToRestore.statistics.wordCount,
            estimatedDurationMinutes: versionToRestore.statistics.estimatedDurationMinutes
          }
        });
      }

      return updatedPlay;
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
      message: `Version ${versionToRestore.versionNumber} restaurée avec succès`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/plays/:id/versions/manual
 * Créer une version manuelle (snapshot) sans modifier le contenu
 */
export async function createManualVersion(req, res, next) {
  try {
    const { id } = req.params;
    const { manualLabel } = req.body;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const play = await prisma.play.findUnique({
      where: { id },
      include: {
        statistics: true
      }
    });

    if (!play) {
      throw new NotFoundError('Pièce non trouvée');
    }

    if (play.userId !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Récupérer le prochain numéro de version
    const maxVersion = await prisma.playVersion.aggregate({
      where: { playId: id },
      _max: { versionNumber: true }
    });

    const nextVersionNumber = (maxVersion._max.versionNumber || 0) + 1;

    // Calcul de la taille
    const fileSizeBytes = Buffer.byteLength(play.rawContent, 'utf8') + 
                         Buffer.byteLength(play.htmlContent, 'utf8');

    // Transaction : créer version + statistiques
    const newVersion = await prisma.$transaction(async (tx) => {
      // 1. Créer la version manuelle
      const version = await tx.playVersion.create({
        data: {
          playId: id,
          versionNumber: nextVersionNumber,
          title: play.title,
          rawContent: play.rawContent,
          htmlContent: play.htmlContent,
          versionType: 'manual',
          manualLabel: manualLabel?.trim() || null,
          fileSizeBytes,
          preservedReason: 'manual'
        }
      });

      // 2. Créer les statistiques pour cette version
      if (play.statistics) {
        await tx.versionStatistics.create({
          data: {
            versionId: version.id,
            totalActs: play.statistics.totalActs,
            totalScenes: play.statistics.totalScenes,
            totalCharacters: play.statistics.totalCharacters,
            totalLines: play.statistics.totalLines,
            wordCount: play.statistics.wordCount,
            estimatedDurationMinutes: play.statistics.estimatedDurationMinutes
          }
        });
      }

      return version;
    });

    // Récupérer la version complète avec stats
    const fullVersion = await prisma.playVersion.findUnique({
      where: { id: newVersion.id },
      include: {
        statistics: true
      }
    });

    res.status(201).json({
      version: fullVersion,
      message: 'Version manuelle créée avec succès'
    });
  } catch (error) {
    next(error);
  }
}