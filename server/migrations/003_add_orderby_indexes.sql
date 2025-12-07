-- Migration: Add ORDER BY optimization indexes
-- Purpose: Optimize database performance for sorting queries

-- Index pour ORDER BY version_number dans versions.controller.js
-- Améliore les requêtes de type: SELECT * FROM play_versions WHERE play_id = ? ORDER BY version_number DESC
CREATE INDEX IF NOT EXISTS idx_play_versions_play_version_num
ON play_versions(play_id, version_number DESC);

-- Index pour ORDER BY last_edited_at dans plays.controller.js (pagination)
-- Améliore les requêtes de type: SELECT * FROM plays WHERE user_id = ? ORDER BY last_edited_at DESC
CREATE INDEX IF NOT EXISTS idx_plays_user_edited
ON plays(user_id, last_edited_at DESC);

-- Index composite avec filtre status (pagination filtrée)
-- Améliore les requêtes de type: SELECT * FROM plays WHERE user_id = ? AND status = ? ORDER BY last_edited_at DESC
CREATE INDEX IF NOT EXISTS idx_plays_user_status_edited
ON plays(user_id, status, last_edited_at DESC);
