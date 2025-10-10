-- Migration pour nettoyer les données de la colonne role
-- Supprime les caractères de retour à la ligne et espaces

-- 1. Nettoyer la colonne role (supprimer \r\n et espaces)
UPDATE public.users 
SET role = TRIM(BOTH FROM REGEXP_REPLACE(role, E'[\\r\\n]+', '', 'g'))
WHERE role ~ E'[\\r\\n]';

-- 2. S'assurer que tous les rôles sont en minuscules (normalisation)
UPDATE public.users 
SET role = LOWER(TRIM(role))
WHERE role != LOWER(TRIM(role));

-- 3. Corriger les rôles invalides
UPDATE public.users 
SET role = 'candidat'
WHERE role NOT IN ('candidat', 'recruteur', 'admin', 'observateur')
  OR role IS NULL;

-- 4. Ajouter 'observateur' à la contrainte si pas déjà présent
DO $$ 
BEGIN
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
  
  ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('candidat', 'recruteur', 'admin', 'observateur'));
EXCEPTION 
  WHEN undefined_object THEN NULL;
END $$;

-- 5. Commentaire pour documentation
COMMENT ON CONSTRAINT users_role_check ON public.users IS 'Rôles autorisés: candidat, recruteur, admin, observateur';

