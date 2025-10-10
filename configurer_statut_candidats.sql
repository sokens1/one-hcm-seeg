-- ============================================
-- CONFIGURATION DU STATUT DES CANDIDATS
-- ============================================
-- Exécutez ces requêtes dans l'éditeur SQL de Supabase

-- 1. Vérifier les candidats existants
SELECT 
    id,
    email,
    role,
    candidate_status,
    created_at
FROM users
WHERE role = 'candidat'
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- MARQUER DES CANDIDATS COMME INTERNES
-- ============================================

-- Marquer un candidat spécifique comme INTERNE (par email)
-- UPDATE users
-- SET candidate_status = 'interne'
-- WHERE email = 'candidat.interne@example.com'
-- AND role = 'candidat';

-- Marquer un candidat spécifique comme INTERNE (par ID)
-- UPDATE users
-- SET candidate_status = 'interne'
-- WHERE id = 'VOTRE_ID_CANDIDAT'
-- AND role = 'candidat';

-- Marquer TOUS les candidats comme INTERNES (ATTENTION : à utiliser avec précaution)
-- UPDATE users
-- SET candidate_status = 'interne'
-- WHERE role = 'candidat';

-- ============================================
-- MARQUER DES CANDIDATS COMME EXTERNES
-- ============================================

-- Marquer un candidat spécifique comme EXTERNE (par email)
-- UPDATE users
-- SET candidate_status = 'externe'
-- WHERE email = 'candidat.externe@example.com'
-- AND role = 'candidat';

-- Marquer un candidat spécifique comme EXTERNE (par ID)
-- UPDATE users
-- SET candidate_status = 'externe'
-- WHERE id = 'VOTRE_ID_CANDIDAT'
-- AND role = 'candidat';

-- Marquer TOUS les candidats comme EXTERNES (ATTENTION : à utiliser avec précaution)
-- UPDATE users
-- SET candidate_status = 'externe'
-- WHERE role = 'candidat';

-- ============================================
-- VÉRIFICATION APRÈS MISE À JOUR
-- ============================================

-- Compter les candidats par statut
SELECT 
    candidate_status,
    COUNT(*) as nombre
FROM users
WHERE role = 'candidat'
GROUP BY candidate_status
ORDER BY candidate_status;

-- Voir la distribution complète
SELECT 
    COALESCE(candidate_status, 'Non défini') as statut,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pourcentage
FROM users
WHERE role = 'candidat'
GROUP BY candidate_status
ORDER BY candidate_status;

-- ============================================
-- TESTS DE VALIDATION
-- ============================================

-- Test 1 : Vérifier qu'un candidat spécifique est bien marqué
-- SELECT 
--     email,
--     candidate_status,
--     role
-- FROM users
-- WHERE email = 'votre.email@example.com';

-- Test 2 : Liste des candidats internes
SELECT 
    email,
    candidate_status,
    created_at
FROM users
WHERE role = 'candidat'
AND candidate_status = 'interne'
ORDER BY created_at DESC;

-- Test 3 : Liste des candidats externes
SELECT 
    email,
    candidate_status,
    created_at
FROM users
WHERE role = 'candidat'
AND candidate_status = 'externe'
ORDER BY created_at DESC;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- 1. Le statut 'interne' doit être en minuscules
-- 2. Les valeurs possibles sont : 'interne', 'externe', ou NULL
-- 3. NULL est traité comme 'externe' par le système
-- 4. Le filtrage se fait automatiquement côté frontend
-- 5. Pour une sécurité maximale, ajoutez aussi une RLS policy (voir FILTRAGE_OFFRES_INTERNE_EXTERNE.md)

