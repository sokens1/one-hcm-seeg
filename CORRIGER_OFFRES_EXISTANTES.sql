-- ============================================================================
-- CORRIGER LES OFFRES DÉJÀ INSÉRÉES AVEC TOUS LES CHAMPS MANQUANTS
-- ============================================================================
-- Cette requête génère des UPDATE pour corriger les offres déjà dans la base
-- Exécutez dans BASE SOURCE pour générer les UPDATE
-- Puis copiez et exécutez dans BASE DESTINATION
-- ============================================================================

SELECT 
    'UPDATE public.job_offers SET ' ||
    'department = ' || CASE WHEN department IS NULL THEN 'NULL' ELSE quote_literal(department) END || ', ' ||
    'salary_min = ' || CASE WHEN salary_min IS NULL THEN 'NULL' ELSE salary_min::text END || ', ' ||
    'salary_max = ' || CASE WHEN salary_max IS NULL THEN 'NULL' ELSE salary_max::text END || ', ' ||
    'requirements = ' || CASE WHEN requirements IS NULL THEN 'NULL' ELSE quote_literal(REPLACE(requirements, '''', '''''')) END || ', ' ||
    'benefits = ' || CASE WHEN benefits IS NULL THEN 'NULL' ELSE quote_literal(REPLACE(benefits, '''', '''''')) END || ', ' ||
    'application_deadline = ' || CASE WHEN application_deadline IS NULL THEN 'NULL' ELSE quote_literal(application_deadline::text) || '::date' END || ', ' ||
    'reporting_line = ' || CASE WHEN reporting_line IS NULL THEN 'NULL' ELSE quote_literal(REPLACE(reporting_line, '''', '''''')) END || ', ' ||
    'job_grade = ' || CASE WHEN job_grade IS NULL THEN 'NULL' ELSE quote_literal(job_grade) END || ', ' ||
    'salary_note = ' || CASE WHEN salary_note IS NULL THEN 'NULL' ELSE quote_literal(REPLACE(salary_note, '''', '''''')) END || ', ' ||
    'start_date = ' || CASE WHEN start_date IS NULL THEN 'NULL' ELSE quote_literal(start_date::text) || '::date' END || ', ' ||
    'responsibilities = ' || CASE WHEN responsibilities IS NULL THEN 'NULL' ELSE quote_literal(REPLACE(responsibilities, '''', '''''')) END || ' ' ||
    'WHERE id = ' || quote_literal(id::text) || '::uuid;' as UPDATE_OFFRE
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;


