import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

/**
 * Middlewares globaux
 */

// CORS - Autorise les requêtes depuis le frontend
// Accepte l'URL avec ou sans trailing slash pour éviter les problèmes CORS
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (comme Postman, curl, etc.)
    if (!origin) return callback(null, true);

    // Normaliser les URLs en retirant le trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedClientUrl = config.client.url.replace(/\/$/, '');

    if (normalizedOrigin === normalizedClientUrl) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true
}));

// Body parser - Parse JSON et URL-encoded
app.use(express.json({ limit: `${config.limits.maxContentSizeMB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${config.limits.maxContentSizeMB}mb` }));

// Log des requêtes en mode développement
if (config.server.env === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Routes
 */
app.use('/api', routes);

/**
 * Gestion des erreurs
 */

// Route non trouvée (404)
app.use(notFoundHandler);

// Gestionnaire d'erreurs global
app.use(errorHandler);

export default app;