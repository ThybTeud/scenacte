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
 * Liste des pièces de l'utilisateur connecté (paginée)
 */
export async function listPlays(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user.id;

    // Validation de la pagination
    const paginationValidation = validatePagination(page, limit);
    if (!paginationValidation.valid) {
      throw new ValidationError(paginationValidation.message);
    }

    const validatedPage = paginationValidation.page;
    const validatedLimit = paginationValidation.limit;

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

    // Requête pour récupérer les pièces avec stats
    const playsQuery = `
      SELECT 
        p.id, p.title, p.subtitle, p.status, p.content_version,
        p.created_at, p.updated_at, p.last_edited_at,
        s.word_count, s.total_acts, s.total_scenes, s.total_characters,
        s.total_lines, s.estimated_duration_minutes
      FROM plays p
      LEFT JOIN play_statistics s ON s.play_id = p.id
      ${whereClause}
      ORDER BY p.last_edited_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(validatedLimit, (validatedPage - 1) * validatedLimit);

    // Requête pour le total
    const countQuery = `SELECT COUNT(*) FROM plays p ${whereClause}`;
    const countParams = queryParams.slice(0, status ? 2 : 1);

    const [playsResult, countResult] = await Promise.all([
      pool.query(playsQuery, queryParams),
      pool.query(countQuery, countParams)
    ]);

    const plays = playsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      status: row.status,
      contentVersion: row.content_version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastEditedAt: row.last_edited_at,
      statistics: row.word_count !== null ? {
        wordCount: row.word_count,
        totalActs: row.total_acts,
        totalScenes: row.total_scenes,
        totalCharacters: row.total_characters,
        totalLines: row.total_lines,
        estimatedDurationMinutes: row.estimated_duration_minutes
      } : null
    }));

    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      plays,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages: Math.ceil(total / validatedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
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

    // Calcul de la taille du fichier pour la version initiale
    const fileSizeBytes = Buffer.byteLength(rawContent || '', 'utf8') + 
                         Buffer.byteLength(htmlContent || '', 'utf8');

    await client.query('BEGIN');

    // 1. Créer la pièce
    const insertPlayQuery = `
      INSERT INTO plays (user_id, title, subtitle, raw_content, html_content, content_version, status, last_edited_at)
      VALUES ($1, $2, $3, $4, $5, 1, 'draft', NOW())
      RETURNING id, user_id, title, subtitle, raw_content, html_content, content_version, status, created_at, updated_at, last_edited_at
    `;
    const playResult = await client.query(insertPlayQuery, [
      userId,
      title.trim(),
      subtitle?.trim() || null,
      rawContent || '',
      htmlContent || ''
    ]);
    const play = playResult.rows[0];

    // 2. Créer la version initiale
    const insertVersionQuery = `
      INSERT INTO play_versions (play_id, version_number, title, raw_content, html_content, version_type, manual_label, file_size_bytes, preserved_reason)
      VALUES ($1, 1, $2, $3, $4, 'manual', 'Version initiale', $5, 'manual')
      RETURNING id
    `;
    await client.query(insertVersionQuery, [
      play.id,
      play.title,
      play.raw_content,
      play.html_content,
      fileSizeBytes
    ]);

    // 3. Créer les statistiques
    const insertStatsQuery = `
      INSERT INTO play_statistics (play_id, total_acts, total_scenes, total_characters, total_lines, word_count, estimated_duration_minutes, content_version)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
      RETURNING id, total_acts, total_scenes, total_characters, total_lines, word_count, estimated_duration_minutes
    `;
    const statsResult = await client.query(insertStatsQuery, [
      play.id,
      stats.totalActs,
      stats.totalScenes,
      stats.totalCharacters,
      stats.totalLines,
      stats.wordCount,
      stats.estimatedDurationMinutes
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
        contentVersion: play.content_version,
        status: play.status,
        createdAt: play.created_at,
        updatedAt: play.updated_at,
        lastEditedAt: play.last_edited_at,
        statistics: statsResult.rows[0]
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

    // Récupération de la pièce avec stats
    const query = `
      SELECT 
        p.*,
        s.total_acts, s.total_scenes, s.total_characters, s.total_lines, 
        s.word_count, s.estimated_duration_minutes, s.calculated_at, s.content_version as stats_content_version
      FROM plays p
      LEFT JOIN play_statistics s ON s.play_id = p.id
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
        contentVersion: row.content_version,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastEditedAt: row.last_edited_at,
        statistics: row.word_count !== null ? {
          totalActs: row.total_acts,
          totalScenes: row.total_scenes,
          totalCharacters: row.total_characters,
          totalLines: row.total_lines,
          wordCount: row.word_count,
          estimatedDurationMinutes: row.estimated_duration_minutes,
          calculatedAt: row.calculated_at,
          contentVersion: row.stats_content_version
        } : null
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
    const { title, subtitle, rawContent, htmlContent, statistics, versionType = 'auto', manualLabel } = req.body;
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

    const fileSizeBytes = Buffer.byteLength(rawContent, 'utf8') + Buffer.byteLength(htmlContent, 'utf8');

    // Récupérer le prochain numéro de version (protégé par FOR UPDATE sur la table plays)
    const maxVersionQuery = `SELECT COALESCE(MAX(version_number), 0) as max_version FROM play_versions WHERE play_id = $1`;
    const maxVersionResult = await client.query(maxVersionQuery, [id]);
    const nextVersionNumber = maxVersionResult.rows[0].max_version + 1;
    const newContentVersion = existingPlay.content_version + 1;

    // 1. Mettre à jour la pièce
    const updatePlayQuery = `
      UPDATE plays
      SET title = $1, subtitle = $2, raw_content = $3, html_content = $4, content_version = $5, last_edited_at = NOW(), updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    const playResult = await client.query(updatePlayQuery, [
      title.trim(),
      subtitle?.trim() || null,
      rawContent,
      htmlContent,
      newContentVersion,
      id
    ]);

    // 2. Créer nouvelle version
    const insertVersionQuery = `
      INSERT INTO play_versions (play_id, version_number, title, raw_content, html_content, version_type, manual_label, file_size_bytes, preserved_reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const versionResult = await client.query(insertVersionQuery, [
      id,
      nextVersionNumber,
      title.trim(),
      rawContent,
      htmlContent,
      versionType,
      versionType === 'manual' ? (manualLabel || null) : null,
      fileSizeBytes,
      versionType === 'manual' ? 'manual' : null
    ]);
    const versionId = versionResult.rows[0].id;

    // 3. Upsert play_statistics
    const upsertStatsQuery = `
      INSERT INTO play_statistics (play_id, total_acts, total_scenes, total_characters, total_lines, word_count, estimated_duration_minutes, content_version, calculated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (play_id)
      DO UPDATE SET
        total_acts = $2, total_scenes = $3, total_characters = $4, total_lines = $5,
        word_count = $6, estimated_duration_minutes = $7, content_version = $8, calculated_at = NOW()
      RETURNING *
    `;
    const statsResult = await client.query(upsertStatsQuery, [
      id,
      calculatedStats.totalActs,
      calculatedStats.totalScenes,
      calculatedStats.totalCharacters,
      calculatedStats.totalLines,
      calculatedStats.wordCount,
      calculatedStats.estimatedDurationMinutes,
      newContentVersion
    ]);

    // 4. Créer version_statistics
    const insertVersionStatsQuery = `
      INSERT INTO version_statistics (version_id, total_acts, total_scenes, total_characters, total_lines, word_count, estimated_duration_minutes, calculated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `;
    await client.query(insertVersionStatsQuery, [
      versionId,
      calculatedStats.totalActs,
      calculatedStats.totalScenes,
      calculatedStats.totalCharacters,
      calculatedStats.totalLines,
      calculatedStats.wordCount,
      calculatedStats.estimatedDurationMinutes
    ]);

    await client.query('COMMIT');

    const play = playResult.rows[0];
    const stats = statsResult.rows[0];

    res.json({
      play: {
        id: play.id,
        userId: play.user_id,
        title: play.title,
        subtitle: play.subtitle,
        rawContent: play.raw_content,
        htmlContent: play.html_content,
        contentVersion: play.content_version,
        status: play.status,
        createdAt: play.created_at,
        updatedAt: play.updated_at,
        lastEditedAt: play.last_edited_at,
        statistics: stats
      },
      versionNumber: nextVersionNumber,
      message: 'Pièce sauvegardée avec succès'
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

    // Récupérer les stats
    const statsQuery = `SELECT * FROM play_statistics WHERE play_id = $1`;
    const statsResult = await pool.query(statsQuery, [id]);

    const updatedPlay = updateResult.rows[0];

    res.json({
      play: {
        ...updatedPlay,
        statistics: statsResult.rows[0] || null
      },
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
}