import "server-only";

import { paths as localPaths, type PathContent } from "@content/paths";
import { getCourseOutline } from "@/lib/data/course-player";
import { getCourses, type Course } from "@/lib/data/courses";
import { loc } from "@/lib/i18n/localized";

export type PathStage = {
  course: Course;
  why: string;
  modules: { slug: string; title: string; slides: number }[];
  /** All slides in the course: lectures, quizzes and practice. */
  lessons: number;
  practice: number;
};

export type PathSummary = {
  slug: string;
  title: string;
  summary: string;
  courseTitles: string[];
  modules: number;
  lessons: number;
};

export type CareerPath = {
  slug: string;
  title: string;
  summary: string;
  outcomes: string[];
  stages: PathStage[];
  practiceSkills: string[];
};

export const pathSlugs = () => localPaths.map((p) => p.slug);

/** Resolves a path's steps to published courses, skipping courses that don't exist (yet). */
async function resolveStages(path: PathContent, locale: string): Promise<PathStage[]> {
  const courses = await getCourses(locale);
  const stages = await Promise.all(
    path.steps.map(async (step): Promise<PathStage | null> => {
      const course = courses.find((c) => c.slug === step.course);
      if (!course) return null;
      const outline = await getCourseOutline(step.course, locale);
      const modules = (outline?.modules ?? []).map((m) => ({ slug: m.slug, title: m.title, slides: m.slides.length }));
      const slides = outline?.modules.flatMap((m) => m.slides) ?? [];
      return {
        course,
        why: loc(step.why, locale),
        modules,
        lessons: slides.length,
        practice: slides.filter((s) => s.kind === "practice").length,
      };
    }),
  );
  return stages.filter((s): s is PathStage => s !== null);
}

export async function getPaths(locale: string): Promise<PathSummary[]> {
  return Promise.all(
    localPaths.map(async (p) => {
      const stages = await resolveStages(p, locale);
      return {
        slug: p.slug,
        title: loc(p.title, locale),
        summary: loc(p.summary, locale),
        courseTitles: stages.map((s) => s.course.title),
        modules: stages.reduce((n, s) => n + s.modules.length, 0),
        lessons: stages.reduce((n, s) => n + s.lessons, 0),
      };
    }),
  );
}

export async function getPath(slug: string, locale: string): Promise<CareerPath | null> {
  const p = localPaths.find((x) => x.slug === slug);
  if (!p) return null;
  return {
    slug: p.slug,
    title: loc(p.title, locale),
    summary: loc(p.summary, locale),
    outcomes: p.outcomes.map((o) => loc(o, locale)),
    stages: await resolveStages(p, locale),
    practiceSkills: p.practiceSkills,
  };
}
