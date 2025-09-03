CREATE OR REPLACE FUNCTION public.create_new_user(
    p_email TEXT,
    p_password TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT,
    p_matricule TEXT
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id uuid;
    user_data jsonb;
BEGIN
    -- 1. Vérifier si le matricule est déjà utilisé dans la table public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE matricule = p_matricule) THEN
        RAISE EXCEPTION 'duplicate-matricule';
    END IF;

    -- 2. Utiliser auth.signup pour créer l'utilisateur, ce qui gère aussi la duplication d'email
    SELECT auth.signup(
      p_email,
      p_password,
      jsonb_build_object(
        'first_name', p_first_name,
        'last_name', p_last_name,
        'phone', p_phone,
        'matricule', p_matricule,
        'role', 'candidat'
      )
    ) INTO user_data;

    new_user_id := (user_data->>'id')::uuid;

    -- 3. L'insertion dans public.users est maintenant gérée par le trigger `on_auth_user_created`.
    --    Il faut juste s'assurer que le trigger met bien à jour le matricule.
    --    On force la mise à jour ici au cas où le trigger ne le ferait pas.
    UPDATE public.users
    SET 
      first_name = p_first_name,
      last_name = p_last_name,
      phone = p_phone,
      matricule = p_matricule,
      role = 'candidat'
    WHERE id = new_user_id;

    RETURN jsonb_build_object('id', new_user_id);

EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM = 'duplicate-matricule' THEN
            RAISE EXCEPTION 'Un utilisateur avec ce matricule existe déjà.';
        END IF;
        -- L'erreur de duplication d'email est gérée par auth.signup, qui renvoie une erreur 422.
        RAISE; -- Propage l'erreur originale (y compris celle de auth.signup)
END;
$$;
