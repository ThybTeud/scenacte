import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} payload - Données à encoder dans le token (userId, email)
 * @returns {string} Token JWT
 */
export function generateToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
}

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Token JWT à vérifier
 * @returns {Object|null} Payload décodé ou null si invalide
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
}

/**
 * Génère un token de réinitialisation de mot de passe (expire en 1h)
 * @param {string} userId - ID de l'utilisateur
 * @returns {string} Token de reset
 */
export function generateResetToken(userId) {
  return jwt.sign({ userId, type: 'reset' }, config.jwt.secret, {
    expiresIn: '1h'
  });
}

/**
 * Vérifie un token de réinitialisation
 * @param {string} token - Token à vérifier
 * @returns {Object|null} Payload si valide, null sinon
 */
export function verifyResetToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'reset') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}