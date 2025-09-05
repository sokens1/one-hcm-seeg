-- Créer automatiquement un utilisateur dans la table users s'il n'existe pas
-- Cette fonction sera appelée avant les autres fonctions RPC

CREATE OR REPLACE FUNCTION public.ensure_user_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier si l'utilisateur existe dans la table users
  IF NOT EXISTS(
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
  ) THEN
    -- Créer l'utilisateur avec des valeurs par défaut
    INSERT INTO public.users (
      id,
      email,
      role,
      first_name,
      last_name,
      created_at,
      updated_at
    ) VALUES (
      auth.uid()::text,
      COALESCE(auth.email(), ''),
      'candidat', -- Rôle par défaut
      COALESCE(auth.jwt() ->> 'first_name', ''),
      COALESCE(auth.jwt() ->> 'last_name', ''),
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$;

-- Modifier les fonctions RPC pour s'assurer que l'utilisateur existe
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

  -- S'assurer que l'utilisateur existe dans la table users
  PERFORM public.ensure_user_exists();

  -- Vérifier si l'utilisateur a des candidatures
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

-- Modifier get_all_recruiter_applications
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

  -- S'assurer que l'utilisateur existe dans la table users
  PERFORM public.ensure_user_exists();

  -- Vérifier si l'utilisateur est recruteur ou admin
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

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.ensure_user_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_candidate_applications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_recruiter_applications() TO authenticated;
