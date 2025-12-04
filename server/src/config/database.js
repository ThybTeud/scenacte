import pg from 'pg';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

/**
 * Pool de connexions PostgreSQL
 * Gère automatiquement les connexions pour performance optimale
 */
export const pool = new Pool({
  connectionString: config.database.url,
  max: 20, // Nombre maximum de connexions
  min: 2, // Nombre minimum de connexions maintenues (améliore les temps de réponse)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Augmenté à 5s pour plus de fiabilité
  application_name: 'scenacte-backend', // Identifie l'application dans les logs PostgreSQL
});

/**
 * Vérifie la connexion à la base de données
 */
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    logger.error({ error }, 'Erreur de connexion à la base de données');
    return false;
  }
}

/**
 * Ferme le pool de connexions
 */
export async function closePool() {
  await pool.end();
}

// Gestion des erreurs du pool
pool.on('error', (err) => {
  logger.error({ error: err }, 'Erreur inattendue du pool de connexions');
});