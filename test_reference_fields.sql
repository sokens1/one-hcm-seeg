-- Test pour vérifier que les colonnes de référence acceptent NULL
-- Exécutez ce script APRÈS avoir exécuté CORRECTION_FINALE_REFERENCES_NOT_NULL.sql

-- Test 1: Vérifier que les colonnes acceptent NULL
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name IN ('reference_full_name', 'reference_email', 'reference_contact', 'reference_company')
ORDER BY column_name;

-- Test 2: Essayer d'insérer une candidature avec des références NULL (simulation)
-- Note: Ce test ne sera pas exécuté automatiquement, mais vous pouvez l'utiliser pour tester manuellement

-- Test 3: Vérifier les données existantes
SELECT 
    id,
    candidate_id,
    job_offer_id,
    reference_full_name,
    reference_email,
    reference_contact,
    reference_company,
    created_at
FROM applications 
ORDER BY created_at DESC 
LIMIT 5;

-- Test 4: Compter les candidatures avec et sans références
SELECT 
    'Total candidatures' as type,
    COUNT(*) as count
FROM applications
UNION ALL
SELECT 
    'Avec références complètes' as type,
    COUNT(*) as count
FROM applications 
WHERE reference_full_name IS NOT NULL 
    AND reference_email IS NOT NULL 
    AND reference_contact IS NOT NULL 
    AND reference_company IS NOT NULL
UNION ALL
SELECT 
    'Sans références' as type,
    COUNT(*) as count
FROM applications 
WHERE reference_full_name IS NULL 
    AND reference_email IS NULL 
    AND reference_contact IS NULL 
    AND reference_company IS NULL;
