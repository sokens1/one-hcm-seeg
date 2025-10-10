-- ÉTAPE 4 : Vérifier que tout est correct
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'job_offers'
AND column_name IN ('status', 'status_offerts', 'mtp_questions_metier', 'mtp_questions_talent', 'mtp_questions_paradigme', 'id')
ORDER BY column_name;

