-- ============================================================================
-- GUIDE COMPLET - CORRIGER LES 45 OFFRES AVEC TOUS LES CHAMPS
-- ============================================================================

-- ============================================================================
-- LISTE COMPLÈTE DES CHAMPS DE JOB_OFFERS (26 colonnes)
-- ============================================================================
-- ✅ Déjà insérés dans vos 45 offres:
--    1. id
--    2. recruiter_id
--    3. title
--    4. description
--    5. location
--    6. contract_type
--    7. status
--    8. status_offerts
--    9. campaign_id
--   10. created_at
--   11. updated_at
--
-- ❌ MANQUANTS (à ajouter):
--   12. department
--   13. salary_min
--   14. salary_max
--   15. requirements (TEXT[])
--   16. benefits (TEXT[])
--   17. application_deadline
--   18. reporting_line
--   19. job_grade
--   20. salary_note
--   21. start_date
--   22. responsibilities (TEXT[])
--   23. categorie_metier
--   24. date_limite
--   25. mtp_questions_metier (TEXT[])
--   26. mtp_questions_talent (TEXT[])
--   27. mtp_questions_paradigme (TEXT[])
-- ============================================================================


-- ============================================================================
-- ÉTAPE 1: METTRE À JOUR LES 45 OFFRES EXISTANTES
-- ============================================================================
-- A. Ouvrez votre BASE SOURCE
-- B. Exécutez le fichier: UPDATE_COMPLET_TOUS_LES_CHAMPS.sql
-- C. Copiez TOUTES les lignes UPDATE générées (environ 45 UPDATE)
-- D. Collez et exécutez dans votre BASE DESTINATION


-- ============================================================================
-- ÉTAPE 2: AJOUTER L'OFFRE MANQUANTE (Chef de Délégation Nord)
-- ============================================================================
-- A. Dans BASE SOURCE, exécutez: INSERT_CHEF_DELEGATION_NORD_COMPLET.sql
-- B. Copiez l'INSERT généré (avec TOUS les champs)
-- C. Collez et exécutez dans BASE DESTINATION


-- ============================================================================
-- ÉTAPE 3: VÉRIFICATIONS FINALES
-- ============================================================================

-- Nombre total
SELECT COUNT(*) as total FROM public.job_offers WHERE campaign_id = 3;
-- Résultat attendu: 46

-- Vérifier que tous les champs importants sont remplis
SELECT 
    title,
    CASE WHEN requirements IS NULL THEN '❌ MANQUE' ELSE '✅ OK' END as requirements,
    CASE WHEN benefits IS NULL THEN '❌ MANQUE' ELSE '✅ OK' END as benefits,
    CASE WHEN responsibilities IS NULL THEN '❌ MANQUE' ELSE '✅ OK' END as responsibilities,
    CASE WHEN reporting_line IS NULL THEN '❌ MANQUE' ELSE '✅ OK' END as reporting_line,
    CASE WHEN mtp_questions_metier IS NULL THEN '❌ MANQUE' ELSE '✅ OK' END as mtp_metier,
    CASE WHEN mtp_questions_talent IS NULL THEN '❌ MANQUE' ELSE '✅ OK' END as mtp_talent,
    CASE WHEN mtp_questions_paradigme IS NULL THEN '❌ MANQUE' ELSE '✅ OK' END as mtp_paradigme
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- Vérifier le contenu d'une offre complète
SELECT *
FROM public.job_offers
WHERE campaign_id = 3
LIMIT 1;


-- ============================================================================
-- FICHIERS À UTILISER DANS L'ORDRE:
-- ============================================================================
-- 1. UPDATE_COMPLET_TOUS_LES_CHAMPS.sql       -> Corriger les 45 offres
-- 2. INSERT_CHEF_DELEGATION_NORD_COMPLET.sql  -> Ajouter la 46ème offre
-- 3. Ce fichier (vérifications)               -> Valider le résultat

