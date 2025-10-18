-- UPDATE SIMPLE : Mettre candidate_status = 'interne' pour les 121 candidats de la campagne 1
-- Copier et exécuter UNIQUEMENT cette requête

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

