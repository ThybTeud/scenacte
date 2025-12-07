import express from 'express';
import { exportPlayToPDF } from '../controllers/export.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { exportLimiter } from '../middleware/rateLimiter.js';

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
 * Rate limited: 5 exports/minute
 */
router.post('/pdf', exportLimiter, exportPlayToPDF);

export default router;