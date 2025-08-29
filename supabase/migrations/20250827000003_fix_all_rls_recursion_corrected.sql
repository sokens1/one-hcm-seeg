-- Fix infinite recursion in ALL tables RLS policies
-- This migration will temporarily disable RLS and recreate simple policies
-- Based on the actual table structure discovered

-- Step 1: Disable RLS on all tables to break the recursion
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to start fresh
-- Users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Recruiters and admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Allow insert for new users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Recruiters can read users" ON public.users;

-- Job offers table
DROP POLICY IF EXISTS "Recruiters can manage their job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Candidates can view active job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Recruiters can view all job offers" ON public.job_offers;

-- Applications table
DROP POLICY IF EXISTS "Candidates can manage their applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their job offers" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view all applications" ON public.applications;

-- Candidate profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Recruiters can view candidate profiles" ON public.candidate_profiles;

-- Job categories table
DROP POLICY IF EXISTS "Anyone can view job categories" ON public.job_categories;

-- Notifications table
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- Step 3: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies

-- USERS TABLE - Simple policies without recursion
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert for new users" ON public.users
  FOR INSERT WITH CHECK (true);

-- JOB_OFFERS TABLE - Simple policies
CREATE POLICY "Anyone can view active job offers" ON public.job_offers
  FOR SELECT USING (status = 'active');

CREATE POLICY "Recruiters can manage their job offers" ON public.job_offers
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('recruteur', 'admin', 'observateur', 'observer')
    )
  );

-- APPLICATIONS TABLE - Simple policies (using candidate_id, not user_id)
CREATE POLICY "Users can view their own applications" ON public.applications
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Users can insert their own applications" ON public.applications
  FOR INSERT WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Recruiters can view all applications" ON public.applications
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('recruteur', 'admin', 'observateur', 'observer')
    )
  );

-- CANDIDATE_PROFILES TABLE - Simple policies (using user_id)
CREATE POLICY "Users can view their own profile" ON public.candidate_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.candidate_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.candidate_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Recruiters can view all candidate profiles" ON public.candidate_profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('recruteur', 'admin', 'observateur', 'observer')
    )
  );

-- JOB_CATEGORIES TABLE - Simple policies
CREATE POLICY "Anyone can view job categories" ON public.job_categories
  FOR SELECT USING (true);

-- NOTIFICATIONS TABLE - Simple policies (assuming user_id column exists)
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Step 5: Grant necessary permissions
GRANT SELECT, UPDATE, INSERT ON public.users TO authenticated;
GRANT SELECT, UPDATE, INSERT, DELETE ON public.job_offers TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.applications TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.candidate_profiles TO authenticated;
GRANT SELECT ON public.job_categories TO authenticated;
GRANT SELECT, UPDATE, INSERT ON public.notifications TO authenticated;
