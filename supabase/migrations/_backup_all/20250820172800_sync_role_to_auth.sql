-- Sync role changes in public.users to Supabase Auth (JWT app_metadata.role)
-- This ensures that when you update public.users.role, the user's JWT metadata will reflect it after next sign-in.

create or replace function public.sync_role_to_auth()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Update app_metadata.role in auth.users for the same user id
  update auth.users
  set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new.role)
  )
  where id = new.id;

  return new;
end;
$$;

-- Trigger after UPDATE of role
drop trigger if exists trg_sync_role_to_auth on public.users;
create trigger trg_sync_role_to_auth
after update of role on public.users
for each row
execute function public.sync_role_to_auth();

-- Trigger after INSERT to initialize app_metadata.role from users.role
drop trigger if exists trg_sync_role_to_auth_insert on public.users;
create trigger trg_sync_role_to_auth_insert
after insert on public.users
for each row
execute function public.sync_role_to_auth();
