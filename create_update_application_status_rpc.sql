-- Create RPC function to update application status
-- This bypasses RLS policies temporarily

CREATE OR REPLACE FUNCTION update_application_status(
    app_id UUID,
    new_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Update the application status
    UPDATE applications 
    SET 
        status = new_status::application_status,
        updated_at = NOW()
    WHERE id = app_id;
    
    -- Check if any row was updated
    IF FOUND THEN
        -- Return the updated application
        SELECT to_json(a) INTO result
        FROM applications a
        WHERE a.id = app_id;
        
        RETURN result;
    ELSE
        -- Return error if no row was updated
        RETURN json_build_object('error', 'Application not found or not updated');
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_application_status(UUID, TEXT) TO authenticated;



