-- Script minimal pour ajouter seulement les colonnes de simulation essentielles
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Colonne simulation_date dans applications (PRIORITÉ)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS simulation_date TIMESTAMP WITH TIME ZONE;

-- Vérifier la colonne ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name = 'simulation_date';
