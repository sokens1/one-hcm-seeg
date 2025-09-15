-- URGENT: Script pour corriger la programmation de simulation
-- Copiez et collez ce script dans l'interface Supabase SQL Editor

-- 1. Ajouter les colonnes de simulation à protocol2_evaluations
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_date DATE,
ADD COLUMN IF NOT EXISTS simulation_time TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS simulation_scheduled_at TIMESTAMP WITH TIME ZONE;

-- 2. Ajouter la colonne simulation_date à applications si elle n'existe pas
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS simulation_date TIMESTAMP WITH TIME ZONE;

-- 3. Vérifier que les colonnes ont été ajoutées
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
