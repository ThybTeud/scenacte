import { pool } from '../config/database.js';
import { validateEmail } from '../utils/validation.js';
import { BadRequestError, ValidationError } from '../middleware/errorHandler.js';
import { sendBugReportConfirmation } from '../services/email.service.js';

// Catégories valides
const VALID_CATEGORIES = [
  'editeur',
  'apercu',
  'export_pdf',
  'sauvegarde',
  'compte',
  'performance',
  'autre'
];

/**
 * Génère un titre depuis la description (50 premiers caractères, tronqué au dernier mot)
 */
function generateTitle(description) {
  if (!description || description.length <= 50) {
    return description || '';
  }

  const truncated = description.substring(0, 50);
  const lastSpace = truncated.lastIndexOf(' ');

  // Tronquer au dernier mot complet
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Valide une chaîne base64 JPEG
 */
function isValidBase64Screenshot(str) {
  if (!str) return true; // Optionnel

  // Vérifier le format data:image/jpeg;base64,... ou data:image/png;base64,...
  const base64Regex = /^data:image\/(jpeg|png);base64,/;
  if (!base64Regex.test(str)) {
    return false;
  }

  // Vérifier que la partie base64 est valide
  try {
    const base64Data = str.split(',')[1];
    Buffer.from(base64Data, 'base64');
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * POST /api/bug-reports
 * Créer un signalement de bug
 */
export async function createBugReport(req, res, next) {
  try {
    const { description, categories, email, screenshot, url, userAgent, appVersion } = req.body;

    // Récupérer user_id et email depuis le token JWT si connecté
    const userId = req.user?.id || null;
    const userEmail = req.user?.email || email || null;

    // Validation description
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new ValidationError('La description est requise');
    }

    // Validation categories
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      throw new ValidationError('Au moins une catégorie doit être sélectionnée');
    }

    // Vérifier que toutes les catégories sont valides
    const invalidCategories = categories.filter(cat => !VALID_CATEGORIES.includes(cat));
    if (invalidCategories.length > 0) {
      throw new ValidationError(`Catégories invalides: ${invalidCategories.join(', ')}`);
    }

    // Validation email (si fourni et non connecté)
    if (userEmail && !userId) {
      const emailValidation = validateEmail(userEmail);
      if (!emailValidation.valid) {
        throw new ValidationError(emailValidation.message);
      }
    }

    // Validation screenshot
    if (screenshot && !isValidBase64Screenshot(screenshot)) {
      throw new ValidationError('Le format de la capture d\'écran est invalide');
    }

    // Générer le titre
    const title = generateTitle(description);

    // Insérer en base de données
    const insertQuery = `
      INSERT INTO bug_reports (
        title, description, categories, screenshot, url, user_agent, user_id, email, app_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, created_at
    `;

    const values = [
      title,
      description.trim(),
      categories,
      screenshot || null,
      url || null,
      userAgent || null,
      userId,
      userEmail,
      appVersion || null
    ];

    const result = await pool.query(insertQuery, values);
    const bugReport = result.rows[0];

    // Envoyer email de confirmation si email fourni
    if (userEmail) {
      try {
        await sendBugReportConfirmation(userEmail, title, categories);
      } catch (emailError) {
        // Logger l'erreur mais ne pas faire échouer la requête
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Signalement enregistré avec succès',
      data: {
        id: bugReport.id,
        title: bugReport.title,
        createdAt: bugReport.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}
