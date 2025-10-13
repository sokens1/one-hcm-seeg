-- ============================================================================
-- DUPLICATION DES 3 OFFRES DE LA CAMPAGNE 1 VERS LA CAMPAGNE 2
-- Date: 2025-10-13
-- ============================================================================
-- 
-- Objectif : Créer 3 nouvelles offres pour la campagne 2 identiques aux offres
-- de la campagne 1, mais avec des dates mises à jour :
--   - Date d'embauche : 01/02/2026
--   - Date limite de candidature : 21/10/2025
--
-- Offres concernées :
--   1. Directeur des Systèmes d'Information
--   2. Directeur Audit & Contrôle interne
--   3. Directeur Juridique, Communication & RSE
-- ============================================================================

-- Étape 1: Vérifier que les offres de la campagne 1 existent
SELECT 
    id,
    title,
    campaign_id,
    status,
    start_date as date_embauche_actuelle,
    date_limite as date_limite_actuelle
FROM public.job_offers
WHERE campaign_id = 1
  AND title IN (
      'Directeur des Systèmes d''Information',
      'Directeur Audit & Contrôle interne',
      'Directeur Juridique, Communication & RSE'
  )
ORDER BY title;

-- Étape 2: Dupliquer les offres vers la campagne 2 avec les nouvelles dates
INSERT INTO public.job_offers (
    recruiter_id,
    title,
    description,
    location,
    contract_type,
    department,
    profile,
    salary_min,
    salary_max,
    requirements,
    benefits,
    status,
    application_deadline,
    categorie_metier,
    date_limite,
    reporting_line,
    job_grade,
    salary_note,
    start_date,
    status_offerts,
    responsibilities,
    mtp_questions_metier,
    mtp_questions_talent,
    mtp_questions_paradigme,
    campaign_id,
    created_at,
    updated_at
)
SELECT 
    recruiter_id,
    title,
    description,
    location,
    contract_type,
    department,
    profile,
    salary_min,
    salary_max,
    requirements,
    benefits,
    'active' as status, -- Statut actif pour les nouvelles offres
    '2025-10-21'::date as application_deadline, -- Date limite de candidature
    categorie_metier,
    '2025-10-21 23:59:59+00'::timestamptz as date_limite, -- Date limite avec heure
    reporting_line,
    job_grade,
    salary_note,
    '2026-02-01'::date as start_date, -- Date d'embauche souhaitée
    status_offerts,
    responsibilities,
    mtp_questions_metier,
    mtp_questions_talent,
    mtp_questions_paradigme,
    2 as campaign_id, -- Campagne 2
    now() as created_at, -- Date de création = maintenant
    now() as updated_at  -- Date de mise à jour = maintenant
FROM public.job_offers
WHERE campaign_id = 1
  AND title IN (
      'Directeur des Systèmes d''Information',
      'Directeur Audit & Contrôle interne',
      'Directeur Juridique, Communication & RSE'
  )
RETURNING id, title, campaign_id, start_date, date_limite, status;

-- Étape 3: Vérifier que les nouvelles offres ont été créées
SELECT 
    id,
    title,
    campaign_id,
    status,
    start_date as date_embauche,
    date_limite as date_limite_candidature,
    created_at
FROM public.job_offers
WHERE campaign_id = 2
  AND title IN (
      'Directeur des Systèmes d''Information',
      'Directeur Audit & Contrôle interne',
      'Directeur Juridique, Communication & RSE'
  )
ORDER BY title;

-- Étape 4: Afficher un récapitulatif des offres par campagne
SELECT 
    campaign_id,
    COUNT(*) as nombre_offres,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as offres_actives,
    string_agg(DISTINCT title, ', ' ORDER BY title) as titres_offres
FROM public.job_offers
WHERE title IN (
    'Directeur des Systèmes d''Information',
    'Directeur Audit & Contrôle interne',
    'Directeur Juridique, Communication & RSE'
)
GROUP BY campaign_id
ORDER BY campaign_id;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- 
-- Après l'exécution de ce script, vous devriez avoir :
--   - 3 nouvelles offres dans la campagne 2
--   - Statut : active
--   - Date d'embauche : 01/02/2026
--   - Date limite de candidature : 21/10/2025
--   - Toutes les autres informations identiques à la campagne 1
-- 
-- ============================================================================

