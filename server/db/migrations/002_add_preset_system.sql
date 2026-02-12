-- Migration : Add preset system and remove old template columns
-- Date: 2026-02-12
-- Description: Refactor PDF template system to use client-side presets instead of DB templates

-- 1. Add preset_id column to plays table
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS preset_id VARCHAR(50) DEFAULT 'arche';

-- 2. Migrate existing template_id values to preset_id
-- Map old template names to new preset IDs
UPDATE plays
SET preset_id = CASE
    -- If template_id references a system template, use default preset
    WHEN template_id IN (
        SELECT id FROM export_templates WHERE name IN ('Classique', 'Moderne', 'Minimal')
    ) THEN 'arche'
    -- Otherwise use default
    ELSE 'arche'
END
WHERE template_id IS NOT NULL;

-- 3. Drop old template columns (optional - uncomment if you want to remove them)
-- ALTER TABLE plays DROP COLUMN IF EXISTS paper_size;
-- ALTER TABLE plays DROP COLUMN IF EXISTS template_id;

-- 4. Delete system templates (Classique, Moderne, Minimal)
-- These are now replaced by client-side presets
DELETE FROM export_templates
WHERE name IN ('Classique', 'Moderne', 'Minimal')
AND is_public = true;

-- 5. Add index on preset_id for better query performance
CREATE INDEX IF NOT EXISTS idx_plays_preset_id ON plays(preset_id);

-- Note: Keep export_templates table and API routes for future custom preset functionality
-- Users will be able to create custom presets in the database later
