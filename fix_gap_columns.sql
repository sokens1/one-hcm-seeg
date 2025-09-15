-- Script pour ajouter les colonnes gap et plan_formation
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Colonnes d'analyse des compétences
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS gap_competences_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gap_competences_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS gap_competences_level TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS plan_formation_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_formation_comments TEXT DEFAULT '';

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND (column_name LIKE '%gap_%' OR column_name LIKE '%plan_%')
ORDER BY column_name;
