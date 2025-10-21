-- Vérifier l'état des offres de la campagne 2
SELECT 
    id, 
    title, 
    status, 
    campaign_id, 
    created_at,
    application_deadline
FROM job_offers 
WHERE campaign_id = 2 
ORDER BY created_at DESC 
LIMIT 10;
