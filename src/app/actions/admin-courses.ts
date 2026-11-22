"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdminResult } from "@/app/actions/admin";
import type { CourseFormState, SlideFormState } from "@/lib/admin/course-forms";
import { formatIssues } from "@/lib/admin/validate";
import { isAdmin } from "@/lib/auth/roles";
import { runCSharp, type RunResult } from "@/lib/runner/csharp";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin-only course mutations. Each action re-checks the role, and every `admin_*` RPC checks it
 * again in the database (supabase/migrations/20261122160000_course_admin.sql).
 */

const FORBIDDEN: AdminResult = { ok: false, errors: ["Only admins can do this."] };
const slug = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "use lower-case letters, digits and dashes");
const uuid = z.string().uuid();
const loc = z.object({ en: z.string().max(100_000), uk: z.string().max(100_000) });

function dbError(error: { code?: string; message: string }): AdminResult {
  if (error.code === "23505") return { ok: false, errors: ["That slug is already taken in this course."] };
  return { ok: false, errors: [error.message] };
}

/** Courses appear on static pages (/courses, sitemap) and in the player, so refresh every localized page. */
function refreshSite() {
  revalidatePath("/[locale]", "layout");
}

const filled = (l: { en: string; uk: string }) => l.en.trim() !== "" && l.uk.trim() !== "";

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

const courseInput = z.object({
  create: z.boolean(),
  course: z.object({
    slug,
    title: loc,
    summary: loc,
    topics: z.array(loc).max(50),
    published: z.boolean(),
    sortOrder: z.number().int().min(0).max(1000),
  }),
});

export async function saveCourseAction(input: { create: boolean; course: CourseFormState }): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const parsed = courseInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };
  const { course: c, create } = parsed.data;
  const errors: string[] = [];
  if (!filled(c.title)) errors.push("title: fill in both English and Ukrainian");
  if (!filled(c.summary)) errors.push("summary: fill in both English and Ukrainian");
  const topics = c.topics.filter((t) => t.en.trim() || t.uk.trim());
  if (topics.some((t) => !filled(t))) errors.push("topics: every topic needs English and Ukrainian");
  if (errors.length) return { ok: false, errors };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_course", {
    p_course: { slug: c.slug, title: c.title, summary: c.summary, topics, published: c.published, sort_order: c.sortOrder },
    p_create: create,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true, slug: c.slug };
}

export async function deleteCourseAction(courseSlug: string): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  if (!slug.safeParse(courseSlug).success) return { ok: false, errors: ["Invalid slug."] };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_course", { p_slug: courseSlug });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

const moduleInput = z.object({
  id: uuid.nullable(),
  course: slug,
  slug,
  title: loc,
});

export async function saveModuleAction(input: z.input<typeof moduleInput>): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const parsed = moduleInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };
  const m = parsed.data;
  if (!filled(m.title)) return { ok: false, errors: ["title: fill in both English and Ukrainian"] };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_course_module", {
    p_module: { id: m.id, course: m.course, slug: m.slug, title: m.title },
    p_create: m.id === null,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true };
}

export async function deleteModuleAction(id: string): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  if (!uuid.safeParse(id).success) return { ok: false, errors: ["Invalid id."] };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_course_module", { p_id: id });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true };
}

export async function reorderAction(kind: "module" | "slide", ids: string[]): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  if (!z.array(uuid).max(500).safeParse(ids).success || !["module", "slide"].includes(kind)) return { ok: false, errors: ["Invalid order."] };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_reorder_course_items", { p_kind: kind, p_ids: ids });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Slides
// ---------------------------------------------------------------------------

const questionInput = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "question ids use lower-case letters, digits and dashes"),
  mode: z.enum(["single", "multi"]),
  prompt: loc,
  options: z.array(z.object({ id: z.string().regex(/^[a-z0-9]+$/), text: loc })).max(10),
  correct: z.array(z.string()).max(10),
});

const slideInput = z.object({
  id: uuid.nullable(),
  course: slug,
  moduleId: uuid,
  slug,
  kind: z.enum(["lecture", "quiz", "practice"]),
  title: loc,
  body: loc,
  questions: z.array(questionInput).max(50),
  starter: z.string().max(50_000),
  solution: z.string().max(50_000),
  expectedOutput: z.string().max(100_000),
  maxScore: z.number().int().min(0).max(100),
});

function slideIssues(s: z.infer<typeof slideInput>): string[] {
  const errors: string[] = [];
  if (!filled(s.title)) errors.push("title: fill in both English and Ukrainian");
  if (s.kind !== "quiz" && !filled(s.body)) errors.push("body: fill in both English and Ukrainian");
  if (s.kind === "quiz") {
    if (s.questions.length === 0) errors.push("quiz: add at least one question");
    const ids = new Set<string>();
    s.questions.forEach((q, i) => {
      const where = `question ${i + 1}`;
      if (ids.has(q.id)) errors.push(`${where}: duplicate id "${q.id}"`);
      ids.add(q.id);
      if (!filled(q.prompt)) errors.push(`${where}: fill in the question in both languages`);
      if (q.options.length < 2) errors.push(`${where}: add at least two options`);
      if (q.options.some((o) => !filled(o.text))) errors.push(`${where}: every option needs English and Ukrainian text`);
      if (new Set(q.options.map((o) => o.id)).size !== q.options.length) errors.push(`${where}: option ids must be unique`);
      const optionIds = new Set(q.options.map((o) => o.id));
      if (q.correct.length === 0) errors.push(`${where}: mark the correct answer`);
      if (q.correct.some((c) => !optionIds.has(c))) errors.push(`${where}: a correct answer points at a removed option`);
      if (q.mode === "single" && q.correct.length > 1) errors.push(`${where}: single choice needs exactly one correct answer`);
    });
  }
  if (s.kind === "practice") {
    if (!s.starter.trim()) errors.push("starter code is empty");
    if (!s.expectedOutput.trim()) errors.push("expected output is empty: run the solution to fill it in");
    if (s.maxScore < 1) errors.push("max score must be at least 1");
  }
  return errors;
}

export async function saveSlideAction(input: SlideFormState): Promise<AdminResult & { id?: string }> {
  if (!(await isAdmin())) return FORBIDDEN;
  const parsed = slideInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };
  const s = parsed.data;
  const issues = slideIssues(s);
  if (issues.length) return { ok: false, errors: issues };

  const payload = {
    id: s.id,
    course: s.course,
    module_id: s.moduleId,
    slug: s.slug,
    kind: s.kind,
    title: s.title,
    body: s.kind === "quiz" && !filled(s.body) ? { en: "", uk: "" } : s.body,
    quiz: s.kind === "quiz" ? { questions: s.questions } : null,
    practice:
      s.kind === "practice"
        ? { language: "csharp", starter: s.starter, solution: s.solution, expected_output: s.expectedOutput, max_score: s.maxScore }
        : null,
  };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_save_course_slide", {
    p_slide: JSON.parse(JSON.stringify(payload)) as Json,
    p_create: s.id === null,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true, slug: s.slug, id: data as string };
}

export async function deleteSlideAction(id: string): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  if (!uuid.safeParse(id).success) return { ok: false, errors: ["Invalid id."] };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_course_slide", { p_id: id });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true };
}

/** Runs C# for the slide editor, e.g. to fill in the expected output from the reference solution. */
export async function adminRunCSharpAction(code: string): Promise<{ ok: true; run: RunResult } | { ok: false; errors: string[] }> {
  if (!(await isAdmin())) return FORBIDDEN as { ok: false; errors: string[] };
  if (!z.string().max(50_000).safeParse(code).success) return { ok: false, errors: ["The code is too long."] };
  return { ok: true, run: await runCSharp(code) };
}
