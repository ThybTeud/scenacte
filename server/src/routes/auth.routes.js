import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 * Body: { email, username, password }
 * Rate limit: 5 requêtes / 15 minutes
 */
router.post('/register', authLimiter, register);

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 * Body: { email, password }
 * Rate limit: 5 requêtes / 15 minutes
 */
router.post('/login', authLimiter, login);

/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation de mot de passe
 * Body: { email }
 * Rate limit: 5 requêtes / 15 minutes
 */
router.post('/forgot-password', authLimiter, forgotPassword);

/**
 * POST /api/auth/reset-password
 * Réinitialisation du mot de passe avec token
 * Body: { token, newPassword }
 * Rate limit: 5 requêtes / 15 minutes
 */
router.post('/reset-password', authLimiter, resetPassword);

/**
 * GET /api/auth/me
 * Récupère l'utilisateur connecté
 * Requiert: Authorization header avec Bearer token
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router;