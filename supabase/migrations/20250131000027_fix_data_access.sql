-- CORRECTION DE L'ACCÈS AUX DONNÉES
-- Cette migration s'assure que les utilisateurs peuvent voir leurs données

-- 1. VÉRIFIER L'ÉTAT ACTUEL DES POLITIQUES
SELECT 
    tablename,
    policyname, 
    cmd, 
    roles,
    qual
FROM pg_policies 
WHERE tablename IN ('users', 'applications', 'job_offers')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. VÉRIFIER LES RÔLES DES UTILISATEURS
SELECT 
    id,
    email,
    role,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. VÉRIFIER LES CANDIDATURES
SELECT 
    COUNT(*) as total_applications,
    COUNT(DISTINCT candidate_id) as unique_candidates,
    COUNT(DISTINCT job_offer_id) as unique_job_offers
FROM public.applications;

-- 4. VÉRIFIER LES OFFRES D'EMPLOI
SELECT 
    COUNT(*) as total_job_offers,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_job_offers
FROM public.job_offers;

-- 5. CRÉER UNE FONCTION POUR VÉRIFIER L'ACCÈS UTILISATEUR
CREATE OR REPLACE FUNCTION public.check_user_access()
RETURNS TABLE (
  user_id text,
  user_email text,
  user_role text,
  can_access_users boolean,
  can_access_applications boolean,
  can_access_job_offers boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier l'utilisateur actuel
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    auth.uid()::text as user_id,
    (auth.jwt() ->> 'email')::text as user_email,
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'user_role'),
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      'candidat'
    )::text as user_role,
    EXISTS(
      SELECT 1 FROM public.users u 
      WHERE u.id::text = auth.uid()::text
    ) as can_access_users,
    EXISTS(
      SELECT 1 FROM public.applications a 
      WHERE a.candidate_id::text = auth.uid()::text
      LIMIT 1
    ) as can_access_applications,
    EXISTS(
      SELECT 1 FROM public.job_offers jo 
      WHERE jo.status = 'active'
      LIMIT 1
    ) as can_access_job_offers;
END;
$$;

-- 6. TESTER L'ACCÈS POUR L'UTILISATEUR ACTUEL
SELECT * FROM public.check_user_access();

-- 7. CRÉER UNE FONCTION DE DEBUG POUR LES POLITIQUES RLS
CREATE OR REPLACE FUNCTION public.debug_rls_policies()
RETURNS TABLE (
  table_name text,
  policy_name text,
  policy_type text,
  policy_condition text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.tablename::text,
    p.policyname::text,
    p.cmd::text,
    COALESCE(p.qual, p.with_check, 'N/A')::text
  FROM pg_policies p
  WHERE p.schemaname = 'public'
  AND p.tablename IN ('users', 'applications', 'job_offers')
  ORDER BY p.tablename, p.policyname;
END;
$$;

-- 8. AFFICHER LES POLITIQUES RLS ACTUELLES
SELECT * FROM public.debug_rls_policies();

-- 9. CRÉER UNE FONCTION POUR FORCER L'ACCÈS TEMPORAIRE (POUR DEBUG)
CREATE OR REPLACE FUNCTION public.temp_disable_rls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Désactiver temporairement RLS pour debug
  ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.job_offers DISABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE 'RLS temporairement désactivé pour debug';
END;
$$;

-- 10. CRÉER UNE FONCTION POUR RÉACTIVER RLS
CREATE OR REPLACE FUNCTION public.reenable_rls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Réactiver RLS
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE 'RLS réactivé';
END;
$$;

-- 11. DIAGNOSTIC COMPLET
DO $$
DECLARE
    user_count integer;
    app_count integer;
    job_count integer;
    active_job_count integer;
BEGIN
    -- Compter les utilisateurs
    SELECT COUNT(*) INTO user_count FROM public.users;
    
    -- Compter les candidatures
    SELECT COUNT(*) INTO app_count FROM public.applications;
    
    -- Compter les offres d'emploi
    SELECT COUNT(*) INTO job_count FROM public.job_offers;
    SELECT COUNT(*) INTO active_job_count FROM public.job_offers WHERE status = 'active';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNOSTIC DE LA BASE DE DONNÉES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Utilisateurs: %', user_count;
    RAISE NOTICE 'Candidatures: %', app_count;
    RAISE NOTICE 'Offres d''emploi: %', job_count;
    RAISE NOTICE 'Offres actives: %', active_job_count;
    RAISE NOTICE '========================================';
    
    IF user_count = 0 THEN
        RAISE NOTICE 'ATTENTION: Aucun utilisateur trouvé dans la table users';
    END IF;
    
    IF app_count = 0 THEN
        RAISE NOTICE 'ATTENTION: Aucune candidature trouvée dans la table applications';
    END IF;
    
    IF active_job_count = 0 THEN
        RAISE NOTICE 'ATTENTION: Aucune offre d''emploi active trouvée';
    END IF;
END $$;
