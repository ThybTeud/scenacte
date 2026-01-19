-- Add password_updated_at column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMP DEFAULT NOW();

-- Set existing users' password_updated_at to their created_at
UPDATE users
SET password_updated_at = created_at
WHERE password_updated_at IS NULL;
