-- Explicit table privileges for the Data API roles.
--
-- Newer Supabase projects no longer grant anon/authenticated access to new tables in `public`
-- automatically, so every table the app reads or writes through the API needs its own grant.
-- Grants only open the door; RLS policies (see the init migration) still decide which rows are visible.

grant usage on schema public to anon, authenticated;

-- Public catalogue: read-only for everyone.
grant select on public.skills, public.lectures, public.tasks, public.task_skills to anon, authenticated;

-- Profiles: signed-in users read (own row, or all for admins); only name and avatar are writable.
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

-- Interviews: owners read and create; every later change goes through SECURITY DEFINER RPCs.
grant select, insert on public.interviews, public.interview_items to authenticated;

-- Progress: read-only for the owner; written by submit_item().
grant select on public.user_task_progress to authenticated;
grant select on public.user_skill_mastery to authenticated;
