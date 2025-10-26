-- Script de correction SIMPLE pour le problème de visibilité des candidatures
-- Version optimisée pour éviter les timeouts

-- ============================================================================
-- ÉTAPE 1: CORRIGER LES POLITIQUES RLS (VERSION SIMPLE)
-- ============================================================================

-- Supprimer les politiques problématiques
DROP POLICY IF EXISTS "applications_select_own" ON public.applications;
DROP POLICY IF EXISTS "applications_insert_own" ON public.applications;
DROP POLICY IF EXISTS "applications_update_own" ON public.applications;

-- Créer une politique simple et efficace
CREATE POLICY "applications_candidate_access" ON public.applications
    FOR ALL 
    USING (candidate_id = auth.uid())
    WITH CHECK (candidate_id = auth.uid());

-- ============================================================================
-- ÉTAPE 2: CORRIGER LA FONCTION RPC (VERSION SIMPLE)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_candidate_applications()
RETURNS TABLE (
  application_details jsonb,
  job_offer_details jsonb,
  candidate_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_jsonb(a.*) AS application_details,
    to_jsonb(jo.*) AS job_offer_details,
    to_jsonb(u.*) AS candidate_details
  FROM
    public.applications a
  INNER JOIN
    public.job_offers jo ON a.job_offer_id = jo.id
  INNER JOIN
    public.users u ON a.candidate_id = u.id
  WHERE
    a.candidate_id = auth.uid()
  ORDER BY
    a.created_at DESC;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.get_candidate_applications() TO authenticated;
