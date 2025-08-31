-- Migration simplifiée pour corriger les politiques RLS des applications
-- Cette migration permet aux recruteurs et admins de modifier les statuts des candidatures

begin;

-- S'assurer que RLS est activé sur la table applications
alter table public.applications enable row level security;

-- Supprimer toutes les politiques existantes pour éviter les conflits
drop policy if exists applications_select_candidate on public.applications;
drop policy if exists applications_select_recruiter_or_admin on public.applications;
drop policy if exists applications_insert_candidate on public.applications;
drop policy if exists applications_update_candidate_or_recruiter_or_admin on public.applications;
drop policy if exists "Candidates can view their own applications" on public.applications;
drop policy if exists "Candidates can create applications" on public.applications;
drop policy if exists "Candidates can update their own applications" on public.applications;
drop policy if exists "Recruiters can view applications for their jobs" on public.applications;
drop policy if exists "Recruiters can update applications for their jobs" on public.applications;

-- Créer une fonction helper pour vérifier le rôle utilisateur
create or replace function public.is_user_recruiter_or_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists(
    select 1 
    from public.users 
    where id = auth.uid() 
    and role in ('recruteur', 'admin', 'observateur')
  );
$$;

-- Politique SELECT : les candidats peuvent voir leurs propres candidatures
create policy applications_select_candidate
on public.applications
for select
using (candidate_id = auth.uid());

-- Politique SELECT : les recruteurs et admins peuvent voir toutes les candidatures
create policy applications_select_recruiter_admin
on public.applications
for select
using (public.is_user_recruiter_or_admin());

-- Politique INSERT : les candidats peuvent créer leurs propres candidatures
create policy applications_insert_candidate
on public.applications
for insert
with check (candidate_id = auth.uid());

-- Politique UPDATE : les candidats peuvent modifier leurs propres candidatures
create policy applications_update_candidate
on public.applications
for update
using (candidate_id = auth.uid())
with check (candidate_id = auth.uid());

-- Politique UPDATE : les recruteurs et admins peuvent modifier toutes les candidatures
create policy applications_update_recruiter_admin
on public.applications
for update
using (public.is_user_recruiter_or_admin())
with check (public.is_user_recruiter_or_admin());

-- Accorder les permissions nécessaires
grant usage on schema public to authenticated;
grant select, insert, update on public.applications to authenticated;
grant execute on function public.is_user_recruiter_or_admin() to authenticated;

commit;

