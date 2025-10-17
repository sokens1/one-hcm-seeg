-- ============================================================================
-- COMPARAISON SOURCE VS DESTINATION - CAMPAGNE 3
-- ============================================================================

-- PARTIE A: EXÉCUTEZ DANS VOTRE BASE SOURCE
-- ============================================================================

-- Liste complète des 46 offres attendues avec détails
SELECT 
    ROW_NUMBER() OVER (ORDER BY title) as numero,
    id,
    title,
    status,
    status_offerts
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- ============================================================================
-- PARTIE B: EXÉCUTEZ DANS VOTRE BASE DESTINATION
-- ============================================================================

-- Liste de vos 45 offres actuelles
SELECT 
    ROW_NUMBER() OVER (ORDER BY title) as numero,
    id,
    title,
    status,
    status_offerts
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- ============================================================================
-- PARTIE C: POUR TROUVER RAPIDEMENT L'OFFRE MANQUANTE
-- ============================================================================

-- Dans BASE DESTINATION: Vérifiez ces offres spécifiques (celles qui étaient actives)
SELECT id, title, status 
FROM public.job_offers 
WHERE id IN (
    '49b4db78-817e-4fae-825e-dde2af10b510'::uuid,  -- Chef de Délégation Centre Sud (active)
    '1b0d2513-f2de-476f-b5e7-6a152ab1734e'::uuid   -- Chef de Division Etudes et Travaux Transport Electricité (active)
);

-- Si une de ces 2 manque, c'est celle-là !

