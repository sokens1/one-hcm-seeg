-- ============================================================================
-- MIGRATION UNIQUE - FIX COMPLET DE TOUTES LES FONCTIONS RPC
-- Date: 2025-10-12
-- Cette migration corrige TOUS les problèmes en une seule fois
-- ============================================================================

-- ============================================================================
-- PARTIE 1: SUPPRIMER TOUTES LES ANCIENNES VERSIONS DES FONCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS public.ensure_user_exists();
DROP FUNCTION IF EXISTS public.ensure_user_exists(text);
DROP FUNCTION IF EXISTS public.get_candidate_applications();
DROP FUNCTION IF EXISTS public.get_all_recruiter_applications(uuid);
DROP FUNCTION IF EXISTS public.get_all_recruiter_applications();
DROP FUNCTION IF EXISTS public.get_recruiter_activities(integer, integer);
DROP FUNCTION IF EXISTS public.get_recruiter_activities(integer);
DROP FUNCTION IF EXISTS public.get_recruiter_activities();

-- ============================================================================
-- PARTIE 2: CRÉER ensure_user_exists
-- ============================================================================

CREATE FUNCTION public.ensure_user_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id text;
  user_email text;
BEGIN
  current_user_id := auth.uid()::text;
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (SELECT 1 FROM public.users WHERE id::text = current_user_id) THEN
    RETURN true;
  END IF;

  SELECT email INTO user_email
  FROM auth.users
  WHERE id::text = current_user_id;

  IF user_email IS NOT NULL THEN
    INSERT INTO public.users (id, email, role, statut, first_name, last_name)
    VALUES (
      current_user_id,
      user_email,
      'candidat',
      'actif',
      '',
      ''
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_exists() TO authenticated;

-- ============================================================================
-- PARTIE 3: CRÉER get_candidate_applications
-- ============================================================================

CREATE FUNCTION public.get_candidate_applications()
RETURNS TABLE (
  application_details jsonb,
  job_offer_details jsonb,
  candidate_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id text;
BEGIN
  current_user_id := auth.uid()::text;
  
  IF current_user_id IS NULL THEN
    RETURN; -- Retourner vide au lieu de lever une exception
  END IF;

  RETURN QUERY
  SELECT
    to_jsonb(apps.*) AS application_details,
    to_jsonb(jobs.*) AS job_offer_details,
    to_jsonb(users_table.*) || jsonb_build_object(
      'candidate_profiles', to_jsonb(profiles.*)
    ) AS candidate_details
  FROM
    public.applications AS apps
  INNER JOIN
    public.job_offers AS jobs ON apps.job_offer_id = jobs.id
  INNER JOIN
    public.users AS users_table ON apps.candidate_id::text = users_table.id::text
  LEFT JOIN
    public.candidate_profiles AS profiles ON users_table.id::text = profiles.user_id::text
  WHERE
    apps.candidate_id::text = current_user_id
  ORDER BY
    apps.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_candidate_applications() TO authenticated;

-- ============================================================================
-- PARTIE 4: CRÉER get_all_recruiter_applications
-- ============================================================================

CREATE FUNCTION public.get_all_recruiter_applications(
  p_job_offer_id uuid DEFAULT NULL
)
RETURNS TABLE (
  application_details jsonb,
  job_offer_details jsonb,
  candidate_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id text;
  user_role text;
BEGIN
  current_user_id := auth.uid()::text;
  
  IF current_user_id IS NULL THEN
    RETURN; -- Retourner vide au lieu de lever une exception
  END IF;

  -- Récupérer le rôle avec alias explicite
  SELECT users.role INTO user_role
  FROM public.users AS users
  WHERE users.id::text = current_user_id;

  IF user_role NOT IN ('recruteur', 'admin', 'recruiter', 'observateur', 'observer') THEN
    RETURN; -- Retourner vide au lieu de lever une exception
  END IF;

  IF p_job_offer_id IS NOT NULL THEN
    RETURN QUERY
    SELECT
      to_jsonb(apps.*) AS application_details,
      to_jsonb(jobs.*) AS job_offer_details,
      to_jsonb(users_table.*) || jsonb_build_object(
        'candidate_profiles', to_jsonb(profiles.*)
      ) AS candidate_details
    FROM
      public.applications AS apps
    INNER JOIN
      public.job_offers AS jobs ON apps.job_offer_id = jobs.id
    INNER JOIN
      public.users AS users_table ON apps.candidate_id::text = users_table.id::text
    LEFT JOIN
      public.candidate_profiles AS profiles ON users_table.id::text = profiles.user_id::text
    WHERE
      apps.job_offer_id = p_job_offer_id
      AND (
        jobs.recruiter_id::text = current_user_id
        OR user_role IN ('admin', 'observateur', 'observer')
      )
    ORDER BY
      apps.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT
      to_jsonb(apps.*) AS application_details,
      to_jsonb(jobs.*) AS job_offer_details,
      to_jsonb(users_table.*) || jsonb_build_object(
        'candidate_profiles', to_jsonb(profiles.*)
      ) AS candidate_details
    FROM
      public.applications AS apps
    INNER JOIN
      public.job_offers AS jobs ON apps.job_offer_id = jobs.id
    INNER JOIN
      public.users AS users_table ON apps.candidate_id::text = users_table.id::text
    LEFT JOIN
      public.candidate_profiles AS profiles ON users_table.id::text = profiles.user_id::text
    WHERE
      jobs.recruiter_id::text = current_user_id
      OR user_role IN ('admin', 'observateur', 'observer')
    ORDER BY
      apps.created_at DESC;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_recruiter_applications(uuid) TO authenticated;

-- ============================================================================
-- PARTIE 5: CRÉER get_recruiter_activities
-- ============================================================================

CREATE FUNCTION public.get_recruiter_activities(
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
SET search_path = public
AS $$
DECLARE
  current_user_id text;
  user_role text;
BEGIN
  current_user_id := auth.uid()::text;
  
  IF current_user_id IS NULL THEN
    RETURN; -- Retourner vide
  END IF;

  -- Récupérer le rôle avec alias explicite
  SELECT users.role INTO user_role
  FROM public.users AS users
  WHERE users.id::text = current_user_id;

  IF user_role NOT IN ('recruteur', 'admin', 'recruiter', 'observateur', 'observer') THEN
    RETURN; -- Retourner vide
  END IF;

  RETURN QUERY
  SELECT
    apps.id AS id,
    users_table.first_name || ' ' || users_table.last_name || ' a postulé' AS description,
    jobs.title AS job_title,
    users_table.first_name || ' ' || users_table.last_name AS candidate_name,
    apps.created_at AS created_at,
    'application'::text AS activity_type
  FROM
    public.applications AS apps
  INNER JOIN
    public.job_offers AS jobs ON apps.job_offer_id = jobs.id
  INNER JOIN
    public.users AS users_table ON apps.candidate_id::text = users_table.id::text
  WHERE
    jobs.recruiter_id::text = current_user_id
    OR user_role IN ('admin', 'observateur', 'observer')
  ORDER BY
    apps.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_recruiter_activities(integer, integer) TO authenticated;

-- ============================================================================
-- PARTIE 6: VÉRIFICATION FINALE
-- ============================================================================

SELECT 
    'Fonction' as type,
    proname as nom,
    '✓ Créée' as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND proname IN ('ensure_user_exists', 'get_candidate_applications', 'get_all_recruiter_applications', 'get_recruiter_activities')
ORDER BY proname;

