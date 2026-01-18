import { Router } from 'express';
import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * Route de debug pour inspecter la queue PgBoss
 * À SUPPRIMER EN PRODUCTION
 */
router.get('/queue-status', async (req, res) => {
  try {
    // 0. D'abord, lister toutes les colonnes disponibles
    const columnsResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'pgboss'
        AND table_name = 'job'
      ORDER BY ordinal_position
    `);

    // 1. Compter les jobs par état
    const countResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM pgboss.job
      WHERE name = 'send-email'
      GROUP BY state
      ORDER BY count DESC
    `);

    // 2. Récupérer les derniers jobs (en utilisant * pour avoir toutes les colonnes)
    const jobsResult = await pool.query(`
      SELECT *
      FROM pgboss.job
      WHERE name = 'send-email'
      ORDER BY createdon DESC
      LIMIT 20
    `);

    // 3. Compter les jobs bloqués
    const blockedResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM pgboss.job
      WHERE name = 'send-email'
        AND state = 'active'
        AND startedon < NOW() - INTERVAL '5 minutes'
    `);

    res.json({
      columns: columnsResult.rows,
      summary: countResult.rows,
      blocked: blockedResult.rows[0].count,
      recentJobs: jobsResult.rows
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Erreur lors de la récupération du statut de la queue');
    res.status(500).json({ error: error.message });
  }
});

export default router;
