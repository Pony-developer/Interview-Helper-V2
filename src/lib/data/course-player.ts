import "server-only";

import { courses as catalog } from "@content/courses";
import { cache } from "react";
import { loadCourseModules, type LoadedSlide } from "@/lib/content/course-loader";
import { loc } from "@/lib/i18n/localized";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient, createPublicClient } from "@/lib/supabase/server";

export type SlideKind = "lecture" | "quiz" | "practice";
export type OutlineSlide = { id: string; slug: string; kind: SlideKind; title: string; maxScore: number };
export type OutlineModule = { id: string; slug: string; title: string; slides: OutlineSlide[] };
export type CourseOutline = { id: string; slug: string; title: string; modules: OutlineModule[] };

export type QuizQuestion = { id: string; mode: "single" | "multi"; prompt: string; options: { id: string; text: string }[] };
export type CourseSlide = OutlineSlide & {
  moduleSlug: string;
  body: string;
  questions: QuizQuestion[] | null;
  practice: PracticeInfo | null;
};
export type PracticeInfo = { language: "csharp" | "sql"; starter: string; setup: string };
export type SlideProgress = { score: number; completed: boolean; attempts: number; lastCode: string | null };
export type CourseProgress = { signedIn: boolean; bySlide: Record<string, SlideProgress>; certificateId: string | null };

/** Local ids (no database) are "<course>/<slide>", so actions can find the slide again. */
export const localSlideId = (course: string, slug: string) => `${course}/${slug}`;

type RawQuiz = { questions?: { id: string; mode: "single" | "multi"; prompt: unknown; options: { id: string; text: unknown }[] }[] };

function localizeQuestions(quiz: RawQuiz | null, locale: string): QuizQuestion[] | null {
  if (!quiz?.questions) return null;
  return quiz.questions.map((q) => ({
    id: q.id,
    mode: q.mode,
    prompt: loc(q.prompt as never, locale),
    options: q.options.map((o) => ({ id: o.id, text: loc(o.text as never, locale) })),
  }));
}

// ---------------------------------------------------------------------------
// Local content (development without Supabase)
// ---------------------------------------------------------------------------
function localCourse(courseSlug: string) {
  const meta = catalog.find((c) => c.slug === courseSlug);
  if (!meta) return null;
  const loaded = loadCourseModules().courses.find((c) => c.course === courseSlug);
  return { meta, modules: loaded?.modules ?? [] };
}

function localSlide(courseSlug: string, s: LoadedSlide, moduleSlug: string, locale: string): CourseSlide {
  return {
    id: localSlideId(courseSlug, s.slug),
    slug: s.slug,
    kind: s.kind,
    title: loc(s.title, locale),
    maxScore: s.maxScore,
    moduleSlug,
    body: loc(s.body, locale),
    questions:
      s.kind === "quiz"
        ? s.questions.map((q) => ({
            id: q.id,
            mode: q.mode,
            prompt: loc(q.prompt, locale),
            options: q.options.map((o) => ({ id: o.id, text: loc(o.text, locale) })),
          }))
        : null,
    practice: s.kind === "practice" ? { language: s.language, starter: s.starter, setup: s.setup ?? "" } : null,
  };
}

// ---------------------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------------------

/** Course with its modules and slide titles (no slide bodies). Null when the course doesn't exist. */
export const getCourseOutline = cache(async (courseSlug: string, locale: string): Promise<CourseOutline | null> => {
  if (!isSupabaseConfigured()) {
    const local = localCourse(courseSlug);
    if (!local) return null;
    return {
      id: courseSlug,
      slug: courseSlug,
      title: loc(local.meta.title, locale),
      modules: local.modules.map((m) => ({
        id: m.slug,
        slug: m.slug,
        title: loc(m.title, locale),
        slides: m.slides.map((s) => ({
          id: localSlideId(courseSlug, s.slug),
          slug: s.slug,
          kind: s.kind,
          title: loc(s.title, locale),
          maxScore: s.maxScore,
        })),
      })),
    };
  }

  try {
    const supabase = createPublicClient();
    const { data: course, error } = await supabase
      .from("courses")
      .select("id, slug, title")
      .eq("slug", courseSlug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    if (!course) return null;

    const [modules, slides] = await Promise.all([
      supabase.from("course_modules").select("id, slug, title, sort_order").eq("course_id", course.id).order("sort_order"),
      supabase
        .from("course_slides")
        .select("id, slug, kind, title, max_score, module_id, sort_order")
        .eq("course_id", course.id)
        .order("sort_order"),
    ]);
    if (modules.error) throw modules.error;
    if (slides.error) throw slides.error;

    return {
      id: course.id,
      slug: course.slug,
      title: loc(course.title as never, locale),
      modules: modules.data.map((m) => ({
        id: m.id,
        slug: m.slug,
        title: loc(m.title as never, locale),
        slides: slides.data
          .filter((s) => s.module_id === m.id)
          .map((s) => ({ id: s.id, slug: s.slug, kind: s.kind, title: loc(s.title as never, locale), maxScore: s.max_score })),
      })),
    };
  } catch (e) {
    console.error("getCourseOutline failed", e);
    return null;
  }
});

/** One slide with its body, quiz questions (without answers) or practice starter code. */
export async function getCourseSlide(outline: CourseOutline, slideSlug: string, locale: string): Promise<CourseSlide | null> {
  const mod = outline.modules.find((m) => m.slides.some((s) => s.slug === slideSlug));
  if (!mod) return null;

  if (!isSupabaseConfigured()) {
    const local = localCourse(outline.slug);
    const loadedModule = local?.modules.find((m) => m.slug === mod.slug);
    const s = loadedModule?.slides.find((x) => x.slug === slideSlug);
    return s ? localSlide(outline.slug, s, mod.slug, locale) : null;
  }

  try {
    const { data, error } = await createPublicClient()
      .from("course_slides")
      .select("id, slug, kind, title, body, quiz, practice, max_score")
      .eq("course_id", outline.id)
      .eq("slug", slideSlug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const practice = data.practice as { language?: string; starter?: string; setup?: string } | null;
    return {
      id: data.id,
      slug: data.slug,
      kind: data.kind,
      title: loc(data.title as never, locale),
      maxScore: data.max_score,
      moduleSlug: mod.slug,
      body: loc(data.body as never, locale),
      questions: localizeQuestions(data.quiz as RawQuiz | null, locale),
      practice: practice
        ? { language: practice.language === "sql" ? "sql" : "csharp", starter: practice.starter ?? "", setup: practice.setup ?? "" }
        : null,
    };
  } catch (e) {
    console.error("getCourseSlide failed", e);
    return null;
  }
}

/** The signed-in visitor's progress in a course (once per request: the player layout and page share it). Anonymous visitors get `signedIn: false`. */
export const getCourseProgress = cache(async (outline: CourseOutline): Promise<CourseProgress> => {
  if (!isSupabaseConfigured()) return { signedIn: false, bySlide: {}, certificateId: null };
  try {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    if (!claims?.claims?.sub) return { signedIn: false, bySlide: {}, certificateId: null };

    const ids = outline.modules.flatMap((m) => m.slides.map((s) => s.id));
    const [progress, certificate] = await Promise.all([
      ids.length
        ? supabase.from("course_progress").select("slide_id, score, completed, attempts, last_code").in("slide_id", ids)
        : Promise.resolve({ data: [], error: null }),
      supabase.from("course_certificates").select("id").eq("course_id", outline.id).maybeSingle(),
    ]);
    if (progress.error) throw progress.error;
    return {
      signedIn: true,
      bySlide: Object.fromEntries(
        (progress.data ?? []).map((r) => [r.slide_id, { score: r.score, completed: r.completed, attempts: r.attempts, lastCode: r.last_code }]),
      ),
      certificateId: certificate.data?.id ?? null,
    };
  } catch (e) {
    console.error("getCourseProgress failed", e);
    return { signedIn: false, bySlide: {}, certificateId: null };
  }
});

/** Share (0–100, rounded down) of the course's points earned, best score per graded slide. Null without graded slides. */
export function coursePercent(outline: CourseOutline, bySlide: Record<string, SlideProgress>): number | null {
  const graded = outline.modules.flatMap((m) => m.slides).filter((s) => s.maxScore > 0);
  const total = graded.reduce((sum, s) => sum + s.maxScore, 0);
  if (total === 0) return null;
  const earned = graded.reduce((sum, s) => sum + Math.min(bySlide[s.id]?.score ?? 0, s.maxScore), 0);
  return Math.floor((100 * earned) / total);
}
