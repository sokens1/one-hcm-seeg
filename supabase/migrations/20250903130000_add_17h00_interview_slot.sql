-- Migration pour ajouter le créneau 17h00 et synchroniser tous les créneaux manquants
-- Cette migration garantit que tous les créneaux définis dans le frontend sont disponibles en base

-- 1. Ajouter le créneau 17h00 pour toutes les dates existantes
INSERT INTO public.interview_slots (date, time, is_available, status, created_at, updated_at)
SELECT DISTINCT 
  date,
  '17:00:00'::time,
  true,
  'available',
  NOW(),
  NOW()
FROM public.interview_slots 
WHERE date >= CURRENT_DATE - INTERVAL '30 days'  -- Limiter aux 30 derniers jours
  AND NOT EXISTS (
    SELECT 1 FROM public.interview_slots 
    WHERE interview_slots.date = interview_slots.date 
      AND interview_slots.time = '17:00:00'::time
  );

-- 2. Créer une fonction pour générer automatiquement tous les créneaux manquants
CREATE OR REPLACE FUNCTION generate_missing_interview_slots()
RETURNS void AS $$
DECLARE
  slot_date DATE;
  slot_time TIME;
  time_slots TIME[] := ARRAY['09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00']::TIME[];
BEGIN
  -- Générer les créneaux pour les 30 prochains jours
  FOR slot_date IN SELECT generate_series(
    CURRENT_DATE, 
    CURRENT_DATE + INTERVAL '30 days', 
    INTERVAL '1 day'
  )::DATE
  LOOP
    -- Ignorer les weekends (samedi = 6, dimanche = 0)
    IF EXTRACT(DOW FROM slot_date) NOT IN (0, 6) THEN
      FOREACH slot_time IN ARRAY time_slots
      LOOP
        -- Insérer seulement si le créneau n'existe pas déjà
        INSERT INTO public.interview_slots (date, time, is_available, status, created_at, updated_at)
        VALUES (slot_date, slot_time, true, 'available', NOW(), NOW())
        ON CONFLICT (date, time) DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Exécuter la fonction pour générer les créneaux manquants
SELECT generate_missing_interview_slots();

-- 4. Nettoyer la fonction temporaire
DROP FUNCTION generate_missing_interview_slots();

-- 5. Vérifier que tous les créneaux sont bien présents
-- Cette requête devrait retourner 7 créneaux par jour ouvré
COMMENT ON TABLE public.interview_slots IS 'Table des créneaux d''entretien avec créneaux 9h, 10h, 11h, 14h, 15h, 16h, 17h00';
