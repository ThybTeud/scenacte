-- Migration: Restructuration du versioning des pièces
-- Date: 2026-01-18
--
-- Cette migration:
-- 1. Ajoute ast_content TEXT et statistics JSONB à plays
-- 2. Migre les données de play_statistics vers plays.statistics
-- 3. Renomme play_versions en play_history
-- 4. Ajoute statistics JSONB à play_history
-- 5. Migre les données de version_statistics vers play_history.statistics
-- 6. Supprime html_content de play_history
-- 7. Supprime les tables play_statistics et version_statistics
-- 8. Met à jour les index

BEGIN;

-- ============================================================
-- ÉTAPE 1: Ajouter les nouvelles colonnes à plays
-- ============================================================

-- ast_content pour stocker l'AST sérialisé (nullable pour l'instant)
ALTER TABLE plays ADD COLUMN IF NOT EXISTS ast_content TEXT;

-- statistics JSONB pour embarquer les statistiques directement
ALTER TABLE plays ADD COLUMN IF NOT EXISTS statistics JSONB DEFAULT '{}';

COMMENT ON COLUMN plays.ast_content IS 'AST (Abstract Syntax Tree) de la pièce, sérialisé en JSON';
COMMENT ON COLUMN plays.statistics IS 'Statistiques de la pièce (actes, scènes, personnages, etc.) en JSONB';

-- ============================================================
-- ÉTAPE 2: Migrer les données de play_statistics vers plays.statistics
-- ============================================================

UPDATE plays p
SET statistics = jsonb_build_object(
    'totalActs', COALESCE(ps.total_acts, 0),
    'totalScenes', COALESCE(ps.total_scenes, 0),
    'totalCharacters', COALESCE(ps.total_characters, 0),
    'totalLines', COALESCE(ps.total_lines, 0),
    'wordCount', COALESCE(ps.word_count, 0),
    'estimatedDurationMinutes', COALESCE(ps.estimated_duration_minutes, 0),
    'calculatedAt', ps.calculated_at,
    'contentVersion', ps.content_version
)
FROM play_statistics ps
WHERE ps.play_id = p.id;

-- ============================================================
-- ÉTAPE 3: Renommer play_versions en play_history
-- ============================================================

ALTER TABLE play_versions RENAME TO play_history;

-- Mettre à jour les commentaires
COMMENT ON TABLE play_history IS 'Historique complet des versions des pièces';

-- ============================================================
-- ÉTAPE 4: Ajouter statistics JSONB à play_history
-- ============================================================

ALTER TABLE play_history ADD COLUMN IF NOT EXISTS statistics JSONB DEFAULT '{}';

COMMENT ON COLUMN play_history.statistics IS 'Statistiques de cette version historique en JSONB';

-- ============================================================
-- ÉTAPE 5: Migrer les données de version_statistics vers play_history.statistics
-- ============================================================

UPDATE play_history ph
SET statistics = jsonb_build_object(
    'totalActs', COALESCE(vs.total_acts, 0),
    'totalScenes', COALESCE(vs.total_scenes, 0),
    'totalCharacters', COALESCE(vs.total_characters, 0),
    'totalLines', COALESCE(vs.total_lines, 0),
    'wordCount', COALESCE(vs.word_count, 0),
    'estimatedDurationMinutes', COALESCE(vs.estimated_duration_minutes, 0),
    'calculatedAt', vs.calculated_at
)
FROM version_statistics vs
WHERE vs.version_id = ph.id;

-- ============================================================
-- ÉTAPE 6: Supprimer html_content de play_history (régénérable)
-- ============================================================

ALTER TABLE play_history DROP COLUMN IF EXISTS html_content;

-- ============================================================
-- ÉTAPE 7: Supprimer les anciennes tables de statistiques
-- ============================================================

DROP TABLE IF EXISTS version_statistics;
DROP TABLE IF EXISTS play_statistics;

-- ============================================================
-- ÉTAPE 8: Mettre à jour les index
-- ============================================================

-- Supprimer les anciens index qui référençaient play_versions
DROP INDEX IF EXISTS idx_play_versions_play_id;
DROP INDEX IF EXISTS idx_play_versions_play_created;
DROP INDEX IF EXISTS idx_play_versions_cleanup;

-- Créer les nouveaux index pour play_history
CREATE INDEX IF NOT EXISTS idx_play_history_play_id ON play_history(play_id);
CREATE INDEX IF NOT EXISTS idx_play_history_play_created ON play_history(play_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_play_history_cleanup ON play_history(version_type, created_at);

-- Index GIN pour les recherches dans statistics (optionnel mais utile pour les requêtes JSONB)
CREATE INDEX IF NOT EXISTS idx_plays_statistics_gin ON plays USING gin(statistics);
CREATE INDEX IF NOT EXISTS idx_play_history_statistics_gin ON play_history USING gin(statistics);

COMMIT;
