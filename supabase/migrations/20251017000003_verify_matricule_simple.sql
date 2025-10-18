-- Migration pour améliorer la vérification du matricule
-- Vérifier si le matricule existe dans seeg_agents ET s'il n'a pas déjà postulé en campagne 1

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS verify_matricule(text);

-- Créer la nouvelle fonction
CREATE FUNCTION verify_matricule(p_matricule text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists_in_agents boolean := false;
    v_already_used_campaign1 boolean := false;
    v_message text;
    v_is_valid boolean;
BEGIN
    -- Vérifier existence dans seeg_agents (matricule est bigint, on le convertit en text)
    SELECT EXISTS (
        SELECT 1 
        FROM seeg_agents 
        WHERE CAST(matricule AS text) = p_matricule
    ) INTO v_exists_in_agents;

    -- Vérifier si le matricule a déjà postulé lors de la campagne 1
    -- En rejoignant users -> applications -> job_offers
    SELECT EXISTS (
        SELECT 1 
        FROM users u
        INNER JOIN applications a ON a.candidate_id = u.id
        INNER JOIN job_offers jo ON a.job_offer_id = jo.id
        WHERE u.matricule = p_matricule
        AND jo.campaign_id = 1
    ) INTO v_already_used_campaign1;

    -- Déterminer validité et message
    IF v_exists_in_agents = false THEN
        v_is_valid := false;
        v_message := 'Ce matricule n existe pas dans la base SEEG';
    ELSIF v_already_used_campaign1 = true THEN
        v_is_valid := false;
        v_message := 'Le titulaire de ce matricule a deja postule lors de la campagne 1';
    ELSE
        v_is_valid := true;
        v_message := 'Matricule valide';
    END IF;

    -- Retourner le résultat
    RETURN json_build_object(
        'exists_in_agents', v_exists_in_agents,
        'already_used', v_already_used_campaign1,
        'is_valid', v_is_valid,
        'message', v_message
    );
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION verify_matricule(text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_matricule(text) TO anon;

