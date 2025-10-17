-- =====================================================
-- CORRECTION DES POLITIQUES RLS POUR APPLICATION_DOCUMENTS
-- =====================================================
-- Cette migration corrige les problèmes de permissions
-- pour l'affichage des documents des candidatures
-- =====================================================

-- Étape 1 : S'assurer que RLS est activé
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

-- Étape 2 : Supprimer toutes les anciennes politiques pour repartir sur une base saine
DROP POLICY IF EXISTS "Recruiters can view all documents" ON application_documents;
DROP POLICY IF EXISTS "Observers can view all documents" ON application_documents;
DROP POLICY IF EXISTS "Candidates can view own documents" ON application_documents;
DROP POLICY IF EXISTS "Users can insert documents for their applications" ON application_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON application_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON application_documents;
DROP POLICY IF EXISTS "recruiters_can_view_all_documents" ON application_documents;
DROP POLICY IF EXISTS "observers_can_view_all_documents" ON application_documents;
DROP POLICY IF EXISTS "candidates_can_view_own_documents" ON application_documents;
DROP POLICY IF EXISTS "candidates_can_insert_documents" ON application_documents;
DROP POLICY IF EXISTS "candidates_can_update_own_documents" ON application_documents;
DROP POLICY IF EXISTS "candidates_can_delete_own_documents" ON application_documents;

-- Étape 3 : Créer les nouvelles politiques claires et testées

-- Politique 1 : Les recruteurs peuvent voir TOUS les documents
CREATE POLICY "recruiters_can_view_all_documents"
ON application_documents
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'recruiter'
    )
);

-- Politique 2 : Les observateurs peuvent voir TOUS les documents
CREATE POLICY "observers_can_view_all_documents"
ON application_documents
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'observer'
    )
);

-- Politique 3 : Les candidats peuvent voir uniquement leurs propres documents
CREATE POLICY "candidates_can_view_own_documents"
ON application_documents
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_documents.application_id
        AND applications.candidate_id = auth.uid()
    )
);

-- Politique 4 : Les candidats peuvent insérer des documents pour leurs candidatures
CREATE POLICY "candidates_can_insert_documents"
ON application_documents
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_documents.application_id
        AND applications.candidate_id = auth.uid()
    )
);

-- Politique 5 : Les candidats peuvent mettre à jour leurs propres documents
CREATE POLICY "candidates_can_update_own_documents"
ON application_documents
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_documents.application_id
        AND applications.candidate_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_documents.application_id
        AND applications.candidate_id = auth.uid()
    )
);

-- Politique 6 : Les candidats peuvent supprimer leurs propres documents
CREATE POLICY "candidates_can_delete_own_documents"
ON application_documents
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_documents.application_id
        AND applications.candidate_id = auth.uid()
    )
);

-- Étape 4 : Vérification - Afficher toutes les politiques créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'application_documents'
ORDER BY policyname;

-- Étape 5 : Test rapide - Compter les documents visibles pour chaque rôle
-- (Exécutez cette requête en tant que recruteur pour vérifier)
SELECT 
    COUNT(*) as total_documents_visibles,
    COUNT(DISTINCT application_id) as nombre_candidatures_avec_documents
FROM application_documents;

-- =====================================================
-- NOTES D'UTILISATION
-- =====================================================
-- 1. Exécutez ce script dans la console SQL de Supabase
-- 2. Vérifiez les résultats de l'étape 4 (liste des politiques)
-- 3. Testez l'accès aux documents dans l'application
-- 4. Si le problème persiste, vérifiez :
--    - Que le bucket 'application-documents' est public
--    - Que les file_url sont corrects dans la table
--    - Que l'utilisateur est bien authentifié avec le bon rôle
-- =====================================================

