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

    res.json({
      message: "Structure de la table pgboss.job",
      columns: columnsResult.rows
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Erreur lors de la récupération du statut de la queue');
    res.status(500).json({ error: error.message });
  }
});

export default router;
