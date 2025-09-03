-- 1. Supprimer les anciennes politiques si elles existent pour éviter les conflits
DROP POLICY IF EXISTS "Candidates can view their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Candidates can update their own profile" ON public.candidate_profiles;

-- 2. Activer RLS sur la table si ce n'est pas déjà fait
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Créer une politique SELECT : les candidats authentifiés peuvent lire leur propre profil
CREATE POLICY "Candidates can view their own profile" 
ON public.candidate_profiles
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Créer une politique UPDATE : les candidats authentifiés peuvent mettre à jour leur propre profil
CREATE POLICY "Candidates can update their own profile" 
ON public.candidate_profiles
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Créer une politique INSERT : les candidats authentifiés peuvent créer leur propre profil
-- C'est important pour les utilisateurs qui n'ont pas encore de profil
CREATE POLICY "Candidates can create their own profile" 
ON public.candidate_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);
