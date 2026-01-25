import express from 'express';
import { createBugReport } from '../controllers/bugReports.controller.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Auth optionnelle (récupère user_id si connecté, sinon continue)
router.use(optionalAuthMiddleware);

// Rate limiting pour prévenir les abus
router.use(apiLimiter);

/**
 * POST /api/bug-reports
 * Créer un signalement de bug
 * Body: { description, categories, email?, screenshot?, url, userAgent, appVersion? }
 * Auth: Optionnelle (JWT token si disponible)
 */
router.post('/', express.json({ limit: '5mb' }), createBugReport);

export default router;
