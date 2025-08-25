-- supabase/migrations/20250824224500_temporarily_disable_welcome_notification.sql

-- Temporarily disable the welcome notification creation to allow user signup
-- We'll re-enable it once we identify the root cause of the issue

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- First, insert or update the user in the public.users table
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

  -- Temporarily commented out the welcome notification creation
  -- IF (TG_OP = 'INSERT') THEN
  --   INSERT INTO public.notifications (user_id, title, message, link)
  --   VALUES (
  --       NEW.id,
  --       'Bienvenue sur la plateforme SEEG',
  --       'Votre compte a été créé avec succès. Vous pouvez maintenant postuler à nos offres d''emploi.',
  --       '/jobs'
  --   );
  -- END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
