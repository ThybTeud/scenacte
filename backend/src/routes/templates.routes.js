import express from 'express';
import { 
  listTemplates, 
  createTemplate, 
  getTemplate, 
  updateTemplate, 
  deleteTemplate 
} from '../controllers/templates.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

/**
 * GET /api/templates
 * Liste des templates de l'utilisateur connecté
 * Query params: playId? (filtre par pièce spécifique)
 * Requiert: Authorization header avec Bearer token
 */
router.get('/', listTemplates);

/**
 * POST /api/templates
 * Créer un nouveau template
 * Body: { name, settings, isDefault?, playId? }
 * Requiert: Authorization header avec Bearer token
 */
router.post('/', createTemplate);

/**
 * GET /api/templates/:id
 * Récupérer un template spécifique
 * Requiert: Authorization header avec Bearer token
 */
router.get('/:id', getTemplate);

/**
 * PUT /api/templates/:id
 * Modifier un template
 * Body: { name?, settings?, isDefault? }
 * Requiert: Authorization header avec Bearer token
 */
router.put('/:id', updateTemplate);

/**
 * DELETE /api/templates/:id
 * Supprimer un template
 * Requiert: Authorization header avec Bearer token
 */
router.delete('/:id', deleteTemplate);

export default router;