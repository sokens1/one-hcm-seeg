-- ============================================================================
-- MIGRATION COMPLÈTE - FIX DASHBOARD RECRUTEUR
-- Date: 2025-10-12
-- ============================================================================

-- ============================================================================
-- PARTIE 1: ASSIGNER campaign_id AUX OFFRES EXISTANTES
-- ============================================================================

-- Mettre à jour les offres existantes avec campaign_id basé sur leur date de création
UPDATE public.job_offers
SET campaign_id = CASE
    -- Campagne 1 : Créées avant le 11/09/2025
    WHEN created_at < '2025-09-11 00:00:00+00'::timestamptz THEN 1
    
    -- Campagne 2 : Créées entre le 11/09/2025 et le 21/10/2025
    WHEN created_at >= '2025-09-11 00:00:00+00'::timestamptz 
         AND created_at <= '2025-10-21 23:59:59+00'::timestamptz THEN 2
    
    -- Campagne 3 : Créées après le 21/10/2025
    WHEN created_at > '2025-10-21 23:59:59+00'::timestamptz THEN 3
    
    -- Par défaut : Campagne actuelle (basée sur la date d'aujourd'hui)
    ELSE CASE
        WHEN CURRENT_TIMESTAMP < '2025-09-11 00:00:00+00'::timestamptz THEN 1
        WHEN CURRENT_TIMESTAMP <= '2025-10-21 23:59:59+00'::timestamptz THEN 2
        ELSE 3
    END
END
WHERE campaign_id IS NULL;

-- ============================================================================
-- PARTIE 2: CORRIGER get_recruiter_activities (AMBIGUÏTÉ DE COLONNE)
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_recruiter_activities(integer, integer);

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
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Récupérer le rôle de l'utilisateur
  SELECT u.role INTO user_role
  FROM public.users u
  WHERE u.id::text = current_user_id;

  -- Vérifier si l'utilisateur est recruteur, admin ou observateur
  IF user_role NOT IN ('recruteur', 'admin', 'recruiter', 'observateur', 'observer') THEN
    -- Retourner un tableau vide au lieu de lever une exception
    RETURN;
  END IF;

  -- Retourner les activités avec des alias explicites pour éviter l'ambiguïté
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

GRANT EXECUTE ON FUNCTION public.get_recruiter_activities(integer, integer) TO authenticated;

-- ============================================================================
-- PARTIE 3: VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier la distribution des offres par campagne
SELECT 
    COALESCE(campaign_id::text, 'NULL') as campaign_id,
    COUNT(*) as nombre_offres,
    MIN(created_at) as premiere_offre,
    MAX(created_at) as derniere_offre
FROM public.job_offers
WHERE status = 'active'
GROUP BY campaign_id
ORDER BY campaign_id NULLS LAST;

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

