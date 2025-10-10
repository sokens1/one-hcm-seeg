-- Migration pour nettoyer les données de la colonne role
-- Supprime les caractères de retour à la ligne et espaces

-- 1. D'ABORD, supprimer la contrainte existante (si elle existe)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Afficher les rôles uniques existants (pour debug)
DO $$
DECLARE
  role_record RECORD;
BEGIN
  RAISE NOTICE '=== Rôles existants dans la base ===';
  FOR role_record IN 
    SELECT DISTINCT role, COUNT(*) as count
    FROM public.users
    GROUP BY role
    ORDER BY count DESC
  LOOP
    RAISE NOTICE 'Rôle: "%" (longueur: %, count: %)', 
      role_record.role, 
      LENGTH(role_record.role), 
      role_record.count;
  END LOOP;
END $$;

-- 3. Nettoyer la colonne role (supprimer \r\n, \n, \t et espaces)
UPDATE public.users 
SET role = TRIM(BOTH FROM REGEXP_REPLACE(role, E'[\\r\\n\\t\\s]+', '', 'g'))
WHERE role IS NOT NULL;

-- 4. S'assurer que tous les rôles sont en minuscules (normalisation)
UPDATE public.users 
SET role = LOWER(TRIM(role))
WHERE role IS NOT NULL;

-- 5. Mapper les anciens rôles vers les nouveaux
UPDATE public.users SET role = 'recruteur' WHERE role = 'recruiter';
UPDATE public.users SET role = 'observateur' WHERE role = 'observer';

-- 6. Corriger les rôles NULL
UPDATE public.users 
SET role = 'candidat'
WHERE role IS NULL;

-- 7. Corriger tous les rôles qui ne sont pas dans la liste autorisée
UPDATE public.users 
SET role = 'candidat'
WHERE role NOT IN ('candidat', 'recruteur', 'admin', 'observateur');

-- 8. Afficher les rôles après nettoyage
DO $$
DECLARE
  role_record RECORD;
  invalid_count INTEGER;
BEGIN
  RAISE NOTICE '=== Rôles après nettoyage ===';
  FOR role_record IN 
    SELECT DISTINCT role, COUNT(*) as count
    FROM public.users
    GROUP BY role
    ORDER BY count DESC
  LOOP
    RAISE NOTICE 'Rôle: "%" (count: %)', role_record.role, role_record.count;
  END LOOP;
  
  -- Compter les invalides restants
  SELECT COUNT(*) INTO invalid_count
  FROM public.users
  WHERE role NOT IN ('candidat', 'recruteur', 'admin', 'observateur')
     OR role IS NULL;
  
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Il reste % rôles invalides après nettoyage !', invalid_count;
  ELSE
    RAISE NOTICE '✅ Tous les rôles sont valides, contrainte peut être ajoutée';
  END IF;
END $$;

-- 9. MAINTENANT, ajouter la contrainte (après nettoyage et vérification)
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('candidat', 'recruteur', 'admin', 'observateur'));

-- 5. Commentaire pour documentation
COMMENT ON CONSTRAINT users_role_check ON public.users IS 'Rôles autorisés: candidat, recruteur, admin, observateur';

