-- ============================================================================
-- INSERT CHEF DE DÉLÉGATION NORD AVEC LES 28 CHAMPS COMPLETS
-- ============================================================================
-- Exécutez cette requête dans votre BASE SOURCE
-- Copiez le résultat et exécutez-le dans votre BASE DESTINATION
-- ============================================================================

SELECT 
    'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, department, salary_min, salary_max, requirements, benefits, status, application_deadline, profile, categorie_metier, date_limite, reporting_line, job_grade, salary_note, start_date, responsibilities, status_offerts, mtp_questions_metier, mtp_questions_talent, mtp_questions_paradigme, campaign_id, created_at, updated_at) VALUES (' ||
    
    -- ID et recruteur
    quote_literal(id::text) || '::uuid, ' ||
    quote_literal(recruiter_id) || ', ' ||
    
    -- Titre
    quote_literal(title) || ', ' ||
    
    -- Description (HTML)
    quote_literal(REPLACE(COALESCE(description, ''), '''', '''''')) || ', ' ||
    
    -- Location et contract
    quote_literal(COALESCE(location, '')) || ', ' ||
    quote_literal(COALESCE(contract_type, '')) || ', ' ||
    
    -- Department, salaires
    CASE WHEN department IS NULL THEN 'NULL' ELSE quote_literal(department) END || ', ' ||
    CASE WHEN salary_min IS NULL THEN 'NULL' ELSE salary_min::text END || ', ' ||
    CASE WHEN salary_max IS NULL THEN 'NULL' ELSE salary_max::text END || ', ' ||
    
    -- Arrays: requirements, benefits
    CASE WHEN requirements IS NULL THEN 'NULL' ELSE quote_literal(requirements::text) || '::text[]' END || ', ' ||
    CASE WHEN benefits IS NULL THEN 'NULL' ELSE quote_literal(benefits::text) || '::text[]' END || ', ' ||
    
    -- Status et deadline
    quote_literal(status) || ', ' ||
    CASE WHEN application_deadline IS NULL THEN 'NULL' ELSE quote_literal(application_deadline::text) || '::date' END || ', ' ||
    
    -- Profile (CONNAISSANCES SAVOIR)
    CASE WHEN profile IS NULL THEN 'NULL' ELSE quote_literal(REPLACE(profile, '''', '''''')) END || ', ' ||
    
    -- Categorie metier et date limite
    CASE WHEN categorie_metier IS NULL THEN 'NULL' ELSE quote_literal(categorie_metier) END || ', ' ||
    CASE WHEN date_limite IS NULL THEN 'NULL' ELSE quote_literal(date_limite::text) || '::timestamptz' END || ', ' ||
    
    -- Fiche de poste
    CASE WHEN reporting_line IS NULL THEN 'NULL' ELSE quote_literal(reporting_line) END || ', ' ||
    CASE WHEN job_grade IS NULL THEN 'NULL' ELSE quote_literal(job_grade) END || ', ' ||
    CASE WHEN salary_note IS NULL THEN 'NULL' ELSE quote_literal(salary_note) END || ', ' ||
    CASE WHEN start_date IS NULL THEN 'NULL' ELSE quote_literal(start_date::text) || '::date' END || ', ' ||
    
    -- Responsibilities array
    CASE WHEN responsibilities IS NULL THEN 'NULL' ELSE quote_literal(responsibilities::text) || '::text[]' END || ', ' ||
    
    -- Status offerts
    CASE WHEN status_offerts IS NULL THEN 'NULL' ELSE quote_literal(status_offerts) END || ', ' ||
    
    -- MTP Questions arrays
    CASE WHEN mtp_questions_metier IS NULL THEN 'NULL' ELSE quote_literal(mtp_questions_metier::text) || '::text[]' END || ', ' ||
    CASE WHEN mtp_questions_talent IS NULL THEN 'NULL' ELSE quote_literal(mtp_questions_talent::text) || '::text[]' END || ', ' ||
    CASE WHEN mtp_questions_paradigme IS NULL THEN 'NULL' ELSE quote_literal(mtp_questions_paradigme::text) || '::text[]' END || ', ' ||
    
    -- Campaign ID
    COALESCE(campaign_id::text, 'NULL') || ', ' ||
    
    -- Timestamps
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);' as INSERT_COMPLET_CHEF_DELEGATION_NORD
    
FROM public.job_offers
WHERE campaign_id = 3 
  AND title = 'Chef de Délégation Nord'
LIMIT 1;


