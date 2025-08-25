-- supabase/migrations/20250824220600_add_welcome_notification_trigger.sql

-- 1. Create a function to handle new user welcome notification
-- This migration is now obsolete as the welcome notification logic has been moved
-- to the user sync trigger to prevent race conditions.

-- 1. Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user_welcome_notification();
