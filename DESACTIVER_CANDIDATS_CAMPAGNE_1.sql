-- Requête SQL pour changer le statut de tous les candidats de la campagne 1 en "inactif"
-- Cette requête met à jour le champ "statut" dans la table users

-- ÉTAPE 1 : Vérifier d'abord les candidats qui seront affectés (SÉCURITÉ)
SELECT 
    u.id,
    u.email,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.statut AS statut_actuel,
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
    u.id, u.email, u.first_name, u.last_name, u.statut
ORDER BY 
    u.last_name, u.first_name;

-- ÉTAPE 2 : UPDATE pour changer le statut en "inactif"
-- ⚠️ ATTENTION : Cette requête modifie les données de manière permanente
UPDATE users
SET 
    statut = 'inactif',
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT a.candidate_id
    FROM applications a
    INNER JOIN job_offers jo ON a.job_offer_id = jo.id
    WHERE jo.campaign_id = 1
);

-- ÉTAPE 3 : Vérification après mise à jour
SELECT 
    COUNT(DISTINCT u.id) AS candidats_desactives,
    COUNT(DISTINCT CASE WHEN u.statut = 'inactif' THEN u.id END) AS statut_inactif_confirme
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1;

-- BONUS : Si vous voulez réactiver plus tard, utilisez cette requête
-- UPDATE users
-- SET 
--     statut = 'actif',
--     updated_at = NOW()
-- WHERE id IN (
--     SELECT DISTINCT a.candidate_id
--     FROM applications a
--     INNER JOIN job_offers jo ON a.job_offer_id = jo.id
--     WHERE jo.campaign_id = 1
-- );

