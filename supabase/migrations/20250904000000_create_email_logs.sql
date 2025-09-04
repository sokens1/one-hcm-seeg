-- Table de journalisation des emails envoyés
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  to text not null,
  subject text not null,
  html text,
  category text not null default 'generic',
  application_id uuid,
  provider_message_id text,
  sent_at timestamptz not null default now()
);

-- Index pour les analyses futures
create index if not exists email_logs_sent_at_idx on public.email_logs (sent_at desc);
create index if not exists email_logs_category_idx on public.email_logs (category);
create index if not exists email_logs_application_id_idx on public.email_logs (application_id);

-- RLS (lecture admin/recruteur, insertion par fonctions edge/API)
alter table public.email_logs enable row level security;
do $$ begin
  create policy email_logs_read_admin on public.email_logs
    for select to authenticated using (true);
exception when others then null; end $$;

