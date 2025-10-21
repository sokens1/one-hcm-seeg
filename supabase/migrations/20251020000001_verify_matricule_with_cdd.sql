DROP FUNCTION IF EXISTS verify_matricule(text);

CREATE FUNCTION verify_matricule(p_matricule text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists_in_agents boolean := false;
    v_already_used_campaign1 boolean := false;
    v_is_cdd boolean := false;
    v_message text;
    v_is_valid boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM seeg_agents 
        WHERE CAST(matricule AS text) = p_matricule
    ) INTO v_exists_in_agents;

    SELECT EXISTS (
        SELECT 1 
        FROM cdd_matricules 
        WHERE CAST("MLE" AS text) = p_matricule
    ) INTO v_is_cdd;

    SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END
    INTO v_already_used_campaign1
    FROM users u
    INNER JOIN applications a ON CAST(a.candidate_id AS text) = CAST(u.id AS text)
    INNER JOIN job_offers jo ON CAST(a.job_offer_id AS text) = CAST(jo.id AS text)
    WHERE u.matricule = p_matricule
    AND jo.campaign_id = 1;

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

