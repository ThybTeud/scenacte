import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

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

    // Injection de l'utilisateur depuis le JWT vérifié
    // Un JWT valide et non expiré garantit l'authenticité de l'utilisateur
    // Note: Si des données fraîches sont nécessaires (ex: rôles modifiés),
    // effectuer une requête spécifique dans le contrôleur concerné
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username
    };

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
      // Injection de l'utilisateur depuis le JWT vérifié
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username
      };
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans bloquer
    logger.warn({ error: error.message }, 'Token JWT optionnel invalide');
    next();
  }
}