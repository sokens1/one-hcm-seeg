-- Créer la fonction get_recruiter_applications manquante
-- Cette fonction permet aux recruteurs de récupérer leurs candidatures

CREATE OR REPLACE FUNCTION public.get_recruiter_applications(
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
BEGIN
  -- Vérifier si l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RETURN; -- Retourne un tableau vide si non authentifié
  END IF;

  -- S'assurer que l'utilisateur existe dans public.users
  PERFORM public.ensure_user_exists();

  -- Vérifier si l'utilisateur est un recruteur ou un admin
  IF NOT EXISTS(
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text AND role IN ('recruteur', 'admin', 'recruiter')
  ) THEN
    RETURN; -- Retourne un tableau vide si l'utilisateur n'a pas le bon rôle
  END IF;

  -- Si un job_offer_id spécifique est fourni, filtrer par cette offre
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
      jo.recruiter_id::text = auth.uid()::text
      AND a.job_offer_id = p_job_offer_id
    ORDER BY
      a.created_at DESC;
  ELSE
    -- Sinon, retourner toutes les candidatures du recruteur
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
      jo.recruiter_id::text = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()::text AND role = 'admin'
      )
    ORDER BY
      a.created_at DESC;
  END IF;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.get_recruiter_applications(uuid) TO authenticated;
