-- ============================================================================
-- VÉRIFIER SI LE CHAMP PROFILE EXISTE
-- ============================================================================
-- Exécutez dans votre BASE SOURCE pour voir si profile existe
-- ============================================================================

-- Vérifier l'existence du champ profile
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'job_offers'
  AND column_name IN ('profile', 'requirements');

-- Vérifier le contenu des champs profile et requirements dans une offre
SELECT 
    id,
    title,
    profile,
    requirements
FROM public.job_offers
WHERE campaign_id = 3
LIMIT 5;

-- Liste COMPLÈTE de TOUS les champs avec leurs valeurs pour une offre
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'job_offers'
ORDER BY ordinal_position;


