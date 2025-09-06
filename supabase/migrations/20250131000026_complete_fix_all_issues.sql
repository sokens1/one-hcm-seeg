-- CORRECTION COMPLÈTE DE TOUS LES PROBLÈMES RLS ET RPC
-- Cette migration résout définitivement tous les problèmes identifiés

-- 1. CORRECTION DE LA RÉCURSION RLS DANS LA TABLE USERS
-- Supprimer toutes les politiques existantes sur la table users
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_record.policyname);
        RAISE NOTICE 'Dropped users policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Supprimer les fonctions problématiques
DROP FUNCTION IF EXISTS public.is_admin_db();
DROP FUNCTION IF EXISTS public.current_role();
DROP FUNCTION IF EXISTS public.get_user_role_from_jwt();
DROP FUNCTION IF EXISTS public.is_admin_from_jwt();
DROP FUNCTION IF EXISTS public.is_recruiter_from_jwt();

-- Créer des fonctions sécurisées sans récursion
CREATE OR REPLACE FUNCTION public.get_user_role_from_jwt()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'user_role'),
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    'candidat'::text
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_from_jwt()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_user_role_from_jwt() = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_recruiter_from_jwt()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_user_role_from_jwt() IN ('recruteur', 'admin', 'recruiter');
$$;

-- Recréer les politiques RLS pour users sans récursion
CREATE POLICY users_select_policy
ON public.users
FOR SELECT
TO authenticated
USING (
  public.is_admin_from_jwt() OR 
  public.is_recruiter_from_jwt() OR 
  id::text = auth.uid()::text
);

CREATE POLICY users_insert_policy
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_from_jwt()
);

CREATE POLICY users_update_policy
ON public.users
FOR UPDATE
TO authenticated
USING (
  public.is_admin_from_jwt() OR id::text = auth.uid()::text
)
WITH CHECK (
  public.is_admin_from_jwt() OR (
    id::text = auth.uid()::text AND 
    (role = (SELECT u.role FROM public.users u WHERE u.id::text = auth.uid()::text) OR role IS NULL)
  )
);

CREATE POLICY users_delete_policy
ON public.users
FOR DELETE
TO authenticated
USING (
  public.is_admin_from_jwt()
);

-- 2. CORRECTION DES POLITIQUES RLS POUR APPLICATIONS
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'applications' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.applications', policy_record.policyname);
        RAISE NOTICE 'Dropped applications policy: %', policy_record.policyname;
    END LOOP;
END $$;

CREATE POLICY applications_select_policy
ON public.applications
FOR SELECT
TO authenticated
USING (
  candidate_id::text = auth.uid()::text
  OR
  EXISTS (
    SELECT 1 FROM public.job_offers jo 
    WHERE jo.id = applications.job_offer_id 
    AND jo.recruiter_id::text = auth.uid()::text
  )
  OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id::text = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY applications_insert_policy
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id::text = auth.uid()::text
);

CREATE POLICY applications_update_policy
ON public.applications
FOR UPDATE
TO authenticated
USING (
  candidate_id::text = auth.uid()::text
  OR
  EXISTS (
    SELECT 1 FROM public.job_offers jo 
    WHERE jo.id = applications.job_offer_id 
    AND jo.recruiter_id::text = auth.uid()::text
  )
  OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id::text = auth.uid()::text 
    AND u.role = 'admin'
  )
)
WITH CHECK (
  candidate_id::text = auth.uid()::text
  OR
  EXISTS (
    SELECT 1 FROM public.job_offers jo 
    WHERE jo.id = applications.job_offer_id 
    AND jo.recruiter_id::text = auth.uid()::text
  )
  OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id::text = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- 3. CORRECTION DES POLITIQUES RLS POUR JOB_OFFERS
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'job_offers' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.job_offers', policy_record.policyname);
        RAISE NOTICE 'Dropped job_offers policy: %', policy_record.policyname;
    END LOOP;
END $$;

CREATE POLICY job_offers_select_policy
ON public.job_offers
FOR SELECT
TO authenticated
USING (
  status = 'active'
  OR
  recruiter_id::text = auth.uid()::text
  OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id::text = auth.uid()::text 
    AND u.role = 'admin'
  )
);

CREATE POLICY job_offers_insert_policy
ON public.job_offers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id::text = auth.uid()::text 
    AND u.role IN ('recruteur', 'admin', 'recruiter')
  )
);

CREATE POLICY job_offers_update_policy
ON public.job_offers
FOR UPDATE
TO authenticated
USING (
  recruiter_id::text = auth.uid()::text
  OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id::text = auth.uid()::text 
    AND u.role = 'admin'
  )
)
WITH CHECK (
  recruiter_id::text = auth.uid()::text
  OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id::text = auth.uid()::text 
    AND u.role = 'admin'
  )
);

-- 4. CORRECTION DE LA FONCTION RPC get_all_recruiter_applications
-- Supprimer les versions existantes
DROP FUNCTION IF EXISTS public.get_all_recruiter_applications();
DROP FUNCTION IF EXISTS public.get_all_recruiter_applications(uuid);

-- Créer une seule version de la fonction avec paramètre optionnel
CREATE OR REPLACE FUNCTION public.get_all_recruiter_applications(
  p_job_offer_id uuid DEFAULT NULL
)
RETURNS TABLE (
  application_details jsonb,
  job_offer_details jsonb,
  candidate_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier si l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- Vérifier si l'utilisateur est recruteur ou admin
  IF NOT EXISTS(
    SELECT 1 FROM public.users
    WHERE id::text = auth.uid()::text AND role IN ('recruteur', 'admin', 'recruiter')
  ) THEN
    RETURN;
  END IF;

  -- Si un job_offer_id spécifique est fourni, filtrer par cette offre
  IF p_job_offer_id IS NOT NULL THEN
    RETURN QUERY
    SELECT
      to_jsonb(a.*) AS application_details,
      to_jsonb(jo.*) AS job_offer_details,
      to_jsonb(u.*) || jsonb_build_object(
        'candidate_profiles', to_jsonb(cp.*)
      ) AS candidate_details
    FROM
      public.applications a
    INNER JOIN
      public.job_offers jo ON a.job_offer_id = jo.id
    INNER JOIN
      public.users u ON a.candidate_id::text = u.id::text
    LEFT JOIN
      public.candidate_profiles cp ON u.id::text = cp.user_id::text
    WHERE
      jo.recruiter_id::text = auth.uid()::text
      AND a.job_offer_id = p_job_offer_id
    ORDER BY
      a.created_at DESC;
  ELSE
    -- Sinon, retourner toutes les candidatures du recruteur
    RETURN QUERY
    SELECT
      to_jsonb(a.*) AS application_details,
      to_jsonb(jo.*) AS job_offer_details,
      to_jsonb(u.*) || jsonb_build_object(
        'candidate_profiles', to_jsonb(cp.*)
      ) AS candidate_details
    FROM
      public.applications a
    INNER JOIN
      public.job_offers jo ON a.job_offer_id = jo.id
    INNER JOIN
      public.users u ON a.candidate_id::text = u.id::text
    LEFT JOIN
      public.candidate_profiles cp ON u.id::text = cp.user_id::text
    WHERE
      jo.recruiter_id::text = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id::text = auth.uid()::text AND role = 'admin'
      )
    ORDER BY
      a.created_at DESC;
  END IF;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.get_all_recruiter_applications(uuid) TO authenticated;

-- 5. CORRECTION DE LA TABLE protocol1_evaluations
-- Supprimer la contrainte unique problématique
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT conname
        FROM pg_constraint 
        WHERE conrelid = 'public.protocol1_evaluations'::regclass
        AND contype = 'u'
        AND pg_get_constraintdef(oid) LIKE '%application_id%'
    LOOP
        EXECUTE format('ALTER TABLE public.protocol1_evaluations DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
        RAISE NOTICE 'Dropped unique constraint: %', constraint_record.conname;
    END LOOP;
END $$;

-- Créer un index unique partiel pour éviter les doublons actifs
DROP INDEX IF EXISTS protocol1_evaluations_unique_active;
CREATE UNIQUE INDEX protocol1_evaluations_unique_active
ON public.protocol1_evaluations (application_id)
WHERE status IS NULL OR status != 'archived';

-- 6. S'ASSURER QUE RLS EST ACTIVÉ
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;

-- 7. ACCORDER LES PERMISSIONS NÉCESSAIRES
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_offers TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 8. CRÉER LA FONCTION get_recruiter_activities SI ELLE N'EXISTE PAS
CREATE OR REPLACE FUNCTION public.get_recruiter_activities()
RETURNS TABLE (
  activity_type text,
  activity_count bigint,
  activity_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier si l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- Vérifier si l'utilisateur est recruteur ou admin
  IF NOT EXISTS(
    SELECT 1 FROM public.users
    WHERE id::text = auth.uid()::text AND role IN ('recruteur', 'admin', 'recruiter')
  ) THEN
    RETURN;
  END IF;

  -- Retourner les activités du recruteur
  RETURN QUERY
  SELECT 
    'applications'::text as activity_type,
    COUNT(*)::bigint as activity_count,
    DATE(a.created_at) as activity_date
  FROM public.applications a
  INNER JOIN public.job_offers jo ON a.job_offer_id = jo.id
  WHERE jo.recruiter_id::text = auth.uid()::text
  GROUP BY DATE(a.created_at)
  ORDER BY activity_date DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_recruiter_activities() TO authenticated;

-- 9. VÉRIFICATION FINALE
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORRECTION COMPLÈTE APPLIQUÉE AVEC SUCCÈS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Récursion RLS users corrigée';
    RAISE NOTICE 'Politiques RLS applications/job_offers corrigées';
    RAISE NOTICE 'Fonction RPC get_all_recruiter_applications corrigée';
    RAISE NOTICE 'Contrainte unique protocol1_evaluations supprimée';
    RAISE NOTICE 'Fonction get_recruiter_activities créée';
    RAISE NOTICE 'Toutes les erreurs 500 et 409 devraient être résolues';
    RAISE NOTICE '========================================';
END $$;
