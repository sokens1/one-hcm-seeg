-- ============================================================================
-- MIGRATION COMPLÈTE - AVEC SUPPRESSION DES FONCTIONS EXISTANTES
-- Date: 2025-10-12
-- ============================================================================

-- ============================================================================
-- ÉTAPE 0: SUPPRIMER LES FONCTIONS EXISTANTES
-- ============================================================================

-- Supprimer les anciennes versions des fonctions
DROP FUNCTION IF EXISTS public.ensure_user_exists();
DROP FUNCTION IF EXISTS public.ensure_user_exists(text);
DROP FUNCTION IF EXISTS public.get_candidate_applications();
DROP FUNCTION IF EXISTS public.get_all_recruiter_applications(uuid);
DROP FUNCTION IF EXISTS public.get_all_recruiter_applications();

-- ============================================================================
-- ÉTAPE 1: CORRIGER LES POLITIQUES RLS SUR USERS
-- ============================================================================

-- Désactiver RLS temporairement
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Candidates can view their own user data" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_can_view_all" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own" ON public.users;
DROP POLICY IF EXISTS "users_can_insert_own" ON public.users;

-- Créer des politiques avec casts corrects (tout en TEXT)
CREATE POLICY "users_can_view_all" ON public.users
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "users_can_update_own" ON public.users
    FOR UPDATE 
    USING (id::text = auth.uid()::text)
    WITH CHECK (id::text = auth.uid()::text);

CREATE POLICY "users_can_insert_own" ON public.users
    FOR INSERT 
    WITH CHECK (id::text = auth.uid()::text);

-- Réactiver RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ÉTAPE 2: CRÉER LA FONCTION ensure_user_exists
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
-- ÉTAPE 3: CRÉER get_candidate_applications
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
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    to_jsonb(a.*) AS application_details,
    to_jsonb(jo.*) AS job_offer_details,
    to_jsonb(u.*) || jsonb_build_object(
      'candidate_profiles', to_jsonb(cp.*)
    ) AS candidate_details
  FROM
    public.applications a
  INNER JOIN
    public.job_offers jo ON a.job_offer_id = jo.id
  INNER JOIN
    public.users u ON a.candidate_id::text = u.id::text
  LEFT JOIN
    public.candidate_profiles cp ON u.id::text = cp.user_id::text
  WHERE
    a.candidate_id::text = current_user_id
  ORDER BY
    a.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_candidate_applications() TO authenticated;

-- ============================================================================
-- ÉTAPE 4: CRÉER get_all_recruiter_applications
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
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT role INTO user_role
  FROM public.users
  WHERE id::text = current_user_id;

  IF user_role NOT IN ('recruteur', 'admin', 'recruiter', 'observateur', 'observer') THEN
    RAISE EXCEPTION 'Access denied. User role: %', user_role;
  END IF;

  IF p_job_offer_id IS NOT NULL THEN
    RETURN QUERY
    SELECT
      to_jsonb(a.*) AS application_details,
      to_jsonb(jo.*) AS job_offer_details,
      to_jsonb(u.*) || jsonb_build_object(
        'candidate_profiles', to_jsonb(cp.*)
      ) AS candidate_details
    FROM
      public.applications a
    INNER JOIN
      public.job_offers jo ON a.job_offer_id = jo.id
    INNER JOIN
      public.users u ON a.candidate_id::text = u.id::text
    LEFT JOIN
      public.candidate_profiles cp ON u.id::text = cp.user_id::text
    WHERE
      a.job_offer_id = p_job_offer_id
      AND (
        jo.recruiter_id::text = current_user_id
        OR user_role IN ('admin', 'observateur', 'observer')
      )
    ORDER BY
      a.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT
      to_jsonb(a.*) AS application_details,
      to_jsonb(jo.*) AS job_offer_details,
      to_jsonb(u.*) || jsonb_build_object(
        'candidate_profiles', to_jsonb(cp.*)
      ) AS candidate_details
    FROM
      public.applications a
    INNER JOIN
      public.job_offers jo ON a.job_offer_id = jo.id
    INNER JOIN
      public.users u ON a.candidate_id::text = u.id::text
    LEFT JOIN
      public.candidate_profiles cp ON u.id::text = cp.user_id::text
    WHERE
      jo.recruiter_id::text = current_user_id
      OR user_role IN ('admin', 'observateur', 'observer')
    ORDER BY
      a.created_at DESC;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_recruiter_applications(uuid) TO authenticated;

-- ============================================================================
-- ÉTAPE 5: CORRIGER LES POLITIQUES RLS SUR APPLICATIONS
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "applications_select_candidate" ON public.applications;
DROP POLICY IF EXISTS "applications_select_recruiter" ON public.applications;
DROP POLICY IF EXISTS "applications_insert_candidate" ON public.applications;
DROP POLICY IF EXISTS "applications_update_candidate" ON public.applications;
DROP POLICY IF EXISTS "applications_update_recruiter" ON public.applications;
DROP POLICY IF EXISTS "applications_select_own" ON public.applications;
DROP POLICY IF EXISTS "applications_insert_own" ON public.applications;
DROP POLICY IF EXISTS "applications_update_own" ON public.applications;

-- Créer des politiques avec casts corrects
CREATE POLICY "applications_select_own" ON public.applications
    FOR SELECT 
    USING (
        candidate_id::text = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM public.job_offers jo
            WHERE jo.id = job_offer_id
            AND jo.recruiter_id::text = auth.uid()::text
        )
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id::text = auth.uid()::text
            AND u.role IN ('admin', 'observateur', 'observer')
        )
    );

CREATE POLICY "applications_insert_own" ON public.applications
    FOR INSERT 
    WITH CHECK (candidate_id::text = auth.uid()::text);

CREATE POLICY "applications_update_own" ON public.applications
    FOR UPDATE 
    USING (
        candidate_id::text = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM public.job_offers jo
            WHERE jo.id = job_offer_id
            AND jo.recruiter_id::text = auth.uid()::text
        )
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id::text = auth.uid()::text
            AND u.role IN ('admin', 'observateur', 'observer')
        )
    );

-- ============================================================================
-- ÉTAPE 6: CORRIGER LES POLITIQUES RLS SUR CANDIDATE_PROFILES
-- ============================================================================

-- Désactiver RLS temporairement
ALTER TABLE IF EXISTS public.candidate_profiles DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can insert their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Recruiters and Admins can view all candidate profiles" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Simple user profile access" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Recruiters can view all profiles" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_all_own" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_select_recruiters" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_select_policy" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_insert_policy" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_update_policy" ON public.candidate_profiles;

-- Créer des politiques avec casts corrects
CREATE POLICY "candidate_profiles_select_policy" ON public.candidate_profiles
    FOR SELECT 
    USING (true);

CREATE POLICY "candidate_profiles_insert_policy" ON public.candidate_profiles
    FOR INSERT 
    WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "candidate_profiles_update_policy" ON public.candidate_profiles
    FOR UPDATE 
    USING (user_id::text = auth.uid()::text)
    WITH CHECK (user_id::text = auth.uid()::text);

-- Réactiver RLS
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier que les fonctions existent
SELECT 
    'get_candidate_applications' as function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = 'get_candidate_applications'
        ) THEN '✓ Existe'
        ELSE '✗ Manquante'
    END as status
UNION ALL
SELECT 
    'get_all_recruiter_applications' as function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = 'get_all_recruiter_applications'
        ) THEN '✓ Existe'
        ELSE '✗ Manquante'
    END as status
UNION ALL
SELECT 
    'ensure_user_exists' as function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = 'ensure_user_exists'
        ) THEN '✓ Existe'
        ELSE '✗ Manquante'
    END as status;

