-- ============================================================================
-- CORRECTION : FONCTION RPC POUR QUE TOUS LES RECRUTEURS VOIENT TOUT
-- Date: 2025-10-13
-- ============================================================================
-- 
-- Problème : La fonction get_all_recruiter_applications filtre par recruiter_id
-- Solution : Modifier la fonction pour que tous les recruteurs voient toutes les candidatures
-- 
-- ============================================================================

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.get_all_recruiter_applications(uuid);

-- Créer la nouvelle fonction sans filtrage par recruiter_id
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
    RETURN;
  END IF;

  -- Récupérer le rôle
  SELECT users.role INTO user_role
  FROM public.users AS users
  WHERE users.id::text = current_user_id;

  -- Vérifier que l'utilisateur a un rôle autorisé
  IF user_role NOT IN ('recruteur', 'admin', 'recruiter', 'observateur', 'observer') THEN
    RETURN;
  END IF;

  -- Si un job_offer_id spécifique est demandé
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
    ORDER BY
      apps.created_at DESC;
  ELSE
    -- TOUS les recruteurs, admins et observateurs voient TOUTES les candidatures
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
    ORDER BY
      apps.created_at DESC;
  END IF;
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION public.get_all_recruiter_applications(uuid) TO authenticated;

-- Vérifier que la fonction a été créée
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_all_recruiter_applications';

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- 
-- Maintenant tous les recruteurs, admins et observateurs voient toutes les candidatures
-- sans filtrage par recruiter_id !
-- 
-- ============================================================================
