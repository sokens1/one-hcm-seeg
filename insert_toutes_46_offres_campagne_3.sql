-- ============================================================================
-- INSERTION COMPLÈTE DES 46 OFFRES DE CAMPAGNE 3
-- ============================================================================
-- Ce script génère les INSERT pour TOUTES les offres de campagne 3
-- Exécutez ce script dans la BASE SOURCE pour obtenir le script complet
-- ============================================================================

-- Générer tous les recruteurs + toutes les offres
WITH all_recruteurs AS (
    -- Tous les recruteurs
    SELECT DISTINCT 
        u.id,
        u.email,
        u.matricule,
        u.role,
        u.first_name,
        u.last_name,
        u.phone,
        u.date_of_birth,
        u.candidate_status,
        ROW_NUMBER() OVER (ORDER BY u.first_name, u.last_name) as rn
    FROM public.users u
    WHERE u.id IN (
        SELECT DISTINCT recruiter_id::uuid 
        FROM public.job_offers 
        WHERE campaign_id = 3
    )
),
all_offres AS (
    -- Toutes les offres
    SELECT 
        id,
        recruiter_id,
        title,
        description,
        location,
        contract_type,
        department,
        salary_min,
        salary_max,
        requirements,
        benefits,
        status,
        status_offerts,
        application_deadline,
        campaign_id,
        reporting_line,
        job_grade,
        salary_note,
        start_date,
        responsibilities,
        ROW_NUMBER() OVER (ORDER BY recruiter_id, title) as rn,
        COUNT(*) OVER () as total
    FROM public.job_offers
    WHERE campaign_id = 3
),
header AS (
    -- Header
    SELECT 
        0 as ordre,
        '-- ============================================================================' || chr(10) ||
        '-- SCRIPT D''INSERTION COMPLET - CAMPAGNE 3' || chr(10) ||
        '-- ============================================================================' || chr(10) ||
        '-- Total offres: ' || (SELECT COUNT(*) FROM all_offres)::text || chr(10) ||
        '-- Total recruteurs: ' || (SELECT COUNT(*) FROM all_recruteurs)::text || chr(10) ||
        '-- ============================================================================' || chr(10) || chr(10) as contenu
),
section_recruteurs AS (
    -- Section recruteurs
    SELECT 
        1 as ordre,
        '-- ============================================================================' || chr(10) ||
        '-- ÉTAPE 1: INSERTION DES RECRUTEURS' || chr(10) ||
        '-- ============================================================================' || chr(10) || chr(10) as contenu
    UNION ALL
    SELECT 
        2 as ordre,
        'INSERT INTO public.users (id, email, matricule, role, first_name, last_name, phone, date_of_birth, candidate_status, created_at, updated_at) VALUES ' || chr(10) ||
        string_agg(
            '(' ||
            quote_literal(id::text) || '::uuid, ' ||
            quote_literal(email) || ', ' ||
            COALESCE(quote_literal(matricule), 'NULL') || ', ' ||
            quote_literal(role) || ', ' ||
            quote_literal(first_name) || ', ' ||
            quote_literal(last_name) || ', ' ||
            COALESCE(quote_literal(phone), 'NULL') || ', ' ||
            COALESCE(quote_literal(date_of_birth::text) || '::date', 'NULL') || ', ' ||
            COALESCE(quote_literal(candidate_status), 'NULL') || ', ' ||
            'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            ',' || chr(10)
            ORDER BY rn
        ) || chr(10) ||
        'ON CONFLICT (id) DO NOTHING;' || chr(10) || chr(10) as contenu
    FROM all_recruteurs
),
section_offres_header AS (
    -- Section offres header
    SELECT 
        3 as ordre,
        '-- ============================================================================' || chr(10) ||
        '-- ÉTAPE 2: INSERTION DES 46 OFFRES DE CAMPAGNE 3' || chr(10) ||
        '-- ============================================================================' || chr(10) || chr(10) as contenu
),
section_offres AS (
    -- Section offres
    SELECT 
        4 as ordre,
        CASE 
            WHEN rn = 1 THEN 
                'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, department, salary_min, salary_max, requirements, benefits, status, status_offerts, application_deadline, campaign_id, reporting_line, job_grade, salary_note, start_date, responsibilities, created_at, updated_at) VALUES ' || chr(10)
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
        COALESCE(campaign_id::text, 'NULL') || ', ' ||
        COALESCE(quote_literal(reporting_line), 'NULL') || ', ' ||
        COALESCE(quote_literal(job_grade), 'NULL') || ', ' ||
        COALESCE(quote_literal(salary_note), 'NULL') || ', ' ||
        COALESCE(quote_literal(start_date::text) || '::date', 'NULL') || ', ' ||
        COALESCE(quote_literal(responsibilities::text) || '::text[]', 'NULL') || ', ' ||
        'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)' ||
        CASE WHEN rn < total THEN ',' || chr(10) ELSE ';' || chr(10) || chr(10) END as contenu
    FROM all_offres
    ORDER BY rn
),
stats_recruteur AS (
    -- Statistiques par recruteur
    SELECT 
        recruiter_id,
        COUNT(*) as nb_offres
    FROM all_offres
    GROUP BY recruiter_id
),
stats AS (
    -- Statistiques finales
    SELECT 
        5 as ordre,
        '-- ============================================================================' || chr(10) ||
        '-- STATISTIQUES FINALES' || chr(10) ||
        '-- ============================================================================' || chr(10) ||
        '-- Total offres insérées: ' || (SELECT COUNT(*) FROM all_offres)::text || chr(10) ||
        '-- Répartition par recruteur:' || chr(10) ||
        (SELECT string_agg('--   - ' || recruiter_id || ': ' || nb_offres::text || ' offres', chr(10) ORDER BY recruiter_id) FROM stats_recruteur) || chr(10) ||
        '-- Répartition par statut:' || chr(10) ||
        '--   - Draft: ' || (SELECT COUNT(*) FROM all_offres WHERE status = 'draft')::text || chr(10) ||
        '--   - Active: ' || (SELECT COUNT(*) FROM all_offres WHERE status = 'active')::text || chr(10) ||
        '-- Répartition interne/externe:' || chr(10) ||
        '--   - Interne: ' || (SELECT COUNT(*) FROM all_offres WHERE status_offerts = 'interne')::text || chr(10) ||
        '--   - Externe: ' || (SELECT COUNT(*) FROM all_offres WHERE status_offerts = 'externe')::text || chr(10) ||
        '--   - Non défini: ' || (SELECT COUNT(*) FROM all_offres WHERE status_offerts IS NULL)::text || chr(10) ||
        '-- ============================================================================' || chr(10) || chr(10) as contenu
),
verif AS (
    -- Vérifications
    SELECT 
        6 as ordre,
        '-- ============================================================================' || chr(10) ||
        '-- REQUÊTES DE VÉRIFICATION (à exécuter après l''import)' || chr(10) ||
        '-- ============================================================================' || chr(10) ||
        'SELECT COUNT(*) as total_importees FROM public.job_offers WHERE campaign_id = 3;' || chr(10) ||
        chr(10) ||
        'SELECT recruiter_id, COUNT(*) as nombre FROM public.job_offers WHERE campaign_id = 3 GROUP BY recruiter_id;' || chr(10) ||
        chr(10) ||
        'SELECT status, COUNT(*) as nombre FROM public.job_offers WHERE campaign_id = 3 GROUP BY status;' || chr(10) ||
        chr(10) ||
        'SELECT status_offerts, COUNT(*) as nombre FROM public.job_offers WHERE campaign_id = 3 GROUP BY status_offerts;' as contenu
)
-- Combiner tout
SELECT contenu as script_sql_complet
FROM (
    SELECT * FROM header
    UNION ALL
    SELECT * FROM section_recruteurs
    UNION ALL
    SELECT * FROM section_offres_header
    UNION ALL
    SELECT * FROM section_offres
    UNION ALL
    SELECT * FROM stats
    UNION ALL
    SELECT * FROM verif
) combined
ORDER BY ordre;

