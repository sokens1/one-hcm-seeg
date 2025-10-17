-- ============================================================================
-- SCRIPT D'INSERTION DES OFFRES DE CAMPAGNE 3 VERS UNE AUTRE BASE DE DONNÉES
-- Date: 2025-10-17
-- ============================================================================
--
-- IMPORTANT: Exécutez ce script dans la BASE DE DESTINATION
-- 
-- PRÉREQUIS:
-- 1. La base de destination doit avoir la même structure de tables
-- 2. Le recruteur (recruiter_id) doit déjà exister dans la base de destination
-- 3. Les contraintes et checks doivent être identiques
--
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: Récupérer d'abord toutes les colonnes de job_offers
-- (Exécutez cette requête pour voir la structure de votre table)
-- ============================================================================

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'job_offers'
ORDER BY ordinal_position;


-- ============================================================================
-- ÉTAPE 2: INSERTION DES OFFRES - VERSION COMPLÈTE
-- ============================================================================
-- Cette requête suppose que vous avez exporté les données depuis la base source
-- et que vous les insérez maintenant dans la base destination.

INSERT INTO public.job_offers (
    id,
    recruiter_id,
    title,
    description,
    location,
    contract_type,
    department,
    salary_min,
    salary_max,
    requirements,
    benefits,
    status,
    status_offerts,
    application_deadline,
    campaign_id,
    reporting_line,
    job_grade,
    salary_note,
    start_date,
    responsibilities,
    created_at,
    updated_at
)
VALUES
    ('59618fca-2a3c-427e-9c27-e9cbaafefd6e', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Support Clientèle', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('37063aa3-a5d6-4c87-98c9-0c21dba8a106', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Délégation Est', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('9191c869-bd2c-48de-ba0d-e78fbeeca51e', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Trésorerie', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('7f234ded-2567-4cbe-8ea8-2176fcab44c2', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Délégation Nord', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('fb44ebe8-c525-4cad-be39-1e880290b0d6', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Relations Clients', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('9eac4ba9-920f-43ff-82b0-00701f06f232', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Délégation Ntoum', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('49b4db78-817e-4fae-825e-dde2af10b510', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Délégation Centre Sud', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'active', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('f0b4ef90-746d-4031-8875-7c03cf60378d', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Etudes et Travaux Distribution Electricité', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('20cbfe9d-2697-4a6c-9bfc-b9e29a568a58', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Prépaiement', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('dfe03f66-aa4e-4e25-b03b-3e641acb6327', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Délégation Littoral', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('42db62f9-f5fd-410b-a890-07d27cb181d5', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Facturation Recouvrement', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('12cf3b15-ccd1-4ee0-a9cf-f5179f41c3cc', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Gestion du Parc Automobile', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('fe9c30af-658d-49ae-8f0c-cbfbc4f2dd39', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Audit Interne', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('87c07bbd-d2da-42df-a517-a0a40d9ecfe2', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Juridique', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('5c5ab609-0611-4253-9cdb-d8f7a8e1c209', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Communication', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c6a9ca68-3102-4c92-bf2c-489f31e18da3', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Production Hydraulique', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('798df99b-9c06-4d7f-8e18-6169f7d2e133', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Contrôle', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ad110298-32b1-4ee4-a9ad-6dd01ece8e39', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Transport Logistique & Transport', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('17b75fa2-9aa8-4ab3-bc47-d89ec5e12a8f', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Gestion du Patrimoine et Sûreté', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ea109ce5-b12b-418f-a7fe-b59e85563ca7', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Etudes et Travaux Production Electricité', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('1b0d2513-f2de-476f-b5e7-6a152ab1734e', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Etudes et Travaux Transport Electricité', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'active', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('5c98795b-79b2-4da1-afdd-e97aef5b7ba3', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Achats et Stocks', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('2fa79748-3583-4f5d-adfb-860cc9527e2c', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Qualité et Performance Opérationnelle (Eau)', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('08df648d-688a-439e-8fbf-e095742ca5ed', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Etudes et Travaux Neufs Eau', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c8c35e72-a55b-4d06-8558-58795ceb1c29', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Support Technique Eau', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c86744f9-7327-4711-9ed6-ad2fcdf6a64a', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Cyber sécurité et Données', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('2bf0d17a-f508-4e8e-921c-1dd2de2de9fc', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Applications, Bases de données et Digitalisation', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('57d8a4fd-6d70-4313-8baf-1901509f7428', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Hygiène Sécurité Environnement et Gestion des Risques', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('6a6e9d22-84f8-417a-893c-6886d27a6910', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Infrastructures Réseaux', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('1e37502e-60d9-4a0a-bc50-8ec81493f09e', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division SIG et Cartographie', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b4a810fd-2daa-4300-9765-9950150e70b4', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Responsabilité Sociétale d''Entreprise', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('4f184497-e02d-4336-9d74-9cb06843de2c', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Comptable', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('3f9bd554-b82e-4d85-9f2a-a783333837f4', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Budget et Contrôle de Gestion', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('6ce730ad-abc9-48ef-b85e-c8902f786f9d', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Maintenance Spécialisée Nationale (Electricité)', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b9877c9f-1dfe-4b7f-bafd-5d9a1c250efd', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Distribution Electricité', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('8c1b12a9-613d-4846-a19c-da07b2bf95db', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Production Thermique', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b97e066d-2e99-4132-bbc2-32703ad3ae6e', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef de Division Transport et Mouvement d''Energie', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('050e1910-bb41-4abf-ad7a-9110564b2797', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef Division Conduite', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('2613721b-0889-4eba-84b2-ee1abaea8ae4', 'ff967d0b-e250-40dc-8cb6-fc16429dceed', 'Chef Division Maintenance Spécialisée Nationale (Eau)', '', 'Libreville', 'CDI avec période d''essai', NULL, NULL, NULL, NULL, NULL, 'draft', 'interne', NULL, 3, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Vérifier l'insertion
SELECT COUNT(*) as nombre_offres_inserees FROM public.job_offers WHERE campaign_id = 3;


-- ============================================================================
-- ÉTAPE 3: ALTERNATIVE - INSERT ... SELECT depuis une autre base
-- ============================================================================
-- Si vous avez accès aux deux bases simultanément (via dblink par exemple),
-- utilisez cette approche:

/*
-- Installer l'extension dblink si nécessaire
CREATE EXTENSION IF NOT EXISTS dblink;

-- Connexion à la base source
INSERT INTO public.job_offers (
    id, recruiter_id, title, description, location, contract_type, 
    department, salary_min, salary_max, requirements, benefits, 
    status, status_offerts, application_deadline, campaign_id,
    reporting_line, job_grade, salary_note, start_date, responsibilities,
    created_at, updated_at
)
SELECT 
    id, recruiter_id, title, description, location, contract_type, 
    department, salary_min, salary_max, requirements, benefits, 
    status, status_offerts, application_deadline, campaign_id,
    reporting_line, job_grade, salary_note, start_date, responsibilities,
    COALESCE(created_at, CURRENT_TIMESTAMP), 
    COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM dblink(
    'dbname=base_source host=localhost user=postgres password=votrepassword',
    'SELECT id, recruiter_id, title, description, location, contract_type, 
            department, salary_min, salary_max, requirements, benefits, 
            status, status_offerts, application_deadline, campaign_id,
            reporting_line, job_grade, salary_note, start_date, responsibilities,
            created_at, updated_at
     FROM public.job_offers 
     WHERE campaign_id = 3'
) AS t(
    id uuid, recruiter_id text, title text, description text, 
    location text, contract_type text, department text, 
    salary_min integer, salary_max integer, requirements text[], benefits text[], 
    status text, status_offerts text, application_deadline date, campaign_id integer,
    reporting_line text, job_grade text, salary_note text, start_date date, 
    responsibilities text[], created_at timestamptz, updated_at timestamptz
);
*/


-- ============================================================================
-- ÉTAPE 4: VÉRIFICATIONS POST-INSERTION
-- ============================================================================

-- Vérifier le nombre d'offres insérées
SELECT 
    COUNT(*) as total_offres,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as offres_actives,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as offres_brouillon
FROM public.job_offers 
WHERE campaign_id = 3;

-- Vérifier que le recruteur existe
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(jo.id) as nombre_offres_creees
FROM public.users u
LEFT JOIN public.job_offers jo ON u.id = jo.recruiter_id::uuid
WHERE u.id = 'ff967d0b-e250-40dc-8cb6-fc16429dceed'
GROUP BY u.id, u.first_name, u.last_name, u.email;


-- Liste des offres insérées
SELECT 
    id,
    title,
    status,
    status_offerts,
    created_at
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

