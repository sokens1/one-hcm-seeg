-- Permettre aux recruteurs d'accéder aux profils des candidats qui ont postulé à leurs offres
-- Ceci est nécessaire pour afficher les informations complètes des candidats dans le pipeline

BEGIN;

-- Ajouter une politique pour permettre aux recruteurs de lire les profils des candidats
-- qui ont postulé à leurs offres d'emploi
CREATE POLICY "Recruiters can read candidate profiles for their job applications" ON public.candidate_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.job_offers jo ON jo.id = a.job_offer_id
      JOIN public.users u ON u.id = auth.uid()
      WHERE a.candidate_id = candidate_profiles.user_id
        AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
    )
  );

-- Également permettre aux recruteurs de lire les données users des candidats
-- qui ont postulé à leurs offres
CREATE POLICY "Recruiters can read users for their job applications" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR -- Self-access
    EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.job_offers jo ON jo.id = a.job_offer_id
      JOIN public.users u ON u.id = auth.uid()
      WHERE a.candidate_id = users.id
        AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
    )
  );

COMMIT;
