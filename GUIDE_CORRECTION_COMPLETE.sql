-- ============================================================================
-- GUIDE COMPLET POUR CORRIGER LES 45 OFFRES + AJOUTER LA 46ème
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: VÉRIFIER LES CHAMPS MANQUANTS (OPTIONNEL)
-- ============================================================================
-- Dans BASE DESTINATION, vérifiez d'abord quels champs manquent:

SELECT 
    COUNT(*) as total_offres,
    COUNT(department) as avec_department,
    COUNT(requirements) as avec_requirements,
    COUNT(benefits) as avec_benefits,
    COUNT(reporting_line) as avec_reporting_line
FROM public.job_offers
WHERE campaign_id = 3;

-- Si les colonnes "avec_XXX" sont < au total, ces champs manquent !


-- ============================================================================
-- ÉTAPE 2: GÉNÉRER LES UPDATE POUR LES 45 OFFRES EXISTANTES
-- ============================================================================
-- A. Dans BASE SOURCE, exécutez le fichier: AJOUTER_CHAMPS_MANQUANTS_45_OFFRES.sql
-- B. Copiez TOUTES les lignes UPDATE générées (environ 45 lignes)
-- C. Collez et exécutez dans BASE DESTINATION


-- ============================================================================
-- ÉTAPE 3: AJOUTER L'OFFRE MANQUANTE (Chef de Délégation Nord)
-- ============================================================================
-- A. Dans BASE SOURCE, exécutez le fichier: INSERT_OFFRE_MANQUANTE_COMPLETE.sql
-- B. Copiez la ligne INSERT générée
-- C. Collez et exécutez dans BASE DESTINATION


-- ============================================================================
-- ÉTAPE 4: VÉRIFICATIONS FINALES
-- ============================================================================

-- Nombre total d'offres
SELECT COUNT(*) as total FROM public.job_offers WHERE campaign_id = 3;
-- Résultat attendu: 46

-- Vérifier que tous les champs sont remplis
SELECT 
    title,
    CASE WHEN department IS NULL THEN '❌' ELSE '✅' END as department,
    CASE WHEN requirements IS NULL THEN '❌' ELSE '✅' END as requirements,
    CASE WHEN benefits IS NULL THEN '❌' ELSE '✅' END as benefits,
    CASE WHEN reporting_line IS NULL THEN '❌' ELSE '✅' END as reporting_line
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- Tous les champs doivent avoir ✅ ou NULL si réellement vide dans la source

-- Vérifier par statut
SELECT status, COUNT(*) FROM public.job_offers WHERE campaign_id = 3 GROUP BY status;
-- Résultat attendu: active: 2-3, draft: 43-44

-- ============================================================================
-- RÉSUMÉ DES FICHIERS À UTILISER:
-- ============================================================================
-- 1. AJOUTER_CHAMPS_MANQUANTS_45_OFFRES.sql      -> Pour corriger les 45 offres
-- 2. INSERT_OFFRE_MANQUANTE_COMPLETE.sql         -> Pour ajouter la 46ème offre
-- 3. VERIFIER_CHAMPS_MANQUANTS.sql               -> Pour vérifier les champs
-- 4. Ce fichier (GUIDE_CORRECTION_COMPLETE.sql)  -> Ce guide

