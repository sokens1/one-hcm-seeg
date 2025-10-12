-- ============================================================================
-- FIX FORCÉ - get_recruiter_activities
-- Suppression complète et recréation
-- ============================================================================

-- Supprimer toutes les versions existantes
DROP FUNCTION IF EXISTS public.get_recruiter_activities(integer, integer);
DROP FUNCTION IF EXISTS public.get_recruiter_activities(integer);
DROP FUNCTION IF EXISTS public.get_recruiter_activities();

-- Recréer la fonction avec des alias explicites partout
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
  -- Récupérer l'ID de l'utilisateur authentifié
  current_user_id := auth.uid()::text;
  
  -- Vérifier si l'utilisateur est authentifié
  IF current_user_id IS NULL THEN
    RETURN; -- Retourner vide si non authentifié
  END IF;

  -- Récupérer le rôle de l'utilisateur (avec alias explicite pour éviter ambiguïté)
  SELECT users.role INTO user_role
  FROM public.users AS users
  WHERE users.id::text = current_user_id;

  -- Vérifier si l'utilisateur est recruteur, admin ou observateur
  IF user_role NOT IN ('recruteur', 'admin', 'recruiter', 'observateur', 'observer') THEN
    RETURN; -- Retourner vide si pas autorisé
  END IF;

  -- Retourner les activités avec des alias PARTOUT
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

-- Donner les permissions
GRANT EXECUTE ON FUNCTION public.get_recruiter_activities(integer, integer) TO authenticated;

-- Vérifier la création
SELECT 'get_recruiter_activities' as fonction, '✓ Créée avec succès' as status;

