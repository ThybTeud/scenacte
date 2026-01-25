import express from 'express';
import {
  listVersions,
  getVersion,
  restoreVersion,
  createVersion,
  createManualVersion
} from '../controllers/versions.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router({ mergeParams: true });

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Rate limiting pour prévenir les abus
router.use(apiLimiter);

/**
 * GET /api/plays/:id/versions
 * Liste des versions d'une pièce (paginée)
 * Query params: page?, limit?, type? (auto ou manual)
 * Requiert: Authorization header avec Bearer token
 */
router.get('/', listVersions);

/**
 * GET /api/plays/:id/versions/:versionId
 * Récupérer une version spécifique avec son contenu complet
 * Requiert: Authorization header avec Bearer token
 */
router.get('/:versionId', getVersion);

/**
 * POST /api/plays/:id/versions/restore
 * Restaurer une version (crée une nouvelle version manuelle avec label auto)
 * Body: { versionId }
 * Requiert: Authorization header avec Bearer token
 */
router.post('/restore', restoreVersion);

/**
 * POST /api/plays/:id/versions/manual
 * Créer une version manuelle (snapshot) sans modifier le contenu
 * Body: { manualLabel? }
 * Requiert: Authorization header avec Bearer token
 */
router.post('/manual', createManualVersion);

/**
 * POST /api/plays/:id/versions
 * Créer une nouvelle version (snapshot) sans modifier le contenu
 * Body: { versionType: 'manual' | 'inactivity' | 'threshold' | 'session_close', manualLabel? }
 * versionType est requis
 * manualLabel est optionnel (seulement pour versionType='manual')
 * Requiert: Authorization header avec Bearer token
 */
router.post('/', createVersion);

export default router;