-- Requête SQL pour mettre à jour le candidate_status des 121 candidats de la campagne 1
-- Mise à jour : candidate_status = 'interne' pour tous les candidats de la campagne 1

-- ÉTAPE 1 : Vérification préalable - Voir qui sera affecté
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS statut_actuel,
    u.statut AS statut_compte,
    COUNT(DISTINCT a.id) AS nombre_candidatures
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
    u.candidate_status, u.statut
ORDER BY 
    u.email;

-- ÉTAPE 2 : UPDATE - Mettre candidate_status à 'interne' pour les 121 candidats
-- ⚠️ ATTENTION : Cette requête modifie les données de manière permanente
-- Pour contourner la validation email SEEG, on met aussi no_seeg_email = true pour ceux qui n'ont pas d'email SEEG

UPDATE users
SET 
    candidate_status = 'interne',
    no_seeg_email = CASE 
        WHEN email LIKE '%@seeg-gabon.com' THEN false
        ELSE true
    END,
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT a.candidate_id
    FROM applications a
    INNER JOIN job_offers jo ON a.job_offer_id = jo.id
    WHERE jo.campaign_id = 1
);

-- ÉTAPE 3 : Vérification après mise à jour
SELECT 
    COUNT(DISTINCT u.id) AS total_candidats,
    COUNT(DISTINCT CASE WHEN u.candidate_status = 'interne' THEN u.id END) AS statut_interne,
    COUNT(DISTINCT CASE WHEN u.candidate_status = 'externe' THEN u.id END) AS statut_externe,
    COUNT(DISTINCT CASE WHEN u.candidate_status IS NULL THEN u.id END) AS statut_null
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1;

-- ÉTAPE 4 : Liste finale après mise à jour
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS nouveau_statut,
    u.statut AS statut_compte
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
    u.candidate_status, u.statut
ORDER BY 
    u.email;

-- BONUS : Statistiques croisées statut_compte vs candidate_status
SELECT 
    u.statut AS statut_compte,
    u.candidate_status,
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
    u.statut, u.candidate_status
ORDER BY 
    u.statut, u.candidate_status;

