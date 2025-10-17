-- ============================================================================
-- GÉNÉRER L'INSERT DE L'OFFRE MANQUANTE
-- ============================================================================
-- Exécutez cette requête dans votre BASE SOURCE
-- Elle va générer l'INSERT pour UNE offre spécifique que vous identifiez
-- ============================================================================

-- OPTION 1: Si vous connaissez le TITRE de l'offre manquante
-- Remplacez 'TITRE_DE_L_OFFRE_MANQUANTE' par le vrai titre

SELECT 
    'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, status, status_offerts, campaign_id, created_at, updated_at) VALUES (' ||
    quote_literal(id::text) || '::uuid, ' ||
    quote_literal(recruiter_id) || ', ' ||
    quote_literal(title) || ', ' ||
    quote_literal(REPLACE(COALESCE(description, ''), '''', '''''')) || ', ' ||
    quote_literal(location) || ', ' ||
    quote_literal(contract_type) || ', ' ||
    quote_literal(status) || ', ' ||
    CASE WHEN status_offerts IS NULL THEN 'NULL' ELSE quote_literal(status_offerts) END || ', ' ||
    campaign_id::text || ', ' ||
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);' as INSERT_A_EXECUTER
FROM public.job_offers
WHERE campaign_id = 3 
  AND title = 'TITRE_DE_L_OFFRE_MANQUANTE'  -- <<< REMPLACEZ ICI
LIMIT 1;


-- ============================================================================
-- OPTION 2: Si vous connaissez l'ID de l'offre manquante
-- Remplacez 'ID_DE_L_OFFRE' par le vrai UUID
-- ============================================================================

SELECT 
    'INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, status, status_offerts, campaign_id, created_at, updated_at) VALUES (' ||
    quote_literal(id::text) || '::uuid, ' ||
    quote_literal(recruiter_id) || ', ' ||
    quote_literal(title) || ', ' ||
    quote_literal(REPLACE(COALESCE(description, ''), '''', '''''')) || ', ' ||
    quote_literal(location) || ', ' ||
    quote_literal(contract_type) || ', ' ||
    quote_literal(status) || ', ' ||
    CASE WHEN status_offerts IS NULL THEN 'NULL' ELSE quote_literal(status_offerts) END || ', ' ||
    campaign_id::text || ', ' ||
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);' as INSERT_A_EXECUTER
FROM public.job_offers
WHERE id = 'ID_DE_L_OFFRE'::uuid;  -- <<< REMPLACEZ ICI


-- ============================================================================
-- OPTION 3: VÉRIFICATION - Offres qui pourraient manquer
-- ============================================================================

-- Vérifiez d'abord dans BASE DESTINATION si vous avez bien ces offres critiques:

-- Les 2 offres ACTIVES (prioritaires)
SELECT title FROM public.job_offers WHERE campaign_id = 3 AND id = '49b4db78-817e-4fae-825e-dde2af10b510'::uuid;
-- Résultat attendu: Chef de Délégation Centre Sud

SELECT title FROM public.job_offers WHERE campaign_id = 3 AND id = '1b0d2513-f2de-476f-b5e7-6a152ab1734e'::uuid;
-- Résultat attendu: Chef de Division Etudes et Travaux Transport Electricité

-- Si l'une d'elles ne retourne RIEN, c'est celle qui manque !

