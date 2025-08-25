-- Rollback ciblé: revenir aux politiques RLS strictes d'origine
-- Objectif: les recruteurs voient uniquement les candidatures des offres dont ils sont propriétaires (ou admin)
-- et la lecture de public.users/candidate_profiles redevient strictement self-view.

BEGIN;

-- 1) applications: supprimer les politiques élargies et restaurer les originales
DROP POLICY IF EXISTS "Recruiters and admins can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Candidates can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Candidates can create applications" ON public.applications;
DROP POLICY IF EXISTS "Candidates can update their own applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON public.applications;

CREATE POLICY "Candidates can view their own applications" ON public.applications
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can create applications" ON public.applications
  FOR INSERT WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Candidates can update their own applications" ON public.applications
  FOR UPDATE USING (candidate_id = auth.uid());

CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.job_offers jo
      JOIN public.users u ON u.id = auth.uid()
      WHERE jo.id = job_offer_id
        AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
    )
  );

-- 2) application_documents: supprimer la lecture globale et restaurer self + owner
DROP POLICY IF EXISTS "Recruiters and admins can view all application documents" ON public.application_documents;
DROP POLICY IF EXISTS "Candidates can manage their application documents" ON public.application_documents;
DROP POLICY IF EXISTS "Recruiters can view documents for applications to their jobs" ON public.application_documents;

CREATE POLICY "Candidates can manage their application documents" ON public.application_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id AND a.candidate_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can view documents for applications to their jobs" ON public.application_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.job_offers jo ON jo.id = a.job_offer_id
      JOIN public.users u ON u.id = auth.uid()
      WHERE a.id = application_id
        AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
    )
  );

-- 3) users: retirer la lecture par recruteurs/admins et restaurer self-view/update
DROP POLICY IF EXISTS "Recruiters can read users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 4) candidate_profiles: retirer la lecture par recruteurs/admins (retour strict)
DROP POLICY IF EXISTS "Recruiters can read candidate_profiles" ON public.candidate_profiles;
-- Option stricte: seul le propriétaire voit son profil
DROP POLICY IF EXISTS "Users can view their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update their own candidate profile" ON public.candidate_profiles;

CREATE POLICY "Users can view their own candidate profile" ON public.candidate_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidate profile" ON public.candidate_profiles
  FOR UPDATE USING (auth.uid() = user_id);

COMMIT;
