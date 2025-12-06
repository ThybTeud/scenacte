import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

// Pour obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * Middlewares globaux
 */

// Sécurité - Protection avec Helmet
// Configure les headers HTTP pour sécuriser l'application
app.use(helmet({
  // Content Security Policy (CSP) - Protection contre les attaques XSS
  contentSecurityPolicy: {
    directives: {
      // Par défaut, autoriser uniquement les ressources du même domaine
      defaultSrc: ["'self'"],

      // Scripts : uniquement depuis le même domaine (bundles Vite)
      scriptSrc: ["'self'"],

      // Styles : même domaine + inline (nécessaire pour React et CodeMirror)
      styleSrc: ["'self'", "'unsafe-inline'"],

      // Images : même domaine + data URIs (base64) + blobs (pour les previews)
      imgSrc: ["'self'", "data:", "blob:"],

      // Connexions (fetch, XHR, WebSocket) : uniquement vers notre API
      connectSrc: ["'self'"],

      // Fonts : uniquement depuis le même domaine
      fontSrc: ["'self'"],

      // Objets/embeds : aucun autorisé (pas de Flash, etc.)
      objectSrc: ["'none'"],

      // Empêche l'intégration dans des iframes (protection clickjacking)
      frameAncestors: ["'none'"]
    }
  },

  // Désactivé pour la compatibilité avec le frontend
  crossOriginEmbedderPolicy: false
}));

// Compression - Compression gzip des réponses HTTP
// Réduit la taille des réponses pour améliorer les performances
app.use(compression());

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
      'https://supreme-doodle-xjqw6r6x9f6799-5173.app.github.dev/', //Dev local CodeSpaces
      'https://scenacte.vercel.app', // Déploiement Vercel
      'https://scenacte-frontend.onrender.com', // Déploiement Render (backup)
      'https://scenacte.onrender.com', // Déploiement Render (principal)
    ];

    // Autoriser les requêtes sans origin (Postman, curl, mobile apps, etc.)
    // SÉCURITÉ: Bloquer les requêtes sans origin en production
    if (!origin) {
      if (config.server.env === 'production') {
        return callback(null, false);
      }
      return callback(null, true);
    }

    // Normaliser l'origin en retirant le trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');

    // Vérifier si l'origin est dans la liste autorisée
    const isAllowed = allowedOrigins.some(allowed =>
      allowed && allowed.replace(/\/$/, '') === normalizedOrigin
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] ⚠️  Origin non autorisée: ${origin}`);
      console.warn(`[CORS] 💡 Origines autorisées: ${allowedOrigins.filter(o => o).join(', ')}`);
      console.warn(`[CORS] 💡 Configurez CLIENT_URL=${origin} sur Render si c'est votre frontend`);
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
 * Note: Les routes sont enregistrées dynamiquement par registerRoutes()
 * après le démarrage de la queue d'emails dans server.js
 */

/**
 * Enregistre les routes API
 * Appelé depuis server.js après le démarrage de la queue d'emails
 * En mode test, les routes sont chargées directement au démarrage
 */
export function registerRoutes() {
  // Les routes sont déjà importées, on les monte simplement
  app.use('/api', routes);

  // Les gestionnaires d'erreurs doivent être enregistrés APRÈS les routes
  registerErrorHandlers();
}

/**
 * Enregistre les gestionnaires d'erreurs
 * Doit être appelé APRÈS les routes pour que Express les trouve
 */
function registerErrorHandlers() {
  /**
   * Servir le frontend en production
   *
   * Note: Sur des plateformes comme Render, le frontend et le backend sont souvent
   * déployés séparément. Cette section ne sert que pour des déploiements monolithiques
   * (par exemple sur AlwaysData ou un VPS).
   *
   * Pour activer le service du frontend depuis le backend, définissez la variable
   * d'environnement SERVE_FRONTEND=true
   */
  if (config.server.env === 'production' && process.env.SERVE_FRONTEND === 'true') {
    // Chemin vers le dossier de build Vite (depuis server/src/)
    const buildPath = path.join(__dirname, '../../client/dist');

    console.log('[STATIC] Serving frontend from:', buildPath);

    // Servir les fichiers statiques
    app.use(express.static(buildPath));

    // Toutes les routes non-API redirigent vers index.html (pour React Router)
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else if (config.server.env === 'production') {
    console.log('[STATIC] Frontend serving disabled (backend-only mode)');
    console.log('[STATIC] Set SERVE_FRONTEND=true to enable static file serving');
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
}

// En mode test, charger les routes immédiatement
if (config.server.env === 'test') {
  registerRoutes();
}

export default app;