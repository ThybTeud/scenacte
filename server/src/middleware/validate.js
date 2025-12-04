/**
 * Erreur de validation personnalisée
 * Utilisée lorsque les données de la requête ne passent pas la validation Zod
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

/**
 * Middleware de validation des données de requête
 * Valide le body de la requête avec un schéma Zod
 *
 * @param {ZodSchema} schema - Schéma Zod à utiliser pour la validation
 * @returns {Function} Middleware Express
 *
 * @example
 * router.post('/register', validateBody(registerSchema), register);
 */
export const validateBody = (schema) => (req, res, next) => {
  try {
    // Parse et valide les données avec Zod
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    // Extraire le premier message d'erreur de Zod
    const message = error.errors?.[0]?.message || 'Validation échouée';
    next(new ValidationError(message));
  }
};
