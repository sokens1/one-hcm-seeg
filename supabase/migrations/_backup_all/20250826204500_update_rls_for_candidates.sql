-- Supprimer les anciennes politiques si elles existent pour éviter les conflits
DROP POLICY IF EXISTS "Candidates can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Candidates can view their own user data" ON public.users;
DROP POLICY IF EXISTS "Candidates can view their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Authenticated users can view job offers" ON public.job_offers;

-- Activer RLS sur les tables si ce n'est pas déjà fait
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;

-- Politique pour que les candidats voient leurs propres candidatures
CREATE POLICY "Candidates can view their own applications" ON public.applications
FOR SELECT USING (auth.uid() = candidate_id);

-- Politique pour que les candidats voient leurs propres informations utilisateur
CREATE POLICY "Candidates can view their own user data" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Politique pour que les candidats voient leur propre profil
CREATE POLICY "Candidates can view their own profile" ON public.candidate_profiles
FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs authentifiés puissent voir toutes les offres d'emploi
CREATE POLICY "Authenticated users can view job offers" ON public.job_offers
FOR SELECT USING (auth.role() = 'authenticated');
