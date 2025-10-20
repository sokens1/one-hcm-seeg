-- ============================================================================
-- GÉNÉRER LES REQUÊTES INSERT POUR LES OFFRES DE CAMPAGNE 3
-- Date: 2025-10-17
-- ============================================================================
--
-- ÉTAPE 1: Exécutez cette requête dans la BASE SOURCE
-- Elle va générer automatiquement toutes les requêtes INSERT
-- 
-- ÉTAPE 2: Copiez le résultat et exécutez-le dans la BASE DESTINATION
-- ============================================================================

SELECT 
    'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, department, salary_min, salary_max, requirements, benefits, status, status_offerts, application_deadline, campaign_id, reporting_line, job_grade, salary_note, start_date, responsibilities, created_at, updated_at) VALUES (' ||
    quote_literal(id::text) || ', ' ||
    quote_literal(recruiter_id) || ', ' ||
    quote_literal(title) || ', ' ||
    quote_literal(COALESCE(description, '')) || ', ' ||
    quote_literal(location) || ', ' ||
    quote_literal(contract_type) || ', ' ||
    COALESCE(quote_literal(department), 'NULL') || ', ' ||
    COALESCE(salary_min::text, 'NULL') || ', ' ||
    COALESCE(salary_max::text, 'NULL') || ', ' ||
    COALESCE(quote_literal(requirements::text), 'NULL') || ', ' ||
    COALESCE(quote_literal(benefits::text), 'NULL') || ', ' ||
    quote_literal(status) || ', ' ||
    COALESCE(quote_literal(status_offerts), 'NULL') || ', ' ||
    COALESCE(quote_literal(application_deadline::text), 'NULL') || ', ' ||
    COALESCE(campaign_id::text, 'NULL') || ', ' ||
    COALESCE(quote_literal(reporting_line), 'NULL') || ', ' ||
    COALESCE(quote_literal(job_grade), 'NULL') || ', ' ||
    COALESCE(quote_literal(salary_note), 'NULL') || ', ' ||
    COALESCE(quote_literal(start_date::text), 'NULL') || ', ' ||
    COALESCE(quote_literal(responsibilities::text), 'NULL') || ', ' ||
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);' as requete_insert
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;


-- ============================================================================
-- ALTERNATIVE: Générer un seul INSERT avec toutes les VALUES
-- (Plus rapide mais peut être trop long si beaucoup d'offres)
-- ============================================================================

WITH offres_campagne_3 AS (
    SELECT 
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
        COALESCE(campaign_id::text, 'NULL') || ', ' ||
        COALESCE(quote_literal(reporting_line), 'NULL') || ', ' ||
        COALESCE(quote_literal(job_grade), 'NULL') || ', ' ||
        COALESCE(quote_literal(salary_note), 'NULL') || ', ' ||
        COALESCE(quote_literal(start_date::text) || '::date', 'NULL') || ', ' ||
        COALESCE(quote_literal(responsibilities::text) || '::text[]', 'NULL') || ', ' ||
        'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)' as value_clause,
        ROW_NUMBER() OVER (ORDER BY title) as rn,
        COUNT(*) OVER () as total
    FROM public.job_offers
    WHERE campaign_id = 3
)
SELECT 
    CASE 
        WHEN rn = 1 THEN 
            'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, department, salary_min, salary_max, requirements, benefits, status, status_offerts, application_deadline, campaign_id, reporting_line, job_grade, salary_note, start_date, responsibilities, created_at, updated_at) VALUES ' || chr(10) || value_clause
        WHEN rn < total THEN 
            ',' || chr(10) || value_clause
        ELSE 
            ',' || chr(10) || value_clause || ';' || chr(10) || chr(10) || '-- Vérification' || chr(10) || 'SELECT COUNT(*) FROM public.job_offers WHERE campaign_id = 3;'
    END as requete_complete
FROM offres_campagne_3
ORDER BY rn;


-- ============================================================================
-- OPTION 3: Export CSV puis import
-- ============================================================================
-- Exécutez cette commande dans psql ou pgAdmin pour exporter en CSV:
/*
COPY (
    SELECT 
        id, recruiter_id, title, description, location, contract_type, 
        department, salary_min, salary_max, requirements, benefits, 
        status, status_offerts, application_deadline, campaign_id,
        reporting_line, job_grade, salary_note, start_date, responsibilities,
        CURRENT_TIMESTAMP as created_at,
        CURRENT_TIMESTAMP as updated_at
    FROM public.job_offers
    WHERE campaign_id = 3
) TO '/tmp/offres_campagne_3.csv' WITH CSV HEADER DELIMITER ',' ENCODING 'UTF8';
*/

-- Puis dans la base destination:
/*
COPY public.job_offers (
    id, recruiter_id, title, description, location, contract_type, 
    department, salary_min, salary_max, requirements, benefits, 
    status, status_offerts, application_deadline, campaign_id,
    reporting_line, job_grade, salary_note, start_date, responsibilities,
    created_at, updated_at
)
FROM '/tmp/offres_campagne_3.csv' WITH CSV HEADER DELIMITER ',' ENCODING 'UTF8';
*/


