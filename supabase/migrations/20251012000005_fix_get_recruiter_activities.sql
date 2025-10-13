-- ============================================================================
-- FIX get_recruiter_activities - Corriger l'ambiguïté de colonne
-- Date: 2025-10-12
-- ============================================================================

-- Recréer la fonction avec les bons alias et casts
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
  WHERE users.id::text = current_user_id;

  -- Vérifier si l'utilisateur est recruteur, admin ou observateur
  IF user_role NOT IN ('recruteur', 'admin', 'recruiter', 'observateur', 'observer') THEN
    -- Retourner un tableau vide au lieu de lever une exception
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    a.id AS id,
    u.first_name || ' ' || u.last_name || ' a postulé' AS description,
    jo.title AS job_title,
    u.first_name || ' ' || u.last_name AS candidate_name,
    a.created_at AS created_at,
    'application'::text AS activity_type
  FROM
    public.applications a
  INNER JOIN
    public.job_offers jo ON a.job_offer_id = jo.id
  INNER JOIN
    public.users u ON a.candidate_id::text = u.id::text
  WHERE
    jo.recruiter_id::text = current_user_id
    OR user_role IN ('admin', 'observateur', 'observer')
  ORDER BY
    a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.get_recruiter_activities(integer, integer) TO authenticated;

-- Vérifier que la fonction existe
SELECT 
    'get_recruiter_activities' as function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = 'get_recruiter_activities'
        ) THEN '✓ Existe'
        ELSE '✗ Manquante'
    END as status;

