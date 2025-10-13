-- Vérifier les titres EXACTS des offres de la campagne 1
-- Pour identifier les différences d'orthographe, d'espaces, etc.

SELECT 
    id,
    title,
    LENGTH(title) as longueur_titre,
    campaign_id,
    status,
    start_date,
    date_limite,
    created_at
FROM public.job_offers
WHERE campaign_id = 1
ORDER BY title;

-- Rechercher spécifiquement les offres qui contiennent "Directeur"
SELECT 
    id,
    title,
    campaign_id,
    status
FROM public.job_offers
WHERE campaign_id = 1
  AND title ILIKE '%Directeur%'
ORDER BY title;

-- Rechercher spécifiquement "Systèmes d'Information" ou variations
SELECT 
    id,
    title,
    campaign_id,
    status
FROM public.job_offers
WHERE campaign_id = 1
  AND (
      title ILIKE '%Système%' 
      OR title ILIKE '%Information%'
      OR title ILIKE '%DSI%'
  )
ORDER BY title;

