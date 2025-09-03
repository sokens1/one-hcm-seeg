-- Harden sync function to avoid potential update loops and unnecessary writes
-- Only update auth.users.app_metadata.role if it actually differs from public.users.role

create or replace function public.sync_role_to_auth()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- If no matching auth user, do nothing
  if not exists (select 1 from auth.users au where au.id = new.id) then
    return new;
  end if;

  -- If role is already identical in JWT metadata, skip update
  if (select coalesce(au.raw_app_meta_data->>'role','') from auth.users au where au.id = new.id) = coalesce(new.role,'') then
    return new;
  end if;

  -- Update only when different
  update auth.users au
  set raw_app_meta_data = jsonb_set(
    coalesce(au.raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new.role)
  )
  where au.id = new.id;

  return new;
end;
$$;

-- Ensure triggers exist (idempotent)
drop trigger if exists trg_sync_role_to_auth on public.users;
create trigger trg_sync_role_to_auth
after update of role on public.users
for each row
when (old.role is distinct from new.role)
execute function public.sync_role_to_auth();

-- Insert trigger to init app_metadata.role from users.role
-- Only runs if role is not null

drop trigger if exists trg_sync_role_to_auth_insert on public.users;
create trigger trg_sync_role_to_auth_insert
after insert on public.users
for each row
when (new.role is not null)
execute function public.sync_role_to_auth();
