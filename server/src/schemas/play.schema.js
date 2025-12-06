import { z } from 'zod';

/**
 * Schéma pour les statistiques d'une pièce
 * Doit correspondre aux champs attendus par le contrôleur et la base de données
 */
const statisticsSchema = z.object({
  totalActs: z.number().int().nonnegative('Le nombre d\'actes doit être >= 0'),
  totalScenes: z.number().int().nonnegative('Le nombre de scènes doit être >= 0'),
  totalCharacters: z.number().int().nonnegative('Le nombre de personnages doit être >= 0'),
  totalLines: z.number().int().nonnegative('Le nombre de lignes doit être >= 0'),
  wordCount: z.number().int().nonnegative('Le nombre de mots doit être >= 0'),
  estimatedDurationMinutes: z.number().int().nonnegative('La durée estimée doit être >= 0')
});

/**
 * Schéma de validation pour la création d'une pièce
 */
export const createPlaySchema = z.object({
  title: z
    .string({ required_error: 'Le titre est requis' })
    .min(1, 'Le titre ne peut pas être vide')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères')
    .refine((val) => val && val.trim().length > 0, {
      message: 'Le titre est requis et ne peut pas être vide'
    }),

  subtitle: z
    .string()
    .max(255, 'Le sous-titre ne peut pas dépasser 255 caractères')
    .nullish(),

  rawContent: z
    .string({ required_error: 'Le contenu brut est requis' }),

  htmlContent: z
    .string({ required_error: 'Le contenu HTML est requis' }),

  // Statistics sont maintenant optionnelles car recalculées côté serveur
  statistics: statisticsSchema.optional()
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
    .nullish(),

  rawContent: z
    .string({ required_error: 'Le contenu brut est requis' }),

  htmlContent: z
    .string({ required_error: 'Le contenu HTML est requis' }),

  // Statistics sont maintenant optionnelles car recalculées côté serveur
  statistics: statisticsSchema.optional()
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
