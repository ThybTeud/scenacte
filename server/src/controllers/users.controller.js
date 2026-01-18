import prisma from '../db/index.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
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
import { logger } from '../utils/logger.js';

// Utilise le client pg via src/db/index.js

/**
 * GET /api/users/profile
 * Récupère le profil de l'utilisateur connecté
 */
export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            plays: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedError('Utilisateur non trouvé');
    }

    res.json({
      user: {
        ...user,
        playsCount: user._count.plays
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/users/profile
 * Met à jour le profil de l'utilisateur connecté
 */
export async function updateProfile(req, res, next) {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Données à mettre à jour
    const updateData = {};

    // Mise à jour de l'email
    if (email !== undefined) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        throw new ValidationError(emailValidation.message);
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Vérifier si l'email est différent de l'actuel
      if (normalizedEmail !== req.user.email) {
        // Vérifier que l'email n'est pas déjà utilisé
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (existingUser) {
          throw new ConflictError('Cet email est déjà utilisé');
        }

        updateData.email = normalizedEmail;
      }
    }

    // Changement de mot de passe
    if (newPassword !== undefined) {
      if (!currentPassword) {
        throw new BadRequestError('Mot de passe actuel requis pour changer de mot de passe');
      }

      // Récupérer le hash actuel
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true }
      });

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedError('Mot de passe actuel incorrect');
      }

      // Valider le nouveau mot de passe
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        throw new ValidationError(passwordValidation.message);
      }

      // Hash du nouveau mot de passe
      updateData.passwordHash = await hashPassword(newPassword);
    }

    // Si aucune donnée à mettre à jour
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError('Aucune modification fournie');
    }

    // Mise à jour en base
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      user: updatedUser,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/users/account
 * Supprime le compte de l'utilisateur connecté
 */
export async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    // Validation du mot de passe requis pour supprimer le compte
    if (!password) {
      throw new BadRequestError('Mot de passe requis pour supprimer le compte');
    }

    // Récupérer l'utilisateur avec son hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        passwordHash: true,
        email: true,
        username: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Mot de passe incorrect');
    }

    // Suppression de l'utilisateur
    // Les relations en CASCADE supprimeront automatiquement :
    // - plays (avec statistics embarquées en JSONB)
    // - play_history (historique des versions, avec statistics embarquées)
    // - export_templates
    await prisma.user.delete({
      where: { id: userId }
    });

    logger.info({ email: user.email }, 'Compte supprimé');

    res.json({
      message: 'Compte supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
}