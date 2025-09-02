-- Fix applications RLS policies to work with current user role system
-- This migration ensures that recruiters and admins can properly update application statuses

begin;

-- Ensure RLS is enabled on the applications table
alter table public.applications enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists applications_select_candidate on public.applications;
drop policy if exists applications_select_recruiter_or_admin on public.applications;
drop policy if exists applications_insert_candidate on public.applications;
drop policy if exists applications_update_candidate_or_recruiter_or_admin on public.applications;

-- Create a helper function to get user role from database
create or replace function public.get_user_role(user_id uuid)
returns text
language sql
stable
security definer
as $$
  select role from public.users where id = user_id;
$$;

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
    where j.id = applications.job_offer_id
      and (
        j.recruiter_id = auth.uid() 
        or public.get_user_role(auth.uid()) = 'admin'
      )
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
    where j.id = applications.job_offer_id
      and (
        j.recruiter_id = auth.uid() 
        or public.get_user_role(auth.uid()) = 'admin'
      )
  )
)
with check (
  candidate_id = auth.uid()
  or exists (
    select 1
    from public.job_offers j
    where j.id = applications.job_offer_id
      and (
        j.recruiter_id = auth.uid() 
        or public.get_user_role(auth.uid()) = 'admin'
      )
  )
);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select, insert, update on public.applications to authenticated;
grant execute on function public.get_user_role(uuid) to authenticated;

commit;



