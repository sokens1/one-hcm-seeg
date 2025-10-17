-- ============================================================================
-- IDENTIFIER L'OFFRE MANQUANTE DE CAMPAGNE 3
-- ============================================================================

-- MÉTHODE 1: Lister toutes les offres de campagne 3 avec leur ID
-- Exécutez cette requête dans votre BASE SOURCE et BASE DESTINATION
-- Comparez les résultats pour voir laquelle manque

SELECT 
    id,
    title,
    status,
    status_offerts,
    created_at
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- MÉTHODE 2: Compter par statut dans chaque base
-- Exécutez dans les DEUX bases pour comparer

SELECT 
    status,
    status_offerts,
    COUNT(*) as nombre,
    string_agg(title, ' | ' ORDER BY title) as titres
FROM public.job_offers
WHERE campaign_id = 3
GROUP BY status, status_offerts
ORDER BY status, status_offerts;

-- MÉTHODE 3: Liste simple des titres pour comparaison visuelle
-- Exécutez dans BASE SOURCE

SELECT title FROM public.job_offers WHERE campaign_id = 3 ORDER BY title;

-- MÉTHODE 4: Vérifier les offres par ID spécifique
-- Si vous connaissez l'ID de l'offre manquante, vérifiez:

SELECT * FROM public.job_offers WHERE id = 'VOTRE_ID_ICI'::uuid;

