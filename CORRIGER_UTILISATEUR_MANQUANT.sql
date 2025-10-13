-- Script pour corriger le problème de l'utilisateur manquant dans public.users

-- 1. Vérifier si l'utilisateur existe dans public.users
SELECT 
  id,
  email,
  role,
  candidate_status,
  created_at
FROM users
WHERE id = 'f64bb4ab-23d4-4384-94c3-0562cf047f85';

-- 2. Si l'utilisateur n'existe pas, le créer manuellement
-- IMPORTANT : Remplacez les valeurs par les vraies informations de l'utilisateur
-- Vous pouvez les trouver dans auth.users

-- Vérifier d'abord dans auth.users pour obtenir les informations
-- (Cette requête pourrait ne pas fonctionner selon vos permissions)
-- SELECT id, email, raw_user_meta_data FROM auth.users WHERE id = 'f64bb4ab-23d4-4384-94c3-0562cf047f85';

-- 3. Insérer l'utilisateur dans public.users s'il n'existe pas
-- MODIFIEZ LES VALEURS SELON VOS DONNÉES
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  candidate_status,
  created_at,
  updated_at
)
VALUES (
  'f64bb4ab-23d4-4384-94c3-0562cf047f85',
  'email@example.com',  -- À REMPLACER
  'Prénom',              -- À REMPLACER
  'Nom',                 -- À REMPLACER
  'candidat',            -- Rôle correct
  'externe',             -- Statut candidat
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'candidat',
  candidate_status = 'externe',
  updated_at = now();

-- 4. Vérifier que l'utilisateur existe maintenant
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  candidate_status,
  created_at
FROM users
WHERE id = 'f64bb4ab-23d4-4384-94c3-0562cf047f85';

-- 5. Alternative : Appeler la fonction ensure_user_exists
-- Cette fonction devrait créer l'utilisateur automatiquement
-- SELECT ensure_user_exists();

