-- ============================================================================
-- UPDATE COMPLET AVEC ABSOLUMENT TOUS LES CHAMPS
-- ============================================================================
-- Exécutez cette requête dans votre BASE SOURCE
-- Elle génère les UPDATE avec TOUS les champs de job_offers
-- ============================================================================

SELECT 
    'UPDATE public.job_offers SET ' ||
    -- Champs de base
    'description = ' || quote_literal(REPLACE(COALESCE(description, ''), '''', '''''')) || ', ' ||
    'location = ' || quote_literal(COALESCE(location, '')) || ', ' ||
    'contract_type = ' || quote_literal(COALESCE(contract_type, '')) || ', ' ||
    -- Champs optionnels de base
    'department = ' || CASE WHEN department IS NULL THEN 'NULL' ELSE quote_literal(department) END || ', ' ||
    'salary_min = ' || CASE WHEN salary_min IS NULL THEN 'NULL' ELSE salary_min::text END || ', ' ||
    'salary_max = ' || CASE WHEN salary_max IS NULL THEN 'NULL' ELSE salary_max::text END || ', ' ||
    'application_deadline = ' || CASE WHEN application_deadline IS NULL THEN 'NULL' ELSE quote_literal(application_deadline::text) || '::date' END || ', ' ||
    -- Champs TEXT[] (arrays)
    'requirements = ' || CASE WHEN requirements IS NULL THEN 'NULL' ELSE quote_literal(requirements::text) || '::text[]' END || ', ' ||
    'benefits = ' || CASE WHEN benefits IS NULL THEN 'NULL' ELSE quote_literal(benefits::text) || '::text[]' END || ', ' ||
    'responsibilities = ' || CASE WHEN responsibilities IS NULL THEN 'NULL' ELSE quote_literal(responsibilities::text) || '::text[]' END || ', ' ||
    -- Champs ajoutés pour fiches de poste
    'reporting_line = ' || CASE WHEN reporting_line IS NULL THEN 'NULL' ELSE quote_literal(reporting_line) END || ', ' ||
    'job_grade = ' || CASE WHEN job_grade IS NULL THEN 'NULL' ELSE quote_literal(job_grade) END || ', ' ||
    'salary_note = ' || CASE WHEN salary_note IS NULL THEN 'NULL' ELSE quote_literal(salary_note) END || ', ' ||
    'start_date = ' || CASE WHEN start_date IS NULL THEN 'NULL' ELSE quote_literal(start_date::text) || '::date' END || ', ' ||
    -- Champs catégorie et date limite
    'categorie_metier = ' || CASE WHEN categorie_metier IS NULL THEN 'NULL' ELSE quote_literal(categorie_metier) END || ', ' ||
    'date_limite = ' || CASE WHEN date_limite IS NULL THEN 'NULL' ELSE quote_literal(date_limite::text) || '::timestamptz' END || ', ' ||
    -- Champs MTP Questions (arrays)
    'mtp_questions_metier = ' || CASE WHEN mtp_questions_metier IS NULL THEN 'NULL' ELSE quote_literal(mtp_questions_metier::text) || '::text[]' END || ', ' ||
    'mtp_questions_talent = ' || CASE WHEN mtp_questions_talent IS NULL THEN 'NULL' ELSE quote_literal(mtp_questions_talent::text) || '::text[]' END || ', ' ||
    'mtp_questions_paradigme = ' || CASE WHEN mtp_questions_paradigme IS NULL THEN 'NULL' ELSE quote_literal(mtp_questions_paradigme::text) || '::text[]' END || ', ' ||
    -- Mise à jour timestamp
    'updated_at = CURRENT_TIMESTAMP ' ||
    'WHERE id = ' || quote_literal(id::text) || '::uuid;' as UPDATE_COMPLET
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- NOTE: Cette requête génère les UPDATE pour TOUTES les offres de campagne 3
-- avec ABSOLUMENT TOUS les champs de la table job_offers


