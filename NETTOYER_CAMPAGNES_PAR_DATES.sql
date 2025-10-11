-- Script pour définir les campagnes par dates de création
-- Campagne 1 : Offres créées AVANT le 11/09/2025
-- Campagne 2 : Offres créées APRÈS le 11/09/2025 et AVANT le 21/10/2025
-- Campagne 3 : Offres créées APRÈS le 21/10/2025

-- 1. Vérifier la situation actuelle avant modification
SELECT 
  CASE 
    WHEN created_at < '2025-09-11 00:00:00+00'::timestamptz THEN 'Campagne 1'
    WHEN created_at >= '2025-09-11 00:00:00+00'::timestamptz 
         AND created_at < '2025-10-21 00:00:00+00'::timestamptz THEN 'Campagne 2'
    WHEN created_at >= '2025-10-21 00:00:00+00'::timestamptz THEN 'Campagne 3'
    ELSE 'Non défini'
  END as campagne,
  COUNT(*) as nombre_offres,
  MIN(created_at) as date_premiere_offre,
  MAX(created_at) as date_derniere_offre
FROM job_offers
GROUP BY 
  CASE 
    WHEN created_at < '2025-09-11 00:00:00+00'::timestamptz THEN 'Campagne 1'
    WHEN created_at >= '2025-09-11 00:00:00+00'::timestamptz 
         AND created_at < '2025-10-21 00:00:00+00'::timestamptz THEN 'Campagne 2'
    WHEN created_at >= '2025-10-21 00:00:00+00'::timestamptz THEN 'Campagne 3'
    ELSE 'Non défini'
  END
ORDER BY campagne;

-- 2. Mettre à jour les offres de la Campagne 1 (AVANT le 11/09/2025)
UPDATE job_offers
SET campaign_id = 1
WHERE created_at < '2025-09-11 00:00:00+00'::timestamptz;

-- Vérifier
SELECT COUNT(*) as offres_campagne_1, MIN(created_at) as premiere_offre, MAX(created_at) as derniere_offre
FROM job_offers
WHERE campaign_id = 1;

-- 3. Mettre à jour les offres de la Campagne 2 (Du 11/09/2025 au 21/10/2025)
UPDATE job_offers
SET campaign_id = 2
WHERE created_at >= '2025-09-11 00:00:00+00'::timestamptz
  AND created_at < '2025-10-21 00:00:00+00'::timestamptz;

-- Vérifier
SELECT COUNT(*) as offres_campagne_2, MIN(created_at) as premiere_offre, MAX(created_at) as derniere_offre
FROM job_offers
WHERE campaign_id = 2;

-- 4. Mettre à jour les offres de la Campagne 3 (APRÈS le 21/10/2025)
UPDATE job_offers
SET campaign_id = 3
WHERE created_at >= '2025-10-21 00:00:00+00'::timestamptz;

-- Vérifier
SELECT COUNT(*) as offres_campagne_3, MIN(created_at) as premiere_offre, MAX(created_at) as derniere_offre
FROM job_offers
WHERE campaign_id = 3;

-- 5. Propager le campaign_id aux candidatures
UPDATE applications a
SET campaign_id = jo.campaign_id
FROM job_offers jo
WHERE a.job_offer_id = jo.id
  AND (a.campaign_id IS NULL OR a.campaign_id != jo.campaign_id);

-- 6. Vérifier la répartition finale
SELECT 
  campaign_id,
  COUNT(*) as nombre_offres,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as offres_actives,
  MIN(created_at) as date_premiere_offre,
  MAX(created_at) as date_derniere_offre
FROM job_offers
GROUP BY campaign_id
ORDER BY campaign_id;

-- 7. Vérifier les candidatures par campagne
SELECT 
  campaign_id,
  COUNT(*) as nombre_candidatures,
  MIN(created_at) as premiere_candidature,
  MAX(created_at) as derniere_candidature
FROM applications
GROUP BY campaign_id
ORDER BY campaign_id;

-- 8. Lister quelques offres par campagne pour vérification
-- Campagne 1
SELECT 
  id, 
  title, 
  campaign_id,
  status,
  created_at
FROM job_offers
WHERE campaign_id = 1
ORDER BY created_at DESC
LIMIT 5;

-- Campagne 2
SELECT 
  id, 
  title, 
  campaign_id,
  status,
  created_at
FROM job_offers
WHERE campaign_id = 2
ORDER BY created_at DESC
LIMIT 5;

-- Campagne 3
SELECT 
  id, 
  title, 
  campaign_id,
  status,
  created_at
FROM job_offers
WHERE campaign_id = 3
ORDER BY created_at DESC
LIMIT 5;

-- 9. Mettre à jour le défaut pour les nouvelles offres (Campagne 2)
-- Les nouvelles offres créées maintenant appartiendront à la Campagne 2
ALTER TABLE job_offers 
ALTER COLUMN campaign_id SET DEFAULT 2;

-- 10. Vérifier les offres sans campaign_id (ne devrait pas y en avoir)
SELECT 
  id, 
  title, 
  created_at,
  campaign_id
FROM job_offers
WHERE campaign_id IS NULL;

