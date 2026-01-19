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
    // 1. Compter les jobs par état
    const countResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM pgboss.job
      WHERE name = 'send-email'
      GROUP BY state
      ORDER BY count DESC
    `);

    // 2. Récupérer les derniers jobs
    const jobsResult = await pool.query(`
      SELECT
        id,
        name,
        state,
        priority,
        retry_limit,
        retry_count,
        retry_delay,
        start_after,
        created_on,
        started_on,
        completed_on,
        expire_seconds,
        data->>'to' as email_to,
        data->>'subject' as subject,
        output
      FROM pgboss.job
      WHERE name = 'send-email'
      ORDER BY created_on DESC
      LIMIT 20
    `);

    // 3. Compter les jobs bloqués
    const blockedResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM pgboss.job
      WHERE name = 'send-email'
        AND state = 'active'
        AND started_on < NOW() - INTERVAL '5 minutes'
    `);

    // 4. Récupérer les jobs en attente (created)
    const pendingResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM pgboss.job
      WHERE name = 'send-email'
        AND state = 'created'
        AND (start_after IS NULL OR start_after <= NOW())
    `);

    res.json({
      summary: countResult.rows,
      blocked: blockedResult.rows[0]?.count || 0,
      pendingReady: pendingResult.rows[0]?.count || 0,
      recentJobs: jobsResult.rows
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Erreur lors de la récupération du statut de la queue');
    res.status(500).json({ error: error.message });
  }
});

export default router;
