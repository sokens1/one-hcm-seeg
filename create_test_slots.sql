-- Script pour créer des créneaux de test
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer quelques créneaux disponibles pour les tests
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

-- Vérifier que les créneaux ont été créés
SELECT date, time, is_available, status FROM public.interview_slots ORDER BY date, time;
