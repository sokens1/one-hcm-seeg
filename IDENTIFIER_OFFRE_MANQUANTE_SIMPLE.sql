-- ============================================================================
-- IDENTIFIER L'OFFRE MANQUANTE - MÉTHODE SIMPLE
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: Exécutez dans votre BASE SOURCE
-- ============================================================================

SELECT 
    ROW_NUMBER() OVER (ORDER BY title) as numero,
    title as titre_offre,
    status
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- Comptez le nombre de lignes: devrait être 39 ou 46


-- ============================================================================
-- ÉTAPE 2: Exécutez dans votre BASE DESTINATION
-- ============================================================================

SELECT 
    ROW_NUMBER() OVER (ORDER BY title) as numero,
    title as titre_offre,
    status
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- Comptez le nombre de lignes: vous avez 45


-- ============================================================================
-- ÉTAPE 3: VÉRIFICATION RAPIDE DES OFFRES ACTIVES
-- ============================================================================

-- Dans BASE DESTINATION: combien d'offres actives avez-vous ?
SELECT COUNT(*) as nombre_actives
FROM public.job_offers
WHERE campaign_id = 3 AND status = 'active';

-- Si < 2, il manque une offre active !

-- Liste des offres actives
SELECT id, title
FROM public.job_offers
WHERE campaign_id = 3 AND status = 'active';


-- ============================================================================
-- ÉTAPE 4: LISTE DE CONTRÔLE DES 39 OFFRES DE JESSY MAC
-- ============================================================================

-- Vérifiez si vous avez ces offres (cochez mentalement):

SELECT title 
FROM public.job_offers 
WHERE campaign_id = 3 AND recruiter_id = 'ff967d0b-e250-40dc-8cb6-fc16429dceed'
ORDER BY title;

-- Liste attendue (39 offres):
-- 1. Chef de Délégation Centre Sud (ACTIVE)
-- 2. Chef de Délégation Est
-- 3. Chef de Délégation Littoral
-- 4. Chef de Délégation Nord
-- 5. Chef de Délégation Ntoum
-- 6. Chef de Division Achats et Stocks
-- 7. Chef de Division Applications, Bases de données et Digitalisation
-- 8. Chef de Division Audit Interne
-- 9. Chef de Division Budget et Contrôle de Gestion
-- 10. Chef de Division Communication
-- 11. Chef de Division Comptable
-- 12. Chef de Division Contrôle
-- 13. Chef de Division Cyber sécurité et Données
-- 14. Chef de Division Distribution Electricité
-- 15. Chef de Division Etudes et Travaux Distribution Electricité
-- 16. Chef de Division Etudes et Travaux Neufs Eau
-- 17. Chef de Division Etudes et Travaux Production Electricité
-- 18. Chef de Division Etudes et Travaux Transport Electricité (ACTIVE)
-- 19. Chef de Division Facturation Recouvrement
-- 20. Chef de Division Gestion du Parc Automobile
-- 21. Chef de Division Gestion du Patrimoine et Sûreté
-- 22. Chef de Division Hygiène Sécurité Environnement et Gestion des Risques
-- 23. Chef de Division Infrastructures Réseaux
-- 24. Chef de Division Juridique
-- 25. Chef de Division Maintenance Spécialisée Nationale (Electricité)
-- 26. Chef de Division Maintenance Spécialisée Nationale (Eau)
-- 27. Chef de Division Prépaiement
-- 28. Chef de Division Production Hydraulique
-- 29. Chef de Division Production Thermique
-- 30. Chef de Division Qualité et Performance Opérationnelle (Eau)
-- 31. Chef de Division Relations Clients
-- 32. Chef de Division Responsabilité Sociétale d'Entreprise
-- 33. Chef de Division SIG et Cartographie
-- 34. Chef de Division Support Clientèle
-- 35. Chef de Division Support Technique Eau
-- 36. Chef de Division Transport et Mouvement d'Energie
-- 37. Chef de Division Transport Logistique & Transport
-- 38. Chef de Division Trésorerie
-- 39. Chef Division Conduite


