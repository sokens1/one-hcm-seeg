-- CORRECTION : Remettre les offres de la campagne 2 en statut 'active'
-- Le masquage doit se faire par la logique de filtrage, pas par désactivation

-- 1. Vérifier l'état actuel des offres de la campagne 2
SELECT 
    id, 
    title, 
    status, 
    campaign_id, 
    created_at,
    application_deadline
FROM job_offers 
WHERE campaign_id = 2 
ORDER BY created_at DESC;

-- 2. Remettre toutes les offres de la campagne 2 en statut 'active'
-- (Le masquage se fera automatiquement par la logique de filtrage après le 21/10)
UPDATE job_offers 
SET status = 'active', updated_at = now()
WHERE campaign_id = 2 
  AND status != 'active';

-- 3. Vérifier le résultat
SELECT 
    id, 
    title, 
    status, 
    campaign_id, 
    updated_at
FROM job_offers 
WHERE campaign_id = 2 
ORDER BY created_at DESC;
