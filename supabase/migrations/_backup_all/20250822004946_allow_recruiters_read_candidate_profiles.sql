-- Autoriser les recruteurs et admins à LIRE les profils candidats
-- Nécessaire pour afficher gender / current_position / birth_date côté recruteur

BEGIN;

-- Politique idempotente: on supprime si elle existe puis on recrée
DROP POLICY IF EXISTS "Recruiters can read candidate_profiles" ON public.candidate_profiles;
CREATE POLICY "Recruiters can read candidate_profiles" ON public.candidate_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role IN ('recruteur', 'admin')
    )
  );

COMMIT;
