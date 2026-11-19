-- Make the first user who ever signed up an admin.
-- Safe to run more than once. Creates the profile row if it's missing.
--
-- Run it with:
--   npx supabase db query --remote -f supabase/snippets/make-first-user-admin.sql
-- or paste it into Supabase Dashboard → SQL Editor.

insert into public.profiles (id, display_name, avatar_url, role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.raw_user_meta_data ->> 'avatar_url',
  'admin'
from auth.users u
order by u.created_at asc
limit 1
on conflict (id) do update set role = 'admin';

-- Show who is an admin now.
select p.id, u.email, p.display_name, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin';
