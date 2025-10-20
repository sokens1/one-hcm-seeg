-- ============================================================================
-- VÉRIFICATION DES OFFRES DANS LA BASE SOURCE
-- ============================================================================
-- Exécutez ces requêtes dans votre BASE SOURCE pour comprendre ce qui se passe

-- 1. Nombre total d'offres de campagne 3
SELECT COUNT(*) as total_offres_campagne_3 
FROM public.job_offers 
WHERE campaign_id = 3;

-- 2. Répartition par recruteur
SELECT 
    recruiter_id,
    COUNT(*) as nombre_offres,
    string_agg(title, ' | ') as exemples
FROM public.job_offers
WHERE campaign_id = 3
GROUP BY recruiter_id
ORDER BY recruiter_id;

-- 3. Vérifier les recruteurs
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(jo.id) as nombre_offres
FROM public.users u
INNER JOIN public.job_offers jo ON u.id = jo.recruiter_id::uuid
WHERE jo.campaign_id = 3
GROUP BY u.id, u.first_name, u.last_name, u.email;

-- 4. Liste de toutes les offres
SELECT 
    id,
    recruiter_id,
    title,
    status,
    status_offerts
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY recruiter_id, title;


