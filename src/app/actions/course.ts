"use server";

import { z } from "zod";
import { loadCourseModules } from "@/lib/content/course-loader";
import { runCSharp, type RunResult } from "@/lib/runner/csharp";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const slideId = z.string().min(1).max(200);
const answersSchema = z.record(z.string().max(60), z.array(z.string().max(20)).max(10));
const codeSchema = z.string().max(50_000);

/** Set once the learner holds the course certificate; `new` on the submission that earned it. */
export type CertificateRef = { id: string; new: boolean } | null;
export type QuizOutcome = {
  score: number;
  max: number;
  results: Record<string, boolean>;
  /** Answer key per question, revealed only in the response to a submission. Absent before the 20261123180000 migration. */
  correct?: Record<string, string[]>;
  saved: boolean;
  certificate?: CertificateRef;
};
export type PracticeOutcome = { passed: boolean; score: number; max: number; saved: boolean; certificate?: CertificateRef };

/** Same normalisation as private.normalize_output in the database. */
const normalize = (s: string) =>
  s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+(\n|$)/g, "$1")
    .replace(/[ \t\n]+$/, "");

/** Finds a slide in the authored content by its local id "<course>/<slide>" (development without Supabase). */
function localSlide(id: string) {
  const [course, slug] = id.split("/");
  return loadCourseModules()
    .courses.find((c) => c.course === course)
    ?.modules.flatMap((m) => m.slides)
    .find((s) => s.slug === slug);
}

/** Issues the course certificate to a signed-in learner who already has 90% of the points. */
export async function claimCertificateAction(courseId: string) {
  if (!z.string().uuid().safeParse(courseId).success || !isSupabaseConfigured()) return { ok: false as const };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("course_claim_certificate", { p_course: courseId });
  if (error) return { ok: false as const };
  const result = data as { percent: number | null; certificate: CertificateRef };
  return { ok: true as const, percent: result.percent, certificate: result.certificate };
}

export async function markLectureViewedAction(id: string) {
  if (!slideId.safeParse(id).success || !isSupabaseConfigured()) return { ok: false as const };
  const supabase = await createClient();
  const { error } = await supabase.rpc("course_mark_viewed", { p_slide: id });
  return { ok: !error };
}

export async function submitQuizAction(id: string, answers: Record<string, string[]>) {
  const parsed = answersSchema.safeParse(answers);
  if (!slideId.safeParse(id).success || !parsed.success) return { ok: false as const, error: "invalid" as const };

  if (!isSupabaseConfigured()) {
    const slide = localSlide(id);
    if (slide?.kind !== "quiz") return { ok: false as const, error: "invalid" as const };
    const results: Record<string, boolean> = {};
    const correct: Record<string, string[]> = {};
    for (const q of slide.questions) {
      const selected = [...new Set(parsed.data[q.id] ?? [])].sort();
      results[q.id] = selected.join(",") === [...q.correct].sort().join(",");
      correct[q.id] = q.correct;
    }
    const score = Object.values(results).filter(Boolean).length;
    return { ok: true as const, outcome: { score, max: slide.maxScore, results, correct, saved: false } satisfies QuizOutcome };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("course_submit_quiz", { p_slide: id, p_answers: parsed.data });
  if (error) return { ok: false as const, error: "server" as const };
  return { ok: true as const, outcome: data as QuizOutcome };
}

export type RunResponse =
  | { ok: true; run: RunResult; outcome: PracticeOutcome | null }
  | { ok: false; error: "invalid" | "sign-in" | "server" };

/**
 * Compiles and runs the code on Wandbox, then grades the output. Running code needs a signed-in user
 * when the site has a database, so the endpoint can't be used as an anonymous compiler proxy.
 */
export async function runPracticeAction(id: string, code: string): Promise<RunResponse> {
  if (!slideId.safeParse(id).success || !codeSchema.safeParse(code).success) return { ok: false, error: "invalid" };

  if (!isSupabaseConfigured()) {
    const slide = localSlide(id);
    if (slide?.kind !== "practice") return { ok: false, error: "invalid" };
    const run = await runCSharp(code);
    const passed = run.status === "ok" && normalize(run.output) === normalize(slide.expectedOutput);
    return {
      ok: true,
      run,
      outcome: run.status === "ok" ? { passed, score: passed ? slide.maxScore : 0, max: slide.maxScore, saved: false } : null,
    };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return { ok: false, error: "sign-in" };

  const run = await runCSharp(code);
  if (run.status !== "ok") {
    // Keep the code even when it doesn't compile, so the next visit resumes from it.
    if (run.status === "compile-error") await supabase.rpc("course_save_code", { p_slide: id, p_code: code });
    return { ok: true, run, outcome: null };
  }
  const { data, error } = await supabase.rpc("course_submit_practice", { p_slide: id, p_code: code, p_output: run.output });
  if (error) return { ok: false, error: "server" };
  return { ok: true, run, outcome: data as PracticeOutcome };
}

export type SqlSubmitResponse = { ok: true; outcome: PracticeOutcome | null } | { ok: false; error: "invalid" | "server" };

/**
 * Grades a PostgreSQL practice. SQL runs in the learner's browser (PGlite), so the output arrives with
 * the code; this is the same trust model as course_submit_practice, which anyone may call directly.
 * `output` is null when the code failed with an error: the code is then only saved (signed-in users).
 */
export async function submitSqlPracticeAction(id: string, code: string, output: string | null): Promise<SqlSubmitResponse> {
  const outputOk = output === null || z.string().max(100_000).safeParse(output).success;
  if (!slideId.safeParse(id).success || !codeSchema.safeParse(code).success || !outputOk) return { ok: false, error: "invalid" };

  if (!isSupabaseConfigured()) {
    const slide = localSlide(id);
    if (slide?.kind !== "practice" || slide.language !== "sql") return { ok: false, error: "invalid" };
    if (output === null) return { ok: true, outcome: null };
    const passed = normalize(output) === normalize(slide.expectedOutput);
    return { ok: true, outcome: { passed, score: passed ? slide.maxScore : 0, max: slide.maxScore, saved: false } };
  }

  const supabase = await createClient();
  if (output === null) {
    await supabase.rpc("course_save_code", { p_slide: id, p_code: code });
    return { ok: true, outcome: null };
  }
  const { data, error } = await supabase.rpc("course_submit_practice", { p_slide: id, p_code: code, p_output: output });
  if (error) return { ok: false, error: "server" };
  return { ok: true, outcome: data as PracticeOutcome };
}
