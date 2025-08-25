-- Supprimer l'ancienne fonction défaillante
DROP FUNCTION IF EXISTS public.get_document_signed_url(TEXT);

-- Créer une fonction simple qui retourne l'URL publique directement
CREATE OR REPLACE FUNCTION get_document_public_url(p_file_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url TEXT := 'https://fyiitzndlqcnyluwkpqp.supabase.co/storage/v1/object/public/application-documents/';
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Retourner l'URL publique construite
  RETURN base_url || p_file_path;
END;
$$;

-- Donner la permission d'exécuter la fonction aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.get_document_public_url(TEXT) TO authenticated;
