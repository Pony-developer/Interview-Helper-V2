-- =====================================================================
-- Assay — initial schema
--   Catalog: skills, lectures, tasks, task_skills (public read)
--   Private: private.task_solutions (never exposed through the API)
--   User data: profiles, interviews, interview_items, user_task_progress
--   RPCs: submit_item, mark_help_used, finish_interview, get_interview_review
-- Localised text is stored as jsonb {"en": "...", "uk": "..."}.
-- =====================================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.task_kind as enum ('quiz', 'practice');
create type public.interview_method as enum ('manual', 'url', 'llm_url', 'llm_text');
create type public.interview_level as enum ('junior', 'middle', 'senior');
create type public.interview_status as enum ('in_progress', 'completed', 'abandoned');
create type public.item_status as enum ('pending', 'answered', 'skipped');
create type public.progress_status as enum ('passed', 'failed');

-- ---------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  name text not null,
  category text not null,
  aliases text[] not null default '{}',
  description jsonb not null default '{}'::jsonb,
  codeable boolean not null default false,
  has_content boolean not null default false,
  popularity smallint not null default 0,
  created_at timestamptz not null default now()
);
create index skills_category_idx on public.skills (category);

create table public.lectures (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  skill_id uuid not null references public.skills (id) on delete cascade,
  title jsonb not null,
  summary jsonb not null,
  body jsonb not null,
  reading_minutes smallint not null default 5,
  updated_at timestamptz not null default now()
);
create index lectures_skill_idx on public.lectures (skill_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  kind public.task_kind not null,
  complexity smallint not null check (complexity between 1 and 5),
  est_seconds integer not null check (est_seconds > 0),
  title jsonb not null,
  prompt jsonb not null,
  lecture_id uuid references public.lectures (id) on delete set null,
  -- quiz:     {"mode": "single"|"multi", "code"?: string, "options": [{"id","text":{en,uk},"code"?}]}
  quiz jsonb,
  -- practice: {"framework", "files": {path: code}, "visibleFiles": [], "activeFile", "tests": string}
  practice jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint tasks_payload_matches_kind check (
    (kind = 'quiz' and quiz is not null and practice is null)
    or (kind = 'practice' and practice is not null and quiz is null)
  )
);
create index tasks_kind_idx on public.tasks (kind) where published;

create table public.task_skills (
  task_id uuid not null references public.tasks (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  weight real not null default 1 check (weight > 0 and weight <= 1),
  primary key (task_id, skill_id)
);
create index task_skills_skill_idx on public.task_skills (skill_id);

create table private.task_solutions (
  task_id uuid primary key references public.tasks (id) on delete cascade,
  correct_option_ids text[],
  explanation jsonb not null default '{}'::jsonb,
  solution_files jsonb
);

-- ---------------------------------------------------------------------
-- User data
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'uk')),
  method public.interview_method not null,
  source_url text check (source_url is null or char_length(source_url) <= 2048),
  level public.interview_level not null,
  detected_skill_ids uuid[] not null default '{}',
  focus_skill_ids uuid[] not null default '{}',
  status public.interview_status not null default 'in_progress',
  budget_seconds integer not null check (budget_seconds > 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score real,
  grade text
);
create index interviews_user_idx on public.interviews (user_id, started_at desc);

create table public.interview_items (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete restrict,
  position smallint not null,
  status public.item_status not null default 'pending',
  answer jsonb,
  tests_passed integer,
  tests_total integer,
  is_correct boolean,
  score real,
  help_used boolean not null default false,
  time_spent_seconds integer not null default 0,
  submitted_at timestamptz,
  unique (interview_id, position),
  unique (interview_id, task_id)
);
create index interview_items_interview_idx on public.interview_items (interview_id, position);

create table public.user_task_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  status public.progress_status not null,
  attempts integer not null default 0,
  passes integer not null default 0,
  last_score real not null default 0,
  last_attempt_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

-- Aggregated mastery inputs per user & skill (computed with security_invoker so RLS applies).
create view public.user_skill_mastery
with (security_invoker = true) as
select
  p.user_id,
  ts.skill_id,
  count(*)::int as tasks_attempted,
  count(*) filter (where p.status = 'passed')::int as tasks_passed,
  sum(p.attempts)::int as attempts,
  avg(p.last_score)::real as avg_last_score,
  max(p.last_attempt_at) as last_attempt_at
from public.user_task_progress p
join public.task_skills ts on ts.task_id = p.task_id
group by p.user_id, ts.skill_id;

-- ---------------------------------------------------------------------
-- New user → profile
-- ---------------------------------------------------------------------
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------
alter table public.skills enable row level security;
alter table public.lectures enable row level security;
alter table public.tasks enable row level security;
alter table public.task_skills enable row level security;
alter table public.profiles enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_items enable row level security;
alter table public.user_task_progress enable row level security;
alter table private.task_solutions enable row level security;

create policy "Catalog: skills are public" on public.skills for select to anon, authenticated using (true);
create policy "Catalog: lectures are public" on public.lectures for select to anon, authenticated using (true);
create policy "Catalog: published tasks are public" on public.tasks for select to anon, authenticated using (published);
create policy "Catalog: task skills are public" on public.task_skills for select to anon, authenticated using (true);

create policy "Profiles: read own" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Profiles: update own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Interviews: read own" on public.interviews for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Interviews: create own" on public.interviews for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'in_progress' and score is null and grade is null);

create policy "Items: read own" on public.interview_items for select to authenticated
  using (exists (
    select 1 from public.interviews i
    where i.id = interview_id and i.user_id = (select auth.uid())
  ));
create policy "Items: create for own open interview" on public.interview_items for insert to authenticated
  with check (
    status = 'pending' and answer is null and score is null and is_correct is null
    and exists (
      select 1 from public.interviews i
      where i.id = interview_id and i.user_id = (select auth.uid()) and i.status = 'in_progress'
    )
  );

create policy "Progress: read own" on public.user_task_progress for select to authenticated
  using ((select auth.uid()) = user_id);

-- Column-level hardening: clients may only read; all writes beyond the inserts above go through RPCs.
revoke update, delete on public.interviews, public.interview_items, public.user_task_progress from anon, authenticated;
revoke insert, update, delete on public.skills, public.lectures, public.tasks, public.task_skills from anon, authenticated;

-- ---------------------------------------------------------------------
-- Grading helpers
-- ---------------------------------------------------------------------
create function private.complexity_weight(c smallint)
returns real
language sql
immutable
as $$ select (1 + 0.25 * (c - 1))::real $$;

create function private.karat_grade(pct real)
returns text
language sql
immutable
as $$
  select case
    when pct >= 95 then '24K'
    when pct >= 85 then '22K'
    when pct >= 70 then '18K'
    when pct >= 55 then '14K'
    when pct >= 40 then '10K'
    else 'ORE'
  end
$$;

-- Loads an item and verifies that the caller owns its open interview.
create function private.owned_open_item(p_item_id uuid)
returns public.interview_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.interview_items;
begin
  select ii.* into v_item
  from public.interview_items ii
  join public.interviews i on i.id = ii.interview_id
  where ii.id = p_item_id
    and i.user_id = auth.uid()
    and i.status = 'in_progress';

  if not found then
    raise exception 'Item not found or interview closed' using errcode = 'P0002';
  end if;
  return v_item;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: submit (or skip) an item
--   p_answer for quiz:     {"selected": ["a","c"]}
--   p_answer for practice: {"files": {path: code}}
--   p_skip = true records a skip (score 0)
-- Correctness is intentionally not returned (interview feel).
-- ---------------------------------------------------------------------
create function public.submit_item(
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
  if v_task.kind = 'quiz' and (v_sol.task_id is null or coalesce(cardinality(v_sol.correct_option_ids), 0) = 0) then
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

-- ---------------------------------------------------------------------
-- RPC: record that the user opened the help lecture for an item
-- ---------------------------------------------------------------------
create function public.mark_help_used(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.interview_items;
begin
  v_item := private.owned_open_item(p_item_id);
  if v_item.status = 'pending' then
    update public.interview_items set help_used = true where id = v_item.id;
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: finish an interview → score (complexity-weighted %) and karat grade
-- Pending items are recorded as skipped.
-- ---------------------------------------------------------------------
create function public.finish_interview(p_interview_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_interview public.interviews;
  v_pct real;
  v_grade text;
begin
  select * into v_interview from public.interviews
   where id = p_interview_id and user_id = auth.uid();
  if not found then
    raise exception 'Interview not found' using errcode = 'P0002';
  end if;

  if v_interview.status = 'completed' then
    return jsonb_build_object('score', v_interview.score, 'grade', v_interview.grade);
  end if;

  -- Unanswered items count as skipped (and as failed attempts in progress tracking).
  insert into public.user_task_progress as p (user_id, task_id, status, attempts, passes, last_score, last_attempt_at)
  select auth.uid(), ii.task_id, 'failed', 1, 0, 0, now()
    from public.interview_items ii
   where ii.interview_id = p_interview_id and ii.status = 'pending'
  on conflict (user_id, task_id) do update
    set status = 'failed', attempts = p.attempts + 1, last_score = 0, last_attempt_at = now();

  update public.interview_items
     set status = 'skipped', is_correct = false, score = 0, submitted_at = now()
   where interview_id = p_interview_id and status = 'pending';

  select coalesce(
           100 * sum(coalesce(ii.score, 0) * private.complexity_weight(t.complexity))
               / nullif(sum(private.complexity_weight(t.complexity)), 0),
           0)::real
    into v_pct
    from public.interview_items ii
    join public.tasks t on t.id = ii.task_id
   where ii.interview_id = p_interview_id;

  v_grade := private.karat_grade(v_pct);

  update public.interviews
     set status = 'completed', completed_at = now(), score = round(v_pct::numeric, 1), grade = v_grade
   where id = p_interview_id;

  return jsonb_build_object('score', round(v_pct::numeric, 1), 'grade', v_grade);
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: review a completed interview, including correct answers
-- ---------------------------------------------------------------------
create function public.get_interview_review(p_interview_id uuid)
returns table (
  item_id uuid,
  item_position smallint,
  task_id uuid,
  status public.item_status,
  answer jsonb,
  tests_passed integer,
  tests_total integer,
  is_correct boolean,
  score real,
  help_used boolean,
  time_spent_seconds integer,
  correct_option_ids text[],
  explanation jsonb,
  solution_files jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.interviews i
     where i.id = p_interview_id and i.user_id = auth.uid() and i.status = 'completed'
  ) then
    raise exception 'Interview not found or not completed' using errcode = 'P0002';
  end if;

  return query
  select ii.id, ii.position, ii.task_id, ii.status, ii.answer, ii.tests_passed, ii.tests_total,
         ii.is_correct, ii.score, ii.help_used, ii.time_spent_seconds,
         s.correct_option_ids, s.explanation, s.solution_files
    from public.interview_items ii
    left join private.task_solutions s on s.task_id = ii.task_id
   where ii.interview_id = p_interview_id
   order by ii.position;
end;
$$;

-- ---------------------------------------------------------------------
-- Function privileges: only signed-in users may call the RPCs.
-- ---------------------------------------------------------------------
revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.owned_open_item(uuid) from public, anon, authenticated;
revoke execute on function public.submit_item(uuid, jsonb, integer, integer, integer, boolean) from public, anon;
revoke execute on function public.mark_help_used(uuid) from public, anon;
revoke execute on function public.finish_interview(uuid) from public, anon;
revoke execute on function public.get_interview_review(uuid) from public, anon;
grant execute on function public.submit_item(uuid, jsonb, integer, integer, integer, boolean) to authenticated;
grant execute on function public.mark_help_used(uuid) to authenticated;
grant execute on function public.finish_interview(uuid) to authenticated;
grant execute on function public.get_interview_review(uuid) to authenticated;
