-- Migration pour synchroniser les utilisateurs auth avec la table users

-- Fonction pour créer automatiquement un utilisateur dans la table users lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, first_name, last_name, phone, date_of_birth)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'recruiter' THEN 'recruteur'
      WHEN NEW.raw_user_meta_data->>'role' = 'candidate' THEN 'candidat'
      WHEN NEW.raw_user_meta_data->>'role' IN ('recruteur', 'candidat', 'admin') THEN NEW.raw_user_meta_data->>'role'
      ELSE 'candidat'
    END,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL AND NEW.raw_user_meta_data->>'birth_date' != ''
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
      ELSE NULL 
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = COALESCE(EXCLUDED.role, public.users.role),
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, public.users.date_of_birth),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après chaque inscription ou connexion
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Synchroniser les utilisateurs existants dans auth.users avec la table users
INSERT INTO public.users (id, email, role, first_name, last_name)
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.raw_user_meta_data->>'role' = 'recruiter' THEN 'recruteur'
    WHEN au.raw_user_meta_data->>'role' = 'candidate' THEN 'candidat'
    WHEN au.raw_user_meta_data->>'role' IN ('recruteur', 'candidat', 'admin') THEN au.raw_user_meta_data->>'role'
    ELSE 'candidat'
  END as role,
  COALESCE(au.raw_user_meta_data->>'first_name', 'Utilisateur') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', 'Inconnu') as last_name
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
  AND au.email NOT IN (SELECT email FROM public.users)
ON CONFLICT (id) DO NOTHING;
