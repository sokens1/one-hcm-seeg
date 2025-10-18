-- Liste COMPLÈTE de TOUS les 121 candidats de la campagne 1
-- Sans aucun filtre

SELECT DISTINCT
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS statut_declare,
    u.statut AS statut_compte,
    u.phone,
    u.created_at AS date_inscription
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
ORDER BY 
    u.email;

-- Compter pour vérifier qu'on a bien les 121
SELECT COUNT(DISTINCT u.id) AS total_candidats
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1;

