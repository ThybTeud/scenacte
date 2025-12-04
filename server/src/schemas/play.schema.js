import { z } from 'zod';

/**
 * Schéma pour les statistiques d'une pièce
 */
const statisticsSchema = z.object({
  characterCount: z.number().int().nonnegative(),
  wordCount: z.number().int().nonnegative(),
  lineCount: z.number().int().nonnegative(),
  sceneCount: z.number().int().nonnegative(),
  actCount: z.number().int().nonnegative(),
  pageCount: z.number().int().nonnegative(),
  speakingCharacterCount: z.number().int().nonnegative()
});

/**
 * Schéma de validation pour la création d'une pièce
 */
export const createPlaySchema = z.object({
  title: z
    .string({ required_error: 'Le titre est requis' })
    .min(1, 'Le titre ne peut pas être vide')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères'),

  subtitle: z
    .string()
    .max(255, 'Le sous-titre ne peut pas dépasser 255 caractères')
    .optional(),

  rawContent: z
    .string({ required_error: 'Le contenu brut est requis' }),

  htmlContent: z
    .string({ required_error: 'Le contenu HTML est requis' }),

  statistics: statisticsSchema
});

/**
 * Schéma de validation pour la mise à jour d'une pièce
 */
export const updatePlaySchema = z.object({
  title: z
    .string({ required_error: 'Le titre est requis' })
    .min(1, 'Le titre ne peut pas être vide')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères'),

  subtitle: z
    .string()
    .max(255, 'Le sous-titre ne peut pas dépasser 255 caractères')
    .optional(),

  rawContent: z
    .string({ required_error: 'Le contenu brut est requis' }),

  htmlContent: z
    .string({ required_error: 'Le contenu HTML est requis' }),

  statistics: statisticsSchema
});

/**
 * Schéma de validation pour la mise à jour du statut d'une pièce
 */
export const updateStatusSchema = z.object({
  status: z.enum(['draft', 'completed', 'archived'], {
    required_error: 'Le statut est requis',
    invalid_type_error: 'Le statut doit être "draft", "completed" ou "archived"'
  })
});
