-- Script pour ajouter la contrainte UNIQUE manquante
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure actuelle de la table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'interview_slots' 
ORDER BY ordinal_position;

-- 2. Ajouter la contrainte UNIQUE sur (date, time)
-- D'abord, supprimer les doublons s'il y en a
DELETE FROM public.interview_slots 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM public.interview_slots 
  GROUP BY date, time
);

-- Ajouter la contrainte UNIQUE
ALTER TABLE public.interview_slots 
ADD CONSTRAINT interview_slots_date_time_unique 
UNIQUE (date, time);

-- 3. Vérifier que la contrainte a été ajoutée
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'interview_slots' 
AND constraint_type = 'UNIQUE';

-- 4. Maintenant on peut créer les créneaux de test
INSERT INTO public.interview_slots (
  date, 
  time, 
  application_id, 
  candidate_name, 
  job_title, 
  status, 
  is_available, 
  recruiter_id, 
  candidate_id, 
  notes, 
  created_at, 
  updated_at
) VALUES 
  ('2024-02-15', '09:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-15', '10:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-15', '11:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-16', '09:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-16', '10:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-16', '11:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-17', '09:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-17', '10:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-17', '11:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW())
ON CONFLICT (date, time) DO NOTHING;

-- 5. Vérifier que les créneaux ont été créés
SELECT date, time, is_available, status FROM public.interview_slots ORDER BY date, time;
