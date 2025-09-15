-- Script pour ajouter la colonne simulation_time
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Colonne simulation_time dans protocol2_evaluations
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_time TIME WITHOUT TIME ZONE;

-- Vérifier la colonne ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'simulation_time';
