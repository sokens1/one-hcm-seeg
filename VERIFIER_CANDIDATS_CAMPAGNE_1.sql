-- Requête SQL pour vérifier TOUS les candidats de la campagne 1
-- Liste complète avec email, matricule, et statut

-- LISTE COMPLÈTE : TOUS les candidats de la campagne 1
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name AS prenom,
    u.last_name AS nom,
    u.candidate_status AS statut_candidat,
    u.statut AS statut_compte,
    u.phone AS telephone,
    u.date_of_birth AS date_naissance,
    u.sexe,
    u.adresse,
    u.created_at AS date_inscription,
    COUNT(DISTINCT a.id) AS nombre_candidatures,
    STRING_AGG(DISTINCT jo.title, ' | ') AS postes_postuled
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
GROUP BY 
    u.id, u.email, u.matricule, u.first_name, u.last_name, 
    u.candidate_status, u.statut, u.phone, u.date_of_birth,
    u.sexe, u.adresse, u.created_at
ORDER BY 
    u.email;

-- STATISTIQUES : Répartition par type de candidat et matricule
SELECT 
    u.candidate_status AS type_candidat,
    COUNT(DISTINCT u.id) AS nombre_candidats,
    COUNT(DISTINCT CASE WHEN u.matricule IS NOT NULL AND u.matricule != '' THEN u.id END) AS avec_matricule,
    COUNT(DISTINCT CASE WHEN u.matricule IS NULL OR u.matricule = '' THEN u.id END) AS sans_matricule
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
GROUP BY 
    u.candidate_status;

-- VÉRIFICATION : Emails SEEG vs autres
SELECT 
    CASE 
        WHEN u.email LIKE '%@seeg-gabon.com' THEN 'Email SEEG'
        ELSE 'Email externe'
    END AS type_email,
    u.candidate_status AS statut_candidat,
    COUNT(DISTINCT u.id) AS nombre_candidats
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
GROUP BY 
    CASE 
        WHEN u.email LIKE '%@seeg-gabon.com' THEN 'Email SEEG'
        ELSE 'Email externe'
    END,
    u.candidate_status
ORDER BY 
    type_email, statut_candidat;

-- LISTE : Candidats avec matricule (potentiellement internes)
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS statut_declare,
    u.statut AS statut_compte
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
    AND (u.matricule IS NOT NULL AND u.matricule != '')
GROUP BY 
    u.id, u.email, u.matricule, u.first_name, u.last_name, 
    u.candidate_status, u.statut
ORDER BY 
    u.matricule;

-- LISTE : Candidats avec email SEEG
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS statut_declare,
    u.statut AS statut_compte
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
    AND u.email LIKE '%@seeg-gabon.com'
GROUP BY 
    u.id, u.email, u.matricule, u.first_name, u.last_name, 
    u.candidate_status, u.statut
ORDER BY 
    u.email;

