-- Migration: Add missing database indexes
-- Purpose: Optimize database performance for common queries

-- Index pour filtrage par statut de pièce
-- Améliore les requêtes de type: SELECT * FROM plays WHERE status = 'draft'
CREATE INDEX IF NOT EXISTS idx_plays_status ON plays(status);

-- Index pour la clé étrangère play_id dans export_templates
-- Améliore les requêtes de jointure et les recherches de templates par pièce
CREATE INDEX IF NOT EXISTS idx_export_templates_play_id ON export_templates(play_id);

-- Index composite pour le job de cleanup des versions
-- Améliore les requêtes de type: SELECT * FROM play_versions WHERE version_type = 'auto' ORDER BY created_at
CREATE INDEX IF NOT EXISTS idx_play_versions_cleanup ON play_versions(version_type, created_at);
