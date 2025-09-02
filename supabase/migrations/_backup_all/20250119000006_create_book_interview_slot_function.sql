-- Fonction pour réserver un créneau d'entretien de manière atomique
CREATE OR REPLACE FUNCTION book_interview_slot(
  p_date DATE,
  p_time TIME,
  p_application_id UUID,
  p_candidate_name TEXT,
  p_job_title TEXT,
  p_existing_slot_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  slot_exists BOOLEAN;
  application_has_slot BOOLEAN;
BEGIN
  -- Vérifier si le créneau est déjà pris
  SELECT EXISTS(
    SELECT 1 FROM interview_slots 
    WHERE date = p_date 
    AND time = p_time 
    AND status = 'scheduled'
  ) INTO slot_exists;

  IF slot_exists THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Créneau déjà réservé'
    );
  END IF;

  -- Vérifier si la candidature a déjà un créneau actif
  SELECT EXISTS(
    SELECT 1 FROM interview_slots 
    WHERE application_id = p_application_id 
    AND status = 'scheduled'
    AND (p_existing_slot_id IS NULL OR id != p_existing_slot_id)
  ) INTO application_has_slot;

  IF application_has_slot THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Cette candidature a déjà un créneau réservé'
    );
  END IF;

  -- Annuler l'ancien créneau s'il existe
  IF p_existing_slot_id IS NOT NULL THEN
    UPDATE interview_slots 
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = p_existing_slot_id;
  END IF;

  -- Créer le nouveau créneau
  INSERT INTO interview_slots (
    date, 
    time, 
    application_id, 
    candidate_name, 
    job_title, 
    status
  ) VALUES (
    p_date, 
    p_time, 
    p_application_id, 
    p_candidate_name, 
    p_job_title, 
    'scheduled'
  );

  RETURN json_build_object(
    'success', true, 
    'message', 'Créneau réservé avec succès'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', SQLERRM
    );
END;
$$;
