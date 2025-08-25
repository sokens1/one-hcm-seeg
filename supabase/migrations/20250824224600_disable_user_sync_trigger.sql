-- supabase/migrations/20250824224600_disable_user_sync_trigger.sql

-- Temporarily disable the user sync trigger to isolate the signup issue

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
