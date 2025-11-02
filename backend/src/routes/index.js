import express from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import playsRoutes from './plays.routes.js';
import versionsRoutes from './versions.routes.js';
import templatesRoutes from './templates.routes.js';
import exportRoutes from './export.routes.js';

const router = express.Router();

/**
 * Route de santé (health check)
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Scenacte API'
  });
});

/**
 * Montage des routes
 */

// Authentification
router.use('/auth', authRoutes);

// Utilisateurs
router.use('/users', usersRoutes);

// Pièces de théâtre
router.use('/plays', playsRoutes);

// Versions (nested sous /plays/:id/versions)
router.use('/plays/:id/versions', versionsRoutes);

// Export (nested sous /plays/:id/export)
router.use('/plays/:id/export', exportRoutes);

// Templates
router.use('/templates', templatesRoutes);

export default router;