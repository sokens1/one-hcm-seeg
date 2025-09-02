-- 1. Activer RLS sur la table 'users' si ce n'est pas déjà fait
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques si elles existent pour éviter les conflits
DROP POLICY IF EXISTS "Allow users to view their own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to insert their own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON public.users;

-- 3. Créer la politique pour la LECTURE (SELECT)
CREATE POLICY "Allow users to view their own data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- 4. Créer la politique pour l'INSERTION (INSERT)
CREATE POLICY "Allow users to insert their own data" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 5. Créer la politique pour la MISE À JOUR (UPDATE)
CREATE POLICY "Allow users to update their own data" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);
