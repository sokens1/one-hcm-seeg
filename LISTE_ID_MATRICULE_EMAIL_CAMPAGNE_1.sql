-- Liste simple de tous les candidats de la campagne 1
-- ID, Email, Matricule uniquement

SELECT DISTINCT
    u.id,
    u.email,
    u.matricule
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

