-- Script de restauration du candidat supprimé par erreur
-- ID du candidat à restaurer : ab70c5ab-339c-4529-a5eb-ee3ca694e56f

-- 1. Vérifier que le candidat existe dans auth.users
SELECT 
    id,
    email,
    created_at,
    updated_at,
    raw_user_meta_data
FROM auth.users 
WHERE id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f';

-- 2. Restaurer le candidat dans la table users
INSERT INTO public.users (
    id,
    email,
    role,
    first_name,
    last_name,
    phone,
    date_of_birth,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    'candidat' as role,
    COALESCE(au.raw_user_meta_data ->> 'first_name', '') as first_name,
    COALESCE(au.raw_user_meta_data ->> 'last_name', '') as last_name,
    COALESCE(au.raw_user_meta_data ->> 'phone', '') as phone,
    CASE 
        WHEN au.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL 
        THEN (au.raw_user_meta_data ->> 'date_of_birth')::date
        ELSE NULL 
    END as date_of_birth,
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE au.id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    date_of_birth = EXCLUDED.date_of_birth,
    updated_at = now();

-- 3. Vérifier que la restauration a réussi
SELECT 
    id,
    email,
    role,
    first_name,
    last_name,
    phone,
    date_of_birth,
    created_at,
    updated_at
FROM public.users 
WHERE id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f';

-- 4. Vérifier s'il y a des données dans candidate_profiles à restaurer
SELECT 
    cp.*
FROM public.candidate_profiles cp
WHERE cp.user_id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f';

-- 5. Vérifier s'il y a des candidatures à restaurer
SELECT 
    a.*
FROM public.applications a
WHERE a.candidate_id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f';
