-- Script de nettoyage RAPIDE pour corriger immédiatement les problèmes
-- À exécuter en premier dans Supabase

-- 1. Nettoyer les champs de référence corrompus
UPDATE applications 
SET 
  reference_full_name = CASE 
    WHEN reference_full_name LIKE '%&%' OR reference_full_name LIKE '%''%' 
    THEN TRIM(REGEXP_REPLACE(REGEXP_REPLACE(reference_full_name, '&[^&]*', '', 'g'), '''', '', 'g'))
    ELSE reference_full_name 
  END,
  reference_email = CASE 
    WHEN reference_email LIKE '%&%' OR reference_email LIKE '%''%' 
    THEN TRIM(REGEXP_REPLACE(REGEXP_REPLACE(reference_email, '&[^&]*', '', 'g'), '''', '', 'g'))
    ELSE reference_email 
  END,
  reference_contact = CASE 
    WHEN reference_contact LIKE '%&%' OR reference_contact LIKE '%''%' 
    THEN TRIM(REGEXP_REPLACE(REGEXP_REPLACE(reference_contact, '&[^&]*', '', 'g'), '''', '', 'g'))
    ELSE reference_contact 
  END,
  reference_company = CASE 
    WHEN reference_company LIKE '%&%' OR reference_company LIKE '%''%' 
    THEN TRIM(REGEXP_REPLACE(REGEXP_REPLACE(reference_company, '&[^&]*', '', 'g'), '''', '', 'g'))
    ELSE reference_company 
  END
WHERE 
  reference_full_name LIKE '%&%' OR reference_full_name LIKE '%''%' OR
  reference_email LIKE '%&%' OR reference_email LIKE '%''%' OR
  reference_contact LIKE '%&%' OR reference_contact LIKE '%''%' OR
  reference_company LIKE '%&%' OR reference_company LIKE '%''%';

-- 2. Nettoyer les réponses MTP corrompues (approche simplifiée)
UPDATE applications 
SET mtp_answers = CASE 
  WHEN mtp_answers::text LIKE '%&%' OR mtp_answers::text LIKE '%''%'
  THEN (
    SELECT jsonb_build_object(
      'metier', COALESCE(
        (SELECT jsonb_agg(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(elem::text, '&[^&]*', '', 'g'), '''', '', 'g')))
         FROM jsonb_array_elements_text(mtp_answers->'metier') AS elem
         WHERE elem::text NOT LIKE '%&%' AND elem::text NOT LIKE '%''%' 
         OR TRIM(REGEXP_REPLACE(REGEXP_REPLACE(elem::text, '&[^&]*', '', 'g'), '''', '', 'g')) != ''),
        '[]'::jsonb
      ),
      'talent', COALESCE(
        (SELECT jsonb_agg(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(elem::text, '&[^&]*', '', 'g'), '''', '', 'g')))
         FROM jsonb_array_elements_text(mtp_answers->'talent') AS elem
         WHERE elem::text NOT LIKE '%&%' AND elem::text NOT LIKE '%''%' 
         OR TRIM(REGEXP_REPLACE(REGEXP_REPLACE(elem::text, '&[^&]*', '', 'g'), '''', '', 'g')) != ''),
        '[]'::jsonb
      ),
      'paradigme', COALESCE(
        (SELECT jsonb_agg(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(elem::text, '&[^&]*', '', 'g'), '''', '', 'g')))
         FROM jsonb_array_elements_text(mtp_answers->'paradigme') AS elem
         WHERE elem::text NOT LIKE '%&%' AND elem::text NOT LIKE '%''%' 
         OR TRIM(REGEXP_REPLACE(REGEXP_REPLACE(elem::text, '&[^&]*', '', 'g'), '''', '', 'g')) != ''),
        '[]'::jsonb
      )
    )
  )
  ELSE mtp_answers
END
WHERE mtp_answers IS NOT NULL 
AND (mtp_answers::text LIKE '%&%' OR mtp_answers::text LIKE '%''%');

-- 3. Vérifier les résultats
SELECT 
  'Résumé du nettoyage' as operation,
  COUNT(*) as total_applications,
  COUNT(reference_full_name) as with_full_name,
  COUNT(reference_email) as with_email,
  COUNT(reference_contact) as with_contact,
  COUNT(reference_company) as with_company
FROM applications;

-- 4. Afficher quelques exemples de données nettoyées
SELECT 
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
  END as total_mtp_answers
FROM applications 
ORDER BY created_at DESC 
LIMIT 5;
