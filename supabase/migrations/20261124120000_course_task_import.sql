-- =====================================================================
-- Copy course quizzes and practices into interview tasks.
--   * An admin picks quiz questions and practice slides; each one becomes an independent task
--     (a copy: later slide edits don't touch it). tasks.copied_from_* remembers the origin so the
--     picker can mark what was already imported and refuse to copy it twice.
--   * New practice flavour, graded by output instead of tests:
--       practice = {runner: 'output', language: 'csharp' | 'sql', starter, setup?}
--     The expected output lives in private.task_solutions.expected_output.
--     The answer is {files: {"Program.cs" | "query.sql": code}, output: text | null}; like course
--     practice, the output is produced on the candidate's side (Wandbox via our server, or PGlite).
-- =====================================================================

alter table public.tasks
  add column copied_from_slide_id uuid references public.course_slides (id) on delete set null,
  add column copied_from_question text;
create unique index tasks_copied_from_key on public.tasks (copied_from_slide_id, coalesce(copied_from_question, ''))
  where copied_from_slide_id is not null;

alter table private.task_solutions add column expected_output text;

-- ---------------------------------------------------------------------
-- admin_save_task: accepts output practices.
--   p_task additions: practice: {runner: 'output', language, starter, setup}, expected_output: text
-- ---------------------------------------------------------------------
create or replace function public.admin_save_task(p_task jsonb, p_create boolean)
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
  v_practice jsonb := p_task -> 'practice';
  v_output boolean := v_kind = 'practice' and p_task -> 'practice' ->> 'runner' = 'output';
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

  if v_output then
    if coalesce(v_practice ->> 'language', '') not in ('csharp', 'sql') then
      raise exception 'Unknown practice language' using errcode = '22023';
    end if;
    if coalesce(p_task ->> 'expected_output', '') = '' then
      raise exception 'A practice needs the expected output' using errcode = '22023';
    end if;
    v_practice := jsonb_strip_nulls(jsonb_build_object(
      'runner', 'output',
      'language', v_practice ->> 'language',
      'starter', coalesce(v_practice ->> 'starter', ''),
      'setup', case when v_practice ->> 'language' = 'sql' then nullif(v_practice ->> 'setup', '') end));
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
      case when v_kind = 'practice' then v_practice end,
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
           practice = case when v_kind = 'practice' then v_practice end,
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

  insert into private.task_solutions (task_id, correct_option_ids, explanation, solution_files, expected_output)
  values (
    v_id,
    case when v_kind = 'quiz' then v_correct end,
    coalesce(p_task -> 'explanation', '{}'::jsonb),
    case when v_kind = 'practice' and jsonb_typeof(p_task -> 'solution') = 'object' then p_task -> 'solution' end,
    case when v_output then p_task ->> 'expected_output' end
  )
  on conflict (task_id) do update
    set correct_option_ids = excluded.correct_option_ids,
        explanation = excluded.explanation,
        solution_files = excluded.solution_files,
        expected_output = excluded.expected_output;

  perform private.refresh_skill_content_flags();
  return v_slug;
end;
$$;

-- Full task for the editor, now with the expected output and where the task was copied from.
create or replace function public.admin_get_task(p_slug text)
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
           'expected_output', sol.expected_output,
           'copied_from', case when cs.id is not null then jsonb_build_object(
             'course', c.slug, 'course_title', c.title, 'slide_id', cs.id, 'slide', cs.slug,
             'slide_title', cs.title, 'question', t.copied_from_question) end,
           'used_in_interviews', exists (select 1 from public.interview_items ii where ii.task_id = t.id)
         )
    into v
    from public.tasks t
    left join public.lectures l on l.id = t.lecture_id
    left join private.task_solutions sol on sol.task_id = t.id
    left join public.course_slides cs on cs.id = t.copied_from_slide_id
    left join public.courses c on c.id = cs.course_id
   where t.slug = p_slug;
  return v;
end;
$$;

-- ---------------------------------------------------------------------
-- admin_import_course_items: copies course quiz questions and practice slides into tasks.
--   p_items:   [{slide: uuid, question: text | null}]   (question is required for quiz slides)
--   p_options: {skills: [{slug, weight}], complexity, quiz_seconds, practice_seconds,
--               lecture: slug | null, published: boolean (default false)}
--   Returns {created: [slug], skipped: n} — items copied before are skipped, not duplicated.
-- ---------------------------------------------------------------------
create function public.admin_import_course_items(p_items jsonb, p_options jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_slide record;
  v_keys private.course_slide_keys;
  v_qid text;
  v_q jsonb;
  v_pos bigint;
  v_count integer;
  v_lang text;
  v_file text;
  v_base text;
  v_slug text;
  v_n integer;
  v_task jsonb;
  v_created jsonb := '[]'::jsonb;
  v_skipped integer := 0;
begin
  perform private.assert_admin();

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Pick at least one quiz question or practice' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 200 then
    raise exception 'Import at most 200 items at a time' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    select s.id, s.slug, s.kind, s.title, s.body, s.quiz, s.practice, c.slug as course_slug
      into v_slide
      from public.course_slides s
      join public.courses c on c.id = s.course_id
     where s.id = (v_item ->> 'slide')::uuid;
    if not found then
      raise exception 'Slide not found' using errcode = 'P0002';
    end if;
    v_qid := case when v_slide.kind = 'quiz' then nullif(v_item ->> 'question', '') end;

    if exists (select 1 from public.tasks
                where copied_from_slide_id = v_slide.id and coalesce(copied_from_question, '') = coalesce(v_qid, '')) then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    select * into v_keys from private.course_slide_keys where slide_id = v_slide.id;

    -- <course>-<slide>[-<question>], made unique with a numeric suffix.
    v_base := v_slide.course_slug || '-' || v_slide.slug
              || coalesce('-' || nullif(trim(both '-' from lower(regexp_replace(v_qid, '[^a-zA-Z0-9]+', '-', 'g'))), ''), '');
    v_base := trim(both '-' from left(v_base, 90));
    v_slug := v_base;
    v_n := 1;
    while exists (select 1 from public.tasks where slug = v_slug) loop
      v_n := v_n + 1;
      v_slug := v_base || '-' || v_n;
    end loop;

    if v_slide.kind = 'quiz' then
      if v_qid is null then
        raise exception 'Pick a question of the quiz "%"', v_slide.slug using errcode = '22023';
      end if;
      select x.q, x.ord into v_q, v_pos
        from jsonb_array_elements(v_slide.quiz -> 'questions') with ordinality as x(q, ord)
       where x.q ->> 'id' = v_qid;
      if v_q is null then
        raise exception 'Question % not found in "%"', v_qid, v_slide.slug using errcode = 'P0002';
      end if;
      v_count := jsonb_array_length(v_slide.quiz -> 'questions');
      v_task := jsonb_build_object(
        'slug', v_slug,
        'kind', 'quiz',
        'complexity', p_options -> 'complexity',
        'est_seconds', p_options -> 'quiz_seconds',
        -- "Terminology · 2" when the slide had several questions.
        'title', case when v_count > 1
                      then (select jsonb_object_agg(key, (value #>> '{}') || ' · ' || v_pos) from jsonb_each(v_slide.title))
                      else v_slide.title end,
        'prompt', v_q -> 'prompt',
        'explanation', '{}'::jsonb,
        'published', coalesce(p_options -> 'published', 'false'::jsonb),
        'lecture', p_options -> 'lecture',
        'skills', p_options -> 'skills',
        'quiz', jsonb_build_object('mode', coalesce(v_q ->> 'mode', 'single'), 'options', v_q -> 'options'),
        'correct', coalesce(v_keys.quiz_answers -> v_qid, '[]'::jsonb));
    elsif v_slide.kind = 'practice' then
      v_lang := coalesce(v_slide.practice ->> 'language', 'csharp');
      v_file := case when v_lang = 'sql' then 'query.sql' else 'Program.cs' end;
      v_task := jsonb_build_object(
        'slug', v_slug,
        'kind', 'practice',
        'complexity', p_options -> 'complexity',
        'est_seconds', p_options -> 'practice_seconds',
        'title', v_slide.title,
        'prompt', case when v_slide.body = '{}'::jsonb then v_slide.title else v_slide.body end,
        'explanation', '{}'::jsonb,
        'published', coalesce(p_options -> 'published', 'false'::jsonb),
        'lecture', p_options -> 'lecture',
        'skills', p_options -> 'skills',
        'practice', jsonb_build_object(
          'runner', 'output', 'language', v_lang,
          'starter', coalesce(v_slide.practice ->> 'starter', ''),
          'setup', v_slide.practice ->> 'setup'),
        'expected_output', v_keys.expected_output,
        'solution', case when nullif(v_keys.solution, '') is not null then jsonb_build_object(v_file, v_keys.solution) end);
    else
      raise exception 'Only quiz and practice slides can be copied' using errcode = '22023';
    end if;

    perform public.admin_save_task(v_task, true);
    update public.tasks set copied_from_slide_id = v_slide.id, copied_from_question = v_qid where slug = v_slug;
    v_created := v_created || to_jsonb(v_slug);
  end loop;

  return jsonb_build_object('created', v_created, 'skipped', v_skipped);
end;
$$;

-- ---------------------------------------------------------------------
-- submit_item: grades output practices by comparing the program output with the expected one.
-- ---------------------------------------------------------------------
create or replace function public.submit_item(
  p_item_id uuid,
  p_answer jsonb default null,
  p_tests_passed integer default null,
  p_tests_total integer default null,
  p_time_spent integer default 0,
  p_skip boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.interview_items;
  v_task public.tasks;
  v_sol private.task_solutions;
  v_selected text[];
  v_correct boolean;
  v_score real;
  v_user uuid := auth.uid();
  v_output boolean;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  v_item := private.owned_open_item(p_item_id);
  if v_item.status <> 'pending' then
    raise exception 'Item already submitted' using errcode = 'P0001';
  end if;

  select * into v_task from public.tasks where id = v_item.task_id;
  select * into v_sol from private.task_solutions where task_id = v_item.task_id;
  v_output := v_task.kind = 'practice' and v_task.practice ->> 'runner' = 'output';
  if v_task.kind = 'quiz' and (v_sol.task_id is null or coalesce(cardinality(v_sol.correct_option_ids), 0) = 0) then
    raise exception 'Task has no solution configured' using errcode = 'P0001';
  end if;
  if v_output and v_sol.expected_output is null then
    raise exception 'Task has no solution configured' using errcode = 'P0001';
  end if;

  if p_skip then
    v_correct := false;
    v_score := 0;
  elsif v_task.kind = 'quiz' then
    select coalesce(array_agg(x order by x), '{}')
      into v_selected
      from (select distinct jsonb_array_elements_text(coalesce(p_answer -> 'selected', '[]'::jsonb)) as x) s;
    v_correct := v_selected = (select coalesce(array_agg(y order by y), '{}') from unnest(v_sol.correct_option_ids) y);
    v_score := case when v_correct then 1 else 0 end;
  elsif v_output then
    -- One check: the output matches. A run that failed to compile or errored sends no output.
    v_correct := jsonb_typeof(p_answer -> 'output') = 'string'
                 and private.normalize_output(p_answer ->> 'output') = private.normalize_output(v_sol.expected_output);
    v_score := case when v_correct then 1 else 0 end;
    p_tests_passed := case when v_correct then 1 else 0 end;
    p_tests_total := 1;
  else
    if p_tests_total is null or p_tests_total <= 0 or p_tests_passed is null
       or p_tests_passed < 0 or p_tests_passed > p_tests_total then
      raise exception 'Invalid test counts' using errcode = '22023';
    end if;
    v_correct := p_tests_passed = p_tests_total;
    v_score := p_tests_passed::real / p_tests_total;
  end if;

  if v_item.help_used and v_score > 0 then
    v_score := v_score * 0.85;
  end if;

  update public.interview_items
     set status = case when p_skip then 'skipped'::public.item_status else 'answered'::public.item_status end,
         answer = case when p_skip then null else p_answer end,
         tests_passed = case when v_task.kind = 'practice' and not p_skip then p_tests_passed end,
         tests_total = case when v_task.kind = 'practice' and not p_skip then p_tests_total end,
         is_correct = v_correct,
         score = v_score,
         time_spent_seconds = greatest(0, least(coalesce(p_time_spent, 0), 6 * 3600)),
         submitted_at = now()
   where id = v_item.id;

  insert into public.user_task_progress as p (user_id, task_id, status, attempts, passes, last_score, last_attempt_at)
  values (
    v_user, v_item.task_id,
    case when v_correct then 'passed'::public.progress_status else 'failed'::public.progress_status end,
    1, case when v_correct then 1 else 0 end, v_score, now()
  )
  on conflict (user_id, task_id) do update
    set status = excluded.status,
        attempts = p.attempts + 1,
        passes = p.passes + excluded.passes,
        last_score = excluded.last_score,
        last_attempt_at = excluded.last_attempt_at;

  return jsonb_build_object('ok', true, 'status', case when p_skip then 'skipped' else 'answered' end);
end;
$$;

revoke all on function public.admin_import_course_items(jsonb, jsonb) from public, anon;
grant execute on function public.admin_import_course_items(jsonb, jsonb) to authenticated;
