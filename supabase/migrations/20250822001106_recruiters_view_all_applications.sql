-- Assouplir les politiques RLS pour que tous les recruteurs voient toutes les candidatures
-- et leurs documents associés.

BEGIN;

-- Applications: lecture globale pour recruteurs et admins, et candidats voient les leurs
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Candidates can view their own applications" ON public.applications;

CREATE POLICY "Candidates can view their own applications" ON public.applications
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Recruiters and admins can view all applications" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('recruteur', 'admin')
    )
  );

-- Documents: lecture globale pour recruteurs et admins, et candidats voient leurs documents
DROP POLICY IF EXISTS "Recruiters can view documents for applications to their jobs" ON public.application_documents;
DROP POLICY IF EXISTS "Candidates can manage their application documents" ON public.application_documents;

CREATE POLICY "Candidates can manage their application documents" ON public.application_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id AND a.candidate_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters and admins can view all application documents" ON public.application_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('recruteur', 'admin')
    )
  );

COMMIT;
