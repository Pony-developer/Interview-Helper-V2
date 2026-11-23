-- ---------------------------------------------------------------------
-- Quiz review: after a submission the result also carries the answer key, so the player can
-- highlight the correct options. Same signature and grants as before; the result gains
-- `correct`: {question id: [option ids]}. The key is still never sent before the learner submits.
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

  return jsonb_build_object('score', v_score, 'max', v_max, 'results', v_results, 'correct', v_keys,
                            'saved', v_user is not null, 'certificate', v_certificate);
end;
$$;
