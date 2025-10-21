-- Test du filtrage d'audience
-- Vérifier que les offres sont correctement filtrées selon le statut du candidat

-- 1. Vérifier la répartition des offres par audience
SELECT 
    'Répartition des offres par audience' as test,
    status_offerts,
    count(*) as count
FROM job_offers 
WHERE status = 'active'
GROUP BY status_offerts;

-- 2. Simuler ce qu'un candidat EXTERNE devrait voir
SELECT 
    'Candidat EXTERNE voit' as test,
    count(*) as count,
    array_agg(title) as offres_visibles
FROM job_offers 
WHERE status = 'active'
  AND COALESCE(status_offerts, 'externe') = 'externe';

-- 3. Simuler ce qu'un candidat INTERNE devrait voir (toutes les offres)
SELECT 
    'Candidat INTERNE voit' as test,
    count(*) as count,
    array_agg(title) as offres_visibles
FROM job_offers 
WHERE status = 'active';

-- 4. Vérifier les offres de campagne 2 spécifiquement
SELECT 
    'Campagne 2 - Répartition par audience' as test,
    status_offerts,
    count(*) as count,
    array_agg(title) as titres
FROM job_offers 
WHERE campaign_id = 2 AND status = 'active'
GROUP BY status_offerts;

-- 5. Simuler candidat externe sur campagne 2
SELECT 
    'Campagne 2 - Candidat EXTERNE voit' as test,
    count(*) as count,
    array_agg(title) as offres_visibles
FROM job_offers 
WHERE campaign_id = 2 
  AND status = 'active'
  AND COALESCE(status_offerts, 'externe') = 'externe';
