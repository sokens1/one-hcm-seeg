-- supabase/migrations/20250825221000_reenable_and_backfill_user_sync.sql

-- Step 1: Recreate the user handling function to ensure all personal data is synced.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the user in the public.users table
  INSERT INTO public.users (id, email, role, first_name, last_name, phone, date_of_birth)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidat')::text,
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

  -- If it's a new user, create a welcome notification
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (
        NEW.id,
        'Bienvenue sur la plateforme SEEG',
        'Votre compte a été créé avec succès. Vous pouvez maintenant postuler à nos offres d''emploi.',
        '/jobs'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Re-enable the trigger on user creation.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Backfill missing users who registered while the trigger was disabled.
INSERT INTO public.users (id, email, role, first_name, last_name, phone, date_of_birth)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'candidat')::text as role,
  COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
  au.raw_user_meta_data->>'phone' as phone,
  CASE 
    WHEN au.raw_user_meta_data->>'birth_date' IS NOT NULL AND au.raw_user_meta_data->>'birth_date' != ''
    THEN (au.raw_user_meta_data->>'birth_date')::DATE 
    ELSE NULL 
  END as date_of_birth
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
  AND au.email NOT IN (SELECT email FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- Also backfill notifications for these users
INSERT INTO public.notifications (user_id, title, message, link)
SELECT
    u.id,
    'Bienvenue sur la plateforme SEEG',
    'Votre compte a été créé avec succès. Vous pouvez maintenant postuler à nos offres d''emploi.',
    '/jobs'
FROM auth.users u
WHERE u.id NOT IN (SELECT user_id FROM public.notifications WHERE title = 'Bienvenue sur la plateforme SEEG')
  AND u.id IN (SELECT id FROM public.users);
