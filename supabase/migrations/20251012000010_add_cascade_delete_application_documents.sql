-- Migration pour ajouter ON DELETE CASCADE à la contrainte application_documents_application_id_fkey
-- Cela permettra de supprimer automatiquement les documents associés quand une application est supprimée

-- Étape 1: Vérifier et supprimer la contrainte existante si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'application_documents_application_id_fkey' 
        AND table_name = 'application_documents'
    ) THEN
        ALTER TABLE public.application_documents 
        DROP CONSTRAINT application_documents_application_id_fkey;
        
        RAISE NOTICE 'Contrainte existante supprimée avec succès';
    END IF;
END $$;

-- Étape 2: Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE public.application_documents
ADD CONSTRAINT application_documents_application_id_fkey
FOREIGN KEY (application_id)
REFERENCES public.applications(id)
ON DELETE CASCADE;

-- Vérification: afficher les contraintes de clé étrangère
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'application_documents'
    AND tc.constraint_name = 'application_documents_application_id_fkey';

