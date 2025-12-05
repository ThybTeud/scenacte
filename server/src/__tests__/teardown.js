import { pool } from '../config/database.js';

/**
 * Ferme la connexion à la base de données après tous les tests
 */
export default async function globalTeardown() {
  await pool.end();
}
