-- supabase/migrations/20250824220500_alter_notifications_schema.sql

-- This migration corrects the schema of the notifications table to align with the useNotifications hook.

-- 1. Add the 'link' column for navigation
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS link text NULL;

-- 2. Rename 'is_read' to 'read' for consistency
DO $$
BEGIN
   IF EXISTS(
        SELECT 1
        FROM   information_schema.columns
        WHERE  table_schema = 'public'
        AND    table_name = 'notifications'
        AND    column_name = 'is_read'
    ) THEN
        ALTER TABLE public.notifications RENAME COLUMN is_read TO read;
   END IF;
END$$;

-- 3. Change the primary key 'id' from uuid to bigint
-- Note: This is a more complex operation. It's done carefully to avoid data loss.
DO $$
BEGIN
    -- Check if the column type is uuid before attempting to change it
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'notifications'
        AND column_name = 'id'
        AND udt_name = 'uuid'
    ) THEN
        -- Drop the existing primary key constraint if it exists
        IF EXISTS (
            SELECT 1
            FROM information_schema.table_constraints
            WHERE constraint_name = 'notifications_pkey' AND table_name = 'notifications'
        ) THEN
            ALTER TABLE public.notifications DROP CONSTRAINT notifications_pkey;
        END IF;

        -- Alter the column type to bigint using a sequence
        CREATE SEQUENCE notifications_id_seq;
        ALTER TABLE public.notifications ALTER COLUMN id DROP DEFAULT;
        ALTER TABLE public.notifications ALTER COLUMN id SET DATA TYPE bigint USING nextval('notifications_id_seq');
        ALTER TABLE public.notifications ALTER COLUMN id SET DEFAULT nextval('notifications_id_seq');
        ALTER TABLE public.notifications ADD PRIMARY KEY (id);
        PERFORM setval('notifications_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.notifications), false);
    END IF;
END$$;
