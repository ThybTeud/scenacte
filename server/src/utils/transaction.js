import { pool } from '../config/database.js';

/**
 * Helper pour gérer les transactions PostgreSQL de manière sécurisée
 * Gère automatiquement BEGIN, COMMIT et ROLLBACK
 *
 * @param {Function} callback - Fonction asynchrone qui reçoit le client comme paramètre
 * @returns {Promise<*>} - Résultat de la callback
 *
 * @example
 * const result = await withTransaction(async (client) => {
 *   await client.query('INSERT INTO users ...');
 *   await client.query('INSERT INTO profiles ...');
 *   return { success: true };
 * });
 */
export async function withTransaction(callback) {
  // Acquérir un client du pool
  const client = await pool.connect();

  try {
    // Démarrer la transaction
    await client.query('BEGIN');

    // Exécuter les opérations de la callback
    const result = await callback(client);

    // Valider la transaction
    await client.query('COMMIT');

    return result;
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await client.query('ROLLBACK');

    // Propager l'erreur pour que l'appelant puisse la gérer
    throw error;
  } finally {
    // Toujours libérer le client, même en cas d'erreur
    client.release();
  }
}

/**
 * Helper pour exécuter une requête avec gestion automatique des erreurs
 * Utile pour les requêtes simples sans transaction
 *
 * @param {string} query - Requête SQL
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise<Object>} - Résultat de la requête
 *
 * @example
 * const result = await executeQuery('SELECT * FROM users WHERE id = $1', [userId]);
 */
export async function executeQuery(query, params = []) {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('[DATABASE] Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
}
