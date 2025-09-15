-- Script pour vérifier les données de simulation en base
-- Copiez et collez ce script dans l'interface Supabase SQL Editor

-- 1. Vérifier les colonnes de simulation dans protocol2_evaluations
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE 'simulation_%'
ORDER BY column_name;

-- 2. Vérifier les colonnes de simulation dans applications
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name = 'simulation_date';

-- 3. Vérifier les données de simulation pour l'application test
SELECT 
  id,
  application_id,
  simulation_date,
  simulation_time,
  simulation_scheduled_at,
  updated_at
FROM protocol2_evaluations 
WHERE application_id = '91d0c256-9d9e-4dfa-b831-97d2b23e539c';

-- 4. Vérifier les données de simulation dans applications
SELECT 
  id,
  simulation_date,
  status,
  updated_at
FROM applications 
WHERE id = '91d0c256-9d9e-4dfa-b831-97d2b23e539c';
