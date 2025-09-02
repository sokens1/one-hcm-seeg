-- Rollback: Restaure la fonction create_new_user originale
-- Cette migration annule les modifications apportées à la fonction create_new_user

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
    encrypted_pw text;
BEGIN
    -- Vérifier si le matricule existe déjà
    IF EXISTS (SELECT 1 FROM public.users WHERE matricule = p_matricule) THEN
        RAISE EXCEPTION 'Un utilisateur avec ce matricule existe déjà.';
    END IF;

    -- Vérifier si l'email existe déjà
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RAISE EXCEPTION 'Un utilisateur avec cet email existe déjà.';
    END IF;

    -- Générer un nouvel UUID
    new_user_id := gen_random_uuid();

    -- Crypter le mot de passe
    encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- Insérer dans auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        encrypted_pw,
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object(
            'first_name', p_first_name,
            'last_name', p_last_name,
            'phone', p_phone,
            'matricule', p_matricule
        ),
        false,
        'authenticated'
    );

    -- Insérer dans public.users
    INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        phone,
        matricule,
        role,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        p_email,
        p_first_name,
        p_last_name,
        p_phone,
        p_matricule,
        'candidat',
        now(),
        now()
    );

    RETURN jsonb_build_object('id', new_user_id);

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;