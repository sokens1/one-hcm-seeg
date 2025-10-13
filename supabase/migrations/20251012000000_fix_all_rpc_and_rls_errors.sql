-- Migration complète pour corriger toutes les erreurs RPC et RLS
-- Date: 2025-10-12
-- Objectif: Corriger les erreurs "uuid = text", récursion RLS et fonctions 404

-- ============================================================================
-- PARTIE 1: CORRIGER LA RÉCURSION RLS DANS LA TABLE USERS
-- ============================================================================

DO $$
BEGIN
    -- Désactiver temporairement RLS
    ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
    
    -- Supprimer toutes les politiques problématiques sur users
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
    DROP POLICY IF EXISTS "Candidates can view their own user data" ON public.users;
    DROP POLICY IF EXISTS "users_select_own" ON public.users;
    DROP POLICY IF EXISTS "users_update_own" ON public.users;
    DROP POLICY IF EXISTS "users_select_policy" ON public.users;
    DROP POLICY IF EXISTS "users_update_policy" ON public.users;
    DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
    
    -- Créer des politiques simples et non-récursives
    CREATE POLICY "users_can_view_all" ON public.users
        FOR SELECT 
        USING (auth.uid() IS NOT NULL);
    
    CREATE POLICY "users_can_update_own" ON public.users
        FOR UPDATE 
        USING (id = auth.uid()::text)
        WITH CHECK (id = auth.uid()::text);
    
    CREATE POLICY "users_can_insert_own" ON public.users
        FOR INSERT 
        WITH CHECK (id = auth.uid()::text);
    
    -- Réactiver RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Politiques RLS users corrigées';
END $$;

-- ============================================================================
-- PARTIE 2: CORRIGER LA FONCTION get_candidate_applications
-- ============================================================================

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
DECLARE
  current_user_id text;
BEGIN
  -- Récupérer l'ID de l'utilisateur authentifié
  current_user_id := auth.uid()::text;
  
  -- Vérifier si l'utilisateur est authentifié
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Retourner les candidatures de l'utilisateur
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
    public.users u ON a.candidate_id = u.id
  LEFT JOIN
    public.candidate_profiles cp ON u.id = cp.user_id
  WHERE
    a.candidate_id = current_user_id
  ORDER BY
    a.created_at DESC;
END;
$$;

-- Révoquer les permissions existantes et les recréer
REVOKE ALL ON FUNCTION public.get_candidate_applications() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_candidate_applications() TO authenticated;

COMMENT ON FUNCTION public.get_candidate_applications() IS 
'Récupère toutes les candidatures de l''utilisateur authentifié. Correction du problème uuid = text.';

-- ============================================================================
-- PARTIE 3: CORRIGER LA FONCTION get_all_recruiter_applications
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_all_recruiter_applications(
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
  -- Récupérer l'ID de l'utilisateur authentifié
  current_user_id := auth.uid()::text;
  
  -- Vérifier si l'utilisateur est authentifié
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Récupérer le rôle de l'utilisateur
  SELECT role INTO user_role
  FROM public.users
  WHERE id = current_user_id;

  -- Vérifier si l'utilisateur est recruteur, admin ou observateur
  IF user_role NOT IN ('recruteur', 'admin', 'recruiter', 'observateur', 'observer') THEN
    RAISE EXCEPTION 'Access denied. User role: %', user_role;
  END IF;

  -- Si un job_offer_id spécifique est fourni
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
      public.users u ON a.candidate_id = u.id
    LEFT JOIN
      public.candidate_profiles cp ON u.id = cp.user_id
    WHERE
      a.job_offer_id = p_job_offer_id
      AND (
        jo.recruiter_id = current_user_id
        OR user_role IN ('admin', 'observateur', 'observer')
      )
    ORDER BY
      a.created_at DESC;
  ELSE
    -- Retourner toutes les candidatures accessibles
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
      public.users u ON a.candidate_id = u.id
    LEFT JOIN
      public.candidate_profiles cp ON u.id = cp.user_id
    WHERE
      jo.recruiter_id = current_user_id
      OR user_role IN ('admin', 'observateur', 'observer')
    ORDER BY
      a.created_at DESC;
  END IF;
END;
$$;

-- Révoquer les permissions existantes et les recréer
REVOKE ALL ON FUNCTION public.get_all_recruiter_applications(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_all_recruiter_applications(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_all_recruiter_applications(uuid) IS 
'Récupère toutes les candidatures pour un recruteur/admin/observateur. Correction du problème uuid = text.';

-- ============================================================================
-- PARTIE 4: CRÉER UNE FONCTION UTILITAIRE POUR VÉRIFIER L'EXISTENCE D'UN USER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.ensure_user_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id text;
  user_email text;
BEGIN
  -- Récupérer l'ID de l'utilisateur authentifié
  current_user_id := auth.uid()::text;
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Vérifier si l'utilisateur existe déjà
  IF EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id) THEN
    RETURN true;
  END IF;

  -- Si l'utilisateur n'existe pas, essayer de le créer depuis auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id::text = current_user_id;

  IF user_email IS NOT NULL THEN
    INSERT INTO public.users (id, email, role, statut, first_name, last_name)
    VALUES (
      current_user_id,
      user_email,
      'candidat', -- Rôle par défaut
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

COMMENT ON FUNCTION public.ensure_user_exists() IS 
'Vérifie et crée automatiquement un utilisateur dans public.users s''il n''existe pas.';

-- ============================================================================
-- PARTIE 5: CORRIGER LES POLITIQUES RLS SUR APPLICATIONS
-- ============================================================================

DO $$
BEGIN
    -- Supprimer les anciennes politiques
    DROP POLICY IF EXISTS "applications_select_candidate" ON public.applications;
    DROP POLICY IF EXISTS "applications_select_recruiter" ON public.applications;
    DROP POLICY IF EXISTS "applications_insert_candidate" ON public.applications;
    DROP POLICY IF EXISTS "applications_update_candidate" ON public.applications;
    DROP POLICY IF EXISTS "applications_update_recruiter" ON public.applications;
    
    -- Créer des politiques simples
    CREATE POLICY "applications_select_own" ON public.applications
        FOR SELECT 
        USING (
            candidate_id = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.job_offers jo
                WHERE jo.id = job_offer_id
                AND jo.recruiter_id = auth.uid()::text
            )
            OR EXISTS (
                SELECT 1 FROM public.users u
                WHERE u.id = auth.uid()::text
                AND u.role IN ('admin', 'observateur', 'observer')
            )
        );
    
    CREATE POLICY "applications_insert_own" ON public.applications
        FOR INSERT 
        WITH CHECK (candidate_id = auth.uid()::text);
    
    CREATE POLICY "applications_update_own" ON public.applications
        FOR UPDATE 
        USING (
            candidate_id = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM public.job_offers jo
                WHERE jo.id = job_offer_id
                AND jo.recruiter_id = auth.uid()::text
            )
            OR EXISTS (
                SELECT 1 FROM public.users u
                WHERE u.id = auth.uid()::text
                AND u.role IN ('admin', 'observateur', 'observer')
            )
        );
    
    RAISE NOTICE 'Politiques RLS applications corrigées';
END $$;

-- ============================================================================
-- PARTIE 6: VÉRIFICATION FINALE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Migration terminée avec succès!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Corrections appliquées:';
    RAISE NOTICE '1. ✓ Récursion RLS sur users corrigée';
    RAISE NOTICE '2. ✓ get_candidate_applications corrigée (uuid = text)';
    RAISE NOTICE '3. ✓ get_all_recruiter_applications corrigée (uuid = text)';
    RAISE NOTICE '4. ✓ ensure_user_exists créée';
    RAISE NOTICE '5. ✓ Politiques RLS applications corrigées';
    RAISE NOTICE '==============================================';
END $$;

