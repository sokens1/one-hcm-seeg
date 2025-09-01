-- Fix RLS policies for applications table to allow recruiters to update application status
-- Execute this directly in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Recruiters can view applications" ON applications;
DROP POLICY IF EXISTS "Recruiters can update applications" ON applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
DROP POLICY IF EXISTS "Users can create applications" ON applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON applications;

-- Create new policies for applications table

-- Policy 1: Recruiters can view all applications
CREATE POLICY "Recruiters can view applications" ON applications
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.role = 'recruiter'
        )
    );

-- Policy 2: Recruiters can update application status
CREATE POLICY "Recruiters can update applications" ON applications
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.role = 'recruiter'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.role = 'recruiter'
        )
    );

-- Policy 3: Users can view their own applications
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT
    TO authenticated
    USING (candidate_id = auth.uid());

-- Policy 4: Users can create their own applications
CREATE POLICY "Users can create applications" ON applications
    FOR INSERT
    TO authenticated
    WITH CHECK (candidate_id = auth.uid());

-- Policy 5: Users can update their own applications (for status changes like withdrawal)
CREATE POLICY "Users can update their own applications" ON applications
    FOR UPDATE
    TO authenticated
    USING (candidate_id = auth.uid())
    WITH CHECK (candidate_id = auth.uid());

-- Ensure RLS is enabled on applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;



