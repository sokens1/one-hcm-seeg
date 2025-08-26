-- Corriger la politique RLS sur la table users pour autoriser les mises à jour par l'utilisateur

BEGIN;

-- Supprimer l'ancienne politique si elle existe pour éviter les conflits
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;

-- Créer une politique qui autorise les utilisateurs à mettre à jour leur propre profil
CREATE POLICY "Allow users to update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMIT;
