-- Restaurer le statut 'interne' pour tmisseme@seeg-gabon.com et ckoya@seeg-gabon.com
-- Ces deux personnes étaient déjà en statut interne avant

UPDATE users
SET 
    candidate_status = 'interne',
    no_seeg_email = false,
    updated_at = NOW()
WHERE 
    email IN ('tmisseme@seeg-gabon.com', 'ckoya@seeg-gabon.com');

-- Vérification
SELECT 
    id,
    email,
    matricule,
    first_name || ' ' || last_name AS nom_complet,
    candidate_status,
    no_seeg_email,
    statut AS statut_compte
FROM users
WHERE 
    email IN ('tmisseme@seeg-gabon.com', 'ckoya@seeg-gabon.com');

