import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

/**
 * Pool de connexions PostgreSQL
 * Gère automatiquement les connexions pour performance optimale
 */
export const pool = new Pool({
  connectionString: config.database.url,
  max: 20, // Nombre maximum de connexions
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
    console.error('[DATABASE] Erreur de connexion:', error);
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
  console.error('[DATABASE] Erreur inattendue du pool:', err);
});