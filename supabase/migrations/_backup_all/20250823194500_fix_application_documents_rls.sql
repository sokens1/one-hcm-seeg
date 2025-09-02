-- RLS: Autoriser les recruteurs (depuis public.users.role) à lire les documents de candidature
-- Sans dépendre d'un claim JWT, pour éviter les soucis de rafraîchissement de token.

-- Assure que la RLS est activée
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies conflictuelles si elles existent (noms potentiels)
DROP POLICY IF EXISTS application_documents_recruiter_select ON public.application_documents;
DROP POLICY IF EXISTS recruiters_can_view_application_documents ON public.application_documents;

-- Nouvelle policy: tout recruteur/admin peut lire les documents de n'importe quelle candidature
CREATE POLICY recruiters_view_documents_any_offer
ON public.application_documents
FOR SELECT
TO authenticated
USING (
  -- Vérifie que l'utilisateur courant est recruteur/admin dans public.users
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND COALESCE(u.role, '') IN ('recruteur', 'recruiter', 'admin')
  )
  AND
  -- S'assure que le document est bien lié à une candidature existante (intégrité logique)
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.job_offers jo ON jo.id = a.job_offer_id
    WHERE a.id = application_id
  )
);
