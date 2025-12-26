import express from 'express';
import {
  listPlays,
  createPlay,
  getPlay,
  savePlay,
  deletePlay,
  updatePlayStatus,
  getPlayAST
} from '../controllers/plays.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Rate limiting pour prévenir les abus
router.use(apiLimiter);

/**
 * GET /api/plays
 * Liste des pièces de l'utilisateur connecté (paginée)
 * Query params: page?, limit?, status?
 * Requiert: Authorization header avec Bearer token
 */
router.get('/', listPlays);

/**
 * POST /api/plays
 * Créer une nouvelle pièce
 * Body: { title, subtitle?, rawContent?, htmlContent? }
 * Requiert: Authorization header avec Bearer token
 * Note: statistics sont recalculées côté serveur
 */
router.post('/', createPlay);

/**
 * GET /api/plays/:id/ast
 * Récupérer l'AST (Abstract Syntax Tree) d'une pièce en JSON
 * Requiert: Authorization header avec Bearer token
 * Note: Endpoint temporaire pour consultation et debugging
 */
router.get('/:id/ast', getPlayAST);

/**
 * GET /api/plays/:id
 * Récupérer une pièce spécifique
 * Requiert: Authorization header avec Bearer token
 */
router.get('/:id', getPlay);

/**
 * PUT /api/plays/:id
 * Sauvegarder (mettre à jour) une pièce et créer une version
 * Body: { title, subtitle?, rawContent, htmlContent, versionType?, manualLabel? }
 * Requiert: Authorization header avec Bearer token
 * Note: statistics sont recalculées côté serveur
 */
router.put('/:id', savePlay);

/**
 * DELETE /api/plays/:id
 * Supprimer une pièce
 * Requiert: Authorization header avec Bearer token
 */
router.delete('/:id', deletePlay);

/**
 * PATCH /api/plays/:id/status
 * Changer le statut d'une pièce (draft, completed, archived)
 * Body: { status }
 * Requiert: Authorization header avec Bearer token
 */
router.patch('/:id/status', updatePlayStatus);

export default router;