-- ============================================================================
-- INSERTION DE L'OFFRE MANQUANTE: Chef de Délégation Nord
-- ============================================================================
-- Exécutez cette requête dans votre BASE SOURCE pour générer l'INSERT
-- Puis copiez le résultat et exécutez-le dans votre BASE DESTINATION
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
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);' as INSERT_OFFRE_MANQUANTE
FROM public.job_offers
WHERE campaign_id = 3 
  AND title = 'Chef de Délégation Nord'
LIMIT 1;


