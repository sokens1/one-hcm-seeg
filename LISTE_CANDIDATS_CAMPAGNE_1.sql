-- Requête SQL pour lister tous les candidats de la campagne 1
-- Cette requête récupère toutes les candidatures pour les offres de la campagne 1

SELECT DISTINCT
    u.id AS user_id,
    u.email,
    u.first_name AS prenom,
    u.last_name AS nom,
    u.phone AS telephone,
    u.matricule,
    u.candidate_status AS statut_candidat,
    u.date_of_birth AS date_naissance,
    u.sexe,
    u.adresse,
    u.created_at AS date_inscription,
    COUNT(DISTINCT a.id) AS nombre_candidatures,
    STRING_AGG(DISTINCT jo.title, ' | ') AS postes_postuled
FROM 
    applications a
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
INNER JOIN 
    users u ON a.candidate_id = u.id
WHERE 
    jo.campaign_id = 1
GROUP BY 
    u.id, u.email, u.first_name, u.last_name, u.phone, u.matricule, 
    u.candidate_status, u.date_of_birth, u.sexe, u.adresse, u.created_at
ORDER BY 
    u.last_name, u.first_name;

-- Requête alternative avec plus de détails sur chaque candidature
SELECT 
    u.id AS user_id,
    u.email,
    u.first_name AS prenom,
    u.last_name AS nom,
    u.phone AS telephone,
    u.matricule,
    u.candidate_status AS statut_candidat,
    jo.title AS poste,
    jo.id AS offre_id,
    a.status AS statut_candidature,
    a.created_at AS date_candidature,
    a.updated_at AS derniere_mise_a_jour
FROM 
    applications a
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
INNER JOIN 
    users u ON a.candidate_id = u.id
WHERE 
    jo.campaign_id = 1
ORDER BY 
    a.created_at DESC, u.last_name, u.first_name;

-- Statistiques générales de la campagne 1
SELECT 
    COUNT(DISTINCT a.candidate_id) AS total_candidats_uniques,
    COUNT(a.id) AS total_candidatures,
    COUNT(DISTINCT jo.id) AS total_offres,
    COUNT(DISTINCT CASE WHEN u.candidate_status = 'interne' THEN a.candidate_id END) AS candidats_internes,
    COUNT(DISTINCT CASE WHEN u.candidate_status = 'externe' THEN a.candidate_id END) AS candidats_externes,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS candidatures_en_attente,
    COUNT(CASE WHEN a.status = 'reviewed' THEN 1 END) AS candidatures_examinees,
    COUNT(CASE WHEN a.status = 'shortlisted' THEN 1 END) AS candidatures_preselections,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) AS candidatures_rejetees
FROM 
    applications a
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
INNER JOIN 
    users u ON a.candidate_id = u.id
WHERE 
    jo.campaign_id = 1;

