-- Table des agents SEEG (liste blanche des matricules autorisés)
CREATE TABLE IF NOT EXISTS public.seeg_agents (
  matricule TEXT PRIMARY KEY,
  full_name TEXT,
  department TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS et verrouiller la table (aucune lecture directe côté client)
ALTER TABLE public.seeg_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seeg_agents_no_select" ON public.seeg_agents;
CREATE POLICY "seeg_agents_no_select" ON public.seeg_agents
  FOR SELECT TO authenticated, anon
  USING (false);

-- Fonction sécurisée pour vérifier un matricule sans exposer la table
CREATE OR REPLACE FUNCTION public.verify_seeg_matricule(p_matricule TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  _exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.seeg_agents sa
    WHERE sa.matricule = p_matricule AND sa.active = TRUE
  ) INTO _exists;
  RETURN _exists;
END;
$$;

-- Autoriser l'exécution de la fonction aux rôles client
GRANT EXECUTE ON FUNCTION public.verify_seeg_matricule(TEXT) TO anon, authenticated;

-- Mettre à jour la fonction de sync pour inclure le matricule dès l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, first_name, last_name, phone, date_of_birth, matricule)
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
    END,
    NULLIF(NEW.raw_user_meta_data->>'matricule','')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = COALESCE(EXCLUDED.role, public.users.role),
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, public.users.date_of_birth),
    matricule = COALESCE(EXCLUDED.matricule, public.users.matricule),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
