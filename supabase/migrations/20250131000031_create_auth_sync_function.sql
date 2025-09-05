-- Créer une fonction pour synchroniser les utilisateurs de la table users vers auth.users
-- Cette fonction permet de créer des utilisateurs auth à partir des données CSV importées

-- 1. Fonction pour créer un utilisateur auth à partir des données de la table users
CREATE OR REPLACE FUNCTION public.create_auth_user_from_users(
  p_user_id UUID,
  p_email TEXT,
  p_password TEXT DEFAULT 'TempPassword123!',
  p_first_name TEXT DEFAULT '',
  p_last_name TEXT DEFAULT '',
  p_phone TEXT DEFAULT NULL,
  p_matricule TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_user_id UUID;
  v_result JSONB;
BEGIN
  -- Vérifier si l'utilisateur existe déjà dans auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Utilisateur déjà existant dans auth.users',
      'user_id', p_user_id
    );
  END IF;

  -- Vérifier si l'email existe déjà dans auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Email déjà utilisé dans auth.users',
      'email', p_email
    );
  END IF;

  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', -- instance_id par défaut
    p_user_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')), -- Hash du mot de passe
    now(), -- email_confirmed_at
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}', -- raw_app_meta_data
    jsonb_build_object(
      'first_name', COALESCE(p_first_name, ''),
      'last_name', COALESCE(p_last_name, ''),
      'phone', p_phone,
      'matricule', p_matricule
    ), -- raw_user_meta_data
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Récupérer l'ID de l'utilisateur créé
  v_auth_user_id := p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Utilisateur créé avec succès dans auth.users',
    'user_id', v_auth_user_id,
    'email', p_email
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erreur lors de la création: ' || SQLERRM,
      'user_id', p_user_id,
      'email', p_email
    );
END;
$$;

-- 2. Fonction pour synchroniser tous les utilisateurs de la table users vers auth.users
CREATE OR REPLACE FUNCTION public.sync_all_users_to_auth(
  p_default_password TEXT DEFAULT 'TempPassword123!'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_result JSONB;
  v_success_count INTEGER := 0;
  v_error_count INTEGER := 0;
  v_results JSONB := '[]'::jsonb;
  v_user_result JSONB;
BEGIN
  -- Parcourir tous les utilisateurs de la table users
  FOR v_user IN 
    SELECT id, email, first_name, last_name, phone, matricule
    FROM public.users
    WHERE email IS NOT NULL AND email != ''
  LOOP
    -- Créer l'utilisateur auth
    SELECT public.create_auth_user_from_users(
      v_user.id,
      v_user.email,
      p_default_password,
      v_user.first_name,
      v_user.last_name,
      v_user.phone,
      v_user.matricule
    ) INTO v_user_result;

    -- Ajouter le résultat
    v_results := v_results || jsonb_build_array(v_user_result);

    -- Compter les succès et erreurs
    IF (v_user_result->>'success')::boolean THEN
      v_success_count := v_success_count + 1;
    ELSE
      v_error_count := v_error_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Synchronisation terminée',
    'total_processed', v_success_count + v_error_count,
    'success_count', v_success_count,
    'error_count', v_error_count,
    'results', v_results
  );
END;
$$;

-- 3. Fonction pour créer un utilisateur auth avec un mot de passe personnalisé
CREATE OR REPLACE FUNCTION public.create_auth_user_with_password(
  p_user_id UUID,
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT DEFAULT '',
  p_last_name TEXT DEFAULT '',
  p_phone TEXT DEFAULT NULL,
  p_matricule TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.create_auth_user_from_users(
    p_user_id,
    p_email,
    p_password,
    p_first_name,
    p_last_name,
    p_phone,
    p_matricule
  );
END;
$$;

-- 4. Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_auth_user_from_users(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_all_users_to_auth(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_auth_user_with_password(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
