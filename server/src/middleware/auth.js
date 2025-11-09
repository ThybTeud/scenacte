import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from './errorHandler.js';
import { pool } from '../config/database.js';

/**
 * Middleware d'authentification JWT
 * Vérifie le token et injecte req.user
 */
export async function authMiddleware(req, res, next) {
  try {
    // Récupération du token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token manquant');
    }

    const token = authHeader.substring(7); // Retire "Bearer "

    // Vérification du token
    const decoded = verifyToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Token invalide ou expiré');
    }

    // Vérification que l'utilisateur existe toujours en base
    const query = `
      SELECT id, email, username
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [decoded.userId]);

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Utilisateur non trouvé');
    }

    // Injection de l'utilisateur dans la requête
    req.user = result.rows[0];

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware optionnel : authentification sans bloquer si pas de token
 * Utile pour des routes qui peuvent être publiques ou privées
 */
export async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Pas de token, on continue sans req.user
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded) {
      const query = `
        SELECT id, email, username
        FROM users
        WHERE id = $1
      `;
      const result = await pool.query(query, [decoded.userId]);

      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans bloquer
    next();
  }
}