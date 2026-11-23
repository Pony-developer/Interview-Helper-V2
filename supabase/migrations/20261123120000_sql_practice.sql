-- =====================================================================
-- PostgreSQL practices: a practice slide may now be {language: 'sql', starter, setup}.
--   * SQL runs in the learner's browser on PGlite; the output is graded by course_submit_practice
--     exactly like C# output, so no grading change is needed.
--   * admin_save_course_slide keeps the setup script and rejects unknown languages.
-- =====================================================================

create or replace function public.admin_save_course_slide(p_slide jsonb, p_create boolean)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_course uuid;
  v_kind text;
  v_module uuid := (p_slide ->> 'module_id')::uuid;
  v_quiz jsonb;
  v_answers jsonb;
  v_practice jsonb;
  v_max smallint;
begin
  perform private.assert_admin();

  if p_create then
    select id into v_course from public.courses where slug = p_slide ->> 'course';
    v_kind := p_slide ->> 'kind';
  else
    select course_id, kind into v_course, v_kind from public.course_slides where id = (p_slide ->> 'id')::uuid;
  end if;
  if v_course is null then
    raise exception 'Slide or course not found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.course_modules where id = v_module and course_id = v_course) then
    raise exception 'The module belongs to another course' using errcode = 'P0001';
  end if;

  if v_kind = 'quiz' then
    if jsonb_array_length(coalesce(p_slide -> 'quiz' -> 'questions', '[]'::jsonb)) = 0 then
      raise exception 'A quiz needs at least one question' using errcode = 'P0001';
    end if;
    select jsonb_build_object('questions', jsonb_agg(q - 'correct' order by ord)),
           jsonb_object_agg(q ->> 'id', coalesce(q -> 'correct', '[]'::jsonb))
      into v_quiz, v_answers
      from jsonb_array_elements(p_slide -> 'quiz' -> 'questions') with ordinality as x(q, ord);
    v_max := jsonb_array_length(p_slide -> 'quiz' -> 'questions');
  elsif v_kind = 'practice' then
    if coalesce(p_slide -> 'practice' ->> 'expected_output', '') = '' then
      raise exception 'A practice needs the expected output' using errcode = 'P0001';
    end if;
    if coalesce(p_slide -> 'practice' ->> 'language', 'csharp') not in ('csharp', 'sql') then
      raise exception 'Unknown practice language' using errcode = 'P0001';
    end if;
    -- SQL practices also keep their setup script (the practice database), which learners may read.
    v_practice := jsonb_strip_nulls(jsonb_build_object(
      'language', coalesce(p_slide -> 'practice' ->> 'language', 'csharp'),
      'starter', coalesce(p_slide -> 'practice' ->> 'starter', ''),
      'setup', nullif(p_slide -> 'practice' ->> 'setup', '')));
    v_max := coalesce((p_slide -> 'practice' ->> 'max_score')::smallint, 5);
  else
    v_max := 0;
  end if;

  if p_create then
    insert into public.course_slides (course_id, module_id, slug, kind, title, body, quiz, practice, max_score, sort_order, source)
    values (
      v_course, v_module, p_slide ->> 'slug', v_kind, p_slide -> 'title', coalesce(p_slide -> 'body', '{}'::jsonb),
      v_quiz, v_practice, v_max,
      (select coalesce(max(sort_order), 0) + 1 from public.course_slides where module_id = v_module),
      'admin'
    )
    returning id into v_id;
  else
    v_id := (p_slide ->> 'id')::uuid;
    update public.course_slides
       set module_id = v_module,
           slug = p_slide ->> 'slug',
           title = p_slide -> 'title',
           body = coalesce(p_slide -> 'body', '{}'::jsonb),
           quiz = v_quiz,
           practice = v_practice,
           max_score = v_max,
           -- Moving to another module puts the slide at its end.
           sort_order = case when module_id = v_module then sort_order
                             else (select coalesce(max(s.sort_order), 0) + 1 from public.course_slides s where s.module_id = v_module) end,
           source = 'admin',
           updated_at = now()
     where id = v_id;
  end if;

  if v_kind = 'lecture' then
    delete from private.course_slide_keys where slide_id = v_id;
  else
    insert into private.course_slide_keys (slide_id, quiz_answers, expected_output, solution)
    values (v_id, v_answers, p_slide -> 'practice' ->> 'expected_output', p_slide -> 'practice' ->> 'solution')
    on conflict (slide_id) do update
      set quiz_answers = excluded.quiz_answers,
          expected_output = excluded.expected_output,
          solution = excluded.solution;
  end if;

  return v_id;
end;
$$;
