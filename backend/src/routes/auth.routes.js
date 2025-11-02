import express from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  getCurrentUser 
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 * Body: { email, username, password }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation de mot de passe
 * Body: { email }
 */
router.post('/forgot-password', forgotPassword);

/**
 * POST /api/auth/reset-password
 * Réinitialisation du mot de passe avec token
 * Body: { token, newPassword }
 */
router.post('/reset-password', resetPassword);

/**
 * GET /api/auth/me
 * Récupère l'utilisateur connecté
 * Requiert: Authorization header avec Bearer token
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router;