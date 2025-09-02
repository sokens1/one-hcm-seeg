-- Autoriser les recruteurs et admins à lire la table public.users (visibilité des infos candidats)

BEGIN;

-- Politique existante: "Users can view their own profile" reste en place
-- On ajoute une politique complémentaire pour SELECT par recruteurs/admins

DROP POLICY IF EXISTS "Recruiters can read users" ON public.users;
CREATE POLICY "Recruiters can read users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role IN ('recruteur', 'admin')
    )
  );

COMMIT;
