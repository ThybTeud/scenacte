import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Service de nettoyage des anciennes versions
 * Implémente la stratégie de rétention :
 * - Versions manuelles : gardées indéfiniment
 * - Auto-saves < 7 jours : toutes gardées
 * - Auto-saves > 7 jours : 1 snapshot par jour (la dernière de chaque journée)
 */
export async function cleanupOldVersions() {
  const startTime = Date.now();
  console.log('[CLEANUP] Début du nettoyage des versions', new Date().toISOString());

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Marquer toutes les versions manuelles comme préservées
    const manualUpdated = await prisma.playVersion.updateMany({
      where: {
        versionType: 'manual',
        preservedReason: null
      },
      data: {
        preservedReason: 'manual'
      }
    });

    console.log('[CLEANUP] Versions manuelles marquées comme préservées:', manualUpdated.count);

    // 2. Marquer toutes les auto-saves récentes (< 7 jours) comme préservées
    const recentUpdated = await prisma.playVersion.updateMany({
      where: {
        versionType: 'auto',
        createdAt: {
          gte: sevenDaysAgo
        },
        preservedReason: null
      },
      data: {
        preservedReason: 'recent'
      }
    });

    console.log('[CLEANUP] Auto-saves récentes marquées comme préservées:', recentUpdated.count);

    // 3. Traiter les auto-saves anciennes (> 7 jours)
    // Récupérer toutes les pièces qui ont des auto-saves anciennes
    const playsWithOldVersions = await prisma.play.findMany({
      where: {
        versions: {
          some: {
            versionType: 'auto',
            createdAt: {
              lt: sevenDaysAgo
            }
          }
        }
      },
      select: {
        id: true
      }
    });

    console.log('[CLEANUP] Pièces avec anciennes auto-saves:', playsWithOldVersions.length);

    let dailySnapshotsMarked = 0;

    // Pour chaque pièce, identifier les snapshots quotidiens à conserver
    for (const play of playsWithOldVersions) {
      // Récupérer toutes les anciennes auto-saves pour cette pièce, groupées par jour
      const oldVersions = await prisma.playVersion.findMany({
        where: {
          playId: play.id,
          versionType: 'auto',
          createdAt: {
            lt: sevenDaysAgo
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          createdAt: true
        }
      });

      // Grouper par jour et garder la dernière version de chaque jour
      const versionsByDay = new Map();

      for (const version of oldVersions) {
        const dateKey = version.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!versionsByDay.has(dateKey)) {
          versionsByDay.set(dateKey, version.id);
        }
      }

      // Marquer ces versions comme daily_snapshot
      const snapshotIds = Array.from(versionsByDay.values());

      if (snapshotIds.length > 0) {
        const updated = await prisma.playVersion.updateMany({
          where: {
            id: {
              in: snapshotIds
            },
            preservedReason: null
          },
          data: {
            preservedReason: 'daily_snapshot'
          }
        });

        dailySnapshotsMarked += updated.count;
      }
    }

    console.log('[CLEANUP] Snapshots quotidiens marqués comme préservés:', dailySnapshotsMarked);

    // 4. Supprimer toutes les versions auto anciennes sans preserved_reason
    const deleted = await prisma.playVersion.deleteMany({
      where: {
        versionType: 'auto',
        createdAt: {
          lt: sevenDaysAgo
        },
        preservedReason: null
      }
    });

    console.log('[CLEANUP] Anciennes auto-saves supprimées:', deleted.count);

    // 5. Supprimer les statistiques orphelines (dont la version a été supprimée)
    const deletedStats = await prisma.versionStatistics.deleteMany({
      where: {
        version: null
      }
    });

    console.log('[CLEANUP] Statistiques orphelines supprimées:', deletedStats.count);

    const duration = Date.now() - startTime;
    console.log(`[CLEANUP] Nettoyage terminé en ${duration}ms`);

    return {
      success: true,
      manualPreserved: manualUpdated.count,
      recentPreserved: recentUpdated.count,
      dailySnapshotsPreserved: dailySnapshotsMarked,
      versionsDeleted: deleted.count,
      statsDeleted: deletedStats.count,
      duration
    };

  } catch (error) {
    console.error('[CLEANUP] Erreur lors du nettoyage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calcule les statistiques de rétention des versions
 * Utile pour monitoring et debug
 */
export async function getRetentionStats() {
  try {
    const total = await prisma.playVersion.count();
    
    const byType = await prisma.playVersion.groupBy({
      by: ['versionType'],
      _count: true
    });

    const byReason = await prisma.playVersion.groupBy({
      by: ['preservedReason'],
      _count: true
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldWithoutReason = await prisma.playVersion.count({
      where: {
        versionType: 'auto',
        createdAt: {
          lt: sevenDaysAgo
        },
        preservedReason: null
      }
    });

    return {
      total,
      byType: Object.fromEntries(
        byType.map(item => [item.versionType, item._count])
      ),
      byReason: Object.fromEntries(
        byReason.map(item => [item.preservedReason || 'none', item._count])
      ),
      eligibleForDeletion: oldWithoutReason
    };
  } catch (error) {
    console.error('[CLEANUP] Erreur lors du calcul des stats:', error);
    throw error;
  }
}