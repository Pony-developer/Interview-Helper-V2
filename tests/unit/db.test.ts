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
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
create schema auth;
create table auth.users (id uuid primary key, raw_user_meta_data jsonb not null default '{}'::jsonb);
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
    await db.exec(`insert into auth.users (id, raw_user_meta_data) values
      ('${USER_A}', '{"full_name":"Ada"}'), ('${USER_B}', '{"full_name":"Bob"}');`);
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
});
