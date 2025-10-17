-- ============================================================================
-- AJOUTER LES CHAMPS MANQUANTS AUX 45 OFFRES DÉJÀ INSÉRÉES
-- ============================================================================
-- Exécutez cette requête dans votre BASE SOURCE
-- Elle génère les UPDATE pour ajouter les champs manquants
-- Copiez TOUS les résultats et exécutez-les dans votre BASE DESTINATION
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
    'responsibilities = ' || CASE WHEN responsibilities IS NULL THEN 'NULL' ELSE quote_literal(REPLACE(responsibilities, '''', '''''')) END || ', ' ||
    'updated_at = CURRENT_TIMESTAMP ' ||
    'WHERE id = ' || quote_literal(id::text) || '::uuid;' as UPDATE_POUR_AJOUTER_CHAMPS
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- NOTE: Cette requête génère 39 lignes UPDATE (ou 46 selon votre base source)
-- Vous devez TOUTES les copier et les exécuter dans la base DESTINATION

