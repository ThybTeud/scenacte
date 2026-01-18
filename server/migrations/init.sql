-- Scenacte Database Schema
-- PostgreSQL 16
-- Schéma consolidé (inclut toutes les migrations)

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Types ENUM
DO $$ BEGIN
    CREATE TYPE play_status AS ENUM ('draft', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE version_type AS ENUM ('auto', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE preserved_reason AS ENUM ('manual', 'recent', 'daily_snapshot');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,  -- Nullable (migration 003)
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table export_templates (avant plays car référencée par plays.template_id)
CREATE TABLE IF NOT EXISTS export_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    play_id UUID,  -- Référence ajoutée après création de plays
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    settings JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table plays (avec statistics JSONB embarquées)
CREATE TABLE IF NOT EXISTS plays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    raw_content TEXT NOT NULL,
    html_content TEXT NOT NULL,
    ast_content TEXT,
    content_version INTEGER NOT NULL DEFAULT 1,
    status play_status NOT NULL DEFAULT 'draft',
    paper_size VARCHAR(10) DEFAULT 'A5' CHECK (paper_size IN ('A4', 'A5')),
    template_id UUID REFERENCES export_templates(id) ON DELETE SET NULL,
    statistics JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_edited_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ajouter la référence play_id à export_templates
ALTER TABLE export_templates
    ADD CONSTRAINT fk_export_templates_play
    FOREIGN KEY (play_id) REFERENCES plays(id) ON DELETE CASCADE;

-- Table play_history (historique des versions, sans html_content)
CREATE TABLE IF NOT EXISTS play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    version_type version_type NOT NULL,
    manual_label TEXT,
    file_size_bytes INTEGER NOT NULL,
    preserved_reason preserved_reason,
    statistics JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_plays_user_id ON plays(user_id);
CREATE INDEX IF NOT EXISTS idx_plays_status ON plays(status);
CREATE INDEX IF NOT EXISTS idx_plays_user_edited ON plays(user_id, last_edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_plays_user_status_edited ON plays(user_id, status, last_edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_plays_statistics_gin ON plays USING gin(statistics);
CREATE INDEX IF NOT EXISTS idx_play_history_play_id ON play_history(play_id);
CREATE INDEX IF NOT EXISTS idx_play_history_play_created ON play_history(play_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_play_history_play_version_num ON play_history(play_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_play_history_cleanup ON play_history(version_type, created_at);
CREATE INDEX IF NOT EXISTS idx_play_history_statistics_gin ON play_history USING gin(statistics);
CREATE INDEX IF NOT EXISTS idx_export_templates_user_id ON export_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_export_templates_play_id ON export_templates(play_id);
CREATE INDEX IF NOT EXISTS idx_export_templates_system ON export_templates(user_id) WHERE user_id IS NULL;

-- Templates système par défaut
INSERT INTO export_templates (id, user_id, name, is_default, settings) VALUES
  (gen_random_uuid(), NULL, 'Classique', true, '{
    "fontFamily": "Crimson Text",
    "fontSize": 12,
    "lineHeight": 1.6,
    "margins": {"top": 20, "bottom": 25, "left": 15, "right": 15}
  }'::jsonb),
  (gen_random_uuid(), NULL, 'Moderne', false, '{
    "fontFamily": "Inter",
    "fontSize": 11,
    "lineHeight": 1.5,
    "margins": {"top": 15, "bottom": 20, "left": 20, "right": 20}
  }'::jsonb),
  (gen_random_uuid(), NULL, 'Minimal', false, '{
    "fontFamily": "Space Grotesk",
    "fontSize": 11,
    "lineHeight": 1.4,
    "margins": {"top": 25, "bottom": 25, "left": 25, "right": 25}
  }'::jsonb)
ON CONFLICT DO NOTHING;

-- Commentaires
COMMENT ON TABLE users IS 'Utilisateurs de l''application';
COMMENT ON TABLE plays IS 'Pièces de théâtre (version courante avec statistics JSONB)';
COMMENT ON TABLE play_history IS 'Historique des versions (sans html_content, avec statistics JSONB)';
COMMENT ON TABLE export_templates IS 'Templates d''export PDF (user_id NULL = système)';
COMMENT ON COLUMN plays.ast_content IS 'AST sérialisé en JSON (optionnel)';
COMMENT ON COLUMN plays.statistics IS 'Statistiques embarquées en JSONB';
COMMENT ON COLUMN play_history.statistics IS 'Statistiques de la version en JSONB';
