-- Requête SQL pour lister toutes les inscriptions internes du 17/10/2025 à aujourd'hui
-- Table: users
-- Critères: candidate_status = 'interne' et created_at entre le 17/10/2025 et maintenant

SELECT 
    id,
    email,
    first_name AS prenom,
    last_name AS nom,
    phone AS telephone,
    matricule,
    date_of_birth AS date_naissance,
    sexe,
    adresse,
    candidate_status AS statut_candidat,
    statut,
    poste_actuel,
    annees_experience,
    no_seeg_email AS sans_email_seeg,
    politique_confidentialite AS politique_acceptee,
    created_at AS date_inscription,
    updated_at AS derniere_mise_a_jour
FROM public.users 
WHERE 
    candidate_status = 'interne'
    AND created_at >= '2025-10-17 00:00:00'::timestamp
    AND created_at <= NOW()
ORDER BY created_at DESC;

-- Requête alternative avec plus de détails et formatage
SELECT 
    u.id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) AS nom_complet,
    u.phone AS telephone,
    u.matricule,
    u.date_of_birth AS date_naissance,
    CASE 
        WHEN u.sexe = 'M' THEN 'Homme'
        WHEN u.sexe = 'F' THEN 'Femme'
        ELSE u.sexe
    END AS sexe,
    u.adresse,
    u.candidate_status AS statut_candidat,
    u.statut,
    u.poste_actuel,
    u.annees_experience,
    CASE 
        WHEN u.no_seeg_email = true THEN 'Oui'
        ELSE 'Non'
    END AS sans_email_seeg,
    CASE 
        WHEN u.politique_confidentialite = true THEN 'Acceptée'
        ELSE 'Non acceptée'
    END AS politique_acceptee,
    u.created_at AS date_inscription,
    u.updated_at AS derniere_mise_a_jour,
    EXTRACT(DAY FROM (NOW() - u.created_at)) AS jours_depuis_inscription
FROM public.users u
WHERE 
    u.candidate_status = 'interne'
    AND u.created_at >= '2025-10-17 00:00:00'::timestamp
    AND u.created_at <= NOW()
ORDER BY u.created_at DESC;

-- Requête avec statistiques
SELECT 
    COUNT(*) AS total_inscriptions_internes,
    COUNT(CASE WHEN no_seeg_email = true THEN 1 END) AS sans_email_seeg,
    COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) AS en_attente_validation,
    COUNT(CASE WHEN statut = 'actif' THEN 1 END) AS actifs,
    MIN(created_at) AS premiere_inscription,
    MAX(created_at) AS derniere_inscription
FROM public.users 
WHERE 
    candidate_status = 'interne'
    AND created_at >= '2025-10-17 00:00:00'::timestamp
    AND created_at <= NOW();
