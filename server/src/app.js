import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Pour obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Servir le frontend en production
 */
if (config.server.env === 'production') {
  // Chemin vers le dossier de build Vite (depuis server/src/)
  const buildPath = path.join(__dirname, '../../client/dist');
  
  console.log('[STATIC] Serving frontend from:', buildPath);
  
  // Servir les fichiers statiques
  app.use(express.static(buildPath));
  
  // Toutes les routes non-API redirigent vers index.html (pour React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

/**
 * Gestion des erreurs (uniquement pour les routes API en production)
 */
if (config.server.env !== 'production') {
  // Route non trouvée (404) - en dev seulement
  app.use(notFoundHandler);
}

// Gestionnaire d'erreurs global
app.use(errorHandler);

export default app;