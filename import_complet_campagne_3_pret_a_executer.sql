-- ============================================================================
-- SCRIPT D'IMPORT COMPLET - CAMPAGNE 3
-- Date: 2025-10-17
-- ============================================================================
-- 
-- Ce fichier sera automatiquement généré avec toutes les données
-- Exécutez la requête ci-dessous dans la BASE SOURCE pour générer 
-- le contenu complet à insérer dans la BASE DESTINATION
-- 
-- ============================================================================

-- ============================================================================
-- REQUÊTE À EXÉCUTER DANS LA BASE SOURCE
-- ============================================================================
-- Copiez cette requête, exécutez-la, puis copiez TOUT le résultat
-- et exécutez-le dans la base DESTINATION

WITH 
-- Étape 1: Récupérer les recruteurs
recruteurs AS (
    SELECT DISTINCT 
        u.id,
        u.email,
        u.matricule,
        u.role,
        u.first_name,
        u.last_name,
        u.phone,
        u.date_of_birth,
        u.candidate_status
    FROM public.users u
    INNER JOIN public.job_offers jo ON u.id = jo.recruiter_id::uuid
    WHERE jo.campaign_id = 3
),
-- Étape 2: Générer les INSERT pour les recruteurs
insert_recruteurs AS (
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
        ) || chr(10) ||
        'ON CONFLICT (id) DO NOTHING;' || chr(10) || chr(10) as contenu
    FROM recruteurs
),
-- Étape 3: Générer les INSERT pour les offres
insert_offres_header AS (
    SELECT 
        3 as ordre,
        '-- ============================================================================' || chr(10) ||
        '-- ÉTAPE 2: INSERTION DES OFFRES DE CAMPAGNE 3' || chr(10) ||
        '-- ============================================================================' || chr(10) || chr(10) as contenu
),
offres_avec_rang AS (
    SELECT 
        *,
        ROW_NUMBER() OVER (ORDER BY title) as rn,
        COUNT(*) OVER () as total
    FROM public.job_offers
    WHERE campaign_id = 3
),
insert_offres AS (
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
    FROM offres_avec_rang
    ORDER BY rn
),
-- Étape 4: Statistiques
statistiques AS (
    SELECT 
        5 as ordre,
        '-- ============================================================================' || chr(10) ||
        '-- STATISTIQUES' || chr(10) ||
        '-- ============================================================================' || chr(10) ||
        '-- Total offres: ' || COUNT(*)::text || chr(10) ||
        '-- Actives: ' || COUNT(CASE WHEN status = 'active' THEN 1 END)::text || chr(10) ||
        '-- Brouillons: ' || COUNT(CASE WHEN status = 'draft' THEN 1 END)::text || chr(10) ||
        '-- Internes: ' || COUNT(CASE WHEN status_offerts = 'interne' THEN 1 END)::text || chr(10) ||
        '-- Externes: ' || COUNT(CASE WHEN status_offerts = 'externe' THEN 1 END)::text || chr(10) ||
        '-- ============================================================================' || chr(10) || chr(10) as contenu
    FROM public.job_offers
    WHERE campaign_id = 3
),
-- Étape 5: Requêtes de vérification
verification AS (
    SELECT 
        6 as ordre,
        '-- ============================================================================' || chr(10) ||
        '-- VÉRIFICATION (à exécuter après l''import)' || chr(10) ||
        '-- ============================================================================' || chr(10) ||
        'SELECT COUNT(*) as total_offres_importees FROM public.job_offers WHERE campaign_id = 3;' || chr(10) ||
        chr(10) ||
        'SELECT status, COUNT(*) as nombre FROM public.job_offers WHERE campaign_id = 3 GROUP BY status;' || chr(10) ||
        chr(10) ||
        'SELECT status_offerts, COUNT(*) as nombre FROM public.job_offers WHERE campaign_id = 3 GROUP BY status_offerts;' as contenu
)
-- Combiner tout
SELECT contenu as script_complet_a_executer
FROM (
    SELECT * FROM insert_recruteurs
    UNION ALL
    SELECT * FROM insert_offres_header
    UNION ALL
    SELECT * FROM insert_offres
    UNION ALL
    SELECT * FROM statistiques
    UNION ALL
    SELECT * FROM verification
) combined
ORDER BY ordre;

