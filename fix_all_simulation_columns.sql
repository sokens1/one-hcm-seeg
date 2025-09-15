-- Script complet pour ajouter toutes les colonnes de simulation manquantes
-- Copiez et collez ce script dans l'interface Supabase SQL Editor

-- 1. Ajouter toutes les colonnes de simulation à protocol2_evaluations
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_date DATE,
ADD COLUMN IF NOT EXISTS simulation_time TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS simulation_scheduled_at TIMESTAMP WITH TIME ZONE;

-- 2. Ajouter la colonne simulation_date à applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS simulation_date TIMESTAMP WITH TIME ZONE;

-- 3. Ajouter les autres colonnes manquantes
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS analyse_competences_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analyse_competences_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS fiche_kcis_comments TEXT DEFAULT '';

-- 4. Vérifier que toutes les colonnes existent
SELECT 'protocol2_evaluations' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE 'simulation_%'

UNION ALL

SELECT 'applications' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name = 'simulation_date'

ORDER BY table_name, column_name;
