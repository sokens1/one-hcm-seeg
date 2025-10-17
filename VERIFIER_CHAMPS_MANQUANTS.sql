-- ============================================================================
-- VÉRIFIER LES CHAMPS MANQUANTS DANS LES OFFRES INSÉRÉES
-- ============================================================================
-- Exécutez dans votre BASE DESTINATION pour voir quels champs sont NULL
-- ============================================================================

-- VÉRIFICATION 1: Voir tous les champs d'une offre insérée
SELECT *
FROM public.job_offers
WHERE campaign_id = 3
LIMIT 1;

-- VÉRIFICATION 2: Compter les NULL par colonne
SELECT 
    COUNT(*) as total_offres,
    COUNT(department) as avec_department,
    COUNT(*) - COUNT(department) as sans_department,
    COUNT(salary_min) as avec_salary_min,
    COUNT(*) - COUNT(salary_min) as sans_salary_min,
    COUNT(salary_max) as avec_salary_max,
    COUNT(*) - COUNT(salary_max) as sans_salary_max,
    COUNT(requirements) as avec_requirements,
    COUNT(*) - COUNT(requirements) as sans_requirements,
    COUNT(benefits) as avec_benefits,
    COUNT(*) - COUNT(benefits) as sans_benefits,
    COUNT(application_deadline) as avec_deadline,
    COUNT(*) - COUNT(application_deadline) as sans_deadline,
    COUNT(reporting_line) as avec_reporting_line,
    COUNT(*) - COUNT(reporting_line) as sans_reporting_line,
    COUNT(job_grade) as avec_job_grade,
    COUNT(*) - COUNT(job_grade) as sans_job_grade,
    COUNT(salary_note) as avec_salary_note,
    COUNT(*) - COUNT(salary_note) as sans_salary_note,
    COUNT(start_date) as avec_start_date,
    COUNT(*) - COUNT(start_date) as sans_start_date,
    COUNT(responsibilities) as avec_responsibilities,
    COUNT(*) - COUNT(responsibilities) as sans_responsibilities
FROM public.job_offers
WHERE campaign_id = 3;

-- VÉRIFICATION 3: Lister les offres avec champs manquants
SELECT 
    title,
    CASE WHEN department IS NULL THEN 'MANQUE' ELSE 'OK' END as department,
    CASE WHEN requirements IS NULL THEN 'MANQUE' ELSE 'OK' END as requirements,
    CASE WHEN benefits IS NULL THEN 'MANQUE' ELSE 'OK' END as benefits,
    CASE WHEN reporting_line IS NULL THEN 'MANQUE' ELSE 'OK' END as reporting_line,
    CASE WHEN responsibilities IS NULL THEN 'MANQUE' ELSE 'OK' END as responsibilities
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

