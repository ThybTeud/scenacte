-- Migration 002 : Ajout du support OAuth2

-- Rendre password_hash nullable (users OAuth n'ont pas de mot de passe)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Rendre username nullable (users OAuth n'ont pas de username)
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- Colonnes OAuth
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS provider VARCHAR(50) NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Index unique sur (provider, provider_id) pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS users_provider_provider_id_idx
  ON users(provider, provider_id)
  WHERE provider_id IS NOT NULL;
