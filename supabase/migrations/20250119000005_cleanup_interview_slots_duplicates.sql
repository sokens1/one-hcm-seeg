-- Nettoyer les doublons avant de créer les contraintes
-- D'abord, supprimer la contrainte problématique si elle existe
ALTER TABLE public.interview_slots DROP CONSTRAINT IF EXISTS interview_slots_date_time_status_key;

-- Garder seulement le plus récent créneau pour chaque candidature
WITH ranked_slots AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY application_id 
           ORDER BY created_at DESC
         ) as rn
  FROM public.interview_slots
  WHERE status = 'scheduled'
)
UPDATE public.interview_slots 
SET status = 'cancelled'
WHERE id IN (
  SELECT id 
  FROM ranked_slots 
  WHERE rn > 1
);

-- Garder seulement le plus récent créneau pour chaque date/heure
WITH ranked_date_slots AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY date, time 
           ORDER BY created_at DESC
         ) as rn
  FROM public.interview_slots
  WHERE status = 'scheduled'
)
UPDATE public.interview_slots 
SET status = 'cancelled'
WHERE id IN (
  SELECT id 
  FROM ranked_date_slots 
  WHERE rn > 1
);

-- Maintenant créer les contraintes d'unicité
CREATE UNIQUE INDEX IF NOT EXISTS interview_slots_unique_active_slot 
ON public.interview_slots (date, time) 
WHERE status = 'scheduled';

CREATE UNIQUE INDEX IF NOT EXISTS interview_slots_unique_application 
ON public.interview_slots (application_id) 
WHERE status = 'scheduled';
