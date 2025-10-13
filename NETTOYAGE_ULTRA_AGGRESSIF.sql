-- NETTOYAGE ULTRA-AGRESSIF : Supprimer TOUS les caractères corrompus

-- 1. NETTOYER LES QUESTIONS OFFRES - Version ultra-agressive
UPDATE job_offers
SET mtp_questions_metier = ARRAY(
  SELECT TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(q, '[&]+', '', 'g'),  -- Supprimer TOUS les &
        '[''`´]+', '''', 'g'),               -- Remplacer toutes apostrophes par '
      '\s+', ' ', 'g')                       -- Normaliser espaces
  )
  FROM unnest(mtp_questions_metier) AS q
)
WHERE mtp_questions_metier IS NOT NULL;

UPDATE job_offers
SET mtp_questions_talent = ARRAY(
  SELECT TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(q, '[&]+', '', 'g'),
        '[''`´]+', '''', 'g'),
      '\s+', ' ', 'g')
  )
  FROM unnest(mtp_questions_talent) AS q
)
WHERE mtp_questions_talent IS NOT NULL;

UPDATE job_offers
SET mtp_questions_paradigme = ARRAY(
  SELECT TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(q, '[&]+', '', 'g'),
        '[''`´]+', '''', 'g'),
      '\s+', ' ', 'g')
  )
  FROM unnest(mtp_questions_paradigme) AS q
)
WHERE mtp_questions_paradigme IS NOT NULL;

-- 2. NETTOYER LES RÉPONSES CANDIDATURES - Version ultra-agressive
UPDATE applications
SET mtp_answers = jsonb_build_object(
  'metier', (
    SELECT jsonb_agg(
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(value::text, '[&]+', '', 'g'),
            '[''`´]+', '''', 'g'),
          '\s+', ' ', 'g')
      )::jsonb
    )
    FROM jsonb_array_elements(mtp_answers->'metier') AS value
  ),
  'talent', (
    SELECT jsonb_agg(
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(value::text, '[&]+', '', 'g'),
            '[''`´]+', '''', 'g'),
          '\s+', ' ', 'g')
      )::jsonb
    )
    FROM jsonb_array_elements(mtp_answers->'talent') AS value
  ),
  'paradigme', (
    SELECT jsonb_agg(
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(value::text, '[&]+', '', 'g'),
            '[''`´]+', '''', 'g'),
          '\s+', ' ', 'g')
      )::jsonb
    )
    FROM jsonb_array_elements(mtp_answers->'paradigme') AS value
  )
)
WHERE mtp_answers IS NOT NULL;

-- 3. VÉRIFICATION FINALE
SELECT 
  '✅ APRÈS NETTOYAGE' as verification,
  title,
  mtp_questions_metier[1] as question_exemple
FROM job_offers
WHERE mtp_questions_metier IS NOT NULL
LIMIT 3;

SELECT 
  '✅ RÉPONSES APRÈS NETTOYAGE' as verification,
  id,
  mtp_answers->'metier'->0 as reponse_exemple
FROM applications
WHERE mtp_answers IS NOT NULL
AND mtp_answers->'metier' IS NOT NULL
LIMIT 3;
