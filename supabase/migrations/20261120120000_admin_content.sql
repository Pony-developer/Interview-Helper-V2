-- =====================================================================
-- Admin content management: skills, lectures, quizzes and practice tasks.
--   * Every write goes through an admin-only SECURITY DEFINER RPC. Clients still have no
--     insert/update/delete privileges on the catalogue, and quiz answers stay in `private`.
--   * `source` marks who owns a row: 'seed' (content/ in the repository) or 'admin' (edited here).
--     The generated seed only overwrites 'seed' rows, so `npm run db:push` never undoes admin edits.
-- =====================================================================

alter table public.skills add column source text not null default 'seed' check (source in ('seed', 'admin'));
alter table public.lectures add column source text not null default 'seed' check (source in ('seed', 'admin'));
alter table public.tasks add column source text not null default 'seed' check (source in ('seed', 'admin'));

-- Admins also see unpublished tasks. App queries that build interviews filter on `published` explicitly.
create policy "Catalog: admins read all tasks" on public.tasks for select to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create function private.assert_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can manage content' using errcode = '42501';
  end if;
end;
$$;

-- Recomputes skills.has_content from the published tasks (cheap: a few hundred skills).
create function private.refresh_skill_content_flags()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.skills s
     set has_content = x.has
    from (
      select sk.id,
             exists (
               select 1 from public.task_skills ts
               join public.tasks t on t.id = ts.task_id and t.published
               where ts.skill_id = sk.id
             ) as has
        from public.skills sk
    ) x
   where x.id = s.id and s.has_content is distinct from x.has;
$$;

create function private.json_text_array(p jsonb)
returns text[]
language sql
immutable
as $$
  select coalesce(array(select jsonb_array_elements_text(coalesce(p, '[]'::jsonb))), '{}'::text[])
$$;

-- ---------------------------------------------------------------------
-- Skills
--   p_skill: {slug, name, category, aliases: [], description: {en, uk}, codeable, popularity}
--   p_create: true inserts a new skill; false updates the one with p_skill.slug (slugs are immutable).
-- ---------------------------------------------------------------------
create function public.admin_save_skill(p_skill jsonb, p_create boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slug text := p_skill ->> 'slug';
begin
  perform private.assert_admin();

  if p_create then
    insert into public.skills (slug, name, category, aliases, description, codeable, popularity, source)
    values (
      v_slug,
      p_skill ->> 'name',
      p_skill ->> 'category',
      private.json_text_array(p_skill -> 'aliases'),
      coalesce(p_skill -> 'description', '{}'::jsonb),
      coalesce((p_skill ->> 'codeable')::boolean, false),
      coalesce((p_skill ->> 'popularity')::smallint, 30),
      'admin'
    );
  else
    update public.skills
       set name = p_skill ->> 'name',
           category = p_skill ->> 'category',
           aliases = private.json_text_array(p_skill -> 'aliases'),
           description = coalesce(p_skill -> 'description', '{}'::jsonb),
           codeable = coalesce((p_skill ->> 'codeable')::boolean, false),
           popularity = coalesce((p_skill ->> 'popularity')::smallint, 30),
           source = 'admin'
     where slug = v_slug;
    if not found then
      raise exception 'Skill not found' using errcode = 'P0002';
    end if;
  end if;

  return v_slug;
end;
$$;

-- Deletes a skill that no lecture or task uses (interview history keeps skill ids, so used skills stay).
create function public.admin_delete_skill(p_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform private.assert_admin();
  select id into v_id from public.skills where slug = p_slug;
  if v_id is null then
    raise exception 'Skill not found' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.lectures where skill_id = v_id)
     or exists (select 1 from public.task_skills where skill_id = v_id) then
    raise exception 'Skill is still used by lectures or tasks' using errcode = 'P0001';
  end if;
  delete from public.skills where id = v_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Lectures
--   p_lecture: {slug, skill, title: {en, uk}, summary: {en, uk}, body: {en, uk}, reading_minutes}
-- ---------------------------------------------------------------------
create function public.admin_save_lecture(p_lecture jsonb, p_create boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slug text := p_lecture ->> 'slug';
  v_skill uuid;
begin
  perform private.assert_admin();

  select id into v_skill from public.skills where slug = p_lecture ->> 'skill';
  if v_skill is null then
    raise exception 'Unknown skill: %', p_lecture ->> 'skill' using errcode = 'P0002';
  end if;

  if p_create then
    insert into public.lectures (slug, skill_id, title, summary, body, reading_minutes, source, updated_at)
    values (
      v_slug, v_skill, p_lecture -> 'title', p_lecture -> 'summary', p_lecture -> 'body',
      coalesce((p_lecture ->> 'reading_minutes')::smallint, 5), 'admin', now()
    );
  else
    update public.lectures
       set skill_id = v_skill,
           title = p_lecture -> 'title',
           summary = p_lecture -> 'summary',
           body = p_lecture -> 'body',
           reading_minutes = coalesce((p_lecture ->> 'reading_minutes')::smallint, 5),
           source = 'admin',
           updated_at = now()
     where slug = v_slug;
    if not found then
      raise exception 'Lecture not found' using errcode = 'P0002';
    end if;
  end if;

  return v_slug;
end;
$$;

-- Tasks that pointed at the lecture lose their "Ask for help" link (lecture_id is set null).
create function public.admin_delete_lecture(p_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin();
  delete from public.lectures where slug = p_slug;
  if not found then
    raise exception 'Lecture not found' using errcode = 'P0002';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- Tasks (quizzes and practice), including skill links and the private solution.
--   p_task: {
--     slug, kind, complexity, est_seconds, title, prompt, explanation, published,
--     lecture: slug | null (null → the first skill's lecture),
--     skills: [{slug, weight}],
--     quiz: {...} | null,  correct: ["a"] (quiz only),
--     practice: {...} | null, solution: {path: code} (practice only)
--   }
-- ---------------------------------------------------------------------
create function public.admin_save_task(p_task jsonb, p_create boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slug text := p_task ->> 'slug';
  v_kind public.task_kind := (p_task ->> 'kind')::public.task_kind;
  v_id uuid;
  v_existing_kind public.task_kind;
  v_lecture uuid;
  v_first_skill uuid;
  v_correct text[] := private.json_text_array(p_task -> 'correct');
  v_option_ids text[];
  v_missing text;
begin
  perform private.assert_admin();

  if jsonb_typeof(p_task -> 'skills') <> 'array' or jsonb_array_length(p_task -> 'skills') = 0 then
    raise exception 'A task needs at least one skill' using errcode = '22023';
  end if;

  select string_agg(x ->> 'slug', ', ') into v_missing
    from jsonb_array_elements(p_task -> 'skills') x
   where not exists (select 1 from public.skills s where s.slug = x ->> 'slug');
  if v_missing is not null then
    raise exception 'Unknown skill: %', v_missing using errcode = 'P0002';
  end if;

  if v_kind = 'quiz' then
    v_option_ids := array(select o ->> 'id' from jsonb_array_elements(p_task -> 'quiz' -> 'options') o);
    if cardinality(v_correct) = 0 or not (v_correct <@ v_option_ids) then
      raise exception 'Correct answers must be existing option ids' using errcode = '22023';
    end if;
  end if;

  select s.id into v_first_skill
    from public.skills s where s.slug = p_task -> 'skills' -> 0 ->> 'slug';

  if nullif(p_task ->> 'lecture', '') is not null then
    select id into v_lecture from public.lectures where slug = p_task ->> 'lecture';
    if v_lecture is null then
      raise exception 'Unknown lecture: %', p_task ->> 'lecture' using errcode = 'P0002';
    end if;
  else
    select id into v_lecture from public.lectures where skill_id = v_first_skill order by slug limit 1;
  end if;

  if p_create then
    insert into public.tasks (slug, kind, complexity, est_seconds, title, prompt, lecture_id, quiz, practice, published, source, updated_at)
    values (
      v_slug, v_kind, (p_task ->> 'complexity')::smallint, (p_task ->> 'est_seconds')::integer,
      p_task -> 'title', p_task -> 'prompt', v_lecture,
      case when v_kind = 'quiz' then p_task -> 'quiz' end,
      case when v_kind = 'practice' then p_task -> 'practice' end,
      coalesce((p_task ->> 'published')::boolean, true), 'admin', now()
    )
    returning id into v_id;
  else
    select id, kind into v_id, v_existing_kind from public.tasks where slug = v_slug;
    if v_id is null then
      raise exception 'Task not found' using errcode = 'P0002';
    end if;
    if v_existing_kind <> v_kind then
      raise exception 'The kind of an existing task cannot change' using errcode = '22023';
    end if;
    update public.tasks
       set complexity = (p_task ->> 'complexity')::smallint,
           est_seconds = (p_task ->> 'est_seconds')::integer,
           title = p_task -> 'title',
           prompt = p_task -> 'prompt',
           lecture_id = v_lecture,
           quiz = case when v_kind = 'quiz' then p_task -> 'quiz' end,
           practice = case when v_kind = 'practice' then p_task -> 'practice' end,
           published = coalesce((p_task ->> 'published')::boolean, published),
           source = 'admin',
           updated_at = now()
     where id = v_id;
  end if;

  delete from public.task_skills where task_id = v_id;
  insert into public.task_skills (task_id, skill_id, weight)
  select v_id, s.id, coalesce((x ->> 'weight')::real, 1)
    from jsonb_array_elements(p_task -> 'skills') x
    join public.skills s on s.slug = x ->> 'slug'
  on conflict (task_id, skill_id) do update set weight = excluded.weight;

  insert into private.task_solutions (task_id, correct_option_ids, explanation, solution_files)
  values (
    v_id,
    case when v_kind = 'quiz' then v_correct end,
    coalesce(p_task -> 'explanation', '{}'::jsonb),
    case when v_kind = 'practice' then p_task -> 'solution' end
  )
  on conflict (task_id) do update
    set correct_option_ids = excluded.correct_option_ids,
        explanation = excluded.explanation,
        solution_files = excluded.solution_files;

  perform private.refresh_skill_content_flags();
  return v_slug;
end;
$$;

-- Full task for the editor, including the private solution.
create function public.admin_get_task(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v jsonb;
begin
  perform private.assert_admin();
  select jsonb_build_object(
           'slug', t.slug, 'kind', t.kind, 'complexity', t.complexity, 'est_seconds', t.est_seconds,
           'title', t.title, 'prompt', t.prompt, 'quiz', t.quiz, 'practice', t.practice,
           'published', t.published, 'source', t.source, 'updated_at', t.updated_at,
           'lecture', l.slug,
           'skills', coalesce((
             select jsonb_agg(jsonb_build_object('slug', s.slug, 'weight', ts.weight) order by ts.weight desc, s.slug)
               from public.task_skills ts join public.skills s on s.id = ts.skill_id
              where ts.task_id = t.id), '[]'::jsonb),
           'correct', to_jsonb(coalesce(sol.correct_option_ids, '{}'::text[])),
           'explanation', coalesce(sol.explanation, '{}'::jsonb),
           'solution', sol.solution_files,
           'used_in_interviews', exists (select 1 from public.interview_items ii where ii.task_id = t.id)
         )
    into v
    from public.tasks t
    left join public.lectures l on l.id = t.lecture_id
    left join private.task_solutions sol on sol.task_id = t.id
   where t.slug = p_slug;
  return v;
end;
$$;

create function public.admin_set_task_published(p_slug text, p_published boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin();
  update public.tasks set published = p_published, source = 'admin', updated_at = now() where slug = p_slug;
  if not found then
    raise exception 'Task not found' using errcode = 'P0002';
  end if;
  perform private.refresh_skill_content_flags();
end;
$$;

-- Hard-deletes a task that no interview has used yet; used tasks must be unpublished instead.
create function public.admin_delete_task(p_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform private.assert_admin();
  select id into v_id from public.tasks where slug = p_slug;
  if v_id is null then
    raise exception 'Task not found' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.interview_items where task_id = v_id) then
    raise exception 'Task was used in interviews; unpublish it instead' using errcode = 'P0001';
  end if;
  delete from public.tasks where id = v_id;
  perform private.refresh_skill_content_flags();
end;
$$;

-- ---------------------------------------------------------------------
-- Privileges: only signed-in users can call these, and each one checks is_admin() itself.
-- ---------------------------------------------------------------------
revoke all on function private.assert_admin() from public, anon, authenticated;
revoke all on function private.refresh_skill_content_flags() from public, anon, authenticated;
revoke all on function private.json_text_array(jsonb) from public, anon, authenticated;

revoke all on function public.admin_save_skill(jsonb, boolean) from public, anon;
revoke all on function public.admin_delete_skill(text) from public, anon;
revoke all on function public.admin_save_lecture(jsonb, boolean) from public, anon;
revoke all on function public.admin_delete_lecture(text) from public, anon;
revoke all on function public.admin_save_task(jsonb, boolean) from public, anon;
revoke all on function public.admin_get_task(text) from public, anon;
revoke all on function public.admin_set_task_published(text, boolean) from public, anon;
revoke all on function public.admin_delete_task(text) from public, anon;

grant execute on function public.admin_save_skill(jsonb, boolean) to authenticated;
grant execute on function public.admin_delete_skill(text) to authenticated;
grant execute on function public.admin_save_lecture(jsonb, boolean) to authenticated;
grant execute on function public.admin_delete_lecture(text) to authenticated;
grant execute on function public.admin_save_task(jsonb, boolean) to authenticated;
grant execute on function public.admin_get_task(text) to authenticated;
grant execute on function public.admin_set_task_published(text, boolean) to authenticated;
grant execute on function public.admin_delete_task(text) to authenticated;
