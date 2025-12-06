import { pool } from '../config/database.js';

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

  const client = await pool.connect();

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await client.query('BEGIN');

    // 1. Marquer toutes les versions manuelles comme préservées
    const manualUpdateQuery = `
      UPDATE play_versions
      SET preserved_reason = 'manual'
      WHERE version_type = 'manual' AND preserved_reason IS NULL
    `;
    const manualResult = await client.query(manualUpdateQuery);
    console.log('[CLEANUP] Versions manuelles marquées comme préservées:', manualResult.rowCount);

    // 2. Marquer toutes les auto-saves récentes (< 7 jours) comme préservées
    const recentUpdateQuery = `
      UPDATE play_versions
      SET preserved_reason = 'recent'
      WHERE version_type = 'auto' 
        AND created_at >= $1 
        AND preserved_reason IS NULL
    `;
    const recentResult = await client.query(recentUpdateQuery, [sevenDaysAgo]);
    console.log('[CLEANUP] Auto-saves récentes marquées comme préservées:', recentResult.rowCount);

    // 3. Traiter les auto-saves anciennes (> 7 jours)
    // Récupérer toutes les pièces qui ont des auto-saves anciennes
    const playsQuery = `
      SELECT DISTINCT play_id
      FROM play_versions
      WHERE version_type = 'auto'
        AND created_at < $1
        AND created_at < NOW() - INTERVAL '5 minutes'
    `;
    const playsResult = await client.query(playsQuery, [sevenDaysAgo]);
    console.log('[CLEANUP] Pièces avec anciennes auto-saves:', playsResult.rows.length);

    let dailySnapshotsMarked = 0;

    // Pour chaque pièce, identifier les snapshots quotidiens à conserver
    for (const row of playsResult.rows) {
      const playId = row.play_id;

      // Récupérer toutes les anciennes auto-saves pour cette pièce, groupées par jour
      const oldVersionsQuery = `
        SELECT id, created_at
        FROM play_versions
        WHERE play_id = $1
          AND version_type = 'auto'
          AND created_at < $2
          AND created_at < NOW() - INTERVAL '5 minutes'
        ORDER BY created_at DESC
      `;
      const oldVersionsResult = await client.query(oldVersionsQuery, [playId, sevenDaysAgo]);

      // Grouper par jour et garder la dernière version de chaque jour
      const versionsByDay = new Map();

      for (const version of oldVersionsResult.rows) {
        const dateKey = version.created_at.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!versionsByDay.has(dateKey)) {
          versionsByDay.set(dateKey, version.id);
        }
      }

      // Marquer ces versions comme daily_snapshot
      const snapshotIds = Array.from(versionsByDay.values());

      if (snapshotIds.length > 0) {
        const updateSnapshotsQuery = `
          UPDATE play_versions
          SET preserved_reason = 'daily_snapshot'
          WHERE id = ANY($1) AND preserved_reason IS NULL
        `;
        const snapshotsResult = await client.query(updateSnapshotsQuery, [snapshotIds]);
        dailySnapshotsMarked += snapshotsResult.rowCount;
      }
    }

    console.log('[CLEANUP] Snapshots quotidiens marqués comme préservés:', dailySnapshotsMarked);

    // 4. Supprimer toutes les versions auto anciennes sans preserved_reason
    const deleteQuery = `
      DELETE FROM play_versions
      WHERE version_type = 'auto'
        AND created_at < $1
        AND created_at < NOW() - INTERVAL '5 minutes'
        AND preserved_reason IS NULL
    `;
    const deleteResult = await client.query(deleteQuery, [sevenDaysAgo]);
    console.log('[CLEANUP] Anciennes auto-saves supprimées:', deleteResult.rowCount);

    // 5. Supprimer les statistiques orphelines
    // (normalement géré par CASCADE, mais vérification supplémentaire)
    const deleteOrphanStatsQuery = `
      DELETE FROM version_statistics
      WHERE version_id NOT IN (SELECT id FROM play_versions)
    `;
    const statsResult = await client.query(deleteOrphanStatsQuery);
    console.log('[CLEANUP] Statistiques orphelines supprimées:', statsResult.rowCount);

    await client.query('COMMIT');

    const duration = Date.now() - startTime;
    console.log(`[CLEANUP] Nettoyage terminé en ${duration}ms`);

    return {
      success: true,
      manualPreserved: manualResult.rowCount,
      recentPreserved: recentResult.rowCount,
      dailySnapshotsPreserved: dailySnapshotsMarked,
      versionsDeleted: deleteResult.rowCount,
      statsDeleted: statsResult.rowCount,
      duration
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[CLEANUP] Erreur lors du nettoyage:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    client.release();
  }
}

/**
 * Calcule les statistiques de rétention des versions
 * Utile pour monitoring et debug
 */
export async function getRetentionStats() {
  try {
    // Total
    const totalQuery = `SELECT COUNT(*) as count FROM play_versions`;
    const totalResult = await pool.query(totalQuery);
    const total = parseInt(totalResult.rows[0].count, 10);

    // Par type
    const byTypeQuery = `
      SELECT version_type, COUNT(*) as count
      FROM play_versions
      GROUP BY version_type
    `;
    const byTypeResult = await pool.query(byTypeQuery);
    const byType = {};
    byTypeResult.rows.forEach(row => {
      byType[row.version_type] = parseInt(row.count, 10);
    });

    // Par raison de préservation
    const byReasonQuery = `
      SELECT 
        COALESCE(preserved_reason, 'none') as reason, 
        COUNT(*) as count
      FROM play_versions
      GROUP BY preserved_reason
    `;
    const byReasonResult = await pool.query(byReasonQuery);
    const byReason = {};
    byReasonResult.rows.forEach(row => {
      byReason[row.reason] = parseInt(row.count, 10);
    });

    // Éligibles pour suppression
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const eligibleQuery = `
      SELECT COUNT(*) as count
      FROM play_versions
      WHERE version_type = 'auto'
        AND created_at < $1
        AND created_at < NOW() - INTERVAL '5 minutes'
        AND preserved_reason IS NULL
    `;
    const eligibleResult = await pool.query(eligibleQuery, [sevenDaysAgo]);
    const eligibleForDeletion = parseInt(eligibleResult.rows[0].count, 10);

    return {
      total,
      byType,
      byReason,
      eligibleForDeletion
    };
  } catch (error) {
    console.error('[CLEANUP] Erreur lors du calcul des stats:', error);
    throw error;
  }
}