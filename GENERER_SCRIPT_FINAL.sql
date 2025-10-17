-- ============================================================================
-- EXÉCUTEZ CETTE REQUÊTE DANS VOTRE BASE SOURCE
-- Puis copiez TOUT le résultat et collez-le dans votre BASE DESTINATION
-- ============================================================================

SELECT ligne as SCRIPT_COMPLET_A_COPIER_COLLER
FROM (
    -- 1. Header
    SELECT 1 as ordre, '-- ============================================================================' as ligne
    UNION ALL SELECT 1, '-- SCRIPT D''INSERTION - CAMPAGNE 3'
    UNION ALL SELECT 1, '-- Généré automatiquement'
    UNION ALL SELECT 1, '-- ============================================================================'
    UNION ALL SELECT 1, ''
    
    UNION ALL
    
    -- 2. Insertion des recruteurs
    SELECT 2 as ordre, '-- ÉTAPE 1: Recruteurs' as ligne
    UNION ALL
    SELECT 3,
        'INSERT INTO public.users (id, email, matricule, role, first_name, last_name, phone, date_of_birth, candidate_status, created_at, updated_at) VALUES ' ||
        '(' || quote_literal(u.id::text) || '::uuid, ' ||
        quote_literal(u.email) || ', ' ||
        COALESCE(quote_literal(u.matricule), 'NULL') || ', ' ||
        quote_literal(u.role) || ', ' ||
        quote_literal(u.first_name) || ', ' ||
        quote_literal(u.last_name) || ', ' ||
        COALESCE(quote_literal(u.phone), 'NULL') || ', ' ||
        COALESCE(quote_literal(u.date_of_birth::text) || '::date', 'NULL') || ', ' ||
        COALESCE(quote_literal(u.candidate_status), 'NULL') || ', ' ||
        'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING;'
    FROM public.users u
    WHERE u.id IN (SELECT DISTINCT recruiter_id::uuid FROM public.job_offers WHERE campaign_id = 3)
    
    UNION ALL
    
    -- 3. Séparateur
    SELECT 4 as ordre, '' as ligne
    UNION ALL SELECT 4, '-- ÉTAPE 2: Offres de campagne 3'
    UNION ALL
    
    -- 4. Insertion des offres
    SELECT 5 + ROW_NUMBER() OVER (ORDER BY title),
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY title) = 1 THEN
                'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, department, salary_min, salary_max, requirements, benefits, status, status_offerts, application_deadline, campaign_id, reporting_line, job_grade, salary_note, start_date, responsibilities, created_at, updated_at) VALUES '
            ELSE ''
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
        'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)' ||
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY title) < COUNT(*) OVER () THEN ','
            ELSE ';'
        END
    FROM public.job_offers
    WHERE campaign_id = 3
    
    UNION ALL
    
    -- 5. Vérifications
    SELECT 10000 as ordre, '' as ligne
    UNION ALL SELECT 10001, '-- ============================================================================'
    UNION ALL SELECT 10002, '-- VÉRIFICATIONS'
    UNION ALL SELECT 10003, '-- ============================================================================'
    UNION ALL SELECT 10004, 'SELECT COUNT(*) as total FROM public.job_offers WHERE campaign_id = 3;'
    UNION ALL SELECT 10005, 'SELECT status, COUNT(*) FROM public.job_offers WHERE campaign_id = 3 GROUP BY status;'
) AS t
ORDER BY t.ordre;

