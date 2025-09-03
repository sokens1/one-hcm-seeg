-- Activer RLS sur la table 'candidate_profiles' si ce n'est pas déjà fait
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent pour éviter les conflits
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Allow recruiters to view candidate profiles" ON public.candidate_profiles;

-- Créer la politique pour la LECTURE (SELECT) - utilisateurs peuvent voir leur propre profil
CREATE POLICY "Allow users to view their own profile" 
ON public.candidate_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Créer la politique pour l'INSERTION (INSERT) - utilisateurs peuvent créer leur propre profil
CREATE POLICY "Allow users to insert their own profile" 
ON public.candidate_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Créer la politique pour la MISE À JOUR (UPDATE) - utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Allow users to update their own profile" 
ON public.candidate_profiles 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Créer la politique pour permettre aux recruteurs/admins de voir les profils candidats
CREATE POLICY "Allow recruiters to view candidate profiles" 
ON public.candidate_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('recruteur', 'admin')
  )
);
