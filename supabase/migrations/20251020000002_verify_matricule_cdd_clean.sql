DROP FUNCTION IF EXISTS verify_matricule(text);

CREATE FUNCTION verify_matricule(p_matricule text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists_in_agents boolean;
    v_is_cdd boolean;
    v_already_used_campaign1 boolean;
    v_message text;
    v_is_valid boolean;
BEGIN
    v_exists_in_agents := false;
    v_is_cdd := false;
    v_already_used_campaign1 := false;

    SELECT EXISTS (
        SELECT 1 FROM seeg_agents WHERE CAST(matricule AS text) = p_matricule
    ) INTO v_exists_in_agents;

    SELECT EXISTS (
        SELECT 1 FROM cdd_matricules WHERE CAST("MLE" AS text) = p_matricule
    ) INTO v_is_cdd;

    SELECT EXISTS (
        SELECT 1 
        FROM users u
        WHERE u.matricule = p_matricule
        AND u.id IN (
            SELECT a.candidate_id 
            FROM applications a
            WHERE a.job_offer_id IN (
                SELECT jo.id FROM job_offers jo WHERE jo.campaign_id = 1
            )
        )
    ) INTO v_already_used_campaign1;

    IF v_exists_in_agents = false THEN
        v_is_valid := false;
        v_message := 'Ce matricule n existe pas dans la base SEEG';
    ELSIF v_is_cdd = true THEN
        v_is_valid := false;
        v_message := 'Etant actuellement en CDD, vous ne pouvez candidater dans le cadre de cette campagne';
    ELSIF v_already_used_campaign1 = true THEN
        v_is_valid := false;
        v_message := 'Le titulaire de ce matricule a deja postule lors de la campagne 1';
    ELSE
        v_is_valid := true;
        v_message := 'Matricule valide';
    END IF;

    RETURN json_build_object(
        'exists_in_agents', v_exists_in_agents,
        'is_cdd', v_is_cdd,
        'already_used', v_already_used_campaign1,
        'is_valid', v_is_valid,
        'message', v_message
    );
END;
$$;

GRANT EXECUTE ON FUNCTION verify_matricule(text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_matricule(text) TO anon;

