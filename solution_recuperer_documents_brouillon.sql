-- =====================================================
-- SOLUTION : Récupérer les documents du brouillon
-- et les associer à la candidature
-- =====================================================
-- Candidat : Leo Akouma (JURISTE D'ENTREPRISE)
-- Candidat ID: 124c7c54-dd6b-4253-8f9f-133a5970fb11
-- Candidature ID: 8edf8253-6fd7-4e09-b0c7-68d03706d3bb
-- =====================================================

-- ÉTAPE 1 : Vérifier que les fichiers existent dans le Storage
-- Allez dans Supabase → Storage → application-documents
-- Cherchez ces chemins :
-- - 124c7c54-dd6b-4253-8f9f-133a5970fb11/cv/1760482344508-u1yf6c5k0n.pdf
-- - 124c7c54-dd6b-4253-8f9f-133a5970fb11/cover-letters/1760482333630-4tjb06uxvge.pdf
-- - 124c7c54-dd6b-4253-8f9f-133a5970fb11/certificates/1760482394018-chhjrk2nhl.pdf

-- ÉTAPE 2 : Insérer les documents dans la table application_documents
-- Cette requête récupère automatiquement les données du brouillon

INSERT INTO application_documents (
    application_id,
    document_type,
    file_name,
    file_url,
    file_size
)
VALUES
    -- CV
    (
        '8edf8253-6fd7-4e09-b0c7-68d03706d3bb',
        'cv',
        'Dernier CV_JURISTE D''ENTREPRISE_MBUETH AKOUMA LEO _251014_225125.pdf',
        '124c7c54-dd6b-4253-8f9f-133a5970fb11/cv/1760482344508-u1yf6c5k0n.pdf',
        237875
    ),
    -- Lettre de motivation
    (
        '8edf8253-6fd7-4e09-b0c7-68d03706d3bb',
        'cover_letter',
        'Lettre de motivation SEEG  Leo Akouma finale_251014_225021.pdf',
        '124c7c54-dd6b-4253-8f9f-133a5970fb11/cover-letters/1760482333630-4tjb06uxvge.pdf',
        153531
    ),
    -- Diplômes et certificats
    (
        '8edf8253-6fd7-4e09-b0c7-68d03706d3bb',
        'diploma',
        'diplômes et certificats de travail.pdf',
        '124c7c54-dd6b-4253-8f9f-133a5970fb11/certificates/1760482394018-chhjrk2nhl.pdf',
        2953619
    );

-- ÉTAPE 3 : Vérifier que les documents ont bien été ajoutés
SELECT 
    id,
    document_type,
    file_name,
    file_size,
    uploaded_at
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
ORDER BY uploaded_at DESC;

-- ÉTAPE 4 : OPTIONNEL - Nettoyer le brouillon maintenant que la candidature est complète
-- (À exécuter SEULEMENT si tout fonctionne correctement)
/*
DELETE FROM application_drafts
WHERE user_id = '124c7c54-dd6b-4253-8f9f-133a5970fb11'
  AND job_offer_id = '40cf4a6b-ba59-4ba8-bc5c-b3a31960a525';
*/

-- =====================================================
-- VÉRIFICATIONS POST-INSERTION
-- =====================================================

-- Vérifier que les URLs publiques fonctionnent
SELECT 
    document_type,
    file_name,
    'https://[VOTRE_PROJET_SUPABASE].supabase.co/storage/v1/object/public/application-documents/' || file_url as url_complete
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb';

-- Compter le nombre de documents par type
SELECT 
    document_type,
    COUNT(*) as nombre
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
GROUP BY document_type;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================
-- 1. Assurez-vous que les fichiers existent dans le Storage avant d'exécuter l'INSERT
-- 2. Si les fichiers n'existent plus, vous devrez demander au candidat de les re-uploader
-- 3. Les chemins file_url sont relatifs au bucket 'application-documents'
-- 4. Une fois les documents ajoutés, ils seront visibles dans l'interface recruteur
-- 5. Le bucket 'application-documents' doit être configuré comme PUBLIC
-- =====================================================

