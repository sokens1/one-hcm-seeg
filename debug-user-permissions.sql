-- Script de diagnostic pour vérifier les permissions utilisateur
-- Exécutez ce script dans l'éditeur SQL de Supabase pour diagnostiquer les problèmes de permissions

-- 1. Vérifier l'utilisateur actuel et son rôle
SELECT 
  id,
  email,
  role,
  first_name,
  last_name
FROM public.users 
WHERE id = '6b35be8c-fe50-4618-8187-2de1d1c145fe';

-- 2. Vérifier les candidatures et leurs recruteurs
SELECT 
  a.id as application_id,
  a.status,
  a.candidate_id,
  jo.id as job_offer_id,
  jo.title as job_title,
  jo.recruiter_id,
  recruiter.email as recruiter_email,
  recruiter.role as recruiter_role
FROM public.applications a
JOIN public.job_offers jo ON jo.id = a.job_offer_id
LEFT JOIN public.users recruiter ON recruiter.id = jo.recruiter_id
WHERE a.candidate_id = '6b35be8c-fe50-4618-8187-2de1d1c145fe'
   OR jo.recruiter_id = '6b35be8c-fe50-4618-8187-2de1d1c145fe';

-- 3. Tester la fonction de vérification des permissions
SELECT public.is_user_recruiter_or_admin() as is_recruiter_or_admin;

-- 3b. Vérifier tous les rôles possibles
SELECT DISTINCT role FROM public.users ORDER BY role;

-- 4. Vérifier les politiques RLS actives
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'applications' 
ORDER BY policyname;

-- 5. Vérifier si RLS est activé sur la table applications
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'applications';
