-- Script pour ajouter les colonnes de simulation dans protocol2_evaluations
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Colonnes de simulation dans protocol2_evaluations
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_date DATE;

-- Vérifier la colonne ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'simulation_date';
