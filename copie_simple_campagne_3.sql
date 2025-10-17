-- ============================================================================
-- MÉTHODE SIMPLE: Copier les offres de campagne 3 vers une autre base
-- Date: 2025-10-17
-- ============================================================================

-- ============================================================================
-- MÉTHODE 1: SELECT depuis la base SOURCE pour générer les données
-- ============================================================================
-- Exécutez ceci dans la BASE SOURCE pour récupérer toutes les données

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
    responsibilities
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- Exportez ce résultat en CSV, JSON ou autre format


-- ============================================================================
-- MÉTHODE 2: Génération automatique des INSERT
-- ============================================================================
-- Copiez le résultat de cette requête et exécutez-le dans la BASE DESTINATION

SELECT 
    format(
        'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, status, status_offerts, campaign_id, created_at, updated_at) VALUES (%L, %L, %L, %L, %L, %L, %L, %L, %L, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
        id::text,
        recruiter_id,
        title,
        COALESCE(description, ''),
        location,
        contract_type,
        status,
        status_offerts,
        campaign_id
    ) as requete_insert
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;


-- ============================================================================
-- MÉTHODE 3: INSERT direct (si vous connaissez déjà toutes les données)
-- ============================================================================
-- Remplacez les valeurs ci-dessous par les vraies données depuis votre requête

-- Exemple pour une offre:
/*
INSERT INTO public.job_offers (
    id, 
    recruiter_id, 
    title, 
    description, 
    location, 
    contract_type, 
    status, 
    status_offerts, 
    campaign_id, 
    created_at, 
    updated_at
) VALUES (
    '59618fca-2a3c-427e-9c27-e9cbaafefd6e',
    'ff967d0b-e250-40dc-8cb6-fc16429dceed',
    'Chef de Division Support Clientèle',
    '[DESCRIPTION COMPLÈTE ICI]',
    'Libreville',
    'CDI avec période d''essai',
    'draft',
    'interne',
    3,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
*/


-- ============================================================================
-- MÉTHODE 4: pg_dump/pg_restore (la plus simple!)
-- ============================================================================
-- Dans votre terminal, sur la machine avec la BASE SOURCE:

/*
-- Exporter uniquement les offres de campagne 3
pg_dump -h localhost -U postgres -d base_source \
  --table=public.job_offers \
  --data-only \
  --column-inserts \
  > offres_campagne_3_export.sql

-- Puis éditez le fichier pour garder uniquement les offres avec campaign_id = 3

-- Sur la BASE DESTINATION:
psql -h localhost -U postgres -d base_destination -f offres_campagne_3_export.sql
*/


-- ============================================================================
-- VÉRIFICATIONS APRÈS INSERTION
-- ============================================================================

-- Dans la BASE DESTINATION, vérifiez:

-- 1. Nombre d'offres insérées
SELECT COUNT(*) as total_offres_campagne_3 
FROM public.job_offers 
WHERE campaign_id = 3;

-- 2. Liste des offres
SELECT id, title, status, status_offerts 
FROM public.job_offers 
WHERE campaign_id = 3
ORDER BY title;

-- 3. Vérifier que le recruteur existe
SELECT DISTINCT 
    jo.recruiter_id,
    u.first_name,
    u.last_name,
    u.email
FROM public.job_offers jo
LEFT JOIN public.users u ON jo.recruiter_id::uuid = u.id
WHERE jo.campaign_id = 3;

-- Si le recruteur n'existe pas, vous devez d'abord l'insérer!

