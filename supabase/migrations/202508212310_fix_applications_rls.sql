-- Fix RLS to avoid infinite recursion on public.applications
-- This migration replaces applications policies with simplified, non-recursive rules.

begin;

-- Ensure RLS is enabled on the target table
alter table public.applications enable row level security;

-- Drop existing policies on applications (if they exist)
drop policy if exists "Candidates can view their own applications" on public.applications;
drop policy if exists "Candidates can create applications" on public.applications;
drop policy if exists "Candidates can update their own applications" on public.applications;
drop policy if exists "Recruiters can view applications for their jobs" on public.applications;
drop policy if exists "Recruiters can update applications for their jobs" on public.applications;

-- Recreate safe policies without any direct read to public.applications in USING/with check

-- SELECT: candidates can see their own applications
create policy applications_select_candidate
on public.applications
for select
using (candidate_id = auth.uid());

-- SELECT: recruiters or admin can see applications for jobs they own
create policy applications_select_recruiter_or_admin
on public.applications
for select
using (
  exists (
    select 1
    from public.job_offers j
    join public.users u on u.id = auth.uid()
    where j.id = applications.job_offer_id
      and (j.recruiter_id = auth.uid() or u.role = 'admin')
  )
);

-- INSERT: candidate can create only his own application
create policy applications_insert_candidate
on public.applications
for insert
with check (candidate_id = auth.uid());

-- UPDATE: candidate, recruiter of the job, or admin can update
create policy applications_update_candidate_or_recruiter_or_admin
on public.applications
for update
using (
  candidate_id = auth.uid()
  or exists (
    select 1
    from public.job_offers j
    join public.users u on u.id = auth.uid()
    where j.id = applications.job_offer_id
      and (j.recruiter_id = auth.uid() or u.role = 'admin')
  )
)
with check (
  candidate_id = auth.uid()
  or exists (
    select 1
    from public.job_offers j
    join public.users u on u.id = auth.uid()
    where j.id = applications.job_offer_id
      and (j.recruiter_id = auth.uid() or u.role = 'admin')
  )
);

commit;
