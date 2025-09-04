-- Corriger l'accès aux offres d'emploi pour les candidats
-- S'assurer que les candidats peuvent voir les offres actives

-- 1. Supprimer toutes les politiques existantes sur job_offers pour éviter les conflits
DROP POLICY IF EXISTS "Everyone can view active job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Recruiters and Admins can manage job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Observers can view job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Authenticated users can view job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Recruiters can manage their job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Recruiters can create job offers" ON public.job_offers;

-- 2. Créer une politique simple pour que TOUS les utilisateurs authentifiés puissent voir les offres actives
CREATE POLICY "All authenticated users can view active job offers" ON public.job_offers
  FOR SELECT
  USING (
    status = 'active' AND 
    auth.role() = 'authenticated'
  );

-- 3. Créer une politique pour que les recruteurs et admins puissent gérer les offres
CREATE POLICY "Recruiters and Admins can manage job offers" ON public.job_offers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND role IN ('recruteur', 'admin', 'recruiter')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND role IN ('recruteur', 'admin', 'recruiter')
    )
  );

-- 4. Créer une politique pour que les observateurs puissent voir les offres (lecture seule)
CREATE POLICY "Observers can view job offers" ON public.job_offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text 
      AND role IN ('observateur', 'observer')
    )
  );

-- 5. S'assurer que RLS est activé
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;

-- 6. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON public.job_offers(status);
CREATE INDEX IF NOT EXISTS idx_job_offers_recruiter_id ON public.job_offers(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 7. Vérifier que la table users a les bonnes politiques pour les candidats
DROP POLICY IF EXISTS "Candidates can view their own user data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

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

-- 8. Vérifier que la table applications a les bonnes politiques
DROP POLICY IF EXISTS "Candidates can view their own applications" ON public.applications;

CREATE POLICY "Candidates can view their own applications" ON public.applications
  FOR SELECT
  USING (candidate_id::text = auth.uid()::text);

CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.job_offers jo
      JOIN public.users u ON u.id = auth.uid()::text
      WHERE jo.id = job_offer_id 
      AND (jo.recruiter_id::text = auth.uid()::text OR u.role IN ('recruteur', 'admin'))
    )
  );
