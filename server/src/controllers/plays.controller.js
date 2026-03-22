import { pool } from '../config/database.js';
import {
  validateTitle,
  validateContent,
  validateUUID,
  validatePlayStatus,
  validatePagination
} from '../utils/validation.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ValidationError
} from '../middleware/errorHandler.js';
import { config } from '../config/env.js';
import { calculatePlayStatistics } from '../utils/playStatistics.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/plays
 * Liste des pièces de l'utilisateur connecté
 * Sans page/limit : retourne toutes les pièces (tri/pagination côté client)
 * Avec page/limit : retourne une page (rétrocompatibilité)
 */
export async function listPlays(req, res, next) {
  try {
    const { status } = req.query;
    const userId = req.user.id;
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;

    // Construction du filtre
    let whereClause = 'WHERE p.user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2;

    if (status) {
      const statusValidation = validatePlayStatus(status);
      if (!statusValidation.valid) {
        throw new ValidationError(statusValidation.message);
      }
      whereClause += ` AND p.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Colonnes communes
    const selectClause = `
      SELECT
        p.id, p.title, p.subtitle, p.status, p.content_version,
        p.created_at, p.updated_at, p.last_edited_at,
        p.statistics
      FROM plays p
      ${whereClause}
      ORDER BY p.last_edited_at DESC`;

    let playsResult;
    let total;

    if (hasPagination) {
      // Mode paginé (rétrocompatibilité)
      const { page = 1, limit = 20 } = req.query;
      const paginationValidation = validatePagination(page, limit);
      if (!paginationValidation.valid) {
        throw new ValidationError(paginationValidation.message);
      }

      const validatedPage = paginationValidation.page;
      const validatedLimit = paginationValidation.limit;

      const playsQuery = `${selectClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(validatedLimit, (validatedPage - 1) * validatedLimit);

      const countQuery = `SELECT COUNT(*) FROM plays p ${whereClause}`;
      const countParams = queryParams.slice(0, status ? 2 : 1);

      const [pResult, countResult] = await Promise.all([
        pool.query(playsQuery, queryParams),
        pool.query(countQuery, countParams)
      ]);

      playsResult = pResult;
      total = parseInt(countResult.rows[0].count, 10);

      const plays = playsResult.rows.map(mapPlayRow);

      return res.json({
        plays,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages: Math.ceil(total / validatedLimit)
        }
      });
    }

    // Mode complet (sans pagination) — une seule requête
    playsResult = await pool.query(selectClause, queryParams);
    total = playsResult.rows.length;

    const plays = playsResult.rows.map(mapPlayRow);

    res.json({
      plays,
      pagination: {
        page: 1,
        limit: total,
        total,
        totalPages: 1
      }
    });
  } catch (error) {
    next(error);
  }
}

function mapPlayRow(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    status: row.status,
    contentVersion: row.content_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastEditedAt: row.last_edited_at,
    statistics: row.statistics && Object.keys(row.statistics).length > 0 ? row.statistics : null
  };
}

/**
 * POST /api/plays
 * Créer une nouvelle pièce
 */
export async function createPlay(req, res, next) {
  const client = await pool.connect();
  
  try {
    const { title, subtitle, rawContent, htmlContent, statistics } = req.body;
    const userId = req.user.id;

    // Validation du titre
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      throw new ValidationError(titleValidation.message);
    }

    // Validation des contenus
    const rawValidation = validateContent(rawContent || '', config.limits.maxContentSizeBytes);
    if (!rawValidation.valid) {
      throw new ValidationError(`rawContent: ${rawValidation.message}`);
    }

    const htmlValidation = validateContent(htmlContent || '', config.limits.maxContentSizeBytes);
    if (!htmlValidation.valid) {
      throw new ValidationError(`htmlContent: ${htmlValidation.message}`);
    }

    // Calcul des statistiques côté serveur (ignore les stats envoyées par le client pour sécurité)
    const stats = calculatePlayStatistics(rawContent || '');

    // Parser et stocker l'AST
    const { PlayParser } = await import('../utils/playStatistics.js');
    const parser = new PlayParser();
    const ast = parser.parse(rawContent || '');
    const astContent = JSON.stringify(ast.toJSON());

    // Calcul de la taille du fichier pour la version initiale
    const fileSizeBytes = Buffer.byteLength(rawContent || '', 'utf8') + 
                         Buffer.byteLength(htmlContent || '', 'utf8');

    // Construire l'objet statistics JSONB
    const statisticsJson = {
      totalActs: stats.totalActs,
      totalScenes: stats.totalScenes,
      totalCharacters: stats.totalCharacters,
      totalLines: stats.totalLines,
      wordCount: stats.wordCount,
      estimatedDurationMinutes: stats.estimatedDurationMinutes,
      contentVersion: 1
    };

    await client.query('BEGIN');

    // 1. Créer la pièce avec statistics embarquées et AST
    const insertPlayQuery = `
      INSERT INTO plays (user_id, title, subtitle, raw_content, html_content, ast_content, content_version, status, statistics, last_edited_at)
      VALUES ($1, $2, $3, $4, $5, $6, 1, 'draft', $7, NOW())
      RETURNING id, user_id, title, subtitle, raw_content, html_content, ast_content, content_version, status, statistics, created_at, updated_at, last_edited_at
    `;
    const playResult = await client.query(insertPlayQuery, [
      userId,
      title.trim(),
      subtitle?.trim() || null,
      rawContent || '',
      htmlContent || '',
      astContent,
      JSON.stringify(statisticsJson)
    ]);
    const play = playResult.rows[0];

    // 2. Créer la version initiale dans play_history (sans html_content, avec statistics JSONB)
    const insertHistoryQuery = `
      INSERT INTO play_history (play_id, version_number, title, raw_content, version_type, manual_label, file_size_bytes, preserved_reason, statistics)
      VALUES ($1, 1, $2, $3, 'manual', 'Version initiale', $4, 'manual', $5)
      RETURNING id
    `;
    await client.query(insertHistoryQuery, [
      play.id,
      play.title,
      play.raw_content,
      fileSizeBytes,
      JSON.stringify(statisticsJson)
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      play: {
        id: play.id,
        userId: play.user_id,
        title: play.title,
        subtitle: play.subtitle,
        rawContent: play.raw_content,
        htmlContent: play.html_content,
        astContent: play.ast_content,
        contentVersion: play.content_version,
        status: play.status,
        createdAt: play.created_at,
        updatedAt: play.updated_at,
        lastEditedAt: play.last_edited_at,
        statistics: play.statistics
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

/**
 * GET /api/plays/:id
 * Récupérer une pièce spécifique
 */
export async function getPlay(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Récupération de la pièce avec template (statistics embarquées en JSONB)
    const query = `
      SELECT
        p.*,
        t.id as template_id_val, t.name as template_name, t.settings as template_settings
      FROM plays p
      LEFT JOIN export_templates t ON t.id = p.template_id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    const row = result.rows[0];

    // Vérification que la pièce appartient à l'utilisateur
    if (row.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    res.json({
      play: {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        subtitle: row.subtitle,
        rawContent: row.raw_content,
        htmlContent: row.html_content,
        astContent: row.ast_content,
        contentVersion: row.content_version,
        status: row.status,
        paperSize: row.paper_size || 'A5',
        templateId: row.template_id,
        template: row.template_id_val ? {
          id: row.template_id_val,
          name: row.template_name,
          settings: row.template_settings
        } : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastEditedAt: row.last_edited_at,
        statistics: row.statistics && Object.keys(row.statistics).length > 0 ? row.statistics : null
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/plays/:id
 * Sauvegarder (mettre à jour) une pièce
 * Crée automatiquement une nouvelle version
 */
export async function savePlay(req, res, next) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { title, subtitle, rawContent, htmlContent } = req.body;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    await client.query('BEGIN');

    // Vérifier que la pièce existe et appartient à l'utilisateur (avec verrou pour éviter race condition)
    const checkQuery = `SELECT id, user_id, content_version FROM plays WHERE id = $1 FOR UPDATE`;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    const existingPlay = checkResult.rows[0];

    if (existingPlay.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Validations
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      throw new ValidationError(titleValidation.message);
    }

    const rawValidation = validateContent(rawContent, config.limits.maxContentSizeBytes);
    if (!rawValidation.valid) {
      throw new ValidationError(`rawContent: ${rawValidation.message}`);
    }

    const htmlValidation = validateContent(htmlContent, config.limits.maxContentSizeBytes);
    if (!htmlValidation.valid) {
      throw new ValidationError(`htmlContent: ${htmlValidation.message}`);
    }

    // Calcul des statistiques côté serveur (ignore les stats envoyées par le client pour sécurité)
    const calculatedStats = calculatePlayStatistics(rawContent);

    // Parser et stocker l'AST
    const { PlayParser } = await import('../utils/playStatistics.js');
    const parser = new PlayParser();
    const ast = parser.parse(rawContent);
    const astContent = JSON.stringify(ast.toJSON());

    const newContentVersion = existingPlay.content_version + 1;

    // Construire l'objet statistics JSONB
    const statisticsJson = {
      totalActs: calculatedStats.totalActs,
      totalScenes: calculatedStats.totalScenes,
      totalCharacters: calculatedStats.totalCharacters,
      totalLines: calculatedStats.totalLines,
      wordCount: calculatedStats.wordCount,
      estimatedDurationMinutes: calculatedStats.estimatedDurationMinutes,
      calculatedAt: new Date().toISOString(),
      contentVersion: newContentVersion
    };

    // 1. Mettre à jour la pièce avec statistics embarquées et AST
    const updatePlayQuery = `
      UPDATE plays
      SET title = $1, subtitle = $2, raw_content = $3, html_content = $4, ast_content = $5, content_version = $6, statistics = $7, last_edited_at = NOW(), updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    const playResult = await client.query(updatePlayQuery, [
      title.trim(),
      subtitle?.trim() || null,
      rawContent,
      htmlContent,
      astContent,
      newContentVersion,
      JSON.stringify(statisticsJson),
      id
    ]);

    await client.query('COMMIT');

    const play = playResult.rows[0];

    res.json({
      success: true,
      play: {
        id: play.id,
        title: play.title,
        updatedAt: play.updated_at,
        contentVersion: play.content_version
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

/**
 * DELETE /api/plays/:id
 * Supprimer une pièce
 */
export async function deletePlay(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const checkQuery = `SELECT id, user_id, title FROM plays WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    const play = checkResult.rows[0];

    if (play.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Suppression (CASCADE supprimera automatiquement versions et stats)
    const deleteQuery = `DELETE FROM plays WHERE id = $1`;
    await pool.query(deleteQuery, [id]);

    logger.info({ title: play.title, user: req.user.username }, 'Pièce supprimée');

    res.json({
      message: 'Pièce supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/plays/:id/ast
 * Récupérer l'AST (Abstract Syntax Tree) d'une pièce en JSON
 * Endpoint temporaire pour consultation et debugging
 */
export async function getPlayAST(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Récupération de la pièce
    const query = `SELECT id, user_id, title, raw_content FROM plays WHERE id = $1`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    const row = result.rows[0];

    // Vérification que la pièce appartient à l'utilisateur
    if (row.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Import dynamique du parser pour générer l'AST
    const { PlayParser } = await import('../utils/playStatistics.js');
    const parser = new PlayParser();
    const ast = parser.parse(row.raw_content);

    res.json({
      playId: row.id,
      title: row.title,
      ast: ast.toJSON()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/plays/:id
 * Mise à jour partielle d'une pièce (renommage, paramètres de mise en page)
 * Ne crée pas de nouvelle version
 */
export async function updatePlay(req, res, next) {
  try {
    const { id } = req.params;
    const { title, subtitle, paperSize, templateId } = req.body;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Au moins un champ à mettre à jour
    if (title === undefined && subtitle === undefined && paperSize === undefined && templateId === undefined) {
      throw new ValidationError('Au moins un champ (title, subtitle, paperSize ou templateId) est requis');
    }

    // Validation du titre si fourni
    if (title !== undefined) {
      const titleValidation = validateTitle(title);
      if (!titleValidation.valid) {
        throw new ValidationError(titleValidation.message);
      }
    }

    // Validation de paperSize si fourni
    if (paperSize !== undefined) {
      const validPaperSizes = ['A4', 'A5'];
      if (!validPaperSizes.includes(paperSize)) {
        throw new ValidationError(`paperSize doit être l'un de: ${validPaperSizes.join(', ')}`);
      }
    }

    // Validation de templateId si fourni
    if (templateId !== undefined && templateId !== null) {
      const templateIdValidation = validateUUID(templateId);
      if (!templateIdValidation.valid) {
        throw new ValidationError('templateId invalide');
      }

      // Vérifier que le template existe (système ou appartient à l'utilisateur)
      const templateCheckQuery = `
        SELECT id FROM export_templates
        WHERE id = $1 AND (user_id IS NULL OR user_id = $2)
      `;
      const templateCheckResult = await pool.query(templateCheckQuery, [templateId, userId]);
      if (templateCheckResult.rows.length === 0) {
        throw new NotFoundError('Template non trouvé ou non accessible');
      }
    }

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const checkQuery = `SELECT id, user_id FROM plays WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    const play = checkResult.rows[0];

    if (play.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Construction dynamique de la requête UPDATE
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title.trim());
      paramIndex++;
    }

    if (subtitle !== undefined) {
      updates.push(`subtitle = $${paramIndex}`);
      values.push(subtitle?.trim() || null);
      paramIndex++;
    }

    if (paperSize !== undefined) {
      updates.push(`paper_size = $${paramIndex}`);
      values.push(paperSize);
      paramIndex++;
    }

    if (templateId !== undefined) {
      updates.push(`template_id = $${paramIndex}`);
      values.push(templateId || null);
      paramIndex++;
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const updateQuery = `
      UPDATE plays
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, values);

    const updatedPlay = updateResult.rows[0];

    // Récupérer le template si nécessaire
    let template = null;
    if (updatedPlay.template_id) {
      const templateResult = await pool.query(
        `SELECT id, name, settings FROM export_templates WHERE id = $1`,
        [updatedPlay.template_id]
      );
      template = templateResult.rows[0] || null;
    }

    res.json({
      play: {
        id: updatedPlay.id,
        userId: updatedPlay.user_id,
        title: updatedPlay.title,
        subtitle: updatedPlay.subtitle,
        contentVersion: updatedPlay.content_version,
        status: updatedPlay.status,
        paperSize: updatedPlay.paper_size || 'A5',
        templateId: updatedPlay.template_id,
        template: template ? {
          id: template.id,
          name: template.name,
          settings: template.settings
        } : null,
        createdAt: updatedPlay.created_at,
        updatedAt: updatedPlay.updated_at,
        lastEditedAt: updatedPlay.last_edited_at,
        statistics: updatedPlay.statistics && Object.keys(updatedPlay.statistics).length > 0 ? updatedPlay.statistics : null
      },
      message: 'Pièce mise à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/plays/:id/status
 * Changer le statut d'une pièce
 */
export async function updatePlayStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Validation du statut
    const statusValidation = validatePlayStatus(status);
    if (!statusValidation.valid) {
      throw new ValidationError(statusValidation.message);
    }

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const checkQuery = `SELECT id, user_id FROM plays WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    const play = checkResult.rows[0];

    if (play.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Mise à jour du statut
    const updateQuery = `
      UPDATE plays
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const updateResult = await pool.query(updateQuery, [status, id]);
    const updatedPlay = updateResult.rows[0];

    res.json({
      play: {
        id: updatedPlay.id,
        userId: updatedPlay.user_id,
        title: updatedPlay.title,
        subtitle: updatedPlay.subtitle,
        contentVersion: updatedPlay.content_version,
        status: updatedPlay.status,
        paperSize: updatedPlay.paper_size || 'A5',
        createdAt: updatedPlay.created_at,
        updatedAt: updatedPlay.updated_at,
        lastEditedAt: updatedPlay.last_edited_at,
        statistics: updatedPlay.statistics && Object.keys(updatedPlay.statistics).length > 0 ? updatedPlay.statistics : null
      },
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
}