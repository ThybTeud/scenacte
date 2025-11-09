-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table plays
CREATE TABLE IF NOT EXISTS plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  raw_content TEXT NOT NULL,
  html_content TEXT NOT NULL,
  content_version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_edited_at TIMESTAMP DEFAULT NOW()
);

-- Table play_versions
CREATE TABLE IF NOT EXISTS play_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT,
  raw_content TEXT,
  html_content TEXT,
  version_type TEXT NOT NULL CHECK (version_type IN ('auto', 'manual')),
  manual_label TEXT,
  file_size_bytes INTEGER,
  preserved_reason TEXT CHECK (preserved_reason IN ('manual', 'recent', 'daily_snapshot')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table play_statistics
CREATE TABLE IF NOT EXISTS play_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  play_id UUID UNIQUE REFERENCES plays(id) ON DELETE CASCADE,
  total_acts INTEGER DEFAULT 0,
  total_scenes INTEGER DEFAULT 0,
  total_characters INTEGER DEFAULT 0,
  total_lines INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  estimated_duration_minutes INTEGER DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT NOW(),
  content_version INTEGER
);

-- Table version_statistics
CREATE TABLE IF NOT EXISTS version_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID UNIQUE REFERENCES play_versions(id) ON DELETE CASCADE,
  total_acts INTEGER DEFAULT 0,
  total_scenes INTEGER DEFAULT 0,
  total_characters INTEGER DEFAULT 0,
  total_lines INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  estimated_duration_minutes INTEGER DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Table export_templates
CREATE TABLE IF NOT EXISTS export_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  settings JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_plays_user_id ON plays(user_id);
CREATE INDEX IF NOT EXISTS idx_play_versions_play_id ON play_versions(play_id);
CREATE INDEX IF NOT EXISTS idx_play_versions_play_created ON play_versions(play_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_templates_user_id ON export_templates(user_id);
