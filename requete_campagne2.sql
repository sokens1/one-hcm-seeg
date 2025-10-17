-- ============================================================================
-- REQUÊTE : Afficher les 3 descriptions de poste de la campagne 2
-- ============================================================================

-- VERSION 1 : Descriptions complètes avec toutes les informations
SELECT 
  id,
  title AS "Titre du poste",
  description AS "Description",
  location AS "Lieu",
  contract_type AS "Type de contrat",
  department AS "Département",
  created_at AS "Date de création"
FROM public.job_offers
WHERE campaign_id = 2
ORDER BY created_at DESC
LIMIT 3;

-- ============================================================================

-- VERSION 2 : Uniquement les descriptions (plus simple)
SELECT 
  title AS "Titre",
  description AS "Description complète"
FROM public.job_offers
WHERE campaign_id = 2
ORDER BY created_at DESC
LIMIT 3;

-- ============================================================================

-- VERSION 3 : Toutes les offres de la campagne 2 (sans limite)
SELECT 
  id,
  title AS "Titre du poste",
  description AS "Description",
  location AS "Lieu",
  contract_type AS "Type de contrat",
  department AS "Département",
  status AS "Statut",
  created_at AS "Date de création"
FROM public.job_offers
WHERE campaign_id = 2
ORDER BY created_at DESC;

-- ============================================================================

-- VERSION 4 : Avec le nombre de candidatures par poste
SELECT 
  jo.id,
  jo.title AS "Titre du poste",
  jo.description AS "Description",
  jo.location AS "Lieu",
  jo.contract_type AS "Type de contrat",
  jo.department AS "Département",
  jo.status AS "Statut",
  COUNT(a.id) AS "Nombre de candidatures",
  jo.created_at AS "Date de création"
FROM public.job_offers jo
LEFT JOIN public.applications a ON a.job_offer_id = jo.id
WHERE jo.campaign_id = 2
GROUP BY jo.id, jo.title, jo.description, jo.location, jo.contract_type, jo.department, jo.status, jo.created_at
ORDER BY jo.created_at DESC
LIMIT 3;

-- ============================================================================

-- VERSION 5 : Vue d'ensemble de la campagne 2
SELECT 
  'Total des offres' AS "Statistique",
  COUNT(*) AS "Valeur"
FROM public.job_offers
WHERE campaign_id = 2

UNION ALL

SELECT 
  'Offres actives' AS "Statistique",
  COUNT(*) AS "Valeur"
FROM public.job_offers
WHERE campaign_id = 2 AND status = 'active'

UNION ALL

SELECT 
  'Total des candidatures' AS "Statistique",
  COUNT(a.id) AS "Valeur"
FROM public.job_offers jo
LEFT JOIN public.applications a ON a.job_offer_id = jo.id
WHERE jo.campaign_id = 2;


