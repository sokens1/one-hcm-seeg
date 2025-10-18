-- Vérification après mise à jour du candidate_status à 'interne'
-- Copier et exécuter cette requête APRÈS l'UPDATE

SELECT 
    COUNT(DISTINCT u.id) AS total_candidats,
    COUNT(DISTINCT CASE WHEN u.candidate_status = 'interne' THEN u.id END) AS statut_interne,
    COUNT(DISTINCT CASE WHEN u.candidate_status = 'externe' THEN u.id END) AS statut_externe,
    COUNT(DISTINCT CASE WHEN u.email LIKE '%@seeg-gabon.com' THEN u.id END) AS avec_email_seeg,
    COUNT(DISTINCT CASE WHEN u.no_seeg_email = true THEN u.id END) AS sans_email_seeg
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1;

