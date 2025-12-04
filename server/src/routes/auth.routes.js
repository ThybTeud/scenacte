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
import { validateBody } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../schemas/auth.schema.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 * Body: { email, username, password }
 * Rate limit: 5 requêtes / 15 minutes
 * Validation: registerSchema
 */
router.post('/register', authLimiter, validateBody(registerSchema), register);

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 * Body: { email, password }
 * Rate limit: 5 requêtes / 15 minutes
 * Validation: loginSchema
 */
router.post('/login', authLimiter, validateBody(loginSchema), login);

/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation de mot de passe
 * Body: { email }
 * Rate limit: 5 requêtes / 15 minutes
 * Validation: forgotPasswordSchema
 */
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), forgotPassword);

/**
 * POST /api/auth/reset-password
 * Réinitialisation du mot de passe avec token
 * Body: { token, newPassword }
 * Rate limit: 5 requêtes / 15 minutes
 * Validation: resetPasswordSchema
 */
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), resetPassword);

/**
 * GET /api/auth/me
 * Récupère l'utilisateur connecté
 * Requiert: Authorization header avec Bearer token
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router;