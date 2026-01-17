import { pool } from '../config/database.js';
import { validateUUID } from '../utils/validation.js';
import { validateTemplateSettings } from '../services/pdf.service.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ValidationError
} from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/templates
 * Liste des templates de l'utilisateur connecté
 */
export async function listTemplates(req, res, next) {
  try {
    const userId = req.user.id;
    const { playId } = req.query;

    let query = `
      SELECT 
        t.id, t.name, t.is_default, t.settings, t.created_at, t.updated_at, t.play_id,
        p.title as play_title
      FROM export_templates t
      LEFT JOIN plays p ON p.id = t.play_id
      WHERE (t.user_id = $1 OR t.user_id IS NULL)
    `;
    const queryParams = [userId];
    let paramIndex = 2;

    // Filtre optionnel par pièce
    if (playId) {
      const idValidation = validateUUID(playId);
      if (!idValidation.valid) {
        throw new ValidationError('playId invalide');
      }

      // Vérifier que la pièce appartient à l'utilisateur
      const playCheckQuery = `SELECT user_id FROM plays WHERE id = $1`;
      const playCheckResult = await pool.query(playCheckQuery, [playId]);

      if (playCheckResult.rows.length > 0 && playCheckResult.rows[0].user_id !== userId) {
        throw new ForbiddenError('Accès non autorisé à cette pièce');
      }

      query += ` AND t.play_id = $${paramIndex}`;
      queryParams.push(playId);
      paramIndex++;
    }

    query += ` ORDER BY t.is_default DESC, t.created_at DESC`;

    const result = await pool.query(query, queryParams);

    const templates = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      isDefault: row.is_default,
      settings: row.settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      playId: row.play_id,
      ...(playId && row.play_title ? { play: { title: row.play_title } } : {})
    }));

    res.json({ templates });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/templates/public
 * Liste des templates système (user_id IS NULL)
 * Ne requiert pas d'authentification
 */
export async function listPublicTemplates(req, res, next) {
  try {
    const query = `
      SELECT
        id, name, is_default, settings, created_at, updated_at
      FROM export_templates
      WHERE user_id IS NULL
      ORDER BY is_default DESC, name ASC
    `;

    const result = await pool.query(query);

    const templates = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      isDefault: row.is_default,
      settings: row.settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isSystem: true
    }));

    res.json({ templates });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/templates
 * Créer un nouveau template
 */
export async function createTemplate(req, res, next) {
  const client = await pool.connect();
  
  try {
    const { name, settings, isDefault = false, playId } = req.body;
    const userId = req.user.id;

    // Validation du nom
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Nom du template requis');
    }

    if (name.trim().length > 100) {
      throw new ValidationError('Nom du template trop long (max 100 caractères)');
    }

    // Validation des settings
    if (!validateTemplateSettings(settings)) {
      throw new ValidationError('Configuration du template invalide');
    }

    // Si playId fourni, vérifier que la pièce appartient à l'utilisateur
    if (playId) {
      const idValidation = validateUUID(playId);
      if (!idValidation.valid) {
        throw new ValidationError('playId invalide');
      }

      const playQuery = `SELECT user_id FROM plays WHERE id = $1`;
      const playResult = await client.query(playQuery, [playId]);

      if (playResult.rows.length === 0) {
        throw new NotFoundError('Pièce non trouvée');
      }

      if (playResult.rows[0].user_id !== userId) {
        throw new ForbiddenError('Accès non autorisé à cette pièce');
      }
    }

    await client.query('BEGIN');

    // Si isDefault=true, retirer le défaut des autres templates
    if (isDefault) {
      const updateQuery = `
        UPDATE export_templates
        SET is_default = false
        WHERE user_id = $1 AND (play_id = $2 OR (play_id IS NULL AND $2 IS NULL))
      `;
      await client.query(updateQuery, [userId, playId || null]);
    }

    // Création du template
    const insertQuery = `
      INSERT INTO export_templates (user_id, play_id, name, settings, is_default)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, play_id, name, settings, is_default, created_at, updated_at
    `;
    const result = await client.query(insertQuery, [
      userId,
      playId || null,
      name.trim(),
      JSON.stringify(settings),
      isDefault
    ]);

    await client.query('COMMIT');

    res.status(201).json({ 
      template: result.rows[0],
      message: 'Template créé avec succès'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

/**
 * GET /api/templates/:id
 * Récupérer un template spécifique
 */
export async function getTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Récupération du template
    const query = `
      SELECT 
        t.*,
        p.id as play_id_val, p.title as play_title
      FROM export_templates t
      LEFT JOIN plays p ON p.id = t.play_id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Template non trouvé');
    }

    const row = result.rows[0];

    // Vérification ownership (templates globaux accessibles à tous)
    if (row.user_id && row.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à ce template');
    }

    res.json({
      template: {
        id: row.id,
        userId: row.user_id,
        playId: row.play_id,
        name: row.name,
        settings: row.settings,
        isDefault: row.is_default,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        ...(row.play_id_val ? { play: { id: row.play_id_val, title: row.play_title } } : {})
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/templates/:id
 * Modifier un template
 */
export async function updateTemplate(req, res, next) {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { name, settings, isDefault } = req.body;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Vérifier que le template existe et appartient à l'utilisateur
    const checkQuery = `SELECT id, user_id, play_id FROM export_templates WHERE id = $1`;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new NotFoundError('Template non trouvé');
    }

    const existingTemplate = checkResult.rows[0];

    if (existingTemplate.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à ce template');
    }

    // Données à mettre à jour
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Mise à jour du nom
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new ValidationError('Nom du template invalide');
      }

      if (name.trim().length > 100) {
        throw new ValidationError('Nom du template trop long (max 100 caractères)');
      }

      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    // Mise à jour des settings
    if (settings !== undefined) {
      if (!validateTemplateSettings(settings)) {
        throw new ValidationError('Configuration du template invalide');
      }

      updates.push(`settings = $${paramIndex++}`);
      values.push(JSON.stringify(settings));
    }

    await client.query('BEGIN');

    // Mise à jour du défaut
    if (isDefault !== undefined) {
      if (typeof isDefault !== 'boolean') {
        throw new ValidationError('isDefault doit être un booléen');
      }

      // Si on met ce template en défaut, retirer le défaut des autres
      if (isDefault === true) {
        const updateDefaultQuery = `
          UPDATE export_templates
          SET is_default = false
          WHERE user_id = $1 AND (play_id = $2 OR (play_id IS NULL AND $2 IS NULL)) AND id != $3
        `;
        await client.query(updateDefaultQuery, [userId, existingTemplate.play_id, id]);
      }

      updates.push(`is_default = $${paramIndex++}`);
      values.push(isDefault);
    }

    // Si aucune donnée à mettre à jour
    if (updates.length === 0) {
      throw new BadRequestError('Aucune modification fournie');
    }

    // Ajouter updated_at
    updates.push(`updated_at = NOW()`);

    // Ajouter l'ID comme dernier paramètre
    values.push(id);

    // Mise à jour
    const updateQuery = `
      UPDATE export_templates
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    const result = await client.query(updateQuery, values);

    await client.query('COMMIT');

    res.json({
      template: result.rows[0],
      message: 'Template mis à jour avec succès'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

/**
 * DELETE /api/templates/:id
 * Supprimer un template
 */
export async function deleteTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Vérifier que le template existe et appartient à l'utilisateur
    const checkQuery = `SELECT id, user_id, name FROM export_templates WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new NotFoundError('Template non trouvé');
    }

    const template = checkResult.rows[0];

    if (template.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à ce template');
    }

    // Suppression
    const deleteQuery = `DELETE FROM export_templates WHERE id = $1`;
    await pool.query(deleteQuery, [id]);

    logger.info({ name: template.name, user: req.user.username }, 'Template supprimé');

    res.json({
      message: 'Template supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
}