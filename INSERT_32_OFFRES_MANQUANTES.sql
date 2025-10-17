-- ============================================================================
-- REQUÊTE POUR GÉNÉRER LES INSERT DES 32 OFFRES MANQUANTES
-- ============================================================================
-- Exécutez cette requête dans votre BASE SOURCE
-- Elle va générer 39 INSERT (toutes les offres de Jessy Mac)
-- Copiez TOUTES les lignes de résultat
-- Collez et exécutez dans votre BASE DESTINATION
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
    '3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);' as insert_offre
FROM public.job_offers
WHERE campaign_id = 3
  AND recruiter_id = 'ff967d0b-e250-40dc-8cb6-fc16429dceed'
ORDER BY title;

