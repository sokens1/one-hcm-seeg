-- TEST D'INSCRIPTION : Simulation d'une inscription complète
-- Cette requête simule l'insertion d'un utilisateur dans auth.users avec toutes les métadonnées
-- Ceci déclenchera automatiquement handle_new_user() et créera l'entrée dans public.users

-- ATTENTION : Cette requête est pour TEST uniquement
-- Remplace les valeurs par tes propres données de test

-- 1. Générer un UUID pour le test
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test-inscription@example.com';
BEGIN
    -- 2. Insérer dans auth.users (ceci déclenchera handle_new_user)
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) VALUES (
        test_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        test_email,
        crypt('motdepasse123', gen_salt('bf')),
        NOW(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{
            "role": "candidat",
            "first_name": "Jean",
            "last_name": "Dupont",
            "phone": "+241123456789",
            "matricule": "12345",
            "date_of_birth": "1990-05-15",
            "sexe": "M",
            "adresse": "Libreville, Gabon",
            "candidate_status": "interne",
            "no_seeg_email": false,
            "poste_actuel": "Développeur",
            "annees_experience": 5,
            "politique_confidentialite": true
        }',
        false,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
    );

    -- 3. Vérifier que l'utilisateur a été créé dans public.users
    RAISE NOTICE 'Utilisateur de test créé avec ID: %', test_user_id;
    RAISE NOTICE 'Email de test: %', test_email;
    
    -- 4. Afficher les données créées
    PERFORM (
        SELECT 
            'Utilisateur créé dans public.users:' ||
            ' ID=' || id ||
            ', Email=' || email ||
            ', Role=' || role ||
            ', Candidate_status=' || candidate_status ||
            ', Matricule=' || COALESCE(matricule, 'NULL') ||
            ', First_name=' || first_name ||
            ', Last_name=' || last_name ||
            ', Phone=' || COALESCE(phone, 'NULL') ||
            ', Date_of_birth=' || COALESCE(date_of_birth::text, 'NULL') ||
            ', Sexe=' || COALESCE(sexe, 'NULL') ||
            ', Adresse=' || COALESCE(adresse, 'NULL') ||
            ', Statut=' || statut ||
            ', Politique_confidentialite=' || politique_confidentialite
        FROM public.users 
        WHERE id = test_user_id
    );
    
    -- 5. Nettoyer le test (optionnel - commente si tu veux garder l'utilisateur)
    -- DELETE FROM auth.users WHERE id = test_user_id;
    -- DELETE FROM public.users WHERE id = test_user_id;
    
END $$;

-- 6. Vérification finale - Lister les derniers utilisateurs créés
SELECT 
    'Vérification - Derniers utilisateurs créés' as info,
    id,
    email,
    role,
    candidate_status,
    matricule,
    first_name,
    last_name,
    phone,
    date_of_birth,
    sexe,
    adresse,
    statut,
    politique_confidentialite,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 3;
