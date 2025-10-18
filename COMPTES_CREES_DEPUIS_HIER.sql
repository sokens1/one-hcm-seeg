-- Liste de tous les comptes créés depuis hier (dernières 24 heures)

-- LISTE DÉTAILLÉE : Tous les comptes créés dans les dernières 24h
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.role,
    u.candidate_status,
    u.statut AS statut_compte,
    u.phone,
    u.created_at AS date_inscription,
    EXTRACT(HOUR FROM (NOW() - u.created_at)) AS heures_depuis_creation,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM applications a 
            WHERE a.candidate_id = u.id
        ) THEN 'A candidaté'
        ELSE 'Pas encore candidaté'
    END AS statut_candidature
FROM 
    users u
WHERE 
    u.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY 
    u.created_at DESC;

-- LISTE : Comptes créés depuis minuit aujourd'hui
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.role,
    u.candidate_status,
    u.statut AS statut_compte,
    u.created_at AS date_inscription
FROM 
    users u
WHERE 
    u.created_at >= CURRENT_DATE
ORDER BY 
    u.created_at DESC;

-- STATISTIQUES : Comptes créés dans les dernières 24h
SELECT 
    u.role,
    u.candidate_status,
    COUNT(*) AS nombre,
    COUNT(CASE WHEN u.email LIKE '%@seeg-gabon.com' THEN 1 END) AS avec_email_seeg,
    COUNT(CASE WHEN u.matricule IS NOT NULL AND u.matricule != '' THEN 1 END) AS avec_matricule
FROM 
    users u
WHERE 
    u.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY 
    u.role, u.candidate_status;

-- TOTAL : Nombre de comptes créés depuis hier
SELECT 
    COUNT(*) AS total_comptes_24h
FROM 
    users u
WHERE 
    u.created_at >= NOW() - INTERVAL '24 hours';

-- LISTE : Comptes créés depuis une date spécifique (modifiez la date ci-dessous)
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.role,
    u.candidate_status,
    u.statut AS statut_compte,
    u.created_at AS date_inscription
FROM 
    users u
WHERE 
    u.created_at >= '2025-10-17T00:00:00'  -- Modifiez cette date selon vos besoins
ORDER BY 
    u.created_at DESC;

