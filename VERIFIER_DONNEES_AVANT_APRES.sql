-- Script pour vérifier les données AVANT et APRÈS le nettoyage
-- Exécuter AVANT le nettoyage, puis APRÈS

-- 1. Compter les données corrompues AVANT nettoyage
SELECT 
  'AVANT NETTOYAGE' as periode,
  COUNT(*) as total_applications,
  COUNT(CASE WHEN reference_full_name LIKE '%&%' OR reference_full_name LIKE '%''%' THEN 1 END) as ref_full_name_corrupted,
  COUNT(CASE WHEN reference_email LIKE '%&%' OR reference_email LIKE '%''%' THEN 1 END) as ref_email_corrupted,
  COUNT(CASE WHEN reference_contact LIKE '%&%' OR reference_contact LIKE '%''%' THEN 1 END) as ref_contact_corrupted,
  COUNT(CASE WHEN reference_company LIKE '%&%' OR reference_company LIKE '%''%' THEN 1 END) as ref_company_corrupted,
  COUNT(CASE WHEN mtp_answers::text LIKE '%&%' OR mtp_answers::text LIKE '%''%' THEN 1 END) as mtp_corrupted
FROM applications;

-- 2. Afficher des exemples de données corrompues
SELECT 
  'EXEMPLES DE DONNÉES CORROMPUES' as type,
  id,
  reference_full_name,
  reference_email,
  reference_contact,
  reference_company,
  CASE 
    WHEN mtp_answers IS NOT NULL 
    THEN jsonb_array_length(COALESCE(mtp_answers->'metier', '[]'::jsonb)) +
         jsonb_array_length(COALESCE(mtp_answers->'talent', '[]'::jsonb)) +
         jsonb_array_length(COALESCE(mtp_answers->'paradigme', '[]'::jsonb))
    ELSE 0 
  END as total_mtp_answers,
  mtp_answers::text as mtp_raw
FROM applications 
WHERE 
  reference_full_name LIKE '%&%' OR reference_full_name LIKE '%''%' OR
  reference_email LIKE '%&%' OR reference_email LIKE '%''%' OR
  reference_contact LIKE '%&%' OR reference_contact LIKE '%''%' OR
  reference_company LIKE '%&%' OR reference_company LIKE '%''%' OR
  mtp_answers::text LIKE '%&%' OR mtp_answers::text LIKE '%''%'
ORDER BY created_at DESC 
LIMIT 3;

-- 3. Vérifier les contraintes NOT NULL
SELECT 
  'CONTRAINTES NOT NULL' as check_type,
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name IN ('reference_full_name', 'reference_email', 'reference_contact', 'reference_company')
ORDER BY column_name;
