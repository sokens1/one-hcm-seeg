-- NETTOYAGE URGENT DES APOSTROPHES CORROMPUES DANS LA BASE DE DONNÉES
-- Ce script remplace TOUTES les apostrophes corrompues par des apostrophes simples

-- 1. Nettoyer les questions MTP Métier
UPDATE job_offers
SET mtp_questions_metier = (
  SELECT ARRAY_AGG(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(elem, '''', ''''),  -- ' → '
          ''', ''''),                 -- ' → '
        '`', ''''),                   -- ` → '
      '´', '''')                      -- ´ → '
  )
  FROM unnest(mtp_questions_metier) AS elem
)
WHERE mtp_questions_metier IS NOT NULL;

-- 2. Nettoyer les questions MTP Talent
UPDATE job_offers
SET mtp_questions_talent = (
  SELECT ARRAY_AGG(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(elem, '''', ''''),
          ''', ''''),
        '`', ''''),
      '´', '''')
  )
  FROM unnest(mtp_questions_talent) AS elem
)
WHERE mtp_questions_talent IS NOT NULL;

-- 3. Nettoyer les questions MTP Paradigme
UPDATE job_offers
SET mtp_questions_paradigme = (
  SELECT ARRAY_AGG(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(elem, '''', ''''),
          ''', ''''),
        '`', ''''),
      '´', '''')
  )
  FROM unnest(mtp_questions_paradigme) AS elem
)
WHERE mtp_questions_paradigme IS NOT NULL;

-- 4. Nettoyer les réponses MTP dans les applications (si corrompues)
UPDATE applications
SET mtp_answers = jsonb_build_object(
  'metier', CASE 
    WHEN mtp_answers->'metier' IS NOT NULL THEN (
      SELECT jsonb_agg(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(value::text, '''', ''''),
              ''', ''''),
            '`', ''''),
          '´', '''')::jsonb
      )
      FROM jsonb_array_elements(mtp_answers->'metier') AS value
    )
    ELSE mtp_answers->'metier'
  END,
  'talent', CASE 
    WHEN mtp_answers->'talent' IS NOT NULL THEN (
      SELECT jsonb_agg(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(value::text, '''', ''''),
              ''', ''''),
            '`', ''''),
          '´', '''')::jsonb
      )
      FROM jsonb_array_elements(mtp_answers->'talent') AS value
    )
    ELSE mtp_answers->'talent'
  END,
  'paradigme', CASE 
    WHEN mtp_answers->'paradigme' IS NOT NULL THEN (
      SELECT jsonb_agg(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(value::text, '''', ''''),
              ''', ''''),
            '`', ''''),
          '´', '''')::jsonb
      )
      FROM jsonb_array_elements(mtp_answers->'paradigme') AS value
    )
    ELSE mtp_answers->'paradigme'
  END
)
WHERE mtp_answers IS NOT NULL;

-- Vérification finale
SELECT 
  '✅ QUESTIONS MTP OFFRES' as verification,
  title,
  mtp_questions_metier[1] as exemple_question
FROM job_offers
WHERE mtp_questions_metier IS NOT NULL
LIMIT 3;

SELECT 
  '✅ RÉPONSES MTP CANDIDATURES' as verification,
  id,
  mtp_answers->'metier'->0 as exemple_reponse
FROM applications
WHERE mtp_answers IS NOT NULL
LIMIT 3;
