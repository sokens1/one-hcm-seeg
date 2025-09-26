-- Migration pour ajouter la restriction de date de campagne
-- Empêche les utilisateurs créés avant le 27/09/2025 de postuler

-- 1. Ajouter une fonction pour vérifier l'éligibilité des candidatures
CREATE OR REPLACE FUNCTION public.check_campaign_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si l'utilisateur a été créé à partir du 27/09/2025
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = NEW.candidate_id 
    AND created_at < '2025-09-27 00:00:00+00'::timestamptz
  ) THEN
    RAISE EXCEPTION 'Les candidatures ne sont ouvertes qu''aux utilisateurs créés à partir du 27/09/2025';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger pour empêcher les candidatures des anciens utilisateurs
DROP TRIGGER IF EXISTS check_campaign_eligibility_trigger ON public.applications;
CREATE TRIGGER check_campaign_eligibility_trigger
  BEFORE INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.check_campaign_eligibility();

-- 3. Ajouter une fonction pour obtenir les statistiques de la nouvelle campagne
CREATE OR REPLACE FUNCTION public.get_campaign_stats()
RETURNS TABLE (
  total_jobs bigint,
  total_candidates bigint,
  total_applications bigint,
  applications_per_job jsonb
) AS $$
DECLARE
  campaign_start_date timestamptz := '2025-09-27 00:00:00+00'::timestamptz;
BEGIN
  RETURN QUERY
  WITH campaign_data AS (
    SELECT 
      COUNT(DISTINCT jo.id) as job_count,
      COUNT(DISTINCT u.id) as candidate_count,
      COUNT(a.id) as application_count
    FROM public.job_offers jo
    LEFT JOIN public.applications a ON jo.id = a.job_offer_id
    LEFT JOIN public.users u ON a.candidate_id = u.id
    WHERE jo.status = 'active'
    AND (a.created_at IS NULL OR a.created_at >= campaign_start_date)
    AND (u.created_at IS NULL OR u.created_at >= campaign_start_date)
  ),
  job_stats AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'job_id', jo.id,
        'job_title', jo.title,
        'candidate_count', COALESCE(app_stats.candidate_count, 0),
        'application_count', COALESCE(app_stats.application_count, 0)
      )
    ) as jobs_data
    FROM public.job_offers jo
    LEFT JOIN (
      SELECT 
        a.job_offer_id,
        COUNT(DISTINCT a.candidate_id) as candidate_count,
        COUNT(a.id) as application_count
      FROM public.applications a
      JOIN public.users u ON a.candidate_id = u.id
      WHERE a.created_at >= campaign_start_date
      AND u.created_at >= campaign_start_date
      GROUP BY a.job_offer_id
    ) app_stats ON jo.id = app_stats.job_offer_id
    WHERE jo.status = 'active'
    AND jo.title IN (
      'Directeur Audit & Contrôle interne',
      'Directeur des Systèmes d''Information', 
      'Directeur Juridique, Communication & RSE'
    )
  )
  SELECT 
    cd.job_count,
    cd.candidate_count,
    cd.application_count,
    js.jobs_data
  FROM campaign_data cd, job_stats js;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ajouter une fonction pour obtenir les candidatures de la nouvelle campagne uniquement
CREATE OR REPLACE FUNCTION public.get_campaign_applications()
RETURNS TABLE (
  application_id uuid,
  candidate_id uuid,
  job_offer_id uuid,
  job_title text,
  candidate_name text,
  application_date timestamptz,
  status text
) AS $$
DECLARE
  campaign_start_date timestamptz := '2025-09-27 00:00:00+00'::timestamptz;
BEGIN
  RETURN QUERY
  SELECT 
    a.id as application_id,
    a.candidate_id,
    a.job_offer_id,
    jo.title as job_title,
    CONCAT(u.first_name, ' ', u.last_name) as candidate_name,
    a.created_at as application_date,
    a.status
  FROM public.applications a
  JOIN public.users u ON a.candidate_id = u.id
  JOIN public.job_offers jo ON a.job_offer_id = jo.id
  WHERE a.created_at >= campaign_start_date
  AND u.created_at >= campaign_start_date
  AND jo.status = 'active'
  AND jo.title IN (
    'Directeur Audit & Contrôle interne',
    'Directeur des Systèmes d''Information', 
    'Directeur Juridique, Communication & RSE'
  )
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
