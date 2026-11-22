-- =====================================================================
-- Course player: a course has modules, a module has slides (lecture, quiz, practice).
--   * Slides are public. Quiz answers and expected program output live in `private`.
--   * Progress is per user and per slide. Clients can read their own rows; every write goes
--     through the SECURITY DEFINER functions below, which do the grading.
--   * Anonymous visitors can check quiz answers and practice output; nothing is saved for them.
-- =====================================================================

alter table public.courses add constraint courses_id_slug_key unique (id, slug);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  title jsonb not null,
  sort_order smallint not null default 0,
  unique (course_id, slug),
  unique (id, course_id)
);

create table public.course_slides (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null,
  module_id uuid not null,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  kind text not null check (kind in ('lecture', 'quiz', 'practice')),
  title jsonb not null,
  body jsonb not null default '{}'::jsonb,
  -- quiz: {questions: [{id, mode: single|multi, prompt: {en, uk}, options: [{id, text: {en, uk}}]}]} (no answers)
  quiz jsonb,
  -- practice: {language: 'csharp', starter: '...'}
  practice jsonb,
  max_score smallint not null default 0 check (max_score >= 0),
  sort_order smallint not null default 0,
  updated_at timestamptz not null default now(),
  unique (course_id, slug),
  foreign key (module_id, course_id) references public.course_modules (id, course_id) on delete cascade,
  check ((kind = 'quiz') = (quiz is not null)),
  check ((kind = 'practice') = (practice is not null))
);
create index course_slides_module_idx on public.course_slides (module_id, sort_order);

create table private.course_slide_keys (
  slide_id uuid primary key references public.course_slides (id) on delete cascade,
  -- {questionId: [correct option ids]}
  quiz_answers jsonb,
  expected_output text,
  solution text
);

create table public.course_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  slide_id uuid not null references public.course_slides (id) on delete cascade,
  score smallint not null default 0,
  completed boolean not null default false,
  attempts integer not null default 0,
  last_code text,
  updated_at timestamptz not null default now(),
  primary key (user_id, slide_id)
);

alter table public.course_modules enable row level security;
alter table public.course_slides enable row level security;
alter table public.course_progress enable row level security;
alter table private.course_slide_keys enable row level security;

create policy "Catalog: course modules are public" on public.course_modules for select to anon, authenticated using (true);
create policy "Catalog: course slides are public" on public.course_slides for select to anon, authenticated using (true);
create policy "Course progress: read own" on public.course_progress for select to authenticated
  using (user_id = (select auth.uid()));

grant select on public.course_modules, public.course_slides to anon, authenticated;
grant select on public.course_progress to authenticated;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------

-- Normalises program output for comparison: CRLF → LF, no trailing spaces per line, no trailing blank lines.
create function private.normalize_output(p text)
returns text
language sql
immutable
set search_path = ''
as $$
  select rtrim(regexp_replace(replace(coalesce(p, ''), E'\r\n', E'\n'), E'[ \t]+(\n|$)', E'\\1', 'g'), E' \n\t')
$$;

-- ---------------------------------------------------------------------
-- Lectures: mark as read (signed-in users only; a no-op for anonymous visitors).
-- ---------------------------------------------------------------------
create function public.course_mark_viewed(p_slide uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    return;
  end if;
  if not exists (select 1 from public.course_slides where id = p_slide and kind = 'lecture') then
    raise exception 'Lecture not found' using errcode = 'P0002';
  end if;
  insert into public.course_progress (user_id, slide_id, score, completed, attempts)
  values (v_user, p_slide, 0, true, 0)
  on conflict (user_id, slide_id) do update set completed = true, updated_at = now();
end;
$$;

-- ---------------------------------------------------------------------
-- Quizzes: one point per fully correct question; the best score is kept.
--   p_answers: {questionId: [selected option ids]}
--   returns {score, max, results: {questionId: true|false}, saved}
-- ---------------------------------------------------------------------
create function public.course_submit_quiz(p_slide uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_max smallint;
  v_keys jsonb;
  v_results jsonb := '{}'::jsonb;
  v_score integer := 0;
  v_q record;
  v_ok boolean;
begin
  select s.max_score, k.quiz_answers into v_max, v_keys
    from public.course_slides s
    join private.course_slide_keys k on k.slide_id = s.id
   where s.id = p_slide and s.kind = 'quiz';
  if v_keys is null then
    raise exception 'Quiz not found' using errcode = 'P0002';
  end if;

  for v_q in select key, value from jsonb_each(v_keys) loop
    select coalesce(array_agg(x order by x), '{}') = coalesce((select array_agg(y order by y) from jsonb_array_elements_text(v_q.value) y), '{}')
      into v_ok
      from (select distinct jsonb_array_elements_text(
              case when jsonb_typeof(p_answers -> v_q.key) = 'array' then p_answers -> v_q.key else '[]'::jsonb end) as x) sel;
    v_results := v_results || jsonb_build_object(v_q.key, v_ok);
    if v_ok then
      v_score := v_score + 1;
    end if;
  end loop;

  v_score := least(v_score, v_max);

  if v_user is not null then
    insert into public.course_progress (user_id, slide_id, score, completed, attempts)
    values (v_user, p_slide, v_score, true, 1)
    on conflict (user_id, slide_id) do update
      set score = greatest(public.course_progress.score, excluded.score),
          completed = true,
          attempts = public.course_progress.attempts + 1,
          updated_at = now();
  end if;

  return jsonb_build_object('score', v_score, 'max', v_max, 'results', v_results, 'saved', v_user is not null);
end;
$$;

-- ---------------------------------------------------------------------
-- Practice: the app compiles and runs the code, then submits the program output here.
--   returns {passed, score, max, saved}
-- ---------------------------------------------------------------------
create function public.course_submit_practice(p_slide uuid, p_code text, p_output text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_max smallint;
  v_expected text;
  v_passed boolean;
begin
  if length(coalesce(p_code, '')) > 50000 or length(coalesce(p_output, '')) > 100000 then
    raise exception 'Submission is too large' using errcode = '22001';
  end if;

  select s.max_score, k.expected_output into v_max, v_expected
    from public.course_slides s
    join private.course_slide_keys k on k.slide_id = s.id
   where s.id = p_slide and s.kind = 'practice';
  if v_expected is null then
    raise exception 'Practice not found' using errcode = 'P0002';
  end if;

  v_passed := private.normalize_output(p_output) = private.normalize_output(v_expected);

  if v_user is not null then
    insert into public.course_progress (user_id, slide_id, score, completed, attempts, last_code)
    values (v_user, p_slide, case when v_passed then v_max else 0 end, v_passed, 1, p_code)
    on conflict (user_id, slide_id) do update
      set score = greatest(public.course_progress.score, excluded.score),
          completed = public.course_progress.completed or excluded.completed,
          attempts = public.course_progress.attempts + 1,
          last_code = excluded.last_code,
          updated_at = now();
  end if;

  return jsonb_build_object('passed', v_passed, 'score', case when v_passed then v_max else 0 end, 'max', v_max, 'saved', v_user is not null);
end;
$$;

-- Saves the editor contents without grading (signed-in users only).
create function public.course_save_code(p_slide uuid, p_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    return;
  end if;
  if length(coalesce(p_code, '')) > 50000 then
    raise exception 'Code is too large' using errcode = '22001';
  end if;
  if not exists (select 1 from public.course_slides where id = p_slide and kind = 'practice') then
    raise exception 'Practice not found' using errcode = 'P0002';
  end if;
  insert into public.course_progress (user_id, slide_id, last_code)
  values (v_user, p_slide, p_code)
  on conflict (user_id, slide_id) do update set last_code = excluded.last_code, updated_at = now();
end;
$$;

revoke execute on function public.course_mark_viewed(uuid) from public;
revoke execute on function public.course_submit_quiz(uuid, jsonb) from public;
revoke execute on function public.course_submit_practice(uuid, text, text) from public;
revoke execute on function public.course_save_code(uuid, text) from public;
revoke execute on function private.normalize_output(text) from public;
grant execute on function public.course_mark_viewed(uuid) to authenticated;
grant execute on function public.course_submit_quiz(uuid, jsonb) to anon, authenticated;
grant execute on function public.course_submit_practice(uuid, text, text) to anon, authenticated;
grant execute on function public.course_save_code(uuid, text) to authenticated;
