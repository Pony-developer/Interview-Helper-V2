import "server-only";

import type { AdminCourseStructure, CourseFormState, Loc, QuestionForm, SlideFormState, SlideKind, Source } from "@/lib/admin/course-forms";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/** Course admin reads. Callers must run `requireAdmin()` first; RLS and the admin RPCs enforce it again. */

const toLoc = (v: Json | null | undefined): Loc => {
  const o = (v ?? {}) as Partial<Loc>;
  return { en: o.en ?? "", uk: o.uk ?? "" };
};

export type AdminCourseRow = {
  slug: string;
  title: string;
  published: boolean;
  source: Source;
  updatedAt: string;
  modules: number;
  slides: number;
};

export async function listAdminCourses(): Promise<AdminCourseRow[]> {
  const supabase = await createClient();
  const [courses, modules, slides] = await Promise.all([
    supabase.from("courses").select("id, slug, title, published, source, updated_at").order("sort_order"),
    supabase.from("course_modules").select("course_id"),
    supabase.from("course_slides").select("course_id"),
  ]);
  if (courses.error) throw courses.error;
  const count = (rows: { course_id: string }[] | null, id: string) => (rows ?? []).filter((r) => r.course_id === id).length;
  return courses.data.map((c) => ({
    slug: c.slug,
    title: toLoc(c.title).en || c.slug,
    published: c.published,
    source: c.source,
    updatedAt: c.updated_at,
    modules: count(modules.data, c.id),
    slides: count(slides.data, c.id),
  }));
}

export async function getAdminCourse(slug: string): Promise<AdminCourseStructure | null> {
  const supabase = await createClient();
  const { data: c, error } = await supabase
    .from("courses")
    .select("id, slug, title, summary, topics, sort_order, published, source, updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!c) return null;

  const [modules, slides] = await Promise.all([
    supabase.from("course_modules").select("id, slug, title, source, sort_order").eq("course_id", c.id).order("sort_order"),
    supabase.from("course_slides").select("id, slug, kind, title, max_score, source, module_id, sort_order").eq("course_id", c.id).order("sort_order"),
  ]);
  if (modules.error) throw modules.error;
  if (slides.error) throw slides.error;

  const course: AdminCourseStructure["course"] = {
    slug: c.slug,
    title: toLoc(c.title),
    summary: toLoc(c.summary),
    topics: Array.isArray(c.topics) ? c.topics.map((t) => toLoc(t)) : [],
    published: c.published,
    sortOrder: c.sort_order,
    source: c.source,
    updatedAt: c.updated_at,
  };
  return {
    course,
    modules: modules.data.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: toLoc(m.title),
      source: m.source,
      slides: slides.data
        .filter((s) => s.module_id === m.id)
        .map((s) => ({ id: s.id, slug: s.slug, kind: s.kind, title: toLoc(s.title).en || s.slug, maxScore: s.max_score, source: s.source })),
    })),
  };
}

export function newCourseState(): CourseFormState {
  return { slug: "", title: { en: "", uk: "" }, summary: { en: "", uk: "" }, topics: [], published: true, sortOrder: 0 };
}

type RawSlide = {
  id: string;
  course: string;
  module_id: string;
  slug: string;
  kind: SlideKind;
  title: Json;
  body: Json;
  quiz: { questions?: { id: string; mode: "single" | "multi"; prompt: Json; options: { id: string; text: Json }[] }[] } | null;
  practice: { language?: string; starter?: string } | null;
  max_score: number;
  source: Source;
  updated_at: string;
  quiz_answers: Record<string, string[]> | null;
  expected_output: string | null;
  solution: string | null;
};

/** One slide with its answers, for the slide editor. */
export async function getAdminSlide(id: string): Promise<{ state: SlideFormState; meta: { source: Source; updatedAt: string } } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_get_course_slide", { p_id: id });
  if (error) {
    if (error.code === "P0002" || error.code === "22P02") return null;
    throw error;
  }
  const s = data as unknown as RawSlide;
  const questions: QuestionForm[] = (s.quiz?.questions ?? []).map((q) => ({
    id: q.id,
    mode: q.mode,
    prompt: toLoc(q.prompt),
    options: q.options.map((o) => ({ id: o.id, text: toLoc(o.text) })),
    correct: s.quiz_answers?.[q.id] ?? [],
  }));
  return {
    state: {
      id: s.id,
      course: s.course,
      moduleId: s.module_id,
      slug: s.slug,
      kind: s.kind,
      title: toLoc(s.title),
      body: toLoc(s.body),
      questions,
      starter: s.practice?.starter ?? "",
      solution: s.solution ?? "",
      expectedOutput: s.expected_output ?? "",
      maxScore: s.max_score,
    },
    meta: { source: s.source, updatedAt: s.updated_at },
  };
}
