-- =====================================================================
-- Course certificates.
--   * A learner earns a course's certificate by scoring at least 90% of its points (best score per
--     quiz and practice; lectures carry no points).
--   * Certificates are issued by the database: automatically when a graded submission crosses the
--     threshold, or on request (course_claim_certificate) for learners who already qualify.
--   * The certificate id is an unguessable UUID; anyone with the link can view and verify it
--     through get_course_certificate. The table itself is readable only by its owner.
--   * Once issued, a certificate stays valid when the course changes later.
-- =====================================================================

create table public.course_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  holder_name text not null,
  score_percent smallint not null check (score_percent between 0 and 100),
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.course_certificates enable row level security;
create policy "Certificates: read own" on public.course_certificates for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.course_certificates to authenticated;

-- Share of points (0..100, rounded down) a learner has earned in a course; null when it has no graded slides.
create function private.course_score_percent(p_user uuid, p_course uuid)
returns smallint
language sql
stable
security definer
set search_path = ''
as $$
  select case when sum(s.max_score) > 0
              then floor(100.0 * sum(least(coalesce(p.score, 0), s.max_score)) / sum(s.max_score))::smallint end
    from public.course_slides s
    left join public.course_progress p on p.slide_id = s.id and p.user_id = p_user
   where s.course_id = p_course and s.max_score > 0
$$;

-- Issues the certificate when the learner qualifies. Returns {id, new} or null when not (yet) earned.
create function private.issue_course_certificate(p_user uuid, p_course uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_percent smallint;
  v_name text;
begin
  select id into v_id from public.course_certificates where user_id = p_user and course_id = p_course;
  if v_id is not null then
    return jsonb_build_object('id', v_id, 'new', false);
  end if;

  v_percent := private.course_score_percent(p_user, p_course);
  if v_percent is null or v_percent < 90 then
    return null;
  end if;

  select coalesce(nullif(trim(display_name), ''), 'Assay learner') into v_name from public.profiles where id = p_user;
  insert into public.course_certificates (user_id, course_id, holder_name, score_percent)
  values (p_user, p_course, coalesce(v_name, 'Assay learner'), v_percent)
  on conflict (user_id, course_id) do nothing
  returning id into v_id;
  if v_id is null then
    select id into v_id from public.course_certificates where user_id = p_user and course_id = p_course;
    return jsonb_build_object('id', v_id, 'new', false);
  end if;
  return jsonb_build_object('id', v_id, 'new', true);
end;
$$;

revoke execute on function private.course_score_percent(uuid, uuid) from public;
revoke execute on function private.issue_course_certificate(uuid, uuid) from public;

-- ---------------------------------------------------------------------
-- Grading functions now also issue the certificate. Same signatures as before; the result gains
-- `certificate`: {id, new} once the learner has one for this course.
-- ---------------------------------------------------------------------
create or replace function public.course_submit_quiz(p_slide uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_max smallint;
  v_course uuid;
  v_keys jsonb;
  v_results jsonb := '{}'::jsonb;
  v_score integer := 0;
  v_q record;
  v_ok boolean;
  v_certificate jsonb;
begin
  select s.max_score, s.course_id, k.quiz_answers into v_max, v_course, v_keys
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
    v_certificate := private.issue_course_certificate(v_user, v_course);
  end if;

  return jsonb_build_object('score', v_score, 'max', v_max, 'results', v_results, 'saved', v_user is not null,
                            'certificate', v_certificate);
end;
$$;

create or replace function public.course_submit_practice(p_slide uuid, p_code text, p_output text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_max smallint;
  v_course uuid;
  v_expected text;
  v_passed boolean;
  v_certificate jsonb;
begin
  if length(coalesce(p_code, '')) > 50000 or length(coalesce(p_output, '')) > 100000 then
    raise exception 'Submission is too large' using errcode = '22001';
  end if;

  select s.max_score, s.course_id, k.expected_output into v_max, v_course, v_expected
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
    v_certificate := private.issue_course_certificate(v_user, v_course);
  end if;

  return jsonb_build_object('passed', v_passed, 'score', case when v_passed then v_max else 0 end, 'max', v_max,
                            'saved', v_user is not null, 'certificate', v_certificate);
end;
$$;

-- ---------------------------------------------------------------------
-- Claim: for learners who already qualify (e.g. before certificates existed).
--   returns {percent, certificate: {id, new} | null}
-- ---------------------------------------------------------------------
create function public.course_claim_certificate(p_course uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Sign in to get a certificate' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'percent', private.course_score_percent(v_user, p_course),
    'certificate', private.issue_course_certificate(v_user, p_course));
end;
$$;

-- Public view of one certificate, for the shareable certificate page.
create function public.get_course_certificate(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
           'id', cc.id,
           'holder_name', cc.holder_name,
           'score_percent', cc.score_percent,
           'issued_at', cc.issued_at,
           'course_slug', c.slug,
           'course_title', c.title)
    from public.course_certificates cc
    join public.courses c on c.id = cc.course_id
   where cc.id = p_id
$$;

revoke execute on function public.course_claim_certificate(uuid) from public;
revoke execute on function public.get_course_certificate(uuid) from public;
grant execute on function public.course_claim_certificate(uuid) to authenticated;
grant execute on function public.get_course_certificate(uuid) to anon, authenticated;
