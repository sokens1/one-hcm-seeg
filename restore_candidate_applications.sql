-- Script de restauration des candidatures du candidat supprimé par erreur
-- ID du candidat à restaurer : ab70c5ab-339c-4529-a5eb-ee3ca694e56f

-- 1. Vérifier que le candidat existe dans la table users (doit être restauré d'abord)
SELECT 
    id,
    email,
    first_name,
    last_name,
    role
FROM public.users 
WHERE id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f';

-- 2. Rechercher des traces de candidatures dans les logs ou tables d'audit
-- Vérifier s'il y a des références dans les tables d'évaluation
SELECT 
    'protocol1_evaluations' as table_name,
    pe.application_id,
    pe.evaluator_id,
    pe.created_at
FROM public.protocol1_evaluations pe
JOIN public.applications a ON pe.application_id = a.id
WHERE a.candidate_id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f'

UNION ALL

SELECT 
    'protocol2_evaluations' as table_name,
    pe.application_id,
    pe.evaluator_id,
    pe.created_at
FROM public.protocol2_evaluations pe
JOIN public.applications a ON pe.application_id = a.id
WHERE a.candidate_id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f'

UNION ALL

SELECT 
    'application_documents' as table_name,
    ad.application_id,
    NULL as evaluator_id,
    ad.uploaded_at as created_at
FROM public.application_documents ad
JOIN public.applications a ON ad.application_id = a.id
WHERE a.candidate_id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f';

-- 3. Vérifier s'il y a des candidatures orphelines (sans candidat)
SELECT 
    a.id as application_id,
    a.job_offer_id,
    a.status,
    a.created_at,
    jo.title as job_title,
    jo.status_offerts
FROM public.applications a
LEFT JOIN public.job_offers jo ON a.job_offer_id = jo.id
WHERE a.candidate_id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f';

-- 4. Script de restauration des candidatures (à adapter selon les données trouvées)
-- Ce script restaure les candidatures basé sur les données trouvées dans les tables liées

-- Exemple de restauration d'une candidature (à adapter selon vos données)
-- Remplacez les valeurs par les vraies données de votre candidat

/*
INSERT INTO public.applications (
    id,
    candidate_id,
    job_offer_id,
    cover_letter,
    status,
    motivation,
    availability_start,
    reference_full_name,
    reference_email,
    reference_contact,
    reference_company,
    has_been_manager,
    candidature_status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(), -- Nouvel ID pour la candidature
    'ab70c5ab-339c-4529-a5eb-ee3ca694e56f', -- ID du candidat
    'ID_DE_L_OFFRE_EMPLOI', -- ID de l'offre d'emploi (à remplacer)
    'Lettre de motivation du candidat', -- Lettre de motivation
    'candidature', -- Statut initial
    'Motivation du candidat', -- Motivation
    '2025-01-20', -- Date de disponibilité
    '["Nom Référence 1", "Nom Référence 2"]', -- Références (format JSON)
    '["ref1@email.com", "ref2@email.com"]', -- Emails des références
    '["+241123456789", "+241987654321"]', -- Contacts des références
    '["Entreprise 1", "Entreprise 2"]', -- Entreprises des références
    false, -- A-t-il été manager
    'externe', -- Statut de candidature (interne/externe)
    now(), -- Date de création
    now() -- Date de mise à jour
);
*/

-- 5. Script pour restaurer les documents de candidature (si nécessaire)
/*
INSERT INTO public.application_documents (
    id,
    application_id,
    document_type,
    file_name,
    file_url,
    file_size,
    uploaded_at
) VALUES (
    gen_random_uuid(),
    'ID_DE_LA_CANDIDATURE', -- ID de la candidature restaurée
    'cv',
    'cv_candidat.pdf',
    'https://votre-storage.com/cv_candidat.pdf',
    1024000, -- Taille en bytes
    now()
);
*/

-- 6. Script pour restaurer les évaluations (si nécessaire)
/*
-- Protocole 1
INSERT INTO public.protocol1_evaluations (
    id,
    application_id,
    evaluator_id,
    documents_verified,
    adherence_metier,
    adherence_talent,
    adherence_paradigme,
    metier_notes,
    talent_notes,
    paradigme_notes,
    overall_score,
    completed,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'ID_DE_LA_CANDIDATURE',
    'ID_DU_RECRUTEUR',
    false,
    false,
    false,
    false,
    'Notes métier',
    'Notes talent',
    'Notes paradigme',
    0,
    false,
    now(),
    now()
);

-- Protocole 2
INSERT INTO public.protocol2_evaluations (
    id,
    application_id,
    evaluator_id,
    technical_score,
    behavioral_score,
    cultural_fit_score,
    overall_score,
    notes,
    completed,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'ID_DE_LA_CANDIDATURE',
    'ID_DU_RECRUTEUR',
    0,
    0,
    0,
    0,
    'Notes d\'évaluation',
    false,
    now(),
    now()
);
*/

-- 7. Vérification finale après restauration
SELECT 
    a.id as application_id,
    a.status,
    a.created_at,
    jo.title as job_title,
    u.first_name,
    u.last_name,
    u.email
FROM public.applications a
JOIN public.job_offers jo ON a.job_offer_id = jo.id
JOIN public.users u ON a.candidate_id = u.id
WHERE a.candidate_id = 'ab70c5ab-339c-4529-a5eb-ee3ca694e56f'
ORDER BY a.created_at DESC;

-- 8. Instructions pour l'utilisation
/*
INSTRUCTIONS D'UTILISATION :

1. Exécutez d'abord le script restore_candidate.sql pour restaurer le candidat
2. Exécutez ce script pour identifier les candidatures à restaurer
3. Adaptez les sections commentées (4, 5, 6) avec les vraies données
4. Décommentez et exécutez les sections nécessaires
5. Vérifiez les résultats avec la requête de vérification finale

IMPORTANT :
- Remplacez tous les 'ID_DE_L_OFFRE_EMPLOI' par les vrais IDs des offres
- Remplacez tous les 'ID_DE_LA_CANDIDATURE' par les vrais IDs des candidatures
- Adaptez les données selon les informations réelles du candidat
- Vérifiez que les offres d'emploi existent avant de créer les candidatures
*/
