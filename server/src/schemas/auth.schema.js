import { z } from 'zod';

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  email: z
    .string({ required_error: 'L\'email est requis' })
    .email('Format d\'email invalide'),

  username: z
    .string({ required_error: 'Le nom d\'utilisateur est requis' })
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères')
    .regex(
      /^[a-zA-Z0-9_+-]+$/,
      'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et les caractères _ + -'
    ),

  password: z
    .string({ required_error: 'Le mot de passe est requis' })
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
});

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'L\'email est requis' })
    .email('Format d\'email invalide'),

  password: z
    .string({ required_error: 'Le mot de passe est requis' })
});

/**
 * Schéma de validation pour la demande de réinitialisation de mot de passe
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'L\'email est requis' })
    .email('Format d\'email invalide')
});

/**
 * Schéma de validation pour la réinitialisation de mot de passe
 */
export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'Le token est requis' }),

  newPassword: z
    .string({ required_error: 'Le nouveau mot de passe est requis' })
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
});
