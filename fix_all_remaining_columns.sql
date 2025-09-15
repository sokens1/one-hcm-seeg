-- Script pour ajouter TOUTES les colonnes manquantes restantes
-- Copiez et collez ce script dans l'interface Supabase SQL Editor

-- Ajouter toutes les colonnes manquantes à protocol2_evaluations
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_date DATE,
ADD COLUMN IF NOT EXISTS simulation_time TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS simulation_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS analyse_competences_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analyse_competences_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS fiche_kcis_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiche_kcis_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS fiche_kpis_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiche_kpis_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS fiche_kris_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiche_kris_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS gap_competences_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gap_competences_comments TEXT DEFAULT '';

-- Ajouter la colonne simulation_date à applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS simulation_date TIMESTAMP WITH TIME ZONE;

-- Vérifier que toutes les colonnes existent maintenant
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND (column_name LIKE 'simulation_%' OR column_name LIKE '%competences%' OR column_name LIKE '%kcis%' OR column_name LIKE '%kpis%' OR column_name LIKE '%kris%' OR column_name LIKE '%gap%')
ORDER BY column_name;
