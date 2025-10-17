-- ============================================================================
-- REQUÊTE FINALE SIMPLE - COPIER TOUT EN UNE FOIS
-- ============================================================================
-- Exécutez cette requête dans la BASE SOURCE
-- Copiez le résultat (une seule cellule)
-- Collez dans la BASE DESTINATION
-- ============================================================================

SELECT 
    string_agg(ligne, chr(10) ORDER BY ordre) as SCRIPT_SQL_A_EXECUTER
FROM (
    -- Header
    SELECT 1 as ordre, '-- ============================================================================' as ligne
    UNION ALL SELECT 2, '-- INSERTION CAMPAGNE 3 - SCRIPT GÉNÉRÉ AUTOMATIQUEMENT'
    UNION ALL SELECT 3, '-- ============================================================================'
    UNION ALL SELECT 4, ''
    
    -- Recruteur
    UNION ALL SELECT 10, '-- RECRUTEUR'
    UNION ALL
    SELECT 11,
        'INSERT INTO public.users (id, email, matricule, role, first_name, last_name, phone, date_of_birth, candidate_status, created_at, updated_at) VALUES (' ||
        quote_literal(u.id::text) || '::uuid, ' ||
        quote_literal(u.email) || ', ' ||
        COALESCE(quote_literal(u.matricule), 'NULL') || ', ' ||
        quote_literal(u.role) || ', ' ||
        quote_literal(u.first_name) || ', ' ||
        quote_literal(u.last_name) || ', ' ||
        COALESCE(quote_literal(u.phone), 'NULL') || ', ' ||
        CASE WHEN u.date_of_birth IS NULL THEN 'NULL' ELSE quote_literal(u.date_of_birth::text) || '::date' END || ', ' ||
        COALESCE(quote_literal(u.candidate_status), 'NULL') || ', ' ||
        'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING;'
    FROM public.users u
    WHERE u.id::text IN (SELECT DISTINCT recruiter_id FROM public.job_offers WHERE campaign_id = 3)
    
    UNION ALL SELECT 99, ''
    UNION ALL SELECT 100, '-- OFFRES DE CAMPAGNE 3'
    
    -- Offres - toutes en une seule requête INSERT avec plusieurs VALUES
    UNION ALL
    SELECT 101,
        'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, department, salary_min, salary_max, requirements, benefits, status, status_offerts, application_deadline, campaign_id, reporting_line, job_grade, salary_note, start_date, responsibilities, created_at, updated_at) VALUES'
    
    UNION ALL
    SELECT 
        102 + ROW_NUMBER() OVER (ORDER BY title),
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY title) > 1 THEN ',' ELSE ''
        END ||
        '(' ||
        quote_literal(id::text) || '::uuid, ' ||
        quote_literal(recruiter_id) || ', ' ||
        quote_literal(title) || ', ' ||
        quote_literal(COALESCE(description, '')) || ', ' ||
        quote_literal(location) || ', ' ||
        quote_literal(contract_type) || ', ' ||
        COALESCE(quote_literal(department), 'NULL') || ', ' ||
        COALESCE(salary_min::text, 'NULL') || ', ' ||
        COALESCE(salary_max::text, 'NULL') || ', ' ||
        COALESCE(quote_literal(requirements::text) || '::text[]', 'NULL') || ', ' ||
        COALESCE(quote_literal(benefits::text) || '::text[]', 'NULL') || ', ' ||
        quote_literal(status) || ', ' ||
        COALESCE(quote_literal(status_offerts), 'NULL') || ', ' ||
        COALESCE(quote_literal(application_deadline::text) || '::date', 'NULL') || ', ' ||
        campaign_id::text || ', ' ||
        COALESCE(quote_literal(reporting_line), 'NULL') || ', ' ||
        COALESCE(quote_literal(job_grade), 'NULL') || ', ' ||
        COALESCE(quote_literal(salary_note), 'NULL') || ', ' ||
        COALESCE(quote_literal(start_date::text) || '::date', 'NULL') || ', ' ||
        COALESCE(quote_literal(responsibilities::text) || '::text[]', 'NULL') || ', ' ||
        'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    FROM public.job_offers
    WHERE campaign_id = 3
    
    -- Ligne de fin avec point-virgule
    UNION ALL
    SELECT 9999, ';'
    
    -- Vérifications
    UNION ALL SELECT 10000, ''
    UNION ALL SELECT 10001, '-- ============================================================================'
    UNION ALL SELECT 10002, '-- VÉRIFICATIONS'
    UNION ALL SELECT 10003, '-- ============================================================================'
    UNION ALL SELECT 10004, 'SELECT COUNT(*) as total_offres FROM public.job_offers WHERE campaign_id = 3;'
    UNION ALL SELECT 10005, 'SELECT status, COUNT(*) FROM public.job_offers WHERE campaign_id = 3 GROUP BY status;'
    UNION ALL SELECT 10006, 'SELECT status_offerts, COUNT(*) FROM public.job_offers WHERE campaign_id = 3 GROUP BY status_offerts;'
) t;

