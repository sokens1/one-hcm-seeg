-- Correction simple du problème de comparaison text = uuid
-- Au lieu de changer les types, on corrige les fonctions pour gérer la conversion

-- 1. Recréer la fonction get_candidate_applications avec conversion explicite
CREATE OR REPLACE FUNCTION public.get_candidate_applications()
RETURNS TABLE (
  application_details jsonb,
  job_offer_details jsonb,
  candidate_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security: candidat peut seulement voir ses propres candidatures
  IF NOT EXISTS(
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text AND role = 'candidat'
  ) THEN
    RAISE EXCEPTION 'access denied for uid=%', auth.uid();
  END IF;

  RETURN QUERY
  SELECT
    -- Application details
    to_jsonb(a.*) AS application_details,

    -- Job offer details
    to_jsonb(jo.*) AS job_offer_details,

    -- Candidate details (basic user + embedded candidate_profiles)
    to_jsonb(u.*) || jsonb_build_object(
      'candidate_profiles', to_jsonb(cp.*)
    ) AS candidate_details
  FROM
    public.applications a
  INNER JOIN
    public.job_offers jo ON a.job_offer_id = jo.id
  INNER JOIN
    public.users u ON a.candidate_id::text = u.id
  LEFT JOIN
    public.candidate_profiles cp ON u.id = cp.user_id::text
  WHERE
    a.candidate_id::text = auth.uid()::text  -- Conversion explicite en text
  ORDER BY
    a.created_at DESC;
END;
$$;

-- 2. Recréer la fonction get_recruiter_activities avec conversion explicite
CREATE OR REPLACE FUNCTION public.get_recruiter_activities(
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  description text,
  job_title text,
  candidate_name text,
  created_at timestamp with time zone,
  activity_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    u.first_name || ' ' || u.last_name || ' a postulé' AS description,
    jo.title AS job_title,
    u.first_name || ' ' || u.last_name AS candidate_name,
    a.created_at,
    'application' AS activity_type
  FROM
    public.applications a
  INNER JOIN
    public.job_offers jo ON a.job_offer_id = jo.id
  INNER JOIN
    public.users u ON a.candidate_id::text = u.id
  WHERE
    jo.recruiter_id::text = auth.uid()::text  -- Conversion explicite en text
  ORDER BY
    a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 3. Recréer la fonction create_application_notification avec conversion explicite
CREATE OR REPLACE FUNCTION public.create_application_notification(
  p_application_id uuid,
  p_job_title text,
  p_candidate_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer une notification pour le recruteur
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    link,
    type
  )
  SELECT 
    jo.recruiter_id::text,
    'Nouvelle candidature',
    p_candidate_name || ' a postulé pour ' || p_job_title,
    '/recruiter/candidates',
    'application'
  FROM public.applications a
  JOIN public.job_offers jo ON a.job_offer_id = jo.id
  WHERE a.id = p_application_id;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.get_candidate_applications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_application_notification(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recruiter_activities(integer, integer) TO authenticated;
