-- ============================================================================
-- VÉRIFIER LA STRUCTURE EXACTE DE LA TABLE JOB_OFFERS
-- ============================================================================
-- Exécutez dans BASE SOURCE ET BASE DESTINATION pour comparer
-- ============================================================================

-- Méthode 1: Liste simple des colonnes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'job_offers'
ORDER BY ordinal_position;

-- Méthode 2: Détails complets
SELECT 
    ordinal_position as position,
    column_name as colonne,
    data_type as type,
    is_nullable as nullable,
    column_default as valeur_par_defaut
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'job_offers'
ORDER BY ordinal_position;

-- Méthode 3: Vérifier une offre existante pour voir quels champs ont des valeurs
SELECT *
FROM public.job_offers
WHERE campaign_id = 3
LIMIT 1;

