-- ============================================================================
-- SCRIPT D'INSERTION DES 39 OFFRES DE CAMPAGNE 3
-- À EXÉCUTER DANS LA BASE DESTINATION
-- ============================================================================

-- ÉTAPE 1: Insérer le recruteur
INSERT INTO public.users (id, email, matricule, role, first_name, last_name, phone, date_of_birth, candidate_status, created_at, updated_at) 
VALUES ('ff967d0b-e250-40dc-8cb6-fc16429dceed'::uuid, 'jessymac33@gmail.com', '0001', 'recruteur', 'Jessy', 'Mac Modifié', '+24162788840', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
ON CONFLICT (id) DO NOTHING;

-- ÉTAPE 2: Insérer les 39 offres
-- INSTRUCTIONS: 
-- 1. Retournez dans votre BASE SOURCE
-- 2. Exécutez le fichier: INSERT_32_OFFRES_MANQUANTES.sql
-- 3. Copiez TOUTES les 39 lignes INSERT du résultat
-- 4. Collez-les ICI (après cette ligne de commentaire)
-- 5. Exécutez ce fichier complet dans votre BASE DESTINATION

-- >>> COLLEZ ICI LES 39 INSERT GÉNÉRÉS <<<




-- ÉTAPE 3: Vérifications
SELECT COUNT(*) as total_offres FROM public.job_offers WHERE campaign_id = 3;
SELECT status, COUNT(*) FROM public.job_offers WHERE campaign_id = 3 GROUP BY status;
SELECT status_offerts, COUNT(*) FROM public.job_offers WHERE campaign_id = 3 GROUP BY status_offerts;

