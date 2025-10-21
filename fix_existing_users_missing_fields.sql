-- CORRECTION : Mettre à jour les utilisateurs existants qui n'ont pas tous leurs champs
-- Ce script récupère les données depuis auth.users et met à jour public.users

-- 1. Vérifier les utilisateurs avec des champs manquants
SELECT 
    'Utilisateurs avec des champs manquants' as check_type,
    u.id,
    u.email,
    u.candidate_status,
    u.matricule,
    u.date_of_birth,
    u.sexe,
    u.adresse,
    u.politique_confidentialite
FROM public.users u
WHERE u.candidate_status IS NULL 
   OR u.matricule IS NULL 
   OR u.date_of_birth IS NULL 
   OR u.sexe IS NULL 
   OR u.adresse IS NULL 
   OR u.politique_confidentialite IS NULL;

-- 2. Mettre à jour les utilisateurs existants avec les données depuis auth.users
UPDATE public.users 
SET 
    candidate_status = COALESCE(
        public.users.candidate_status, 
        COALESCE(auth.users.raw_user_meta_data->>'candidate_status', 'externe')
    ),
    matricule = COALESCE(
        public.users.matricule, 
        auth.users.raw_user_meta_data->>'matricule'
    ),
    date_of_birth = COALESCE(
        public.users.date_of_birth, 
        NULLIF(auth.users.raw_user_meta_data->>'date_of_birth', '')::DATE
    ),
    sexe = COALESCE(
        public.users.sexe, 
        auth.users.raw_user_meta_data->>'sexe'
    ),
    adresse = COALESCE(
        public.users.adresse, 
        auth.users.raw_user_meta_data->>'adresse'
    ),
    politique_confidentialite = COALESCE(
        public.users.politique_confidentialite, 
        COALESCE((auth.users.raw_user_meta_data->>'politique_confidentialite')::BOOLEAN, FALSE)
    ),
    updated_at = NOW()
FROM auth.users
WHERE public.users.id = auth.users.id
  AND (
    public.users.candidate_status IS NULL 
    OR public.users.matricule IS NULL 
    OR public.users.date_of_birth IS NULL 
    OR public.users.sexe IS NULL 
    OR public.users.adresse IS NULL 
    OR public.users.politique_confidentialite IS NULL
  );

-- 3. Vérifier le résultat
SELECT 
    'Utilisateurs corrigés' as check_type,
    count(*) as count
FROM public.users u
WHERE u.candidate_status IS NOT NULL 
  AND u.politique_confidentialite IS NOT NULL;

-- 4. Afficher un échantillon des utilisateurs corrigés
SELECT 
    'Échantillon des utilisateurs corrigés' as check_type,
    u.id,
    u.email,
    u.candidate_status,
    u.matricule,
    u.date_of_birth,
    u.sexe,
    u.adresse,
    u.politique_confidentialite
FROM public.users u
ORDER BY u.updated_at DESC
LIMIT 5;
