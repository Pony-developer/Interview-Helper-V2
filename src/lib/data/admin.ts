import "server-only";

import type { LectureFormState } from "@/components/admin/LectureEditor";
import type { SkillFormState } from "@/components/admin/SkillEditor";
import type { FileRow, TaskFormState, TaskMeta } from "@/components/admin/TaskEditor";
import { practiceTemplate } from "@/lib/admin/templates";
import { SKILL_CATEGORIES, type SkillCategory } from "@/lib/content/schema";
import { isOutputPractice, outputPracticeFile, type Framework, type PracticePayload, type TaskPractice } from "@/lib/playground/frameworks";
import type { ContentSource, Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/** Admin-panel reads. Callers must run `requireAdmin()` first; RLS and the admin RPCs enforce it again. */

type Loc = { en: string; uk: string };
const toLoc = (v: Json | null | undefined): Loc => {
  const o = (v ?? {}) as Partial<Loc>;
  return { en: o.en ?? "", uk: o.uk ?? "" };
};

export type AdminTaskRow = {
  slug: string;
  kind: "quiz" | "practice";
  complexity: number;
  published: boolean;
  source: ContentSource;
  updatedAt: string;
  title: string;
  framework: string | null;
  skills: string[];
};

export async function listTasks(): Promise<AdminTaskRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "slug, kind, complexity, published, source, updated_at, title, framework:practice->>framework, language:practice->>language, task_skills(weight, skills(slug))",
    )
    .order("updated_at", { ascending: false });
  if (error) throw error;
  type Row = {
    slug: string;
    kind: "quiz" | "practice";
    complexity: number;
    published: boolean;
    source: ContentSource;
    updated_at: string;
    title: Json;
    framework: string | null;
    /** Output practices (copied from courses): csharp | sql. */
    language: string | null;
    task_skills: { weight: number; skills: { slug: string } | null }[];
  };
  return (data as unknown as Row[]).map((r) => ({
    slug: r.slug,
    kind: r.kind,
    complexity: r.complexity,
    published: r.published,
    source: r.source,
    updatedAt: r.updated_at,
    title: toLoc(r.title).en,
    framework: r.framework ?? r.language,
    skills: [...r.task_skills].sort((a, b) => b.weight - a.weight).flatMap((l) => (l.skills ? [l.skills.slug] : [])),
  }));
}

export async function listLectures() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lectures")
    .select("slug, title, reading_minutes, source, updated_at, skills(slug, name)")
    .order("slug");
  if (error) throw error;
  type Row = {
    slug: string;
    title: Json;
    reading_minutes: number;
    source: ContentSource;
    updated_at: string;
    skills: { slug: string; name: string } | null;
  };
  return (data as unknown as Row[]).map((r) => ({
    slug: r.slug,
    title: toLoc(r.title).en,
    readingMinutes: r.reading_minutes,
    source: r.source,
    updatedAt: r.updated_at,
    skill: r.skills,
  }));
}

export async function listSkills() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("slug, name, category, has_content, popularity, source, codeable")
    .order("popularity", { ascending: false })
    .order("name");
  if (error) throw error;
  return data;
}

export async function skillOptions() {
  const supabase = await createClient();
  const { data } = await supabase.from("skills").select("slug, name").order("name");
  return data ?? [];
}

export async function lectureOptions() {
  const supabase = await createClient();
  const { data } = await supabase.from("lectures").select("slug, title").order("slug");
  return (data ?? []).map((l) => ({ slug: l.slug, title: toLoc(l.title).en }));
}

export async function contentCounts() {
  const supabase = await createClient();
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [quizzes, practice, unpublished, lectures, skills, edited] = await Promise.all([
    count(supabase.from("tasks").select("*", { count: "exact", head: true }).eq("kind", "quiz").eq("published", true)),
    count(supabase.from("tasks").select("*", { count: "exact", head: true }).eq("kind", "practice").eq("published", true)),
    count(supabase.from("tasks").select("*", { count: "exact", head: true }).eq("published", false)),
    count(supabase.from("lectures").select("*", { count: "exact", head: true })),
    count(supabase.from("skills").select("*", { count: "exact", head: true })),
    count(supabase.from("tasks").select("*", { count: "exact", head: true }).eq("source", "admin")),
  ]);
  return { quizzes, practice, unpublished, lectures, skills, edited };
}

// ---------------------------------------------------------------------------
// Editor state
// ---------------------------------------------------------------------------

const blankTask = (): Omit<TaskFormState, "kind"> => ({
  slug: "",
  complexity: 2,
  estSeconds: 90,
  title: { en: "", uk: "" },
  prompt: { en: "", uk: "" },
  explanation: { en: "", uk: "" },
  lecture: "",
  published: true,
  skills: [{ slug: "", weight: 1 }],
  mode: "single",
  code: "",
  codeLanguage: "ts",
  options: ["a", "b", "c", "d"].map((id) => ({
    id,
    text: { en: "", uk: "" },
    code: "",
  })),
  correct: [],
  framework: "vanilla-ts",
  files: [],
  activeFile: "",
  tests: "",
  dependencies: "",
  runner: "tests",
  language: "csharp",
  starter: "",
  setup: "",
  expectedOutput: "",
  outputSolution: "",
});

export function newTaskState(kind: "quiz" | "practice", template?: string, skill?: string): TaskFormState {
  const s: TaskFormState = { ...blankTask(), kind };
  if (skill) s.skills = [{ slug: skill, weight: 1 }];
  if (kind === "practice") {
    const t = practiceTemplate(template);
    const visible = t.visibleFiles ?? Object.keys(t.files);
    s.framework = t.framework;
    s.files = Object.entries(t.files).map(([path, starter]) => ({
      path,
      starter,
      solution: "",
      visible: visible.includes(path),
    }));
    s.activeFile = t.activeFile ?? "";
    s.tests = t.tests;
    s.estSeconds = 900;
    s.complexity = 3;
  }
  return s;
}

type AdminTask = {
  slug: string;
  kind: "quiz" | "practice";
  complexity: number;
  est_seconds: number;
  title: Json;
  prompt: Json;
  explanation: Json;
  quiz: {
    mode: "single" | "multi";
    code?: string;
    codeLanguage?: string;
    options: { id: string; text: Json; code?: string }[];
  } | null;
  practice: TaskPractice | null;
  published: boolean;
  source: ContentSource;
  updated_at: string;
  lecture: string | null;
  skills: { slug: string; weight: number }[];
  correct: string[];
  solution: Record<string, string> | null;
  expected_output: string | null;
  copied_from: { course: string; course_title: Json; slide: string; slide_title: Json; question: string | null } | null;
  used_in_interviews: boolean;
};

export async function getTaskState(slug: string): Promise<{ state: TaskFormState; meta: TaskMeta } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_get_task", {
    p_slug: slug,
  });
  if (error) throw error;
  if (!data) return null;
  const t = data as unknown as AdminTask;

  const state: TaskFormState = {
    ...blankTask(),
    slug: t.slug,
    kind: t.kind,
    complexity: t.complexity,
    estSeconds: t.est_seconds,
    title: toLoc(t.title),
    prompt: toLoc(t.prompt),
    explanation: toLoc(t.explanation),
    // An empty lecture means "automatic", which resolves to the same lecture the seed chose.
    lecture: t.lecture ?? "",
    published: t.published,
    skills: t.skills.length ? t.skills : [{ slug: "", weight: 1 }],
  };

  if (t.kind === "quiz" && t.quiz) {
    state.mode = t.quiz.mode;
    state.code = t.quiz.code ?? "";
    state.codeLanguage = t.quiz.codeLanguage ?? "ts";
    state.options = t.quiz.options.map((o) => ({
      id: o.id,
      text: toLoc(o.text),
      code: o.code ?? "",
    }));
    state.correct = t.correct;
  }
  if (t.kind === "practice" && isOutputPractice(t.practice)) {
    const p = t.practice;
    state.runner = "output";
    state.language = p.language;
    state.starter = p.starter;
    state.setup = p.setup ?? "";
    state.expectedOutput = t.expected_output ?? "";
    state.outputSolution = t.solution?.[outputPracticeFile(p.language)] ?? "";
  } else if (t.kind === "practice" && t.practice) {
    const p = t.practice as PracticePayload;
    const visible = p.visibleFiles?.length ? p.visibleFiles : Object.keys(p.files);
    state.framework = p.framework as Framework;
    state.files = Object.entries(p.files).map(([path, starter]): FileRow => ({
      path,
      starter,
      solution: t.solution?.[path] ?? "",
      visible: visible.includes(path),
    }));
    state.activeFile = p.activeFile ?? "";
    state.tests = p.tests;
    state.dependencies = Object.entries(p.dependencies ?? {})
      .map(([name, version]) => `${name}@${version}`)
      .join("\n");
  }

  return {
    state,
    meta: {
      source: t.source,
      usedInInterviews: t.used_in_interviews,
      updatedAt: t.updated_at,
      copiedFrom: t.copied_from
        ? {
            course: t.copied_from.course,
            courseTitle: toLoc(t.copied_from.course_title).en || t.copied_from.course,
            slideTitle: toLoc(t.copied_from.slide_title).en || t.copied_from.slide,
            question: t.copied_from.question,
          }
        : null,
    },
  };
}

export async function getLectureState(slug: string): Promise<{
  state: LectureFormState;
  meta: { source: ContentSource; updatedAt: string };
} | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lectures")
    .select("slug, title, summary, body, reading_minutes, source, updated_at, skills(slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  const skill = (data.skills as unknown as { slug: string } | null)?.slug ?? "";
  return {
    state: {
      slug: data.slug,
      skill,
      title: toLoc(data.title),
      summary: toLoc(data.summary),
      body: toLoc(data.body),
      readingMinutes: data.reading_minutes,
    },
    meta: { source: data.source, updatedAt: data.updated_at },
  };
}

export const newLectureState = (skill = ""): LectureFormState => ({
  slug: skill,
  skill,
  title: { en: "", uk: "" },
  summary: { en: "", uk: "" },
  body: { en: "", uk: "" },
  readingMinutes: 8,
});

export async function getSkillState(slug: string): Promise<{
  state: SkillFormState;
  meta: { source: ContentSource; hasContent: boolean; usage: number };
} | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("id, slug, name, category, aliases, description, codeable, popularity, has_content, source")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  const [{ count: lectures }, { count: tasks }] = await Promise.all([
    supabase.from("lectures").select("*", { count: "exact", head: true }).eq("skill_id", data.id),
    supabase.from("task_skills").select("*", { count: "exact", head: true }).eq("skill_id", data.id),
  ]);
  const category = (SKILL_CATEGORIES as readonly string[]).includes(data.category) ? (data.category as SkillCategory) : "practices";
  return {
    state: {
      slug: data.slug,
      name: data.name,
      category,
      aliases: data.aliases.filter((a) => a === a.toLowerCase()).join(", "),
      caseSensitiveAliases: data.aliases.filter((a) => a !== a.toLowerCase()).join(", "),
      codeable: data.codeable,
      popularity: data.popularity,
      description: toLoc(data.description),
    },
    meta: {
      source: data.source,
      hasContent: data.has_content,
      usage: (lectures ?? 0) + (tasks ?? 0),
    },
  };
}

export const newSkillState = (): SkillFormState => ({
  slug: "",
  name: "",
  category: "frontend-frameworks",
  aliases: "",
  caseSensitiveAliases: "",
  codeable: false,
  popularity: 30,
  description: { en: "", uk: "" },
});
