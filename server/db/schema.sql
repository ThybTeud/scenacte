-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table plays (avec statistics JSONB embarquées)
CREATE TABLE IF NOT EXISTS plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  raw_content TEXT NOT NULL,
  html_content TEXT NOT NULL,
  ast_content TEXT,
  content_version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  paper_size VARCHAR(10) DEFAULT 'A5' CHECK (paper_size IN ('A4', 'A5')),
  template_id UUID REFERENCES export_templates(id) ON DELETE SET NULL,
  statistics JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_edited_at TIMESTAMP DEFAULT NOW()
);

-- Table play_history (historique des versions, sans html_content)
CREATE TABLE IF NOT EXISTS play_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT,
  raw_content TEXT,
  version_type TEXT NOT NULL CHECK (version_type IN ('auto', 'manual')),
  manual_label TEXT,
  file_size_bytes INTEGER,
  preserved_reason TEXT CHECK (preserved_reason IN ('manual', 'recent', 'daily_snapshot')),
  statistics JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_play_history_play_id ON play_history(play_id);
CREATE INDEX IF NOT EXISTS idx_play_history_play_created ON play_history(play_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_play_history_cleanup ON play_history(version_type, created_at);
CREATE INDEX IF NOT EXISTS idx_plays_statistics_gin ON plays USING gin(statistics);
CREATE INDEX IF NOT EXISTS idx_play_history_statistics_gin ON play_history USING gin(statistics);
CREATE INDEX IF NOT EXISTS idx_export_templates_user_id ON export_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_export_templates_system ON export_templates(user_id) WHERE user_id IS NULL;

-- Table bug_reports
CREATE TABLE IF NOT EXISTS bug_reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(60) NOT NULL,
  description TEXT NOT NULL,
  categories VARCHAR(50)[] NOT NULL,
  screenshot TEXT,
  url VARCHAR(500),
  user_agent VARCHAR(500),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  app_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
