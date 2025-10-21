-- Debug complet des offres de campagne 2
-- Identifier pourquoi aucune offre n'est visible

-- 1. Toutes les offres de campagne 2 avec leurs détails
SELECT 
    id,
    title,
    status,
    campaign_id,
    status_offerts,
    date_limite,
    created_at,
    updated_at
FROM job_offers 
WHERE campaign_id = 2 
ORDER BY created_at DESC;

-- 2. Vérifier les filtres un par un
-- Filtre 1: Statut actif
SELECT 
    'Filtre status=active' as filter_name,
    count(*) as count
FROM job_offers 
WHERE campaign_id = 2 AND status = 'active';

-- Filtre 2: Date limite non expirée
SELECT 
    'Filtre date_limite OK' as filter_name,
    count(*) as count
FROM job_offers 
WHERE campaign_id = 2 
  AND status = 'active'
  AND (date_limite IS NULL OR date_limite >= now());

-- Filtre 3: Audience externe (pour candidat externe)
SELECT 
    'Filtre audience externe' as filter_name,
    count(*) as count
FROM job_offers 
WHERE campaign_id = 2 
  AND status = 'active'
  AND (date_limite IS NULL OR date_limite >= now())
  AND COALESCE(status_offerts, 'externe') = 'externe';

-- 3. Vérifier s'il y a des offres avec date_limite expirée
SELECT 
    'Offres avec date_limite expirée' as issue,
    count(*) as count,
    array_agg(title) as titles
FROM job_offers 
WHERE campaign_id = 2 
  AND status = 'active'
  AND date_limite IS NOT NULL 
  AND date_limite < now();

-- 4. Vérifier s'il y a des offres avec status_offerts = 'interne'
SELECT 
    'Offres interne (candidat externe ne les voit pas)' as issue,
    count(*) as count,
    array_agg(title) as titles
FROM job_offers 
WHERE campaign_id = 2 
  AND status = 'active'
  AND (date_limite IS NULL OR date_limite >= now())
  AND status_offerts = 'interne';
