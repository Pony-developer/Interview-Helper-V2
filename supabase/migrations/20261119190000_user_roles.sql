-- =====================================================================
-- User roles: every user is either 'user' (default) or 'admin'.
--   * profiles.role holds the role; users can never change their own role.
--   * public.is_admin() is the single check to use in RLS policies and RPCs.
--   * public.set_user_role() lets admins promote/demote, keeping at least one admin.
-- To make the first user an admin, run supabase/snippets/make-first-user-admin.sql.
-- =====================================================================

create type public.app_role as enum ('user', 'admin');

alter table public.profiles
  add column role public.app_role not null default 'user';

-- Users may edit their own display name/avatar, but not their role.
revoke update on public.profiles from anon, authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

-- ---------------------------------------------------------------------
-- is_admin(): true when the signed-in user has the admin role.
-- SECURITY DEFINER so policies on profiles can call it without recursion.
-- ---------------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and role = 'admin'
  )
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Admins can see every profile (e.g. for a user-management page).
create policy "Profiles: admins read all" on public.profiles for select to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- set_user_role(): admin-only role management.
-- ---------------------------------------------------------------------
create function public.set_user_role(p_user_id uuid, p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change roles' using errcode = '42501';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;

  if p_role <> 'admin' and not exists (
    select 1 from public.profiles where role = 'admin' and id <> p_user_id
  ) then
    raise exception 'At least one admin must remain' using errcode = 'P0001';
  end if;

  update public.profiles set role = p_role where id = p_user_id;
end;
$$;

revoke all on function public.set_user_role(uuid, public.app_role) from public, anon;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;
