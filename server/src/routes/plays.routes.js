import express from 'express';
import {
  listPlays,
  createPlay,
  getPlay,
  savePlay,
  deletePlay,
  updatePlayStatus
} from '../controllers/plays.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createPlaySchema, updatePlaySchema, updateStatusSchema } from '../schemas/play.schema.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

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
 * Body: { title, subtitle?, rawContent?, htmlContent?, statistics? }
 * Requiert: Authorization header avec Bearer token
 * Validation: createPlaySchema
 */
router.post('/', validateBody(createPlaySchema), createPlay);

/**
 * GET /api/plays/:id
 * Récupérer une pièce spécifique
 * Requiert: Authorization header avec Bearer token
 */
router.get('/:id', getPlay);

/**
 * PUT /api/plays/:id
 * Sauvegarder (mettre à jour) une pièce et créer une version
 * Body: { title, subtitle?, rawContent, htmlContent, statistics, versionType?, manualLabel? }
 * Requiert: Authorization header avec Bearer token
 * Validation: updatePlaySchema
 */
router.put('/:id', validateBody(updatePlaySchema), savePlay);

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
 * Validation: updateStatusSchema
 */
router.patch('/:id/status', validateBody(updateStatusSchema), updatePlayStatus);

export default router;