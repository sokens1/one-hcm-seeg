-- supabase/migrations/20250824221000_add_application_notification_function.sql

-- 1. Create a function to create a notification for a new application
CREATE OR REPLACE FUNCTION public.create_application_notification(
    p_user_id uuid,
    p_job_title text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (
        p_user_id,
        'Candidature enregistrée',
        'Votre candidature pour le poste de "' || p_job_title || '" a bien été enregistrée. Pour toute question, contactez-nous au 076 40 28 86.',
        '/candidate/applications'
    );
END;
$$;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_application_notification(uuid, text) TO authenticated;
