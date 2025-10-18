-- Requête SQL pour lister les personnes inscrites pendant la campagne 1 mais qui n'ont jamais postulé

-- OPTION 1 : Utilisateurs créés pendant la période de la campagne 1 SANS candidature
-- Période campagne 1 : Avant le 11/09/2025
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status,
    u.statut AS statut_compte,
    u.phone,
    u.created_at AS date_inscription,
    COUNT(a.id) AS nombre_candidatures
FROM 
    users u
LEFT JOIN 
    applications a ON a.candidate_id = u.id
WHERE 
    u.created_at < '2025-09-11T00:00:00'  -- Inscrits avant le 11/09/2025 (fin campagne 1)
    AND u.role IN ('candidat', 'candidate')  -- Uniquement les candidats
GROUP BY 
    u.id, u.email, u.matricule, u.first_name, u.last_name, 
    u.candidate_status, u.statut, u.phone, u.created_at
HAVING 
    COUNT(a.id) = 0  -- Aucune candidature
ORDER BY 
    u.created_at DESC;

-- OPTION 2 : Tous les utilisateurs SANS AUCUNE candidature (peu importe la date d'inscription)
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status,
    u.statut AS statut_compte,
    u.phone,
    u.created_at AS date_inscription
FROM 
    users u
WHERE 
    u.role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a 
        WHERE a.candidate_id = u.id
    )
ORDER BY 
    u.created_at DESC;

-- OPTION 3 : Statistiques des utilisateurs sans candidature
SELECT 
    CASE 
        WHEN u.created_at < '2025-09-11T00:00:00' THEN 'Période Campagne 1'
        WHEN u.created_at >= '2025-09-11T00:00:00' AND u.created_at < '2025-10-17T00:00:00' THEN 'Période Campagne 2'
        ELSE 'Période Campagne 3'
    END AS periode_inscription,
    u.candidate_status,
    COUNT(u.id) AS nombre_inscrits_sans_candidature
FROM 
    users u
WHERE 
    u.role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a 
        WHERE a.candidate_id = u.id
    )
GROUP BY 
    CASE 
        WHEN u.created_at < '2025-09-11T00:00:00' THEN 'Période Campagne 1'
        WHEN u.created_at >= '2025-09-11T00:00:00' AND u.created_at < '2025-10-17T00:00:00' THEN 'Période Campagne 2'
        ELSE 'Période Campagne 3'
    END,
    u.candidate_status
ORDER BY 
    periode_inscription, u.candidate_status;

-- OPTION 4 : Utilisateurs avec email SEEG sans candidature
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status,
    u.statut AS statut_compte,
    u.created_at AS date_inscription
FROM 
    users u
WHERE 
    u.role IN ('candidat', 'candidate')
    AND u.email LIKE '%@seeg-gabon.com'
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a 
        WHERE a.candidate_id = u.id
    )
ORDER BY 
    u.created_at DESC;

