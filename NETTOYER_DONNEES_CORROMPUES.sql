-- Script pour nettoyer les données corrompues dans la base de données
-- Ce script nettoie les réponses MTP qui contiennent des caractères & corrompus

-- Fonction de nettoyage SQL (équivalent de notre fonction cleanText)
CREATE OR REPLACE FUNCTION clean_corrupted_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Nettoyer les entités HTML standard
  input_text := replace(input_text, '&amp;', '&');
  input_text := replace(input_text, '&lt;', '<');
  input_text := replace(input_text, '&gt;', '>');
  input_text := replace(input_text, '&quot;', '"');
  input_text := replace(input_text, '&#39;', '''');
  input_text := replace(input_text, '&nbsp;', ' ');
  
  -- Supprimer toutes les autres entités HTML
  input_text := regexp_replace(input_text, '&[a-zA-Z0-9#]+;', '', 'g');
  
  -- Supprimer TOUS les caractères & restants (correction agressive)
  input_text := replace(input_text, '&', '');
  
  -- Supprimer les guillemets simples en début/fin
  input_text := regexp_replace(input_text, '^''|''$', '', 'g');
  
  -- Nettoyer les espaces en début/fin
  input_text := trim(input_text);
  
  RETURN input_text;
END;
$$ LANGUAGE plpgsql;

-- 1. Nettoyer les réponses MTP dans la table applications
UPDATE applications 
SET mtp_answers = jsonb_build_object(
  'metier', CASE 
    WHEN mtp_answers->>'metier' IS NOT NULL 
    THEN (
      SELECT jsonb_agg(clean_corrupted_text(elem::text))
      FROM jsonb_array_elements_text(mtp_answers->'metier') AS elem
    )
    ELSE mtp_answers->'metier'
  END,
  'talent', CASE 
    WHEN mtp_answers->>'talent' IS NOT NULL 
    THEN (
      SELECT jsonb_agg(clean_corrupted_text(elem::text))
      FROM jsonb_array_elements_text(mtp_answers->'talent') AS elem
    )
    ELSE mtp_answers->'talent'
  END,
  'paradigme', CASE 
    WHEN mtp_answers->>'paradigme' IS NOT NULL 
    THEN (
      SELECT jsonb_agg(clean_corrupted_text(elem::text))
      FROM jsonb_array_elements_text(mtp_answers->'paradigme') AS elem
    )
    ELSE mtp_answers->'paradigme'
  END
)
WHERE mtp_answers IS NOT NULL 
AND (
  mtp_answers::text LIKE '%&%' OR 
  mtp_answers::text LIKE '%''%'
);

-- 2. Nettoyer les champs de référence
UPDATE applications 
SET 
  reference_full_name = clean_corrupted_text(reference_full_name),
  reference_email = clean_corrupted_text(reference_email),
  reference_contact = clean_corrupted_text(reference_contact),
  reference_company = clean_corrupted_text(reference_company)
WHERE 
  reference_full_name LIKE '%&%' OR 
  reference_full_name LIKE '%''%' OR
  reference_email LIKE '%&%' OR 
  reference_email LIKE '%''%' OR
  reference_contact LIKE '%&%' OR 
  reference_contact LIKE '%''%' OR
  reference_company LIKE '%&%' OR 
  reference_company LIKE '%''%';

-- 3. Nettoyer les commentaires dans les évaluations Protocol 1
UPDATE protocol1_evaluations 
SET 
  cv_comments = clean_corrupted_text(cv_comments),
  lettre_motivation_comments = clean_corrupted_text(lettre_motivation_comments),
  diplomes_certificats_comments = clean_corrupted_text(diplomes_certificats_comments),
  metier_comments = clean_corrupted_text(metier_comments),
  talent_comments = clean_corrupted_text(talent_comments),
  paradigme_comments = clean_corrupted_text(paradigme_comments),
  interview_metier_comments = clean_corrupted_text(interview_metier_comments),
  interview_talent_comments = clean_corrupted_text(interview_talent_comments),
  interview_paradigme_comments = clean_corrupted_text(interview_paradigme_comments),
  gap_competence_comments = clean_corrupted_text(gap_competence_comments),
  general_summary = clean_corrupted_text(general_summary)
WHERE 
  cv_comments LIKE '%&%' OR cv_comments LIKE '%''%' OR
  lettre_motivation_comments LIKE '%&%' OR lettre_motivation_comments LIKE '%''%' OR
  diplomes_certificats_comments LIKE '%&%' OR diplomes_certificats_comments LIKE '%''%' OR
  metier_comments LIKE '%&%' OR metier_comments LIKE '%''%' OR
  talent_comments LIKE '%&%' OR talent_comments LIKE '%''%' OR
  paradigme_comments LIKE '%&%' OR paradigme_comments LIKE '%''%' OR
  interview_metier_comments LIKE '%&%' OR interview_metier_comments LIKE '%''%' OR
  interview_talent_comments LIKE '%&%' OR interview_talent_comments LIKE '%''%' OR
  interview_paradigme_comments LIKE '%&%' OR interview_paradigme_comments LIKE '%''%' OR
  gap_competence_comments LIKE '%&%' OR gap_competence_comments LIKE '%''%' OR
  general_summary LIKE '%&%' OR general_summary LIKE '%''%';

-- 4. Nettoyer les synthèses dans la table applications
UPDATE applications 
SET 
  synthesis_points_forts = clean_corrupted_text(synthesis_points_forts),
  synthesis_points_amelioration = clean_corrupted_text(synthesis_points_amelioration),
  synthesis_conclusion = clean_corrupted_text(synthesis_conclusion)
WHERE 
  synthesis_points_forts LIKE '%&%' OR synthesis_points_forts LIKE '%''%' OR
  synthesis_points_amelioration LIKE '%&%' OR synthesis_points_amelioration LIKE '%''%' OR
  synthesis_conclusion LIKE '%&%' OR synthesis_conclusion LIKE '%''%';

-- 5. Afficher un résumé des nettoyages effectués
SELECT 
  'Résumé du nettoyage' as operation,
  COUNT(*) as total_records_processed
FROM (
  SELECT 1 FROM applications WHERE mtp_answers IS NOT NULL AND mtp_answers::text LIKE '%&%'
  UNION ALL
  SELECT 1 FROM applications WHERE reference_full_name LIKE '%&%' OR reference_full_name LIKE '%''%'
  UNION ALL
  SELECT 1 FROM protocol1_evaluations WHERE cv_comments LIKE '%&%' OR cv_comments LIKE '%''%'
  UNION ALL
  SELECT 1 FROM applications WHERE synthesis_points_forts LIKE '%&%' OR synthesis_points_forts LIKE '%''%'
) as all_corrupted;

-- 6. Supprimer la fonction temporaire
DROP FUNCTION IF EXISTS clean_corrupted_text(TEXT);
