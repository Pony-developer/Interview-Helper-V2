import "server-only";

import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/** Course content offered for copying into tasks. Callers must run `requireAdmin()` first. */

export type ImportQuestion = { id: string; prompt: string; options: number; importedAs: string | null };
export type ImportSlide = {
  id: string;
  slug: string;
  kind: "quiz" | "practice";
  title: string;
  language: "csharp" | "sql" | null;
  questions: ImportQuestion[];
  /** Practice slides: the task it was already copied to. */
  importedAs: string | null;
};
export type ImportModule = { id: string; title: string; slides: ImportSlide[] };
export type ImportCourse = { slug: string; title: string; published: boolean; modules: ImportModule[] };

const en = (v: Json | null | undefined) => {
  const o = (v ?? {}) as { en?: string; uk?: string };
  return o.en || o.uk || "";
};

/** Markdown → one short plain line for the picker. */
const plain = (md: string, max = 160) => {
  const s = md
    .replace(/```[\s\S]*?```/g, " [code] ")
    .replace(/[`*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

type RawQuiz = { questions?: { id: string; prompt: Json; options?: unknown[] }[] } | null;

export async function loadImportCatalog(): Promise<ImportCourse[]> {
  const supabase = await createClient();
  const [courses, modules, slides, copied] = await Promise.all([
    supabase.from("courses").select("id, slug, title, published").order("sort_order"),
    supabase.from("course_modules").select("id, course_id, title, sort_order").order("sort_order"),
    supabase
      .from("course_slides")
      .select("id, module_id, slug, kind, title, quiz, practice, sort_order")
      .in("kind", ["quiz", "practice"])
      .order("sort_order"),
    supabase.from("tasks").select("slug, copied_from_slide_id, copied_from_question").not("copied_from_slide_id", "is", null),
  ]);
  if (courses.error) throw courses.error;
  if (modules.error) throw modules.error;
  if (slides.error) throw slides.error;
  if (copied.error) throw copied.error;

  const importedAs = new Map((copied.data ?? []).map((t) => [`${t.copied_from_slide_id}/${t.copied_from_question ?? ""}`, t.slug]));

  return courses.data.map((c) => ({
    slug: c.slug,
    title: en(c.title) || c.slug,
    published: c.published,
    modules: modules.data
      .filter((m) => m.course_id === c.id)
      .map((m) => ({
        id: m.id,
        title: en(m.title),
        slides: slides.data
          .filter((s) => s.module_id === m.id)
          .map((s): ImportSlide => {
            const quiz = s.quiz as RawQuiz;
            const practice = s.practice as { language?: string } | null;
            return {
              id: s.id,
              slug: s.slug,
              kind: s.kind as "quiz" | "practice",
              title: en(s.title) || s.slug,
              language: s.kind === "practice" ? (practice?.language === "sql" ? "sql" : "csharp") : null,
              questions: (quiz?.questions ?? []).map((q) => ({
                id: q.id,
                prompt: plain(en(q.prompt)),
                options: q.options?.length ?? 0,
                importedAs: importedAs.get(`${s.id}/${q.id}`) ?? null,
              })),
              importedAs: s.kind === "practice" ? (importedAs.get(`${s.id}/`) ?? null) : null,
            };
          }),
      }))
      .filter((m) => m.slides.length),
  }));
}
