/**
 * Runs the real migration + generated seed in PGlite (Postgres in WASM) with a minimal
 * stand-in for Supabase's auth schema and roles, then exercises RLS and the RPCs.
 * Requires `npm run seed:build` to have produced supabase/seed.sql.
 */
import { PGlite } from "@electric-sql/pglite";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const USER_A = "00000000-0000-4000-8000-00000000000a";
const USER_B = "00000000-0000-4000-8000-00000000000b";

const SUPABASE_STUB = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;
-- Like newer hosted Supabase projects: no default table grants for anon/authenticated,
-- so the migrations must grant every privilege the app relies on.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
create schema auth;
create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
`;

let db: PGlite;

async function asUser<T>(userId: string | null, fn: () => Promise<T>) {
  await db.exec(userId ? `set role authenticated; set request.jwt.claim.sub = '${userId}';` : `set role anon; set request.jwt.claim.sub = '';`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role; reset request.jwt.claim.sub;");
  }
}

const seedPath = path.resolve("supabase/seed.sql");

describe.skipIf(!existsSync(seedPath))("database schema, RLS and RPCs", () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(SUPABASE_STUB);
    const dir = path.resolve("supabase/migrations");
    for (const file of readdirSync(dir).sort()) await db.exec(readFileSync(path.join(dir, file), "utf8"));
    await db.exec(readFileSync(seedPath, "utf8"));
    // Ada signs up first, so she is the one the make-first-user-admin snippet promotes.
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data, created_at) values
      ('${USER_A}', 'ada@example.test', '{"full_name":"Ada"}', '2026-01-01T00:00:00Z'),
      ('${USER_B}', 'bob@example.test', '{"full_name":"Bob"}', '2026-02-01T00:00:00Z');`);
  }, 60_000);

  afterAll(async () => db?.close());

  it("creates profiles for new users", async () => {
    const { rows } = await db.query<{ display_name: string }>("select display_name from public.profiles order by display_name");
    expect(rows.map((r) => r.display_name)).toEqual(["Ada", "Bob"]);
  });

  it("exposes the catalogue to anonymous users but hides solutions", async () => {
    await asUser(null, async () => {
      const skills = await db.query<{ n: number }>("select count(*)::int as n from public.skills");
      expect(skills.rows[0].n).toBeGreaterThan(100);
      const tasks = await db.query<{ n: number }>("select count(*)::int as n from public.tasks");
      expect(tasks.rows[0].n).toBeGreaterThan(0);
      await expect(db.query("select * from private.task_solutions")).rejects.toThrow(/permission denied/);
      await expect(db.query("insert into public.skills (slug, name, category) values ('x','x','x')")).rejects.toThrow();
    });
  });

  it("publishes the C# and JavaScript courses and hides drafts from anonymous users", async () => {
    await db.exec(`insert into public.courses (slug, title, summary, published) values ('draft-course', '{"en":"Draft"}', '{"en":"Draft"}', false)`);
    try {
      await asUser(null, async () => {
        const { rows } = await db.query<{ slug: string; topics: unknown[] }>(
          "select slug, topics from public.courses order by sort_order",
        );
        expect(rows.map((r) => r.slug)).toEqual(["csharp", "javascript"]);
        expect(rows.every((r) => Array.isArray(r.topics) && r.topics.length > 0)).toBe(true);
        await expect(db.query("insert into public.courses (slug, title, summary) values ('x', '{}', '{}')")).rejects.toThrow();
      });
    } finally {
      await db.exec(`delete from public.courses where slug = 'draft-course'`);
    }
  });

  describe("course player", () => {
    const slideId = async (slug: string) =>
      (await db.query<{ id: string }>(`select id from public.course_slides where slug = $1`, [slug])).rows[0].id;

    it("seeds the C# modules and slides, and keeps answers private", async () => {
      await asUser(null, async () => {
        const modules = await db.query<{ slug: string }>(
          "select m.slug from public.course_modules m join public.courses c on c.id = m.course_id where c.slug = 'csharp' order by m.sort_order",
        );
        expect(modules.rows.map((r) => r.slug)).toEqual([
          "first-steps",
          "errors",
          "branching",
          "loops",
          "arrays",
          "collections-strings-files",
          "testing",
          "complexity",
        ]);
        const quiz = await db.query<{ quiz: { questions: Record<string, unknown>[] } }>(
          "select quiz from public.course_slides where slug = 'terminology'",
        );
        expect(quiz.rows[0].quiz.questions).toHaveLength(5);
        expect(JSON.stringify(quiz.rows[0].quiz)).not.toContain("correct");
        await expect(db.query("select * from private.course_slide_keys")).rejects.toThrow(/permission denied/);
        await expect(db.query("select * from public.course_progress")).rejects.toThrow(/permission denied/);
      });
    });

    it("grades quizzes for anonymous visitors without saving anything", async () => {
      const id = await slideId("terminology");
      const result = await asUser(null, async () =>
        (
          await db.query<{ r: { score: number; max: number; saved: boolean; results: Record<string, boolean> } }>(
            "select public.course_submit_quiz($1, $2::jsonb) as r",
            [id, JSON.stringify({ main: ["a"], keywords: ["a", "b", "d"], write: ["b"] })],
          )
        ).rows[0].r,
      );
      expect(result).toMatchObject({ score: 2, max: 5, saved: false });
      expect(result.results).toMatchObject({ main: true, keywords: true, write: false, compiler: false });
      const saved = await db.query<{ n: number }>("select count(*)::int as n from public.course_progress where slide_id = $1", [id]);
      expect(saved.rows[0].n).toBe(0);
    });

    it("saves the best quiz score, practice results and lecture views for signed-in users", async () => {
      const quiz = await slideId("terminology");
      const practice = await slideId("first-step");
      const lecture = await slideId("hello-world");
      const allCorrect = { main: ["a"], compiler: ["a"], keywords: ["d", "b", "a"], write: ["a"], "compile-error": ["a"] };

      await asUser(USER_A, async () => {
        await db.query("select public.course_submit_quiz($1, $2::jsonb)", [quiz, JSON.stringify(allCorrect)]);
        await db.query("select public.course_submit_quiz($1, $2::jsonb)", [quiz, JSON.stringify({ main: ["b"] })]);

        const wrong = await db.query<{ r: { passed: boolean } }>("select public.course_submit_practice($1, $2, $3) as r", [
          practice,
          "code v1",
          "Hello, Assay!\n",
        ]);
        expect(wrong.rows[0].r.passed).toBe(false);
        const right = await db.query<{ r: { passed: boolean; score: number } }>("select public.course_submit_practice($1, $2, $3) as r", [
          practice,
          "code v2",
          "Hello, Assay!  \r\nC# is ready.\r\n\r\n",
        ]);
        expect(right.rows[0].r).toMatchObject({ passed: true, score: 5 });

        await db.query("select public.course_mark_viewed($1)", [lecture]);
        await expect(db.query("select public.course_mark_viewed($1)", [quiz])).rejects.toThrow(/Lecture not found/);

        const rows = await db.query<{ slide_id: string; score: number; completed: boolean; attempts: number; last_code: string | null }>(
          "select slide_id, score, completed, attempts, last_code from public.course_progress",
        );
        const bySlide = new Map(rows.rows.map((r) => [r.slide_id, r]));
        expect(bySlide.get(quiz)).toMatchObject({ score: 5, completed: true, attempts: 2 });
        expect(bySlide.get(practice)).toMatchObject({ score: 5, completed: true, attempts: 2, last_code: "code v2" });
        expect(bySlide.get(lecture)).toMatchObject({ completed: true });
        await expect(
          db.query("insert into public.course_progress (user_id, slide_id, score) values ($1, $2, 99)", [USER_A, quiz]),
        ).rejects.toThrow();
      });

      // Bob sees none of Ada's progress.
      await asUser(USER_B, async () => {
        const rows = await db.query<{ n: number }>("select count(*)::int as n from public.course_progress");
        expect(rows.rows[0].n).toBe(0);
      });
    });
  });

  it("runs a full interview with grading under RLS", async () => {
    const quiz = (
      await db.query<{ id: string; correct: string[]; options: { id: string }[] }>(
        `select t.id, s.correct_option_ids as correct, t.quiz->'options' as options
           from public.tasks t join private.task_solutions s on s.task_id = t.id
          where t.kind = 'quiz' and t.quiz->>'mode' = 'single' order by t.slug limit 1`,
      )
    ).rows[0];
    const practice = (await db.query<{ id: string }>(`select id from public.tasks where kind = 'practice' order by slug limit 1`)).rows[0];
    const wrongOption = quiz.options.map((o) => o.id).find((id) => !quiz.correct.includes(id))!;

    const interviewId = await asUser(USER_A, async () => {
      const iv = await db.query<{ id: string }>(
        `insert into public.interviews (method, level, budget_seconds) values ('manual', 'middle', 900) returning id`,
      );
      const id = iv.rows[0].id;
      await db.query(`insert into public.interview_items (interview_id, task_id, position) values ($1, $2, 0), ($1, $3, 1)`, [
        id,
        quiz.id,
        practice.id,
      ]);
      return id;
    });

    // Another user can neither see nor answer it.
    await asUser(USER_B, async () => {
      const seen = await db.query(`select * from public.interviews where id = $1`, [interviewId]);
      expect(seen.rows).toHaveLength(0);
      const item = await db.query(`select id from public.interview_items where interview_id = $1`, [interviewId]);
      expect(item.rows).toHaveLength(0);
    });

    await asUser(USER_A, async () => {
      const items = (
        await db.query<{ id: string; task_id: string }>(
          `select id, task_id from public.interview_items where interview_id = $1 order by position`,
          [interviewId],
        )
      ).rows;

      // Clients cannot write results directly.
      await expect(db.query(`update public.interview_items set score = 1 where id = $1`, [items[0].id])).rejects.toThrow();

      // Quiz answered correctly after opening the lecture → 0.85 credit.
      await db.query(`select public.mark_help_used($1)`, [items[0].id]);
      await db.query(`select public.submit_item($1, $2::jsonb, null, null, 42)`, [items[0].id, JSON.stringify({ selected: quiz.correct })]);
      await expect(
        db.query(`select public.submit_item($1, $2::jsonb)`, [items[0].id, JSON.stringify({ selected: [wrongOption] })]),
      ).rejects.toThrow(/already submitted/);

      // Practice: 3 of 4 tests.
      await db.query(`select public.submit_item($1, $2::jsonb, 3, 4, 300)`, [items[1].id, JSON.stringify({ files: { "/a.ts": "x" } })]);

      // Review is unavailable until the interview is finished.
      await expect(db.query(`select * from public.get_interview_review($1)`, [interviewId])).rejects.toThrow(/not completed/);

      const finished = await db.query<{ r: { score: number; grade: string } }>(`select public.finish_interview($1) as r`, [interviewId]);
      const { score, grade } = finished.rows[0].r;
      expect(score).toBeGreaterThan(70);
      expect(score).toBeLessThan(85);
      expect(grade).toBe("18K");

      const review = await db.query<{ is_correct: boolean; score: number; correct_option_ids: string[] | null; help_used: boolean }>(
        `select * from public.get_interview_review($1)`,
        [interviewId],
      );
      expect(review.rows).toHaveLength(2);
      expect(review.rows[0]).toMatchObject({ is_correct: true, help_used: true });
      expect(review.rows[0].score).toBeCloseTo(0.85, 5);
      expect(review.rows[0].correct_option_ids).toEqual(quiz.correct);
      expect(review.rows[1]).toMatchObject({ is_correct: false });
      expect(review.rows[1].score).toBeCloseTo(0.75, 5);

      const progress = await db.query<{ status: string }>(`select status from public.user_task_progress order by status`);
      expect(progress.rows.map((r) => r.status).sort()).toEqual(["failed", "passed"]);

      const mastery = await db.query<{ n: number }>(`select count(*)::int as n from public.user_skill_mastery`);
      expect(mastery.rows[0].n).toBeGreaterThan(0);
    });

    await asUser(USER_B, async () => {
      const progress = await db.query(`select * from public.user_task_progress`);
      expect(progress.rows).toHaveLength(0);
      await expect(db.query(`select public.finish_interview($1)`, [interviewId])).rejects.toThrow(/not found/);
    });
  });

  it("marks unanswered items as skipped when finishing", async () => {
    await asUser(USER_B, async () => {
      const iv = await db.query<{ id: string }>(
        `insert into public.interviews (method, level, budget_seconds) values ('manual', 'junior', 300) returning id`,
      );
      const task = (await db.query<{ id: string }>(`select id from public.tasks order by slug limit 1`)).rows[0];
      await db.query(`insert into public.interview_items (interview_id, task_id, position) values ($1, $2, 0)`, [iv.rows[0].id, task.id]);
      const res = await db.query<{ r: { score: number; grade: string } }>(`select public.finish_interview($1) as r`, [iv.rows[0].id]);
      expect(res.rows[0].r).toEqual({ score: 0, grade: "ORE" });
    });
  });

  describe("user roles", () => {
    const roleOf = async (id: string) =>
      (await db.query<{ role: string }>(`select role from public.profiles where id = $1`, [id])).rows[0]?.role;

    it("gives every new user the 'user' role and blocks self-promotion", async () => {
      expect(await roleOf(USER_A)).toBe("user");
      expect(await roleOf(USER_B)).toBe("user");

      await asUser(USER_B, async () => {
        const own = await db.query<{ is_admin: boolean }>(`select public.is_admin() as is_admin`);
        expect(own.rows[0].is_admin).toBe(false);

        // Profile fields stay editable; the role column does not.
        await db.query(`update public.profiles set display_name = 'Bobby' where id = $1`, [USER_B]);
        await expect(db.query(`update public.profiles set role = 'admin' where id = $1`, [USER_B])).rejects.toThrow(/permission denied/);
        await expect(db.query(`select public.set_user_role($1, 'admin')`, [USER_B])).rejects.toThrow(/Only admins/);

        // Without the admin role, only the user's own profile is visible.
        const visible = await db.query(`select id from public.profiles`);
        expect(visible.rows).toHaveLength(1);
      });
      expect(await roleOf(USER_B)).toBe("user");

      await asUser(null, async () => {
        await expect(db.query(`select public.is_admin()`)).rejects.toThrow(/permission denied/);
      });
    });

    it("promotes the earliest sign-up with the make-first-user-admin snippet", async () => {
      const snippet = readFileSync(path.resolve("supabase/snippets/make-first-user-admin.sql"), "utf8");
      await db.exec(snippet);
      await db.exec(snippet); // idempotent
      expect(await roleOf(USER_A)).toBe("admin");
      expect(await roleOf(USER_B)).toBe("user");
    });

    it("lets admins read all profiles and manage roles, keeping at least one admin", async () => {
      await asUser(USER_A, async () => {
        const all = await db.query(`select id from public.profiles`);
        expect(all.rows).toHaveLength(2);

        await db.query(`select public.set_user_role($1, 'admin')`, [USER_B]);
        await db.query(`select public.set_user_role($1, 'user')`, [USER_B]);
        await expect(db.query(`select public.set_user_role($1, 'user')`, [USER_A])).rejects.toThrow(/At least one admin/);
        await expect(db.query(`select public.set_user_role($1, 'admin')`, ["00000000-0000-4000-8000-0000000000ff"])).rejects.toThrow(
          /User not found/,
        );
      });
      expect(await roleOf(USER_A)).toBe("admin");
      expect(await roleOf(USER_B)).toBe("user");
    });
  });

  // Runs after "user roles": Ada (USER_A) is an admin, Bob (USER_B) is not.
  describe("admin content management", () => {
    const L = (en: string) => ({ en, uk: `${en} (uk)` });
    const newQuiz = {
      slug: "admin-quiz-one",
      kind: "quiz",
      complexity: 2,
      est_seconds: 60,
      title: L("Admin quiz"),
      prompt: L("Pick b"),
      explanation: L("Because b"),
      published: true,
      lecture: null,
      skills: [{ slug: "admin-skill", weight: 1 }],
      quiz: { mode: "single", options: [{ id: "a", text: L("A") }, { id: "b", text: L("B") }] },
      correct: ["b"],
    };

    it("rejects content writes from non-admins and anonymous users", async () => {
      await asUser(USER_B, async () => {
        await expect(db.query(`select public.admin_save_task($1::jsonb, true)`, [JSON.stringify(newQuiz)])).rejects.toThrow(/Only admins/);
        await expect(db.query(`select public.admin_get_task('js-typeof-null')`)).rejects.toThrow(/Only admins/);
        await expect(db.query(`select public.admin_delete_lecture('javascript')`)).rejects.toThrow(/Only admins/);
        await expect(db.query(`update public.tasks set complexity = 1`)).rejects.toThrow(/permission denied/);
      });
      await asUser(null, async () => {
        await expect(db.query(`select public.admin_save_skill('{}'::jsonb, true)`)).rejects.toThrow(/permission denied/);
      });
    });

    it("lets admins create a skill, lecture and gradable quiz", async () => {
      await asUser(USER_A, async () => {
        await db.query(`select public.admin_save_skill($1::jsonb, true)`, [
          JSON.stringify({ slug: "admin-skill", name: "Admin Skill", category: "practices", aliases: ["adm"], codeable: false, popularity: 10 }),
        ]);
        await db.query(`select public.admin_save_lecture($1::jsonb, true)`, [
          JSON.stringify({ slug: "admin-skill", skill: "admin-skill", title: L("T"), summary: L("S"), body: L("# Body"), reading_minutes: 3 }),
        ]);

        await expect(
          db.query(`select public.admin_save_task($1::jsonb, true)`, [JSON.stringify({ ...newQuiz, correct: ["z"] })]),
        ).rejects.toThrow(/existing option ids/);
        await expect(
          db.query(`select public.admin_save_task($1::jsonb, true)`, [JSON.stringify({ ...newQuiz, skills: [{ slug: "nope", weight: 1 }] })]),
        ).rejects.toThrow(/Unknown skill: nope/);

        await db.query(`select public.admin_save_task($1::jsonb, true)`, [JSON.stringify(newQuiz)]);
        const got = (await db.query<{ t: Record<string, unknown> }>(`select public.admin_get_task('admin-quiz-one') as t`)).rows[0].t;
        expect(got).toMatchObject({ kind: "quiz", lecture: "admin-skill", correct: ["b"], source: "admin", used_in_interviews: false });

        // Changing the kind of an existing task is refused.
        await expect(
          db.query(`select public.admin_save_task($1::jsonb, false)`, [JSON.stringify({ ...newQuiz, kind: "practice", quiz: null, practice: {} })]),
        ).rejects.toThrow(/kind/);
      });

      const flags = await db.query<{ has_content: boolean; source: string }>(`select has_content, source from public.skills where slug = 'admin-skill'`);
      expect(flags.rows[0]).toEqual({ has_content: true, source: "admin" });
      const sol = await db.query<{ correct_option_ids: string[] }>(
        `select s.correct_option_ids from private.task_solutions s join public.tasks t on t.id = s.task_id where t.slug = 'admin-quiz-one'`,
      );
      expect(sol.rows[0].correct_option_ids).toEqual(["b"]);
    });

    it("keeps admin edits when the seed runs again", async () => {
      const seedTask = (await db.query<{ slug: string }>(`select slug from public.tasks where kind = 'quiz' and source = 'seed' order by slug limit 1`)).rows[0].slug;
      await asUser(USER_A, async () => {
        const t = (await db.query<{ t: Record<string, unknown> }>(`select public.admin_get_task($1) as t`, [seedTask])).rows[0].t;
        await db.query(`select public.admin_save_task($1::jsonb, false)`, [JSON.stringify({ ...t, title: L("Edited by admin") })]);
      });

      await db.exec(readFileSync(seedPath, "utf8"));

      const rows = await db.query<{ slug: string; title: { en: string }; published: boolean }>(
        `select slug, title, published from public.tasks where slug in ($1, 'admin-quiz-one') order by slug`,
        [seedTask],
      );
      expect(rows.rows.find((r) => r.slug === seedTask)?.title.en).toBe("Edited by admin");
      expect(rows.rows.find((r) => r.slug === "admin-quiz-one")?.published).toBe(true);
      const links = await db.query<{ n: number }>(
        `select count(*)::int as n from public.task_skills ts join public.tasks t on t.id = ts.task_id where t.slug = $1`,
        [seedTask],
      );
      expect(links.rows[0].n).toBeGreaterThan(0);
    });

    it("unpublishes tasks used in interviews instead of deleting them", async () => {
      const used = (await db.query<{ slug: string }>(`select t.slug from public.interview_items ii join public.tasks t on t.id = ii.task_id limit 1`)).rows[0].slug;
      await asUser(USER_A, async () => {
        await expect(db.query(`select public.admin_delete_task($1)`, [used])).rejects.toThrow(/unpublish/);
        await db.query(`select public.admin_set_task_published($1, false)`, [used]);
        // Admins still see the unpublished task; ordinary users do not.
        expect((await db.query(`select 1 from public.tasks where slug = $1`, [used])).rows).toHaveLength(1);
        await db.query(`select public.admin_delete_task('admin-quiz-one')`);
        await expect(db.query(`select public.admin_delete_skill('admin-skill')`)).rejects.toThrow(/still used/);
        await db.query(`select public.admin_delete_lecture('admin-skill')`);
        await db.query(`select public.admin_delete_skill('admin-skill')`);
      });
      await asUser(USER_B, async () => {
        expect((await db.query(`select 1 from public.tasks where slug = $1`, [used])).rows).toHaveLength(0);
      });
    });
  });
});
