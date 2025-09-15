-- Script pour ajouter les colonnes de scores calculés
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Colonnes de scores calculés
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS mise_en_situation_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS validation_operationnelle_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analyse_competences_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS overall_score INTEGER DEFAULT 0;

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE '%_score'
ORDER BY column_name;
