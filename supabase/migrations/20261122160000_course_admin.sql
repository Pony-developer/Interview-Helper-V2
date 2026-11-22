-- =====================================================================
-- Course administration: admins create, edit, reorder and delete courses, modules and slides.
--   * Every write goes through an admin-only SECURITY DEFINER RPC; clients still can't write tables.
--   * `source` marks who owns a row, like skills, lectures and tasks: the generated seed only
--     overwrites (or deletes) 'seed' rows, so re-seeding never undoes an admin edit.
-- =====================================================================

alter table public.courses add column source text not null default 'seed' check (source in ('seed', 'admin'));
alter table public.course_modules add column source text not null default 'seed' check (source in ('seed', 'admin'));
alter table public.course_slides add column source text not null default 'seed' check (source in ('seed', 'admin'));

-- Admins also see unpublished courses (visitors only see published ones).
create policy "Catalog: admins read all courses" on public.courses for select to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- Courses
--   p_course: {slug, title: {en, uk}, summary: {en, uk}, topics: [{en, uk}], sort_order, published}
-- ---------------------------------------------------------------------
create function public.admin_save_course(p_course jsonb, p_create boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slug text := p_course ->> 'slug';
begin
  perform private.assert_admin();
  if p_create then
    insert into public.courses (slug, title, summary, topics, sort_order, published, source)
    values (
      v_slug,
      p_course -> 'title',
      p_course -> 'summary',
      coalesce(p_course -> 'topics', '[]'::jsonb),
      coalesce((p_course ->> 'sort_order')::smallint, 0),
      coalesce((p_course ->> 'published')::boolean, true),
      'admin'
    );
  else
    update public.courses
       set title = p_course -> 'title',
           summary = p_course -> 'summary',
           topics = coalesce(p_course -> 'topics', '[]'::jsonb),
           sort_order = coalesce((p_course ->> 'sort_order')::smallint, sort_order),
           published = coalesce((p_course ->> 'published')::boolean, published),
           source = 'admin',
           updated_at = now()
     where slug = v_slug;
    if not found then
      raise exception 'Course not found' using errcode = 'P0002';
    end if;
  end if;
  return v_slug;
end;
$$;

-- Deletes a course with its modules, slides and everyone's progress in it.
create function public.admin_delete_course(p_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin();
  delete from public.courses where slug = p_slug;
  if not found then
    raise exception 'Course not found' using errcode = 'P0002';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- Modules
--   p_module: {id (update only), course (slug, create only), slug, title: {en, uk}, sort_order}
-- ---------------------------------------------------------------------
create function public.admin_save_course_module(p_module jsonb, p_create boolean)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_course uuid;
begin
  perform private.assert_admin();
  if p_create then
    select id into v_course from public.courses where slug = p_module ->> 'course';
    if v_course is null then
      raise exception 'Course not found' using errcode = 'P0002';
    end if;
    insert into public.course_modules (course_id, slug, title, sort_order, source)
    values (
      v_course,
      p_module ->> 'slug',
      p_module -> 'title',
      coalesce((p_module ->> 'sort_order')::smallint,
               (select coalesce(max(sort_order), 0) + 1 from public.course_modules where course_id = v_course)),
      'admin'
    )
    returning id into v_id;
  else
    update public.course_modules
       set slug = p_module ->> 'slug',
           title = p_module -> 'title',
           sort_order = coalesce((p_module ->> 'sort_order')::smallint, sort_order),
           source = 'admin'
     where id = (p_module ->> 'id')::uuid
    returning id into v_id;
    if v_id is null then
      raise exception 'Module not found' using errcode = 'P0002';
    end if;
  end if;
  return v_id;
end;
$$;

create function public.admin_delete_course_module(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin();
  delete from public.course_modules where id = p_id;
  if not found then
    raise exception 'Module not found' using errcode = 'P0002';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- Slides
--   p_slide: {id (update only), course (slug, create only), module_id, slug, kind (create only),
--             title, body: {en, uk},
--             quiz: {questions: [{id, mode, prompt, options: [{id, text}], correct: [ids]}]},
--             practice: {language, starter, expected_output, solution, max_score}}
--   The answers (correct options, expected output, solution) go to private.course_slide_keys.
-- ---------------------------------------------------------------------
create function public.admin_save_course_slide(p_slide jsonb, p_create boolean)
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
    v_practice := jsonb_build_object(
      'language', coalesce(p_slide -> 'practice' ->> 'language', 'csharp'),
      'starter', coalesce(p_slide -> 'practice' ->> 'starter', ''));
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

-- One slide with its answers, for the editor.
create function public.admin_get_course_slide(p_id uuid)
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
           'id', s.id, 'course', c.slug, 'module_id', s.module_id, 'slug', s.slug, 'kind', s.kind,
           'title', s.title, 'body', s.body, 'quiz', s.quiz, 'practice', s.practice, 'max_score', s.max_score,
           'source', s.source, 'updated_at', s.updated_at,
           'quiz_answers', k.quiz_answers, 'expected_output', k.expected_output, 'solution', k.solution)
    into v
    from public.course_slides s
    join public.courses c on c.id = s.course_id
    left join private.course_slide_keys k on k.slide_id = s.id
   where s.id = p_id;
  if v is null then
    raise exception 'Slide not found' using errcode = 'P0002';
  end if;
  return v;
end;
$$;

create function public.admin_delete_course_slide(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin();
  delete from public.course_slides where id = p_id;
  if not found then
    raise exception 'Slide not found' using errcode = 'P0002';
  end if;
end;
$$;

-- Reorders modules of one course, or slides of one module: p_ids in the new order.
create function public.admin_reorder_course_items(p_kind text, p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_admin();
  if p_kind = 'module' then
    update public.course_modules m set sort_order = x.ord, source = 'admin'
      from unnest(p_ids) with ordinality as x(id, ord) where m.id = x.id;
  elsif p_kind = 'slide' then
    update public.course_slides s set sort_order = x.ord, source = 'admin', updated_at = now()
      from unnest(p_ids) with ordinality as x(id, ord) where s.id = x.id;
  else
    raise exception 'Unknown kind' using errcode = '22023';
  end if;
end;
$$;

revoke execute on function public.admin_save_course(jsonb, boolean) from public;
revoke execute on function public.admin_delete_course(text) from public;
revoke execute on function public.admin_save_course_module(jsonb, boolean) from public;
revoke execute on function public.admin_delete_course_module(uuid) from public;
revoke execute on function public.admin_save_course_slide(jsonb, boolean) from public;
revoke execute on function public.admin_get_course_slide(uuid) from public;
revoke execute on function public.admin_delete_course_slide(uuid) from public;
revoke execute on function public.admin_reorder_course_items(text, uuid[]) from public;
grant execute on function public.admin_save_course(jsonb, boolean) to authenticated;
grant execute on function public.admin_delete_course(text) to authenticated;
grant execute on function public.admin_save_course_module(jsonb, boolean) to authenticated;
grant execute on function public.admin_delete_course_module(uuid) to authenticated;
grant execute on function public.admin_save_course_slide(jsonb, boolean) to authenticated;
grant execute on function public.admin_get_course_slide(uuid) to authenticated;
grant execute on function public.admin_delete_course_slide(uuid) to authenticated;
grant execute on function public.admin_reorder_course_items(text, uuid[]) to authenticated;
