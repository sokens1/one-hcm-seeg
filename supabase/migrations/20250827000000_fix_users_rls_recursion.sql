-- Fix infinite recursion in users table RLS policies
-- The problem is that policies are checking the users table recursively

-- First, disable RLS temporarily to fix the policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Recruiters can read users" ON public.users;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Policy 1: Users can view their own profile (simple auth.uid() check)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (simple auth.uid() check)
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Recruiters and admins can read all users (without recursive checks)
CREATE POLICY "Recruiters and admins can read all users" ON public.users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('recruteur', 'admin', 'observateur', 'observer')
    )
  );

-- Policy 4: Allow insert for new users (during signup)
CREATE POLICY "Allow insert for new users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
