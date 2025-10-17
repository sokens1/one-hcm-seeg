-- ============================================================================
-- GÉNÉRATEUR DE SCRIPT D'INSERTION CAMPAGNE 3 - VERSION PROPRE
-- ============================================================================
-- Exécutez cette requête dans votre BASE SOURCE
-- Copiez le résultat et exécutez-le dans votre BASE DESTINATION
-- ============================================================================

-- PARTIE 1: Générer l'INSERT pour le recruteur
SELECT 
    'INSERT INTO public.users (id, email, matricule, role, first_name, last_name, phone, date_of_birth, candidate_status, created_at, updated_at) VALUES (' ||
    quote_literal(u.id::text) || '::uuid, ' ||
    quote_literal(u.email) || ', ' ||
    CASE WHEN u.matricule IS NULL THEN 'NULL' ELSE quote_literal(u.matricule) END || ', ' ||
    quote_literal(u.role) || ', ' ||
    quote_literal(u.first_name) || ', ' ||
    quote_literal(u.last_name) || ', ' ||
    CASE WHEN u.phone IS NULL THEN 'NULL' ELSE quote_literal(u.phone) END || ', ' ||
    CASE WHEN u.date_of_birth IS NULL THEN 'NULL' ELSE quote_literal(u.date_of_birth::text) || '::date' END || ', ' ||
    CASE WHEN u.candidate_status IS NULL THEN 'NULL' ELSE quote_literal(u.candidate_status) END || ', ' ||
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING;' as insert_recruteur
FROM public.users u
WHERE u.id::text IN (
    SELECT DISTINCT recruiter_id 
    FROM public.job_offers 
    WHERE campaign_id = 3
)
ORDER BY u.first_name;


-- ============================================================================
-- PARTIE 2: Générer les INSERT pour les offres (une par une, plus simple)
-- ============================================================================

SELECT 
    'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, department, salary_min, salary_max, requirements, benefits, status, status_offerts, application_deadline, campaign_id, reporting_line, job_grade, salary_note, start_date, responsibilities, created_at, updated_at) VALUES (' ||
    quote_literal(id::text) || '::uuid, ' ||
    quote_literal(recruiter_id) || ', ' ||
    quote_literal(title) || ', ' ||
    quote_literal(COALESCE(description, '')) || ', ' ||
    quote_literal(location) || ', ' ||
    quote_literal(contract_type) || ', ' ||
    CASE WHEN department IS NULL THEN 'NULL' ELSE quote_literal(department) END || ', ' ||
    CASE WHEN salary_min IS NULL THEN 'NULL' ELSE salary_min::text END || ', ' ||
    CASE WHEN salary_max IS NULL THEN 'NULL' ELSE salary_max::text END || ', ' ||
    CASE WHEN requirements IS NULL THEN 'NULL' ELSE quote_literal(requirements::text) || '::text[]' END || ', ' ||
    CASE WHEN benefits IS NULL THEN 'NULL' ELSE quote_literal(benefits::text) || '::text[]' END || ', ' ||
    quote_literal(status) || ', ' ||
    CASE WHEN status_offerts IS NULL THEN 'NULL' ELSE quote_literal(status_offerts) END || ', ' ||
    CASE WHEN application_deadline IS NULL THEN 'NULL' ELSE quote_literal(application_deadline::text) || '::date' END || ', ' ||
    campaign_id::text || ', ' ||
    CASE WHEN reporting_line IS NULL THEN 'NULL' ELSE quote_literal(reporting_line) END || ', ' ||
    CASE WHEN job_grade IS NULL THEN 'NULL' ELSE quote_literal(job_grade) END || ', ' ||
    CASE WHEN salary_note IS NULL THEN 'NULL' ELSE quote_literal(salary_note) END || ', ' ||
    CASE WHEN start_date IS NULL THEN 'NULL' ELSE quote_literal(start_date::text) || '::date' END || ', ' ||
    CASE WHEN responsibilities IS NULL THEN 'NULL' ELSE quote_literal(responsibilities::text) || '::text[]' END || ', ' ||
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);' as insert_offres
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;


-- ============================================================================
-- PARTIE 3: Requêtes de vérification
-- ============================================================================

SELECT '-- Vérifications' as verifications
UNION ALL
SELECT 'SELECT COUNT(*) as total_offres FROM public.job_offers WHERE campaign_id = 3;'
UNION ALL
SELECT 'SELECT status, COUNT(*) FROM public.job_offers WHERE campaign_id = 3 GROUP BY status;'
UNION ALL
SELECT 'SELECT status_offerts, COUNT(*) FROM public.job_offers WHERE campaign_id = 3 GROUP BY status_offerts;';

