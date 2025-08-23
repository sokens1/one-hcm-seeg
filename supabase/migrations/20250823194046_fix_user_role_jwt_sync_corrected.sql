-- Supprimer le trigger défaillant s'il existe
DROP TRIGGER IF EXISTS sync_user_role_trigger ON public.users;
DROP FUNCTION IF EXISTS public.sync_user_role_to_jwt();

-- Créer une fonction corrigée pour synchroniser le user_role dans le JWT
CREATE OR REPLACE FUNCTION public.sync_user_role_to_jwt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Éviter la récursion en vérifiant si c'est nécessaire
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Mettre à jour les métadonnées utilisateur dans auth.users
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', NEW.role)
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour synchroniser automatiquement
CREATE TRIGGER sync_user_role_trigger
  AFTER UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_to_jwt();

-- Synchroniser manuellement les utilisateurs existants (sans trigger)
DO $$
BEGIN
  UPDATE auth.users 
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', u.role)
  FROM public.users u
  WHERE auth.users.id = u.id AND u.role IS NOT NULL;
END;
$$;