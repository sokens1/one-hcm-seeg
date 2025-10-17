-- ============================================================================
-- EXPORT COMPLET DE TOUTES LES OFFRES DE CAMPAGNE 3
-- Date: 2025-10-17
-- ============================================================================
-- 
-- Ce script génère les requêtes INSERT pour TOUTES les offres de campagne 3
-- incluant les 2 recruteurs différents
-- 
-- UTILISATION:
-- 1. Exécutez ce script dans la BASE SOURCE
-- 2. Copiez tous les résultats générés
-- 3. Exécutez-les dans la BASE DESTINATION
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: Vérifier les recruteurs à transférer
-- ============================================================================

SELECT 
    recruiter_id,
    COUNT(*) as nombre_offres,
    string_agg(DISTINCT title, ' | ') as exemples_titres
FROM public.job_offers
WHERE campaign_id = 3
GROUP BY recruiter_id;


-- ============================================================================
-- ÉTAPE 2: Générer les INSERT pour les recruteurs (à exécuter EN PREMIER)
-- ============================================================================

SELECT 
    '-- Insertion du recruteur: ' || u.first_name || ' ' || u.last_name || chr(10) ||
    'INSERT INTO public.users (id, email, matricule, role, first_name, last_name, phone, date_of_birth, candidate_status, created_at, updated_at) VALUES (' ||
    quote_literal(u.id::text) || '::uuid, ' ||
    quote_literal(u.email) || ', ' ||
    COALESCE(quote_literal(u.matricule), 'NULL') || ', ' ||
    quote_literal(u.role) || ', ' ||
    quote_literal(u.first_name) || ', ' ||
    quote_literal(u.last_name) || ', ' ||
    COALESCE(quote_literal(u.phone), 'NULL') || ', ' ||
    COALESCE(quote_literal(u.date_of_birth::text) || '::date', 'NULL') || ', ' ||
    COALESCE(quote_literal(u.candidate_status), 'NULL') || ', ' ||
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP' ||
    ') ON CONFLICT (id) DO NOTHING;' || chr(10) as insert_recruteurs
FROM public.users u
WHERE u.id::text IN (
    SELECT DISTINCT recruiter_id 
    FROM public.job_offers 
    WHERE campaign_id = 3
)
ORDER BY u.first_name, u.last_name;


-- ============================================================================
-- ÉTAPE 3: Générer TOUS les INSERT pour les offres de campagne 3
-- ============================================================================

WITH offres_campagne_3 AS (
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
        created_at,
        updated_at,
        ROW_NUMBER() OVER (ORDER BY title) as rn
    FROM public.job_offers
    WHERE campaign_id = 3
)
SELECT 
    'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, department, salary_min, salary_max, requirements, benefits, status, status_offerts, application_deadline, campaign_id, reporting_line, job_grade, salary_note, start_date, responsibilities, created_at, updated_at) VALUES (' ||
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
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);' || chr(10) as requete_insert
FROM offres_campagne_3
ORDER BY rn;


-- ============================================================================
-- ÉTAPE 4: Statistiques finales
-- ============================================================================

SELECT 
    '-- ============================================================================' || chr(10) ||
    '-- STATISTIQUES DE L''EXPORT' || chr(10) ||
    '-- ============================================================================' || chr(10) ||
    '-- Nombre total d''offres exportées: ' || COUNT(*)::text || chr(10) ||
    '-- Nombre de recruteurs différents: ' || COUNT(DISTINCT recruiter_id)::text || chr(10) ||
    '-- Répartition par statut:' || chr(10) ||
    '--   - Active: ' || COUNT(CASE WHEN status = 'active' THEN 1 END)::text || chr(10) ||
    '--   - Draft: ' || COUNT(CASE WHEN status = 'draft' THEN 1 END)::text || chr(10) ||
    '--   - Closed: ' || COUNT(CASE WHEN status = 'closed' THEN 1 END)::text || chr(10) ||
    '--   - Paused: ' || COUNT(CASE WHEN status = 'paused' THEN 1 END)::text || chr(10) ||
    '-- Répartition interne/externe:' || chr(10) ||
    '--   - Interne: ' || COUNT(CASE WHEN status_offerts = 'interne' THEN 1 END)::text || chr(10) ||
    '--   - Externe: ' || COUNT(CASE WHEN status_offerts = 'externe' THEN 1 END)::text || chr(10) ||
    '--   - Non défini: ' || COUNT(CASE WHEN status_offerts IS NULL THEN 1 END)::text || chr(10) ||
    '-- ============================================================================' as statistiques
FROM public.job_offers
WHERE campaign_id = 3;


-- ============================================================================
-- ÉTAPE 5: Requêtes de vérification (à exécuter APRÈS l'import)
-- ============================================================================

SELECT 
    '-- Vérification dans la base DESTINATION après import:' || chr(10) ||
    'SELECT COUNT(*) as total_offres FROM public.job_offers WHERE campaign_id = 3;' || chr(10) ||
    chr(10) ||
    'SELECT ' || chr(10) ||
    '    recruiter_id, ' || chr(10) ||
    '    COUNT(*) as nombre_offres, ' || chr(10) ||
    '    COUNT(CASE WHEN status = ''active'' THEN 1 END) as actives, ' || chr(10) ||
    '    COUNT(CASE WHEN status = ''draft'' THEN 1 END) as brouillons ' || chr(10) ||
    'FROM public.job_offers ' || chr(10) ||
    'WHERE campaign_id = 3 ' || chr(10) ||
    'GROUP BY recruiter_id;' || chr(10) ||
    chr(10) ||
    '-- Vérifier que tous les recruteurs existent:' || chr(10) ||
    'SELECT DISTINCT jo.recruiter_id, u.first_name, u.last_name ' || chr(10) ||
    'FROM public.job_offers jo ' || chr(10) ||
    'LEFT JOIN public.users u ON jo.recruiter_id::uuid = u.id ' || chr(10) ||
    'WHERE jo.campaign_id = 3;' as requetes_verification;

