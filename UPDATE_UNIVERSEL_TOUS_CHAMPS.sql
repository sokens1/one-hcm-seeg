-- ============================================================================
-- UPDATE UNIVERSEL AVEC TOUS LES CHAMPS POSSIBLES
-- ============================================================================
-- Cette requête inclut TOUS les champs possibles de job_offers
-- Si un champ n'existe pas dans votre base, SQL ignorera cette partie
-- ============================================================================

SELECT 
    'UPDATE public.job_offers SET ' ||
    -- Description (toujours présente)
    'description = ' || quote_literal(REPLACE(COALESCE(description, ''), '''', '''''')) || ', ' ||
    
    -- Champs de base
    'location = ' || quote_literal(COALESCE(location, '')) || ', ' ||
    'contract_type = ' || quote_literal(COALESCE(contract_type, '')) || ', ' ||
    'department = ' || CASE WHEN department IS NULL THEN 'NULL' ELSE quote_literal(department) END || ', ' ||
    'salary_min = ' || CASE WHEN salary_min IS NULL THEN 'NULL' ELSE salary_min::text END || ', ' ||
    'salary_max = ' || CASE WHEN salary_max IS NULL THEN 'NULL' ELSE salary_max::text END || ', ' ||
    'application_deadline = ' || CASE WHEN application_deadline IS NULL THEN 'NULL' ELSE quote_literal(application_deadline::text) || '::date' END || ', ' ||
    
    -- Champ PROFILE (ancien champ pour connaissances savoir)
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_offers' AND column_name = 'profile')
      THEN 'profile = ' || CASE WHEN profile IS NULL THEN 'NULL' ELSE quote_literal(REPLACE(COALESCE(profile, ''), '''', '''''')) END || ', '
      ELSE ''
    END ||
    
    -- Arrays (requirements, benefits, responsibilities)
    'requirements = ' || CASE WHEN requirements IS NULL THEN 'NULL' ELSE quote_literal(requirements::text) || '::text[]' END || ', ' ||
    'benefits = ' || CASE WHEN benefits IS NULL THEN 'NULL' ELSE quote_literal(benefits::text) || '::text[]' END || ', ' ||
    'responsibilities = ' || CASE WHEN responsibilities IS NULL THEN 'NULL' ELSE quote_literal(responsibilities::text) || '::text[]' END || ', ' ||
    
    -- Champs fiche de poste
    'reporting_line = ' || CASE WHEN reporting_line IS NULL THEN 'NULL' ELSE quote_literal(reporting_line) END || ', ' ||
    'job_grade = ' || CASE WHEN job_grade IS NULL THEN 'NULL' ELSE quote_literal(job_grade) END || ', ' ||
    'salary_note = ' || CASE WHEN salary_note IS NULL THEN 'NULL' ELSE quote_literal(salary_note) END || ', ' ||
    'start_date = ' || CASE WHEN start_date IS NULL THEN 'NULL' ELSE quote_literal(start_date::text) || '::date' END || ', ' ||
    
    -- Champs métier et dates
    'categorie_metier = ' || CASE WHEN categorie_metier IS NULL THEN 'NULL' ELSE quote_literal(categorie_metier) END || ', ' ||
    'date_limite = ' || CASE WHEN date_limite IS NULL THEN 'NULL' ELSE quote_literal(date_limite::text) || '::timestamptz' END || ', ' ||
    
    -- Questions MTP (arrays)
    'mtp_questions_metier = ' || CASE WHEN mtp_questions_metier IS NULL THEN 'NULL' ELSE quote_literal(mtp_questions_metier::text) || '::text[]' END || ', ' ||
    'mtp_questions_talent = ' || CASE WHEN mtp_questions_talent IS NULL THEN 'NULL' ELSE quote_literal(mtp_questions_talent::text) || '::text[]' END || ', ' ||
    'mtp_questions_paradigme = ' || CASE WHEN mtp_questions_paradigme IS NULL THEN 'NULL' ELSE quote_literal(mtp_questions_paradigme::text) || '::text[]' END || ', ' ||
    
    -- Timestamp de mise à jour
    'updated_at = CURRENT_TIMESTAMP ' ||
    'WHERE id = ' || quote_literal(id::text) || '::uuid;' as UPDATE_COMPLET
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

