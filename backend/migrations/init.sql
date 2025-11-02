-- Scenacte Database Schema
-- PostgreSQL 16

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types ENUM
CREATE TYPE play_status AS ENUM ('draft', 'completed', 'archived');
CREATE TYPE version_type AS ENUM ('auto', 'manual');
CREATE TYPE preserved_reason AS ENUM ('manual', 'recent', 'daily_snapshot');

-- Table users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table plays
CREATE TABLE plays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    raw_content TEXT NOT NULL,
    html_content TEXT NOT NULL,
    content_version INTEGER NOT NULL DEFAULT 1,
    status play_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_edited_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table play_versions
CREATE TABLE play_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    html_content TEXT NOT NULL,
    version_type version_type NOT NULL,
    manual_label TEXT,
    file_size_bytes INTEGER NOT NULL,
    preserved_reason preserved_reason,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table play_statistics
CREATE TABLE play_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    play_id UUID UNIQUE NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
    total_acts INTEGER NOT NULL DEFAULT 0,
    total_scenes INTEGER NOT NULL DEFAULT 0,
    total_characters INTEGER NOT NULL DEFAULT 0,
    total_lines INTEGER NOT NULL DEFAULT 0,
    word_count INTEGER NOT NULL DEFAULT 0,
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 0,
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    content_version INTEGER NOT NULL
);

-- Table version_statistics
CREATE TABLE version_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID UNIQUE NOT NULL REFERENCES play_versions(id) ON DELETE CASCADE,
    total_acts INTEGER NOT NULL DEFAULT 0,
    total_scenes INTEGER NOT NULL DEFAULT 0,
    total_characters INTEGER NOT NULL DEFAULT 0,
    total_lines INTEGER NOT NULL DEFAULT 0,
    word_count INTEGER NOT NULL DEFAULT 0,
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 0,
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table export_templates
CREATE TABLE export_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    settings JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_plays_user_id ON plays(user_id);
CREATE INDEX idx_play_versions_play_id ON play_versions(play_id);
CREATE INDEX idx_play_versions_play_created ON play_versions(play_id, created_at DESC);
CREATE INDEX idx_export_templates_user_id ON export_templates(user_id);

-- Commentaires
COMMENT ON TABLE users IS 'Utilisateurs de l''application';
COMMENT ON TABLE plays IS 'Pièces de théâtre (version courante)';
COMMENT ON TABLE play_versions IS 'Historique complet des versions';
COMMENT ON TABLE play_statistics IS 'Statistiques de la version courante';
COMMENT ON TABLE version_statistics IS 'Statistiques par version historique';
COMMENT ON TABLE export_templates IS 'Templates d''export PDF';

COMMENT ON COLUMN plays.content_version IS 'Numéro de version incrémenté à chaque sauvegarde';
COMMENT ON COLUMN play_versions.version_number IS 'Numéro de version (auto-incrémenté par pièce)';
COMMENT ON COLUMN play_versions.preserved_reason IS 'Raison de préservation pour la stratégie de rétention';
COMMENT ON COLUMN export_templates.settings IS 'Configuration du template (marges, police, etc.) en JSON';