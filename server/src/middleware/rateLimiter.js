import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/**
 * Rate limiter pour les routes d'authentification
 * Limite stricte pour empêcher les attaques par force brute
 * - 5 requêtes maximum par IP
 * - Fenêtre de 15 minutes
 * - Désactivé en mode test
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 requêtes par fenêtre
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Retourne les infos de rate limit dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  // Désactiver en mode test
  skip: () => config.server.env === 'test',
  handler: (req, res) => {
    console.warn(`[RATE LIMIT] ⚠️  Tentatives excessives sur ${req.path} depuis ${req.ip}`);
    res.status(429).json({
      error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Rate limiter général pour toutes les routes API
 * Limite raisonnable pour une utilisation normale
 * - 100 requêtes maximum par IP
 * - Fenêtre de 1 minute
 * - Désactivé en mode test
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limite à 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes, veuillez patienter.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting pour certaines routes si nécessaire
  skip: (req) => {
    // Désactiver en mode test
    if (config.server.env === 'test') return true;
    // Ne pas limiter les requêtes de health check
    return req.path === '/api/health' || req.path === '/health';
  },
  handler: (req, res) => {
    console.warn(`[RATE LIMIT] ⚠️  Limite API dépassée sur ${req.path} depuis ${req.ip}`);
    res.status(429).json({
      error: 'Trop de requêtes, veuillez patienter.'
    });
  }
});

/**
 * Rate limiter spécifique pour les exports PDF
 * Limite stricte car les exports sont coûteux en ressources
 * - 5 requêtes maximum par IP
 * - Fenêtre de 1 minute
 * - Désactivé en mode test
 */
export const exportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limite à 5 requêtes par fenêtre
  message: {
    error: 'Trop d\'exports, veuillez patienter.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.server.env === 'test',
  handler: (req, res) => {
    console.warn(`[RATE LIMIT] ⚠️  Limite d'export dépassée sur ${req.path} depuis ${req.ip}`);
    res.status(429).json({
      error: 'Trop d\'exports, veuillez patienter.'
    });
  }
});
