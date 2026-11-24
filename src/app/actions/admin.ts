"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formatIssues, taskIssues } from "@/lib/admin/validate";
import { isAdmin } from "@/lib/auth/roles";
import { adminTaskDef, localized, skillDef } from "@/lib/content/schema";
import { countTests, outputPracticeFile, type PracticePayload } from "@/lib/playground/frameworks";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin-only content mutations. Each action re-checks the role, and the database checks it again
 * inside every `admin_*` RPC (see supabase/migrations/20261120120000_admin_content.sql).
 */

export type AdminResult = { ok: true; slug?: string } | { ok: false; errors: string[] };

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "use lower-case letters, digits and dashes");
const FORBIDDEN: AdminResult = {
  ok: false,
  errors: ["Only admins can do this."],
};

function dbError(error: { code?: string; message: string }): AdminResult {
  if (error.code === "23505") return { ok: false, errors: ["That slug is already taken."] };
  return { ok: false, errors: [error.message] };
}

/** Content shows up on static pages (landing, lectures, sitemap), so refresh every localized page. */
function refreshSite() {
  revalidatePath("/[locale]", "layout");
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

const taskInput = z.object({
  create: z.boolean(),
  published: z.boolean(),
  task: adminTaskDef,
});

export async function saveTaskAction(input: z.input<typeof taskInput>): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const parsed = taskInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };
  const { task: t, create, published } = parsed.data;
  if ("runner" in t) return saveOutputPractice(t, create, published);
  const issues = taskIssues(t);
  if (issues.length) return { ok: false, errors: issues };

  const practice: PracticePayload | null =
    t.kind === "practice"
      ? {
          framework: t.framework,
          files: t.files,
          visibleFiles: t.visibleFiles?.length ? t.visibleFiles : undefined,
          activeFile: t.activeFile || undefined,
          tests: t.tests,
          testCount: countTests(t.tests),
          dependencies: t.dependencies && Object.keys(t.dependencies).length ? t.dependencies : undefined,
        }
      : null;

  const payload = {
    slug: t.slug,
    kind: t.kind,
    complexity: t.complexity,
    est_seconds: t.estSeconds,
    title: t.title,
    prompt: t.prompt,
    explanation: t.explanation,
    published,
    lecture: t.lecture ?? null,
    skills: t.skills.map((s) => (typeof s === "string" ? { slug: s, weight: 1 } : s)),
    quiz:
      t.kind === "quiz"
        ? {
            mode: t.mode,
            code: t.code || undefined,
            codeLanguage: t.codeLanguage,
            options: t.options,
          }
        : null,
    correct: t.kind === "quiz" ? t.correct : null,
    practice,
    solution: t.kind === "practice" ? t.solution : null,
  };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_task", {
    p_task: JSON.parse(JSON.stringify(payload)) as Json,
    p_create: create,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true, slug: t.slug };
}

const importInput = z.object({
  items: z
    .array(z.object({ slide: z.string().uuid(), question: z.string().min(1).max(60).nullable() }))
    .min(1, "Pick at least one quiz question or practice.")
    .max(200, "Import at most 200 items at a time."),
  skills: z.array(z.object({ slug, weight: z.number().gt(0).lte(1) })).min(1, "Add at least one skill."),
  complexity: z.number().int().min(1).max(5),
  quizSeconds: z.number().int().min(10).max(3600),
  practiceSeconds: z.number().int().min(60).max(4 * 3600),
  lecture: slug.nullable(),
  published: z.boolean(),
});

export type ImportResult = { ok: true; created: string[]; skipped: number } | { ok: false; errors: string[] };

/** Copies course quiz questions and practice slides into tasks (see admin_import_course_items). */
export async function importCourseItemsAction(input: z.input<typeof importInput>): Promise<ImportResult> {
  if (!(await isAdmin())) return FORBIDDEN as ImportResult;
  const parsed = importInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };
  const d = parsed.data;
  if (new Set(d.skills.map((s) => s.slug)).size !== d.skills.length) return { ok: false, errors: ["skills: each skill can be linked once"] };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_import_course_items", {
    p_items: d.items,
    p_options: {
      skills: d.skills,
      complexity: d.complexity,
      quiz_seconds: d.quizSeconds,
      practice_seconds: d.practiceSeconds,
      lecture: d.lecture,
      published: d.published,
    },
  });
  if (error) return dbError(error) as ImportResult;
  const result = data as { created: string[]; skipped: number };
  refreshSite();
  return { ok: true, created: result.created, skipped: result.skipped };
}

type OutputPracticeTask = Extract<z.output<typeof adminTaskDef>, { runner: "output" }>;

async function saveOutputPractice(t: OutputPracticeTask, create: boolean, published: boolean): Promise<AdminResult> {
  const skillSlugs = t.skills.map((s) => (typeof s === "string" ? s : s.slug));
  if (new Set(skillSlugs).size !== skillSlugs.length) return { ok: false, errors: ["skills: each skill can be linked once"] };
  const payload = {
    slug: t.slug,
    kind: "practice",
    complexity: t.complexity,
    est_seconds: t.estSeconds,
    title: t.title,
    prompt: t.prompt,
    explanation: t.explanation,
    published,
    lecture: t.lecture ?? null,
    skills: t.skills.map((s) => (typeof s === "string" ? { slug: s, weight: 1 } : s)),
    practice: { runner: "output", language: t.language, starter: t.starter, setup: t.language === "sql" ? t.setup || undefined : undefined },
    expected_output: t.expectedOutput,
    solution: t.solution?.trim() ? { [outputPracticeFile(t.language)]: t.solution } : null,
  };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_task", {
    p_task: JSON.parse(JSON.stringify(payload)) as Json,
    p_create: create,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true, slug: t.slug };
}

export async function setTaskPublishedAction(taskSlug: string, published: boolean): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  if (!slug.safeParse(taskSlug).success) return { ok: false, errors: ["Invalid slug."] };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_task_published", {
    p_slug: taskSlug,
    p_published: published,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true };
}

export async function deleteTaskAction(taskSlug: string): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  if (!slug.safeParse(taskSlug).success) return { ok: false, errors: ["Invalid slug."] };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_task", {
    p_slug: taskSlug,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Lectures
// ---------------------------------------------------------------------------

const lectureInput = z.object({
  create: z.boolean(),
  lecture: z.object({
    slug,
    skill: slug,
    title: localized,
    summary: localized,
    body: localized,
    readingMinutes: z.number().int().min(1).max(120),
  }),
});

export async function saveLectureAction(input: z.input<typeof lectureInput>): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const parsed = lectureInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };
  const { lecture: l, create } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_lecture", {
    p_lecture: {
      slug: l.slug,
      skill: l.skill,
      title: l.title,
      summary: l.summary,
      body: l.body,
      reading_minutes: l.readingMinutes,
    },
    p_create: create,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true, slug: l.slug };
}

export async function deleteLectureAction(lectureSlug: string): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  if (!slug.safeParse(lectureSlug).success) return { ok: false, errors: ["Invalid slug."] };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_lecture", {
    p_slug: lectureSlug,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

const skillInput = z.object({ create: z.boolean(), skill: skillDef });

export async function saveSkillAction(input: z.input<typeof skillInput>): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const parsed = skillInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };
  const { skill: s, create } = parsed.data;
  const badAlias = s.aliases.find((a) => a !== a.toLowerCase());
  if (badAlias)
    return {
      ok: false,
      errors: [`aliases: "${badAlias}" must be lower-case (use case-sensitive aliases instead)`],
    };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_skill", {
    p_skill: {
      slug: s.slug,
      name: s.name,
      category: s.category,
      aliases: [...new Set([...s.aliases, ...s.caseSensitiveAliases])],
      description: s.description ?? {},
      codeable: s.codeable,
      popularity: s.popularity,
    },
    p_create: create,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true, slug: s.slug };
}

export async function deleteSkillAction(skillSlug: string): Promise<AdminResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  if (!slug.safeParse(skillSlug).success) return { ok: false, errors: ["Invalid slug."] };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_skill", {
    p_slug: skillSlug,
  });
  if (error) return dbError(error);
  refreshSite();
  return { ok: true };
}
