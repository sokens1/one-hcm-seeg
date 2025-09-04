-- Corriger les permissions d'accès aux fonctions RPC
-- Permettre l'accès même si l'utilisateur n'est pas dans la table users

-- 1. Fonction get_candidate_applications plus permissive
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
  -- Vérifier si l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Vérifier si l'utilisateur a des candidatures (plus permissif)
  IF NOT EXISTS(
    SELECT 1 FROM public.applications
    WHERE candidate_id::text = auth.uid()::text
  ) THEN
    -- Retourner un tableau vide au lieu de lever une exception
    RETURN;
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
    a.candidate_id::text = auth.uid()::text
  ORDER BY
    a.created_at DESC;
END;
$$;

-- 2. Fonction get_all_recruiter_applications plus permissive
CREATE OR REPLACE FUNCTION public.get_all_recruiter_applications()
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
  -- Vérifier si l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Vérifier si l'utilisateur est recruteur ou admin (plus permissif)
  IF NOT EXISTS(
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text AND role IN ('recruteur', 'admin', 'observateur', 'observer')
  ) THEN
    -- Retourner un tableau vide au lieu de lever une exception
    RETURN;
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
  ORDER BY
    a.created_at DESC;
END;
$$;

-- 3. Fonction get_recruiter_activities plus permissive
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
  -- Vérifier si l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Vérifier si l'utilisateur est recruteur ou admin (plus permissif)
  IF NOT EXISTS(
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text AND role IN ('recruteur', 'admin', 'observateur', 'observer')
  ) THEN
    -- Retourner un tableau vide au lieu de lever une exception
    RETURN;
  END IF;

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
    jo.recruiter_id::text = auth.uid()::text
  ORDER BY
    a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.get_candidate_applications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_recruiter_applications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recruiter_activities(integer, integer) TO authenticated;
