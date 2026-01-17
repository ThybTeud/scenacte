-- Migration: Add paper_size to plays and system templates
-- Date: 2026-01-17

-- 1. Ajouter paper_size à la table plays
ALTER TABLE plays ADD COLUMN IF NOT EXISTS paper_size VARCHAR(10) DEFAULT 'A5' CHECK (paper_size IN ('A4', 'A5'));

-- 2. Permettre templates système (user_id NULL)
ALTER TABLE export_templates ALTER COLUMN user_id DROP NOT NULL;

-- 3. Ajouter colonne template_id à plays pour stocker le template sélectionné
ALTER TABLE plays ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES export_templates(id) ON DELETE SET NULL;

-- 4. Supprimer les anciens templates système s'ils existent (pour éviter les doublons)
DELETE FROM export_templates WHERE user_id IS NULL AND name IN ('Classique', 'Moderne', 'Minimal');

-- 5. Seed templates système
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
  }'::jsonb);

-- 6. Index pour les templates système
CREATE INDEX IF NOT EXISTS idx_export_templates_system ON export_templates(user_id) WHERE user_id IS NULL;
