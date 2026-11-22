import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { courseModules, type Localized, type ModuleDef, type SlideDef } from "@content/course-modules";

const DIR = path.join(process.cwd(), "content", "course-modules");
const SLUG = /^[a-z0-9][a-z0-9-]*$/;

export type LoadedSlide = SlideDef & { body: Localized; maxScore: number };
export type LoadedModule = Omit<ModuleDef, "slides"> & { slides: LoadedSlide[] };
export type LoadedCourse = { course: string; modules: LoadedModule[] };

function readBody(course: string, slug: string, lang: "en" | "uk") {
  const file = path.join(DIR, course, `${slug}.${lang}.md`);
  return existsSync(file) ? readFileSync(file, "utf8").replace(/\r\n/g, "\n").trim() : null;
}

function maxScoreOf(slide: SlideDef) {
  if (slide.kind === "quiz") return slide.questions.length;
  if (slide.kind === "practice") return slide.maxScore ?? 5;
  return 0;
}

/**
 * Loads every authored course with its Markdown bodies and validates the structure:
 * unique slugs per course, both languages present, quiz answers that point at real options.
 */
export function loadCourseModules(): { courses: LoadedCourse[]; errors: string[] } {
  const errors: string[] = [];
  const courses: LoadedCourse[] = [];

  for (const [course, modules] of Object.entries(courseModules)) {
    const seen = new Set<string>();
    const moduleSlugs = new Set<string>();
    const loaded: LoadedModule[] = modules.map((mod) => {
      if (!SLUG.test(mod.slug) || moduleSlugs.has(mod.slug)) errors.push(`${course}: bad or duplicate module slug "${mod.slug}"`);
      moduleSlugs.add(mod.slug);
      return {
        ...mod,
        slides: mod.slides.map((slide) => {
          const where = `${course}/${slide.slug}`;
          if (!SLUG.test(slide.slug) || seen.has(slide.slug)) errors.push(`${where}: bad or duplicate slide slug`);
          seen.add(slide.slug);
          if (!slide.title.en || !slide.title.uk) errors.push(`${where}: title needs en and uk`);

          const en = readBody(course, slide.slug, "en");
          const uk = readBody(course, slide.slug, "uk");
          if (slide.kind !== "quiz" && (!en || !uk)) errors.push(`${where}: missing ${slide.slug}.en.md or ${slide.slug}.uk.md`);

          if (slide.kind === "quiz") {
            if (slide.questions.length === 0) errors.push(`${where}: quiz has no questions`);
            const ids = new Set<string>();
            for (const q of slide.questions) {
              if (ids.has(q.id)) errors.push(`${where}: duplicate question id "${q.id}"`);
              ids.add(q.id);
              const options = new Set(q.options.map((o) => o.id));
              if (q.correct.length === 0 || q.correct.some((c) => !options.has(c))) errors.push(`${where}/${q.id}: invalid correct answers`);
              if (q.mode === "single" && q.correct.length !== 1) errors.push(`${where}/${q.id}: single-choice needs exactly one answer`);
            }
          }
          if (slide.kind === "practice" && !slide.expectedOutput.trim()) errors.push(`${where}: empty expected output`);

          return { ...slide, body: { en: en ?? "", uk: uk ?? "" }, maxScore: maxScoreOf(slide) };
        }),
      };
    });
    courses.push({ course, modules: loaded });
  }
  return { courses, errors };
}
