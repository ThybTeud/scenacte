-- Migration: Rendre la colonne username nullable
-- Date: 2026-01-02
-- Description: Permet de ne plus exiger le username lors de l'inscription

-- Retirer la contrainte NOT NULL sur username
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- Retirer la contrainte UNIQUE sur username (optionnel si on veut garder l'unicité quand présent)
-- Pour l'instant, on garde UNIQUE mais on permet NULL
-- PostgreSQL autorise plusieurs NULL dans une colonne UNIQUE
