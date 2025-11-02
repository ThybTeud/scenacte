import { pool } from '../config/database.js';
import { validateUUID, validatePagination } from '../utils/validation.js';
import { 
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ValidationError 
} from '../middleware/errorHandler.js';

/**
 * GET /api/plays/:id/versions
 * Liste des versions d'une pièce (paginée)
 */
export async function listVersions(req, res, next) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    // Validation de la pagination
    const paginationValidation = validatePagination(page, limit);
    if (!paginationValidation.valid) {
      throw new ValidationError(paginationValidation.message);
    }

    const validatedPage = paginationValidation.page;
    const validatedLimit = paginationValidation.limit;

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const playQuery = `SELECT id, user_id FROM plays WHERE id = $1`;
    const playResult = await pool.query(playQuery, [id]);

    if (playResult.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    if (playResult.rows[0].user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Construction du filtre
    let whereClause = 'WHERE pv.play_id = $1';
    const queryParams = [id];
    let paramIndex = 2;

    if (type) {
      if (type !== 'auto' && type !== 'manual') {
        throw new ValidationError('Type invalide (auto ou manual uniquement)');
      }
      whereClause += ` AND pv.version_type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    // Requête pour récupérer les versions
    const versionsQuery = `
      SELECT 
        pv.id, pv.version_number, pv.title, pv.version_type, pv.manual_label,
        pv.file_size_bytes, pv.preserved_reason, pv.created_at,
        vs.total_acts, vs.total_scenes, vs.total_characters, vs.total_lines,
        vs.word_count, vs.estimated_duration_minutes
      FROM play_versions pv
      LEFT JOIN version_statistics vs ON vs.version_id = pv.id
      ${whereClause}
      ORDER BY pv.version_number DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(validatedLimit, (validatedPage - 1) * validatedLimit);

    // Requête pour le total
    const countQuery = `SELECT COUNT(*) FROM play_versions pv ${whereClause}`;
    const countParams = queryParams.slice(0, type ? 2 : 1);

    const [versionsResult, countResult] = await Promise.all([
      pool.query(versionsQuery, queryParams),
      pool.query(countQuery, countParams)
    ]);

    const versions = versionsResult.rows.map(row => ({
      id: row.id,
      versionNumber: row.version_number,
      title: row.title,
      versionType: row.version_type,
      manualLabel: row.manual_label,
      fileSizeBytes: row.file_size_bytes,
      preservedReason: row.preserved_reason,
      createdAt: row.created_at,
      statistics: row.word_count !== null ? {
        totalActs: row.total_acts,
        totalScenes: row.total_scenes,
        totalCharacters: row.total_characters,
        totalLines: row.total_lines,
        wordCount: row.word_count,
        estimatedDurationMinutes: row.estimated_duration_minutes
      } : null
    }));

    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      versions,
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
 * GET /api/plays/:id/versions/:versionId
 * Récupérer une version spécifique (avec le contenu complet)
 */
export async function getVersion(req, res, next) {
  try {
    const { id, versionId } = req.params;
    const userId = req.user.id;

    // Validation UUIDs
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    const versionIdValidation = validateUUID(versionId);
    if (!versionIdValidation.valid) {
      throw new ValidationError('ID de version invalide');
    }

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const playQuery = `SELECT id, user_id FROM plays WHERE id = $1`;
    const playResult = await pool.query(playQuery, [id]);

    if (playResult.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    if (playResult.rows[0].user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Récupérer la version complète
    const versionQuery = `
      SELECT 
        pv.*,
        vs.total_acts, vs.total_scenes, vs.total_characters, vs.total_lines,
        vs.word_count, vs.estimated_duration_minutes, vs.calculated_at
      FROM play_versions pv
      LEFT JOIN version_statistics vs ON vs.version_id = pv.id
      WHERE pv.id = $1
    `;
    const versionResult = await pool.query(versionQuery, [versionId]);

    if (versionResult.rows.length === 0) {
      throw new NotFoundError('Version non trouvée');
    }

    const row = versionResult.rows[0];

    // Vérifier que la version appartient bien à cette pièce
    if (row.play_id !== id) {
      throw new ForbiddenError('Cette version n\'appartient pas à cette pièce');
    }

    res.json({
      version: {
        id: row.id,
        playId: row.play_id,
        versionNumber: row.version_number,
        title: row.title,
        rawContent: row.raw_content,
        htmlContent: row.html_content,
        versionType: row.version_type,
        manualLabel: row.manual_label,
        fileSizeBytes: row.file_size_bytes,
        preservedReason: row.preserved_reason,
        createdAt: row.created_at,
        statistics: row.word_count !== null ? {
          totalActs: row.total_acts,
          totalScenes: row.total_scenes,
          totalCharacters: row.total_characters,
          totalLines: row.total_lines,
          wordCount: row.word_count,
          estimatedDurationMinutes: row.estimated_duration_minutes,
          calculatedAt: row.calculated_at
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/plays/:id/versions/restore
 * Restaurer une version (crée une nouvelle version manuelle)
 */
export async function restoreVersion(req, res, next) {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { versionId } = req.body;
    const userId = req.user.id;

    // Validations
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    if (!versionId) {
      throw new BadRequestError('versionId requis');
    }

    const versionIdValidation = validateUUID(versionId);
    if (!versionIdValidation.valid) {
      throw new ValidationError('ID de version invalide');
    }

    await client.query('BEGIN');

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const playQuery = `SELECT id, user_id, content_version FROM plays WHERE id = $1`;
    const playResult = await client.query(playQuery, [id]);

    if (playResult.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    const play = playResult.rows[0];

    if (play.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Récupérer la version à restaurer avec ses stats
    const versionQuery = `
      SELECT 
        pv.*,
        vs.total_acts, vs.total_scenes, vs.total_characters, vs.total_lines,
        vs.word_count, vs.estimated_duration_minutes
      FROM play_versions pv
      LEFT JOIN version_statistics vs ON vs.version_id = pv.id
      WHERE pv.id = $1
    `;
    const versionResult = await client.query(versionQuery, [versionId]);

    if (versionResult.rows.length === 0) {
      throw new NotFoundError('Version à restaurer non trouvée');
    }

    const versionToRestore = versionResult.rows[0];

    if (versionToRestore.play_id !== id) {
      throw new ForbiddenError('Cette version n\'appartient pas à cette pièce');
    }

    // Récupérer le prochain numéro de version
    const maxVersionQuery = `SELECT COALESCE(MAX(version_number), 0) as max_version FROM play_versions WHERE play_id = $1`;
    const maxVersionResult = await client.query(maxVersionQuery, [id]);
    const nextVersionNumber = maxVersionResult.rows[0].max_version + 1;
    const newContentVersion = play.content_version + 1;

    const fileSizeBytes = Buffer.byteLength(versionToRestore.raw_content, 'utf8') + 
                         Buffer.byteLength(versionToRestore.html_content, 'utf8');

    const manualLabel = `Restauré depuis version ${versionToRestore.version_number}`;

    // 1. Mettre à jour la pièce
    const updatePlayQuery = `
      UPDATE plays
      SET title = $1, raw_content = $2, html_content = $3, content_version = $4, last_edited_at = NOW(), updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    const playUpdateResult = await client.query(updatePlayQuery, [
      versionToRestore.title,
      versionToRestore.raw_content,
      versionToRestore.html_content,
      newContentVersion,
      id
    ]);

    // 2. Créer nouvelle version manuelle
    const insertVersionQuery = `
      INSERT INTO play_versions (play_id, version_number, title, raw_content, html_content, version_type, manual_label, file_size_bytes, preserved_reason)
      VALUES ($1, $2, $3, $4, $5, 'manual', $6, $7, 'manual')
      RETURNING id
    `;
    const newVersionResult = await client.query(insertVersionQuery, [
      id,
      nextVersionNumber,
      versionToRestore.title,
      versionToRestore.raw_content,
      versionToRestore.html_content,
      manualLabel,
      fileSizeBytes
    ]);
    const newVersionId = newVersionResult.rows[0].id;

    // 3. Upsert play_statistics
    if (versionToRestore.word_count !== null) {
      const upsertStatsQuery = `
        INSERT INTO play_statistics (play_id, total_acts, total_scenes, total_characters, total_lines, word_count, estimated_duration_minutes, content_version, calculated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (play_id)
        DO UPDATE SET
          total_acts = $2, total_scenes = $3, total_characters = $4, total_lines = $5,
          word_count = $6, estimated_duration_minutes = $7, content_version = $8, calculated_at = NOW()
      `;
      await client.query(upsertStatsQuery, [
        id,
        versionToRestore.total_acts,
        versionToRestore.total_scenes,
        versionToRestore.total_characters,
        versionToRestore.total_lines,
        versionToRestore.word_count,
        versionToRestore.estimated_duration_minutes,
        newContentVersion
      ]);

      // 4. Créer version_statistics
      const insertVersionStatsQuery = `
        INSERT INTO version_statistics (version_id, total_acts, total_scenes, total_characters, total_lines, word_count, estimated_duration_minutes, calculated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `;
      await client.query(insertVersionStatsQuery, [
        newVersionId,
        versionToRestore.total_acts,
        versionToRestore.total_scenes,
        versionToRestore.total_characters,
        versionToRestore.total_lines,
        versionToRestore.word_count,
        versionToRestore.estimated_duration_minutes
      ]);
    }

    await client.query('COMMIT');

    // Récupérer la pièce complète avec stats
    const fullPlayQuery = `
      SELECT 
        p.*,
        s.total_acts, s.total_scenes, s.total_characters, s.total_lines,
        s.word_count, s.estimated_duration_minutes
      FROM plays p
      LEFT JOIN play_statistics s ON s.play_id = p.id
      WHERE p.id = $1
    `;
    const fullPlayResult = await client.query(fullPlayQuery, [id]);
    const restoredPlay = fullPlayResult.rows[0];

    res.json({
      play: {
        ...restoredPlay,
        statistics: restoredPlay.word_count !== null ? {
          totalActs: restoredPlay.total_acts,
          totalScenes: restoredPlay.total_scenes,
          totalCharacters: restoredPlay.total_characters,
          totalLines: restoredPlay.total_lines,
          wordCount: restoredPlay.word_count,
          estimatedDurationMinutes: restoredPlay.estimated_duration_minutes
        } : null
      },
      versionNumber: nextVersionNumber,
      message: `Version ${versionToRestore.version_number} restaurée avec succès`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

/**
 * POST /api/plays/:id/versions/manual
 * Créer une version manuelle (snapshot) sans modifier le contenu
 */
export async function createManualVersion(req, res, next) {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { manualLabel } = req.body;
    const userId = req.user.id;

    // Validation UUID
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.message);
    }

    await client.query('BEGIN');

    // Vérifier que la pièce existe et appartient à l'utilisateur
    const playQuery = `
      SELECT 
        p.*,
        s.total_acts, s.total_scenes, s.total_characters, s.total_lines,
        s.word_count, s.estimated_duration_minutes
      FROM plays p
      LEFT JOIN play_statistics s ON s.play_id = p.id
      WHERE p.id = $1
    `;
    const playResult = await client.query(playQuery, [id]);

    if (playResult.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    const play = playResult.rows[0];

    if (play.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Récupérer le prochain numéro de version
    const maxVersionQuery = `SELECT COALESCE(MAX(version_number), 0) as max_version FROM play_versions WHERE play_id = $1`;
    const maxVersionResult = await client.query(maxVersionQuery, [id]);
    const nextVersionNumber = maxVersionResult.rows[0].max_version + 1;

    const fileSizeBytes = Buffer.byteLength(play.raw_content, 'utf8') + 
                         Buffer.byteLength(play.html_content, 'utf8');

    // 1. Créer la version manuelle
    const insertVersionQuery = `
      INSERT INTO play_versions (play_id, version_number, title, raw_content, html_content, version_type, manual_label, file_size_bytes, preserved_reason)
      VALUES ($1, $2, $3, $4, $5, 'manual', $6, $7, 'manual')
      RETURNING *
    `;
    const versionResult = await client.query(insertVersionQuery, [
      id,
      nextVersionNumber,
      play.title,
      play.raw_content,
      play.html_content,
      manualLabel?.trim() || null,
      fileSizeBytes
    ]);
    const newVersion = versionResult.rows[0];

    // 2. Créer les statistiques pour cette version
    if (play.word_count !== null) {
      const insertStatsQuery = `
        INSERT INTO version_statistics (version_id, total_acts, total_scenes, total_characters, total_lines, word_count, estimated_duration_minutes, calculated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `;
      await client.query(insertStatsQuery, [
        newVersion.id,
        play.total_acts,
        play.total_scenes,
        play.total_characters,
        play.total_lines,
        play.word_count,
        play.estimated_duration_minutes
      ]);
    }

    await client.query('COMMIT');

    // Récupérer la version complète avec stats
    const fullVersionQuery = `
      SELECT 
        pv.*,
        vs.total_acts, vs.total_scenes, vs.total_characters, vs.total_lines,
        vs.word_count, vs.estimated_duration_minutes
      FROM play_versions pv
      LEFT JOIN version_statistics vs ON vs.version_id = pv.id
      WHERE pv.id = $1
    `;
    const fullVersionResult = await client.query(fullVersionQuery, [newVersion.id]);
    const fullVersion = fullVersionResult.rows[0];

    res.status(201).json({
      version: {
        ...fullVersion,
        statistics: fullVersion.word_count !== null ? {
          totalActs: fullVersion.total_acts,
          totalScenes: fullVersion.total_scenes,
          totalCharacters: fullVersion.total_characters,
          totalLines: fullVersion.total_lines,
          wordCount: fullVersion.word_count,
          estimatedDurationMinutes: fullVersion.estimated_duration_minutes
        } : null
      },
      message: 'Version manuelle créée avec succès'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}