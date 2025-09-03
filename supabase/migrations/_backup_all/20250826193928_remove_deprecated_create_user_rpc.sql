-- Supprime la fonction RPC create_new_user qui n'est plus utilisée.
-- L'inscription est maintenant gérée directement par auth.signUp côté client,
-- et la création de l'utilisateur dans public.users est gérée par un trigger.
DROP FUNCTION IF EXISTS public.create_new_user(text, text, text, text, text, text);
