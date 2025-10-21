-- Test de visibilité des offres de la campagne 2
-- Vérifier l'état actuel et simuler les conditions

-- 1. Vérifier l'heure actuelle du serveur
SELECT 
    now() as current_time,
    '2025-10-22T00:00:00'::timestamp as campaign2_end_date,
    CASE 
        WHEN now() >= '2025-10-22T00:00:00'::timestamp 
        THEN 'Campagne 2 MASQUÉE pour le public' 
        ELSE 'Campagne 2 VISIBLE pour le public' 
    END as visibility_status;

-- 2. Compter les offres de campagne 2 par statut
SELECT 
    status,
    count(*) as count
FROM job_offers 
WHERE campaign_id = 2 
GROUP BY status;

-- 3. Compter les offres de campagne 2 visibles pour le public
-- (en tenant compte de la logique de masquage)
SELECT 
    CASE 
        WHEN now() >= '2025-10-22T00:00:00'::timestamp 
        THEN 0  -- Masquées pour le public après le 22/10 00:00
        ELSE count(*)  -- Visibles avant le 22/10 00:00
    END as public_visible_count
FROM job_offers 
WHERE campaign_id = 2 
  AND status = 'active'
  AND (date_limite IS NULL OR date_limite >= now());

-- 4. Compter les offres de campagne 2 visibles pour les candidats connectés
-- (toujours visibles, même après le 22/10)
SELECT 
    count(*) as candidate_visible_count
FROM job_offers 
WHERE campaign_id = 2 
  AND status = 'active'
  AND (date_limite IS NULL OR date_limite >= now());
