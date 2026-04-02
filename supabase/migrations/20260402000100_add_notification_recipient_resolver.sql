create or replace function public.canonicalize_notification_role(role text)
returns text
language sql
immutable
as $$
  select case
    when lower(regexp_replace(trim(coalesce(role, '')), '[\s-]+', '_', 'g')) in ('administrator', 'super_admin', 'superadmin') then 'admin'
    when lower(regexp_replace(trim(coalesce(role, '')), '[\s-]+', '_', 'g')) in ('verification', 'qa') then 'verifier'
    when lower(regexp_replace(trim(coalesce(role, '')), '[\s-]+', '_', 'g')) in ('projectdeveloper', 'developer') then 'project_developer'
    when lower(regexp_replace(trim(coalesce(role, '')), '[\s-]+', '_', 'g')) in ('buyerinvestor', 'investor') then 'buyer_investor'
    when lower(regexp_replace(trim(coalesce(role, '')), '[\s-]+', '_', 'g')) in ('generaluser', 'user') then 'general_user'
    else lower(regexp_replace(trim(coalesce(role, '')), '[\s-]+', '_', 'g'))
  end
$$;

create or replace function public.resolve_notification_recipient_ids(
  target_user_ids uuid[] default null,
  target_roles text[] default null,
  excluded_user_ids uuid[] default null
)
returns table(user_id uuid)
language sql
security definer
set search_path = public
as $$
  select distinct p.id as user_id
  from public.profiles p
  where (
    (target_user_ids is not null and p.id = any(target_user_ids))
    or (target_roles is not null and public.canonicalize_notification_role(p.role) = any(target_roles))
  )
  and (
    excluded_user_ids is null
    or not (p.id = any(excluded_user_ids))
  )
$$;

grant execute on function public.canonicalize_notification_role(text) to authenticated;
grant execute on function public.resolve_notification_recipient_ids(uuid[], text[], uuid[]) to authenticated;
