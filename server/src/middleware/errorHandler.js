import { config } from '../config/env.js';

/**
 * Classes d'erreur personnalisées
 */
export class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Non autorisé') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Accès refusé') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Ressource non trouvée') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 422;
  }
}

export class InternalServerError extends Error {
  constructor(message = 'Erreur interne du serveur') {
    super(message);
    this.name = 'InternalServerError';
    this.statusCode = 500;
  }
}

/**
 * Middleware global de gestion des erreurs
 * Doit être placé en dernier dans app.js
 */
export function errorHandler(err, req, res, next) {
  // Log de l'erreur en console
  console.error('[ERROR]', {
    name: err.name,
    message: err.message,
    stack: config.server.env === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Erreurs de base de données PostgreSQL (ex: contrainte unique)
  // 23505 : unique_violation
  if (err && err.code === '23505') {
    // Essayer d'extraire le champ de la contrainte si présent
    const detail = err.detail || '';
    const match = detail.match(/\(([^)]+)\)=/);
    const field = match ? match[1] : 'champ';
    return res.status(409).json({
      error: `Ce ${field} existe déjà`
    });
  }

  // Erreurs SQL de validation ou autre
  if (err && err.code && typeof err.code === 'string' && err.code.startsWith('22')) {
    // Codes SQLSTATE commençant par 22 sont souvent des erreurs de données
    return res.status(400).json({
      error: 'Données invalides'
    });
  }

  // Erreurs personnalisées avec statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Erreur par défaut (500)
  res.status(500).json({
    error: config.server.env === 'development' 
      ? err.message 
      : 'Erreur interne du serveur'
  });
}

/**
 * Middleware pour gérer les routes non trouvées (404)
 * À placer juste avant errorHandler dans app.js
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Route non trouvée'
  });
}