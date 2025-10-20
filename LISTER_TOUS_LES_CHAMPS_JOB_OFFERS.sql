-- ============================================================================
-- LISTER TOUS LES CHAMPS DE LA TABLE JOB_OFFERS
-- ============================================================================
-- Exécutez cette requête dans votre BASE SOURCE
-- Elle va afficher TOUTES les colonnes de la table job_offers
-- ============================================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'job_offers'
ORDER BY ordinal_position;

-- Cette requête vous donnera la liste COMPLÈTE de toutes les colonnes
-- Copiez le résultat et envoyez-le moi pour que je génère les UPDATE corrects


