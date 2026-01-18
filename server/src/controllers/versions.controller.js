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
    let whereClause = 'WHERE ph.play_id = $1';
    const queryParams = [id];
    let paramIndex = 2;

    if (type) {
      if (type !== 'auto' && type !== 'manual') {
        throw new ValidationError('Type invalide (auto ou manual uniquement)');
      }
      whereClause += ` AND ph.version_type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    // Requête pour récupérer les versions depuis play_history (statistics embarquées en JSONB)
    const versionsQuery = `
      SELECT
        ph.id, ph.version_number, ph.title, ph.version_type, ph.manual_label,
        ph.file_size_bytes, ph.preserved_reason, ph.created_at,
        ph.statistics
      FROM play_history ph
      ${whereClause}
      ORDER BY ph.version_number DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(validatedLimit, (validatedPage - 1) * validatedLimit);

    // Requête pour le total
    const countQuery = `SELECT COUNT(*) FROM play_history ph ${whereClause}`;
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
      statistics: row.statistics && Object.keys(row.statistics).length > 0 ? row.statistics : null
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

    // Récupérer la version complète depuis play_history (statistics embarquées en JSONB)
    const versionQuery = `
      SELECT *
      FROM play_history
      WHERE id = $1
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
        versionType: row.version_type,
        manualLabel: row.manual_label,
        fileSizeBytes: row.file_size_bytes,
        preservedReason: row.preserved_reason,
        createdAt: row.created_at,
        statistics: row.statistics && Object.keys(row.statistics).length > 0 ? row.statistics : null
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

    // Récupérer la version à restaurer avec ses stats depuis play_history
    const versionQuery = `
      SELECT *
      FROM play_history
      WHERE id = $1
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
    const maxVersionQuery = `SELECT COALESCE(MAX(version_number), 0) as max_version FROM play_history WHERE play_id = $1`;
    const maxVersionResult = await client.query(maxVersionQuery, [id]);
    const nextVersionNumber = maxVersionResult.rows[0].max_version + 1;
    const newContentVersion = play.content_version + 1;

    const fileSizeBytes = Buffer.byteLength(versionToRestore.raw_content, 'utf8');
    const manualLabel = `Restauré depuis version ${versionToRestore.version_number}`;

    // Récupérer les stats de la version à restaurer et mettre à jour contentVersion
    const restoredStats = versionToRestore.statistics && Object.keys(versionToRestore.statistics).length > 0
      ? { ...versionToRestore.statistics, contentVersion: newContentVersion, calculatedAt: new Date().toISOString() }
      : { contentVersion: newContentVersion };

    // 1. Mettre à jour la pièce avec les stats restaurées
    // Note: html_content doit être régénéré côté client car il n'est plus stocké dans l'historique
    const updatePlayQuery = `
      UPDATE plays
      SET title = $1, raw_content = $2, content_version = $3, statistics = $4, last_edited_at = NOW(), updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    await client.query(updatePlayQuery, [
      versionToRestore.title,
      versionToRestore.raw_content,
      newContentVersion,
      JSON.stringify(restoredStats),
      id
    ]);

    // 2. Créer nouvelle entrée dans play_history
    const insertHistoryQuery = `
      INSERT INTO play_history (play_id, version_number, title, raw_content, version_type, manual_label, file_size_bytes, preserved_reason, statistics)
      VALUES ($1, $2, $3, $4, 'manual', $5, $6, 'manual', $7)
      RETURNING id
    `;
    await client.query(insertHistoryQuery, [
      id,
      nextVersionNumber,
      versionToRestore.title,
      versionToRestore.raw_content,
      manualLabel,
      fileSizeBytes,
      JSON.stringify(restoredStats)
    ]);

    await client.query('COMMIT');

    // Récupérer la pièce complète (statistics embarquées)
    const fullPlayQuery = `SELECT * FROM plays WHERE id = $1`;
    const fullPlayResult = await client.query(fullPlayQuery, [id]);
    const restoredPlay = fullPlayResult.rows[0];

    res.json({
      play: {
        id: restoredPlay.id,
        userId: restoredPlay.user_id,
        title: restoredPlay.title,
        subtitle: restoredPlay.subtitle,
        rawContent: restoredPlay.raw_content,
        htmlContent: restoredPlay.html_content,
        contentVersion: restoredPlay.content_version,
        status: restoredPlay.status,
        createdAt: restoredPlay.created_at,
        updatedAt: restoredPlay.updated_at,
        lastEditedAt: restoredPlay.last_edited_at,
        statistics: restoredPlay.statistics && Object.keys(restoredPlay.statistics).length > 0 ? restoredPlay.statistics : null
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

    // Vérifier que la pièce existe et appartient à l'utilisateur (statistics embarquées)
    const playQuery = `SELECT * FROM plays WHERE id = $1`;
    const playResult = await client.query(playQuery, [id]);

    if (playResult.rows.length === 0) {
      throw new NotFoundError('Pièce non trouvée');
    }

    const play = playResult.rows[0];

    if (play.user_id !== userId) {
      throw new ForbiddenError('Accès non autorisé à cette pièce');
    }

    // Récupérer le prochain numéro de version
    const maxVersionQuery = `SELECT COALESCE(MAX(version_number), 0) as max_version FROM play_history WHERE play_id = $1`;
    const maxVersionResult = await client.query(maxVersionQuery, [id]);
    const nextVersionNumber = maxVersionResult.rows[0].max_version + 1;

    const fileSizeBytes = Buffer.byteLength(play.raw_content, 'utf8');

    // Créer la version manuelle dans play_history (sans html_content, avec statistics JSONB)
    const insertHistoryQuery = `
      INSERT INTO play_history (play_id, version_number, title, raw_content, version_type, manual_label, file_size_bytes, preserved_reason, statistics)
      VALUES ($1, $2, $3, $4, 'manual', $5, $6, 'manual', $7)
      RETURNING *
    `;
    const historyResult = await client.query(insertHistoryQuery, [
      id,
      nextVersionNumber,
      play.title,
      play.raw_content,
      manualLabel?.trim() || null,
      fileSizeBytes,
      JSON.stringify(play.statistics || {})
    ]);
    const newVersion = historyResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      version: {
        id: newVersion.id,
        playId: newVersion.play_id,
        versionNumber: newVersion.version_number,
        title: newVersion.title,
        rawContent: newVersion.raw_content,
        versionType: newVersion.version_type,
        manualLabel: newVersion.manual_label,
        fileSizeBytes: newVersion.file_size_bytes,
        preservedReason: newVersion.preserved_reason,
        createdAt: newVersion.created_at,
        statistics: newVersion.statistics && Object.keys(newVersion.statistics).length > 0 ? newVersion.statistics : null
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