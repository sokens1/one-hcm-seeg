-- Voir l'état actuel de tous les candidats pour comprendre ce qui a été modifié

-- Vue d'ensemble par candidate_status
SELECT 
    candidate_status,
    statut AS statut_compte,
    COUNT(*) AS nombre_candidats,
    COUNT(CASE WHEN email LIKE '%@seeg-gabon.com' THEN 1 END) AS avec_email_seeg,
    COUNT(CASE WHEN matricule IS NOT NULL AND matricule != '' THEN 1 END) AS avec_matricule
FROM users
WHERE role IN ('candidat', 'candidate')
GROUP BY candidate_status, statut
ORDER BY candidate_status, statut;

-- Liste détaillée des candidats avec statut 'interne'
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status,
    u.statut,
    u.no_seeg_email,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM applications a 
            INNER JOIN job_offers jo ON a.job_offer_id = jo.id
            WHERE a.candidate_id = u.id AND jo.campaign_id = 1
        ) THEN 'A candidaté campagne 1'
        WHEN EXISTS (
            SELECT 1 FROM applications a WHERE a.candidate_id = u.id
        ) THEN 'A candidaté autres campagnes'
        ELSE 'Jamais candidaté'
    END AS historique_candidature
FROM users u
WHERE 
    role IN ('candidat', 'candidate')
    AND candidate_status = 'interne'
ORDER BY u.created_at DESC;

