-- =====================================================
-- DIAGNOSTIC COMPLET POUR LA CANDIDATURE SANS DOCUMENTS
-- =====================================================
-- Candidat ID: 124c7c54-dd6b-4253-8f9f-133a5970fb11
-- Candidature ID: 8edf8253-6fd7-4e09-b0c7-68d03706d3bb
-- =====================================================

-- 1. Vérifier que la candidature existe dans la base de données
SELECT 
    'Candidature trouvée' as statut,
    id,
    candidate_id,
    job_offer_id,
    status,
    created_at,
    updated_at
FROM applications
WHERE id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb';

-- 2. Vérifier les informations du candidat
SELECT 
    'Candidat trouvé' as statut,
    id,
    email,
    first_name,
    last_name,
    role,
    candidate_status
FROM users
WHERE id = '124c7c54-dd6b-4253-8f9f-133a5970fb11';

-- 3. Vérifier si des documents existent pour cette candidature
SELECT 
    'Documents trouvés' as statut,
    COUNT(*) as nombre_documents
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb';

-- 4. Lister tous les documents pour cette candidature (si ils existent)
SELECT 
    id,
    application_id,
    document_type,
    file_name,
    file_url,
    file_size,
    uploaded_at,
    created_at
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
ORDER BY uploaded_at DESC;

-- 5. Vérifier les politiques RLS (Row Level Security) pour application_documents
-- Cela affichera les politiques actives qui pourraient empêcher l'accès
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'application_documents';

-- 6. Comparer avec une autre candidature qui fonctionne
-- (Cela vous aidera à voir s'il y a une différence structurelle)
SELECT 
    a.id as candidature_id,
    a.candidate_id,
    u.email,
    u.first_name || ' ' || u.last_name as nom_complet,
    COUNT(ad.id) as nombre_documents
FROM applications a
LEFT JOIN users u ON a.candidate_id = u.id
LEFT JOIN application_documents ad ON a.application_id = ad.application_id
WHERE a.job_offer_id = (
    SELECT job_offer_id 
    FROM applications 
    WHERE id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
)
GROUP BY a.id, a.candidate_id, u.email, u.first_name, u.last_name
ORDER BY nombre_documents DESC
LIMIT 10;

-- 7. Vérifier si le candidat a d'autres candidatures avec des documents
SELECT 
    a.id as candidature_id,
    a.job_offer_id,
    jo.title as poste,
    COUNT(ad.id) as nombre_documents,
    a.created_at as date_candidature
FROM applications a
LEFT JOIN job_offers jo ON a.job_offer_id = jo.id
LEFT JOIN application_documents ad ON a.id = ad.application_id
WHERE a.candidate_id = '124c7c54-dd6b-4253-8f9f-133a5970fb11'
GROUP BY a.id, a.job_offer_id, jo.title, a.created_at
ORDER BY a.created_at DESC;

-- 8. Vérifier s'il y a des documents orphelins avec un application_id similaire
-- (au cas où il y aurait une faute de frappe dans l'ID)
SELECT 
    id,
    application_id,
    document_type,
    file_name,
    uploaded_at
FROM application_documents
WHERE application_id LIKE '8edf8253%'
   OR application_id LIKE '%6fd7-4e09%'
ORDER BY uploaded_at DESC;

-- =====================================================
-- SOLUTION POTENTIELLE : Vérifier si les documents 
-- existent dans le storage mais pas dans la table
-- =====================================================

-- 9. Cette requête vérifie l'intégrité des données
-- Vérifier s'il y a des incohérences dans les foreign keys
SELECT 
    'Vérification intégrité' as statut,
    ad.id,
    ad.application_id,
    ad.file_name,
    CASE 
        WHEN a.id IS NULL THEN 'ATTENTION: Application inexistante'
        ELSE 'OK'
    END as validation
FROM application_documents ad
LEFT JOIN applications a ON ad.application_id = a.id
WHERE ad.application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb';

-- 10. NOUVEAU : Vérifier si le candidat avait un brouillon sauvegardé
SELECT 
    'Brouillon trouvé' as statut,
    user_id,
    job_offer_id,
    form_data,
    ui_state,
    updated_at
FROM application_drafts
WHERE user_id = '124c7c54-dd6b-4253-8f9f-133a5970fb11'
ORDER BY updated_at DESC;

-- 11. NOUVEAU : Vérifier spécifiquement les documents dans le brouillon
-- Cette requête extrait les informations sur les fichiers CV, lettre de motivation, etc.
SELECT 
    user_id,
    job_offer_id,
    (form_data->>'cv') as cv_info,
    (form_data->>'coverLetter') as lettre_motivation_info,
    (form_data->>'certificates') as diplomes_info,
    (form_data->>'additionalCertificates') as certificats_info,
    updated_at as derniere_sauvegarde
FROM application_drafts
WHERE user_id = '124c7c54-dd6b-4253-8f9f-133a5970fb11'
ORDER BY updated_at DESC;

-- 12. NOUVEAU : Vérifier tous les brouillons pour cette offre d'emploi
-- (pour comparer avec d'autres candidats)
SELECT 
    ad.user_id,
    ad.job_offer_id,
    u.first_name || ' ' || u.last_name as candidat,
    u.email,
    ad.updated_at as brouillon_modifie,
    CASE 
        WHEN (ad.form_data->>'cv') IS NOT NULL THEN 'Oui'
        ELSE 'Non'
    END as a_cv,
    CASE 
        WHEN (ad.form_data->>'coverLetter') IS NOT NULL THEN 'Oui'
        ELSE 'Non'
    END as a_lettre
FROM application_drafts ad
LEFT JOIN users u ON ad.user_id = u.id
WHERE ad.job_offer_id = (
    SELECT job_offer_id 
    FROM applications 
    WHERE id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
)
ORDER BY ad.updated_at DESC
LIMIT 10;

-- =====================================================
-- INSTRUCTIONS D'UTILISATION
-- =====================================================
-- 1. Exécutez ces requêtes dans l'ordre dans votre console Supabase
-- 2. Notez les résultats de chaque requête
-- 3. Les requêtes 3 et 4 sont les plus importantes pour identifier 
--    si les documents existent dans la base de données
-- 4. La requête 5 vous aidera à identifier des problèmes de permissions
-- 5. Les requêtes 6 et 7 vous aideront à comparer avec d'autres candidatures
-- 6. NOUVEAU : Les requêtes 10-12 vérifient les brouillons sauvegardés
-- =====================================================

