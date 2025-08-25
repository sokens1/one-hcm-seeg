-- supabase/migrations/20250824224300_fix_notifications_foreign_key.sql

-- Fix the foreign key constraint on notifications table to reference public.users instead of auth.users
-- This prevents the race condition during user signup where the notification is created
-- before the user sync trigger completes.

-- 1. Drop the existing foreign key constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- 2. Add the new foreign key constraint referencing public.users
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
