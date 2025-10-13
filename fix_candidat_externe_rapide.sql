-- ============================================
-- FIX RAPIDE : Marquer les candidats comme externes
-- ============================================
-- Exécutez cette requête dans Supabase pour marquer tous les candidats comme externes par défaut

-- 1. Voir l'état actuel
SELECT 
    email,
    role,
    candidate_status,
    created_at
FROM users
WHERE role = 'candidat'
ORDER BY created_at DESC;

-- 2. Marquer TOUS les candidats comme externes (si pas déjà défini)
UPDATE users
SET candidate_status = 'externe'
WHERE role = 'candidat'
AND (candidate_status IS NULL OR candidate_status = '');

-- 3. Vérification après mise à jour
SELECT 
    candidate_status,
    COUNT(*) as nombre
FROM users
WHERE role = 'candidat'
GROUP BY candidate_status;

-- 4. Si vous avez des candidats internes spécifiques, marquez-les :
-- UPDATE users
-- SET candidate_status = 'interne'
-- WHERE email IN (
--     'employe1@seeg.ga',
--     'employe2@seeg.ga'
-- );

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Après l'exécution, tous les candidats devraient avoir :
-- - candidate_status = 'externe' (par défaut)
-- - candidate_status = 'interne' (pour les employés SEEG uniquement)

