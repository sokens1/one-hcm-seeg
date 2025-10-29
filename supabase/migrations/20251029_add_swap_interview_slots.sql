-- Atomic swap of two interview slots between two applications
CREATE OR REPLACE FUNCTION public.swap_interview_slots(
  p_app_id_a UUID,
  p_app_id_b UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slot_a RECORD;
  slot_b RECORD;
BEGIN
  -- Lock rows belonging to both applications to prevent races
  SELECT id, date, time, status INTO slot_a
  FROM interview_slots
  WHERE application_id = p_app_id_a AND status = 'scheduled'
  ORDER BY updated_at DESC NULLS LAST
  FOR UPDATE;

  SELECT id, date, time, status INTO slot_b
  FROM interview_slots
  WHERE application_id = p_app_id_b AND status = 'scheduled'
  ORDER BY updated_at DESC NULLS LAST
  FOR UPDATE;

  IF slot_a IS NULL OR slot_b IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Un des candidats n''a pas de créneau programmé');
  END IF;

  -- Ensure target times are not booked by third parties (should not, since we lock both)
  -- Perform swap
  UPDATE interview_slots
  SET date = slot_b.date, time = slot_b.time, updated_at = NOW()
  WHERE id = slot_a.id;

  UPDATE interview_slots
  SET date = slot_a.date, time = slot_a.time, updated_at = NOW()
  WHERE id = slot_b.id;

  RETURN json_build_object('success', true, 'message', 'Créneaux échangés avec succès');

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Allow anon/service role to execute if needed (adjust to your policy)
GRANT EXECUTE ON FUNCTION public.swap_interview_slots(UUID, UUID) TO anon, authenticated, service_role;

