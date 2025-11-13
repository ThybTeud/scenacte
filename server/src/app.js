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
app.use(cors({
  origin: (origin, callback) => {
    // Liste des origines autorisées
    const allowedOrigins = [
      config.client.url,
      config.client.url.replace(/\/$/, ''), // Sans trailing slash
      config.client.url + '/', // Avec trailing slash
      'http://localhost:5173', // Dev local Vite
      'http://localhost:3000', // Dev local alternatif
      'https://scenacte.vercel.app', // Déploiement alternatif
    ];

    // Autoriser les requêtes sans origin (Postman, curl, mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Normaliser l'origin en retirant le trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Vérifier si l'origin est dans la liste autorisée
    const isAllowed = allowedOrigins.some(allowed => 
      allowed.replace(/\/$/, '') === normalizedOrigin
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origin non autorisée: ${origin}`);
      // IMPORTANT: Ne pas passer une Error, simplement false
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 heures
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