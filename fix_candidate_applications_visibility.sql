-- Script de correction pour le problème de visibilité des candidatures
-- Problème : Les candidatures ne s'affichent pas dans "mes candidatures"

-- ============================================================================
-- ÉTAPE 1: DIAGNOSTIC DU PROBLÈME
-- ============================================================================

-- Vérifier les types de données
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name IN ('candidate_id', 'job_offer_id');

-- Vérifier les politiques RLS actuelles
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'applications' 
AND schemaname = 'public';

-- ============================================================================
-- ÉTAPE 2: CORRIGER LES POLITIQUES RLS
-- ============================================================================

-- Supprimer toutes les politiques existantes sur applications
DROP POLICY IF EXISTS "applications_select_own" ON public.applications;
DROP POLICY IF EXISTS "applications_insert_own" ON public.applications;
DROP POLICY IF EXISTS "applications_update_own" ON public.applications;
DROP POLICY IF EXISTS "applications_select_candidate" ON public.applications;
DROP POLICY IF EXISTS "applications_select_recruiter_or_admin" ON public.applications;
DROP POLICY IF EXISTS "applications_insert_candidate" ON public.applications;
DROP POLICY IF EXISTS "applications_update_candidate_or_recruiter_or_admin" ON public.applications;

-- Créer des politiques RLS cohérentes avec les types UUID
CREATE POLICY "applications_select_policy" ON public.applications
    FOR SELECT 
    USING (
        candidate_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.job_offers jo
            WHERE jo.id = applications.job_offer_id
            AND jo.recruiter_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'observateur', 'observer')
        )
    );

CREATE POLICY "applications_insert_policy" ON public.applications
    FOR INSERT 
    WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "applications_update_policy" ON public.applications
    FOR UPDATE 
    USING (
        candidate_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.job_offers jo
            WHERE jo.id = applications.job_offer_id
            AND jo.recruiter_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'observateur', 'observer')
        )
    );

-- ============================================================================
-- ÉTAPE 3: CORRIGER LA FONCTION RPC get_candidate_applications
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
  current_user_id uuid;
BEGIN
  -- Récupérer l'ID de l'utilisateur authentifié
  current_user_id := auth.uid();
  
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

-- Révoquer et recréer les permissions
REVOKE ALL ON FUNCTION public.get_candidate_applications() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_candidate_applications() TO authenticated;

-- ============================================================================
-- ÉTAPE 4: VÉRIFICATION ET TEST
-- ============================================================================

-- Test de la fonction RPC
SELECT 'Test de la fonction RPC' as test_name;
SELECT COUNT(*) as candidatures_visibles 
FROM public.get_candidate_applications();

-- Vérifier les candidatures directes
SELECT 'Test direct des candidatures' as test_name;
SELECT 
    a.id,
    a.candidate_id,
    a.job_offer_id,
    a.status,
    a.created_at,
    jo.title as job_title
FROM public.applications a
LEFT JOIN public.job_offers jo ON a.job_offer_id = jo.id
WHERE a.candidate_id = auth.uid()
ORDER BY a.created_at DESC;

-- ============================================================================
-- ÉTAPE 5: DIAGNOSTIC FINAL
-- ============================================================================

-- Vérifier que les politiques sont bien appliquées
SELECT 
    'Politiques RLS après correction' as status,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%candidate_id = auth.uid()%' THEN '✅ Correct'
        ELSE '❌ Problème'
    END as verification
FROM pg_policies 
WHERE tablename = 'applications' 
AND schemaname = 'public'
AND cmd = 'SELECT';

-- Vérifier les permissions sur la fonction
SELECT 
    'Permissions fonction RPC' as status,
    routine_name,
    privilege_type
FROM information_schema.routine_privileges 
WHERE routine_name = 'get_candidate_applications'
AND grantee = 'authenticated';

COMMENT ON FUNCTION public.get_candidate_applications() IS 
'Fonction corrigée pour récupérer les candidatures du candidat authentifié. Résout le problème de visibilité des candidatures.';
