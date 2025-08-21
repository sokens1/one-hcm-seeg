-- 1. On supprime l'ancienne contrainte CHECK pour la remplacer
ALTER TABLE public.application_documents DROP CONSTRAINT application_documents_document_type_check;

-- 2. On ajoute la nouvelle contrainte avec les types de documents mis à jour
ALTER TABLE public.application_documents ADD CONSTRAINT application_documents_document_type_check 
CHECK (document_type IN (
    'cv',
    'cover_letter',
    'diploma',
    'certificate',
    'recommendation',
    'integrity_letter', 
    'project_idea'
  )
);
