import prisma from '../db/index.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken, generateResetToken, verifyResetToken } from '../utils/jwt.js';
import {
  validateEmail,
  validatePassword
} from '../utils/validation.js';
import { 
  BadRequestError, 
  UnauthorizedError, 
  ConflictError,
  ValidationError 
} from '../middleware/errorHandler.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service.js';

// Utilise le client pg via src/db/index.js

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
export async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validation des champs
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      throw new ValidationError(emailValidation.message);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message);
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.trim().toLowerCase()) {
        throw new ConflictError('Cet email est déjà utilisé');
      }
    }

    // Hash du mot de passe
    const passwordHash = await hashPassword(password);

    // Création de l'utilisateur (sans username)
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        username: null,
        passwordHash
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    });

    // Génération du token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    // Envoi de l'email de bienvenue (non bloquant)
    sendWelcomeEmail(user.email, user.email);

    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new BadRequestError('Email et mot de passe requis');
    }

    // Recherche de l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    // Vérification du mot de passe
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    // Génération du token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation de mot de passe
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    // Validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      throw new ValidationError(emailValidation.message);
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    // Toujours retourner succès même si l'utilisateur n'existe pas
    // (pour ne pas révéler quels emails sont enregistrés)
    if (!user) {
      return res.json({
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }

    // Génération du token de reset (expire en 1h) avec le timestamp du dernier changement de mot de passe
    const resetToken = generateResetToken(user.id, user.passwordUpdatedAt || user.createdAt);

    // Envoi de l'email (bloquant car critique)
    await sendPasswordResetEmail(user.email, user.email, resetToken);

    res.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/validate-reset-token
 * Valide un token de réinitialisation sans le consommer
 */
export async function validateResetToken(req, res, next) {
  try {
    const { token } = req.query;

    if (!token) {
      throw new BadRequestError('Token requis');
    }

    // Vérification du token JWT
    const decoded = verifyResetToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Ce lien a expiré ou a déjà été utilisé');
    }

    // Vérification que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new UnauthorizedError('Ce lien a expiré ou a déjà été utilisé');
    }

    // Vérification que le token n'a pas été invalidé par un changement de mot de passe
    if (decoded.passwordUpdatedAt) {
      const tokenPasswordDate = new Date(decoded.passwordUpdatedAt);
      const currentPasswordDate = user.passwordUpdatedAt || user.createdAt;

      if (tokenPasswordDate.getTime() !== currentPasswordDate.getTime()) {
        throw new UnauthorizedError('Ce lien a expiré ou a déjà été utilisé');
      }
    }

    res.json({ valid: true });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/reset-password
 * Réinitialisation du mot de passe avec token
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    // Validation
    if (!token) {
      throw new BadRequestError('Token requis');
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message);
    }

    // Vérification du token
    const decoded = verifyResetToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Ce lien a expiré ou a déjà été utilisé');
    }

    // Vérification que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new UnauthorizedError('Ce lien a expiré ou a déjà été utilisé');
    }

    // Vérification que le token n'a pas été invalidé par un changement de mot de passe
    if (decoded.passwordUpdatedAt) {
      const tokenPasswordDate = new Date(decoded.passwordUpdatedAt);
      const currentPasswordDate = user.passwordUpdatedAt || user.createdAt;

      if (tokenPasswordDate.getTime() !== currentPasswordDate.getTime()) {
        throw new UnauthorizedError('Ce lien a expiré ou a déjà été utilisé');
      }
    }

    // Hash du nouveau mot de passe
    const passwordHash = await hashPassword(newPassword);

    // Mise à jour du mot de passe ET du timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordUpdatedAt: new Date()
      }
    });

    res.json({
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Récupère l'utilisateur connecté (nécessite authMiddleware)
 */
export async function getCurrentUser(req, res, next) {
  try {
    // req.user est injecté par authMiddleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('Utilisateur non trouvé');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}