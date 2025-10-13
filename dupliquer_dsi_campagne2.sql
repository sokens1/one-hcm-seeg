-- ============================================================================
-- DUPLICATION SPÉCIFIQUE : Directeur des Systèmes d'Information
-- Campagne 1 → Campagne 2
-- ============================================================================

-- Étape 1: Vérifier si l'offre existe déjà dans la campagne 2
SELECT 
    id,
    title,
    campaign_id,
    status,
    start_date,
    date_limite
FROM public.job_offers
WHERE title = 'Directeur des Systèmes d''Information'
ORDER BY campaign_id;

-- Étape 2: Dupliquer l'offre "Directeur des Systèmes d'Information" vers la campagne 2
-- Utilisation de l'ID pour être certain
INSERT INTO public.job_offers (
    recruiter_id, title, description, location, contract_type, department, profile,
    salary_min, salary_max, requirements, benefits, status, application_deadline,
    categorie_metier, date_limite, reporting_line, job_grade, salary_note,
    start_date, status_offerts, responsibilities, mtp_questions_metier,
    mtp_questions_talent, mtp_questions_paradigme, campaign_id, created_at, updated_at
)
SELECT 
    recruiter_id, title, description, location, contract_type, department, profile,
    salary_min, salary_max, requirements, benefits, 
    'active' as status,
    '2025-10-21'::date as application_deadline,
    categorie_metier,
    '2025-10-21 23:59:59+00'::timestamptz as date_limite,
    reporting_line, job_grade, salary_note,
    '2026-02-01'::date as start_date,
    status_offerts, responsibilities, mtp_questions_metier,
    mtp_questions_talent, mtp_questions_paradigme,
    2 as campaign_id,
    now() as created_at,
    now() as updated_at
FROM public.job_offers
WHERE id = '41112afb-d778-4c2b-bb86-f9ee3b6ca5a4'
RETURNING id, title, campaign_id, start_date, date_limite, status;

-- Étape 3: Vérifier que la nouvelle offre a été créée
SELECT 
    id,
    title,
    campaign_id,
    status,
    start_date as date_embauche,
    date_limite as date_limite_candidature,
    created_at
FROM public.job_offers
WHERE title = 'Directeur des Systèmes d''Information'
ORDER BY campaign_id, created_at DESC;

