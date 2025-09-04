-- Corriger les politiques RLS pour la table candidate_profiles
-- S'assurer que les candidats peuvent sauvegarder leur profil détaillé

-- 1. Supprimer toutes les politiques existantes sur candidate_profiles
DROP POLICY IF EXISTS "Candidates can view their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Candidates can update their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Candidates can insert their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Candidates can create their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Recruiters can view candidate profiles" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Allow recruiters to view candidate profiles" ON public.candidate_profiles;

-- 2. S'assurer que RLS est activé
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Créer des politiques simples et cohérentes
-- Politique pour la lecture (SELECT)
CREATE POLICY "Users can view their own candidate profile" ON public.candidate_profiles
  FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- Politique pour l'insertion (INSERT)
CREATE POLICY "Users can create their own candidate profile" ON public.candidate_profiles
  FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- Politique pour la mise à jour (UPDATE)
CREATE POLICY "Users can update their own candidate profile" ON public.candidate_profiles
  FOR UPDATE
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

-- Politique pour permettre aux recruteurs et admins de voir les profils candidats
CREATE POLICY "Recruiters can view candidate profiles" ON public.candidate_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND role IN ('recruteur', 'admin', 'recruiter')
    )
  );

-- 4. Vérifier que la table users a les bonnes politiques pour les candidats
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Recruiters can view all users" ON public.users;

-- Politique pour que les candidats puissent voir leurs propres données
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT
  USING (id = auth.uid()::text);

-- Politique pour que les recruteurs et admins puissent voir tous les utilisateurs
CREATE POLICY "Recruiters can view all users" ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND role IN ('recruteur', 'admin', 'recruiter')
    )
  );

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON public.candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
