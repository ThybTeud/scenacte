import express from 'express';
import { exportPlayToPDF } from '../controllers/export.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

/**
 * POST /api/plays/:id/export/pdf
 * Exporter une pièce en PDF
 * Body: { templateId?, versionId? }
 * - Si templateId fourni : utilise ce template
 * - Sinon : utilise le template par défaut de l'utilisateur (pièce ou général)
 * - Si versionId fourni : exporte cette version spécifique
 * - Sinon : exporte la version courante
 * Requiert: Authorization header avec Bearer token
 */
router.post('/pdf', exportPlayToPDF);

export default router;