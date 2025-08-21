-- 1. Add the missing 'link' column to the notifications table
ALTER TABLE public.notifications
ADD COLUMN link TEXT;

-- 2. Drop existing INSERT policy if it exists, to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for authenticated users for their own notifications" ON public.notifications;

-- 3. Create a new RLS policy to allow users to create their own notifications
CREATE POLICY "Enable insert for authenticated users for their own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);
