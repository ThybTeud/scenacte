import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  deleteAccount 
} from '../controllers/users.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

/**
 * GET /api/users/profile
 * Récupère le profil de l'utilisateur connecté
 * Requiert: Authorization header avec Bearer token
 */
router.get('/profile', getProfile);

/**
 * PUT /api/users/profile
 * Met à jour le profil de l'utilisateur connecté
 * Body: { email?, username?, currentPassword?, newPassword? }
 * Requiert: Authorization header avec Bearer token
 */
router.put('/profile', updateProfile);

/**
 * DELETE /api/users/account
 * Supprime le compte de l'utilisateur connecté
 * Body: { password }
 * Requiert: Authorization header avec Bearer token
 */
router.delete('/account', deleteAccount);

export default router;