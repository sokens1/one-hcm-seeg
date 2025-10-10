-- Script de vérification : Questions MTP en base de données
-- Exécutez ce script dans l'éditeur SQL de Supabase pour vérifier les données

-- 1. Vérifier que les colonnes existent
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'job_offers'
AND column_name IN ('mtp_questions_metier', 'mtp_questions_talent', 'mtp_questions_paradigme', 'status_offerts')
ORDER BY column_name;

-- 2. Voir toutes les offres avec leurs questions MTP
SELECT 
    id,
    title,
    status_offerts,
    array_length(mtp_questions_metier, 1) as nb_metier,
    array_length(mtp_questions_talent, 1) as nb_talent,
    array_length(mtp_questions_paradigme, 1) as nb_paradigme,
    created_at
FROM job_offers
ORDER BY created_at DESC
LIMIT 20;

-- 3. Afficher les questions d'une offre spécifique (remplacez 'VOTRE_ID' par l'ID réel)
-- SELECT 
--     title,
--     status_offerts,
--     mtp_questions_metier,
--     mtp_questions_talent,
--     mtp_questions_paradigme
-- FROM job_offers
-- WHERE id = 'VOTRE_ID';

-- 4. Compter les offres avec et sans questions MTP personnalisées
SELECT 
    'Avec questions Métier' as type,
    COUNT(*) as nombre
FROM job_offers
WHERE mtp_questions_metier IS NOT NULL 
AND array_length(mtp_questions_metier, 1) > 0

UNION ALL

SELECT 
    'Sans questions Métier' as type,
    COUNT(*) as nombre
FROM job_offers
WHERE mtp_questions_metier IS NULL 
OR array_length(mtp_questions_metier, 1) IS NULL
OR array_length(mtp_questions_metier, 1) = 0;

