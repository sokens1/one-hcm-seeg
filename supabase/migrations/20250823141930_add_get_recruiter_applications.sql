-- Fonction RPC pour récupérer les candidatures (avec enrichissement) côté recruteur/admin
-- Cette fonction vérifie le rôle (recruteur/admin) via la table public.users
-- et renvoie des blocs JSON pour simplifier la consommation côté client.

create or replace function public.get_recruiter_applications(p_job_offer_id uuid)
returns table (
  application_details jsonb,
  job_offer_details jsonb,
  candidate_details jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Sécurité: seuls recruteurs et admins peuvent utiliser cette fonction
  if not exists(
    select 1 from public.users
    where id = auth.uid() and role in ('recruteur','admin')
  ) then
    raise exception 'access denied for uid=%', auth.uid();
  end if;

  return query
  select
    -- Détails candidature
    to_jsonb(a.*) as application_details,

    -- Détails offre
    to_jsonb(jo.*) as job_offer_details,

    -- Détails candidat
    to_jsonb(u.*) || jsonb_build_object(
      'candidate_profiles', to_jsonb(cp.*)
    ) as candidate_details

  from public.applications a
  join public.job_offers jo on jo.id = a.job_offer_id
  join public.users u on u.id = a.candidate_id
  left join public.candidate_profiles cp on cp.user_id = u.id
  where a.job_offer_id = p_job_offer_id
  order by a.created_at desc;
end;
$$;

-- Donner l'exécution aux rôles supabase par défaut
grant execute on function public.get_recruiter_applications(uuid) to anon, authenticated, service_role;
