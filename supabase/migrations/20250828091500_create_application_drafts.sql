-- Create table for cross-device application drafts
-- IMPORTANT: No time limits - drafts are stored indefinitely
-- They persist across devices and sessions until manually deleted or application is submitted
create table if not exists public.application_drafts (
  user_id uuid not null references public.users(id) on delete cascade,
  job_offer_id uuid not null references public.job_offers(id) on delete cascade,
  form_data jsonb not null default '{}'::jsonb,
  ui_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, job_offer_id)
);

-- Index to speed up lookups
create index if not exists idx_application_drafts_user_job on public.application_drafts(user_id, job_offer_id);

-- Enable RLS
alter table public.application_drafts enable row level security;

-- Policies: only the owner can read/write their drafts
drop policy if exists "Users can read their own drafts" on public.application_drafts;
create policy "Users can read their own drafts"
  on public.application_drafts
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own drafts" on public.application_drafts;
create policy "Users can insert their own drafts"
  on public.application_drafts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own drafts" on public.application_drafts;
create policy "Users can update their own drafts"
  on public.application_drafts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own drafts" on public.application_drafts;
create policy "Users can delete their own drafts"
  on public.application_drafts
  for delete
  using (auth.uid() = user_id);