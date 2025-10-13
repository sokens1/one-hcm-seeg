-- ============================================
-- DIAGNOSTIC : Pourquoi mon offre ne s'affiche pas ?
-- ============================================

-- 1. Voir TOUTES vos offres récentes (dernières 24h)
SELECT 
    id,
    title,
    status,
    status_offerts,
    created_at,
    updated_at,
    recruiter_id,
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_depuis_creation,
    EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_depuis_modification
FROM job_offers
WHERE created_at >= NOW() - INTERVAL '24 hours'
   OR updated_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 2. Chercher votre offre par titre (remplacez TITRE_PARTIEL)
-- SELECT 
--     id,
--     title,
--     status,
--     status_offerts,
--     created_at,
--     updated_at
-- FROM job_offers
-- WHERE title ILIKE '%TITRE_PARTIEL%'
-- ORDER BY created_at DESC;

-- 3. Voir TOUTES vos offres (peu importe la date)
SELECT 
    id,
    title,
    status,
    status_offerts,
    created_at,
    DATE_PART('day', NOW() - created_at) as jours_depuis_creation
FROM job_offers
ORDER BY created_at DESC
LIMIT 20;

-- 4. Vérifier le statut (draft vs active)
SELECT 
    status,
    COUNT(*) as nombre
FROM job_offers
GROUP BY status;

-- ============================================
-- PROBLÈMES POSSIBLES
-- ============================================

-- Problème 1 : L'offre est en statut "draft" au lieu de "active"
-- Solution : Changer le statut
-- UPDATE job_offers
-- SET status = 'active'
-- WHERE id = 'VOTRE_ID_OFFRE';

-- Problème 2 : L'offre n'existe pas du tout en base
-- Solution : La créer à nouveau depuis l'interface

-- Problème 3 : L'offre a un recruiter_id différent
-- Solution : Vérifier votre ID utilisateur
SELECT 
    auth.uid() as mon_id_utilisateur,
    (SELECT COUNT(*) FROM job_offers WHERE recruiter_id = auth.uid()) as mes_offres;

