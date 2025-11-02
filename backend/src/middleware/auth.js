import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from './errorHandler.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('Utilisateur non trouvé');
    }

    // Injection de l'utilisateur dans la requête
    req.user = user;

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
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true
        }
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans bloquer
    next();
  }
}