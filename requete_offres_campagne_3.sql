-- ============================================================================
-- REQUÊTE POUR RÉCUPÉRER TOUTES LES OFFRES DE LA CAMPAGNE 3
-- Date: 2025-10-17
-- ============================================================================
-- 
-- Campagne 3 : Offres créées après le 21/10/2025 ou ayant campaign_id = 3
-- ============================================================================

-- VERSION 1: Requête simple avec tous les champs principaux
-- ----------------------------------------------------------------------------
SELECT 
    jo.id,
    jo.title AS titre,
    jo.description,
    jo.location AS localisation,
    jo.contract_type AS type_contrat,
    jo.department AS departement,
    jo.salary_min AS salaire_min,
    jo.salary_max AS salaire_max,
    jo.status AS statut,
    jo.status_offerts AS type_candidature,
    jo.application_deadline AS date_limite_candidature,
    jo.campaign_id AS campagne,
    jo.created_at AS date_creation,
    jo.updated_at AS date_mise_a_jour,
    -- Informations du recruteur
    u.first_name || ' ' || u.last_name AS nom_recruteur,
    u.email AS email_recruteur,
    -- Nombre de candidatures
    COUNT(DISTINCT a.id) AS nombre_candidatures
FROM 
    public.job_offers jo
    LEFT JOIN public.users u ON jo.recruiter_id::uuid = u.id
    LEFT JOIN public.applications a ON jo.id = a.job_offer_id
WHERE 
    jo.campaign_id = 3
GROUP BY 
    jo.id, 
    jo.title, 
    jo.description, 
    jo.location, 
    jo.contract_type, 
    jo.department, 
    jo.salary_min, 
    jo.salary_max, 
    jo.status, 
    jo.status_offerts, 
    jo.application_deadline, 
    jo.campaign_id, 
    jo.created_at, 
    jo.updated_at,
    u.first_name,
    u.last_name,
    u.email
ORDER BY 
    jo.created_at DESC;


-- ============================================================================
-- VERSION 2: Requête détaillée avec champs supplémentaires et statistiques
-- ============================================================================
SELECT 
    jo.id,
    jo.title AS titre,
    jo.description,
    jo.location AS localisation,
    jo.contract_type AS type_contrat,
    jo.department AS departement,
    jo.salary_min AS salaire_min,
    jo.salary_max AS salaire_max,
    jo.status AS statut,
    jo.status_offerts AS type_candidature,
    jo.application_deadline AS date_limite_candidature,
    jo.campaign_id AS campagne,
    jo.requirements AS exigences,
    jo.benefits AS avantages,
    jo.reporting_line AS ligne_hierarchique,
    jo.job_grade AS niveau_poste,
    jo.salary_note AS note_salaire,
    jo.start_date AS date_embauche_souhaitee,
    jo.responsibilities AS responsabilites,
    jo.created_at AS date_creation,
    jo.updated_at AS date_mise_a_jour,
    -- Informations du recruteur
    u.first_name || ' ' || u.last_name AS nom_recruteur,
    u.email AS email_recruteur,
    -- Statistiques des candidatures
    COUNT(DISTINCT a.id) AS nombre_total_candidatures,
    COUNT(DISTINCT CASE WHEN a.status = 'candidature' THEN a.id END) AS candidatures_en_attente,
    COUNT(DISTINCT CASE WHEN a.status = 'incubation' THEN a.id END) AS candidatures_en_incubation,
    COUNT(DISTINCT CASE WHEN a.status = 'embauche' THEN a.id END) AS candidatures_embauchees,
    COUNT(DISTINCT CASE WHEN a.status = 'refuse' THEN a.id END) AS candidatures_refusees
FROM 
    public.job_offers jo
    LEFT JOIN public.users u ON jo.recruiter_id::uuid = u.id
    LEFT JOIN public.applications a ON jo.id = a.job_offer_id
WHERE 
    jo.campaign_id = 3
GROUP BY 
    jo.id, 
    jo.title, 
    jo.description, 
    jo.location, 
    jo.contract_type, 
    jo.department, 
    jo.salary_min, 
    jo.salary_max, 
    jo.status, 
    jo.status_offerts, 
    jo.application_deadline, 
    jo.campaign_id, 
    jo.requirements,
    jo.benefits,
    jo.reporting_line,
    jo.job_grade,
    jo.salary_note,
    jo.start_date,
    jo.responsibilities,
    jo.created_at, 
    jo.updated_at,
    u.first_name,
    u.last_name,
    u.email
ORDER BY 
    jo.created_at DESC;


-- ============================================================================
-- VERSION 3: Requête simple - Uniquement les offres actives de la campagne 3
-- ============================================================================
SELECT 
    id,
    title AS titre,
    department AS departement,
    location AS localisation,
    contract_type AS type_contrat,
    status AS statut,
    status_offerts AS type_candidature,
    application_deadline AS date_limite,
    created_at AS date_creation,
    campaign_id AS campagne
FROM 
    public.job_offers
WHERE 
    campaign_id = 3
    AND status = 'active'
ORDER BY 
    created_at DESC;


-- ============================================================================
-- VERSION 4: Statistiques globales sur la campagne 3
-- ============================================================================
SELECT 
    COUNT(*) AS nombre_total_offres,
    COUNT(CASE WHEN status = 'active' THEN 1 END) AS offres_actives,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) AS offres_brouillon,
    COUNT(CASE WHEN status = 'closed' THEN 1 END) AS offres_fermees,
    COUNT(CASE WHEN status = 'paused' THEN 1 END) AS offres_en_pause,
    COUNT(CASE WHEN status_offerts = 'interne' THEN 1 END) AS offres_internes,
    COUNT(CASE WHEN status_offerts = 'externe' THEN 1 END) AS offres_externes,
    MIN(created_at) AS premiere_offre_creee_le,
    MAX(created_at) AS derniere_offre_creee_le
FROM 
    public.job_offers
WHERE 
    campaign_id = 3;


-- ============================================================================
-- VERSION 5: Liste des offres avec le nombre de candidatures par type
-- ============================================================================
SELECT 
    jo.title AS titre,
    jo.department AS departement,
    jo.status AS statut,
    jo.status_offerts AS type_offre,
    COUNT(DISTINCT a.id) FILTER (WHERE a.candidature_status = 'interne') AS candidatures_internes,
    COUNT(DISTINCT a.id) FILTER (WHERE a.candidature_status = 'externe') AS candidatures_externes,
    COUNT(DISTINCT a.id) AS total_candidatures
FROM 
    public.job_offers jo
    LEFT JOIN public.applications a ON jo.id = a.job_offer_id
WHERE 
    jo.campaign_id = 3
GROUP BY 
    jo.id,
    jo.title,
    jo.department,
    jo.status,
    jo.status_offerts
ORDER BY 
    total_candidatures DESC,
    jo.title;

