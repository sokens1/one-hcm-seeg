-- ============================================
-- METTRE À JOUR LES OFFRES EXISTANTES
-- ============================================
-- Ce script met à jour toutes les offres qui n'ont pas de status_offerts

-- 1. Voir combien d'offres n'ont pas de status_offerts
SELECT 
    COUNT(*) as offres_sans_statut,
    COUNT(CASE WHEN status_offerts IS NOT NULL THEN 1 END) as offres_avec_statut
FROM job_offers
WHERE status = 'active';

-- 2. Mettre à jour toutes les offres sans status_offerts pour les définir comme 'externe' par défaut
-- Vous pouvez modifier 'externe' en 'interne' selon vos besoins
UPDATE job_offers
SET status_offerts = 'externe'
WHERE status_offerts IS NULL;

-- 3. Vérifier le résultat
SELECT 
    status_offerts,
    COUNT(*) as nombre_offres
FROM job_offers
WHERE status = 'active'
GROUP BY status_offerts
ORDER BY status_offerts;

-- 4. Afficher toutes les offres avec leur statut
SELECT 
    id,
    title,
    status,
    status_offerts,
    created_at
FROM job_offers
WHERE status = 'active'
ORDER BY created_at DESC;

