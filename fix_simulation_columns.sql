-- Script pour ajouter les colonnes de simulation manquantes
-- À exécuter dans l'interface Supabase SQL Editor

-- Vérifier d'abord si les colonnes existent
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE 'simulation_%'
ORDER BY column_name;

-- Ajouter les colonnes si elles n'existent pas
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_date DATE,
ADD COLUMN IF NOT EXISTS simulation_time TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS simulation_scheduled_at TIMESTAMP WITH TIME ZONE;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE 'simulation_%'
ORDER BY column_name;

-- Ajouter aussi la colonne simulation_date à la table applications si elle n'existe pas
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS simulation_date TIMESTAMP WITH TIME ZONE;

-- Vérifier la colonne dans applications
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name = 'simulation_date';
