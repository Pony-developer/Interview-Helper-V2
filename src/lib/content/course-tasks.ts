import { courses as catalogCourses } from "@content/courses";
import { courseTaskRules, INTERVIEW_COURSES, type CourseTaskRule, type SkillRef } from "@content/course-tasks";
import type { LoadedCourse } from "@/lib/content/course-loader";
import type { Localized } from "@content/course-modules/types";

/**
 * Interview tasks copied from course slides (see content/course-tasks.ts). The shapes match what the
 * admin import (`admin_import_course_items`) stores, plus a short explanation that points to the course.
 */
type Base = {
  slug: string;
  course: string;
  slide: string;
  /** Quiz question id; null for practices. */
  question: string | null;
  skills: SkillRef[];
  complexity: number;
  estSeconds: number;
  title: Localized;
  prompt: Localized;
  explanation: Localized;
};
export type CourseQuizTask = Base & {
  kind: "quiz";
  quiz: { mode: "single" | "multi"; options: { id: string; text: Localized }[] };
  correct: string[];
};
export type CoursePracticeTask = Base & {
  kind: "practice";
  practice: { runner: "output"; language: "csharp" | "sql"; starter: string; setup?: string };
  expectedOutput: string;
  solution: Record<string, string>;
};
export type CourseTask = CourseQuizTask | CoursePracticeTask;

const QUIZ_SECONDS = 90;
const PRACTICE_SECONDS = [0, 600, 900, 1200, 1500, 1800];
const MAX_SLUG = 90;

const skillSlug = (r: SkillRef) => (typeof r === "string" ? r : r.slug);

/** "Quiz: Collections" → "Collections"; the interview shows the kind on its own. */
const stripKind = (title: string) =>
  title.replace(/^(final quiz|quiz|practice|підсумковий тест|підсумковий квіз|тест|квіз|практика)\s*:\s*/i, "");

const kebab = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function explanation(course: string, moduleTitle: Localized): Localized {
  const c = catalogCourses.find((x) => x.slug === course);
  const title = c?.title ?? { en: course, uk: course };
  return {
    en: `This task comes from the course **[${title.en}](/courses/${course})**, module “${moduleTitle.en}”. The lecture slides before it explain the topic in depth.`,
    uk: `Це завдання з курсу **[${title.uk}](/uk/courses/${course})**, модуль «${moduleTitle.uk}». Слайди-лекції перед ним детально пояснюють тему.`,
  };
}

/**
 * Builds the tasks. `skillSlugs` and `lectureSkills` come from the validated content, so unknown skills
 * are reported here instead of failing in SQL.
 */
export function deriveCourseTasks(
  loaded: LoadedCourse[],
  skillSlugs: Set<string>,
  rulesList: CourseTaskRule[] = courseTaskRules,
): { tasks: CourseTask[]; errors: string[] } {
  const errors: string[] = [];
  const tasks: CourseTask[] = [];
  const ruleKey = (course: string, module: string) => `${course}/${module}`;
  const ruleMap = new Map<string, CourseTaskRule>();
  for (const r of rulesList) {
    const key = ruleKey(r.course, r.module);
    if (ruleMap.has(key)) errors.push(`course-tasks: duplicate rule for ${key}`);
    ruleMap.set(key, r);
  }

  const used = new Set<string>();
  for (const courseSlug of INTERVIEW_COURSES) {
    const course = loaded.find((c) => c.course === courseSlug);
    if (!course) {
      errors.push(`course-tasks: course ${courseSlug} not found`);
      continue;
    }
    for (const mod of course.modules) {
      const key = ruleKey(courseSlug, mod.slug);
      const rule = ruleMap.get(key);
      used.add(key);
      if (!rule) {
        errors.push(`course-tasks: module ${key} has no rule (map it or skip it)`);
        continue;
      }
      if (rule.skip) continue;
      const slideSlugs = new Set(mod.slides.map((s) => s.slug));
      for (const s of Object.keys(rule.slides ?? {}))
        if (!slideSlugs.has(s)) errors.push(`course-tasks: ${key} overrides unknown slide ${s}`);

      for (const slide of mod.slides) {
        if (slide.kind === "lecture") continue;
        const override = rule.slides?.[slide.slug];
        if (override === "skip") continue;
        const complexity = override?.complexity ?? rule.complexity;
        const skills = override?.skills ?? (slide.kind === "quiz" ? (rule.quizSkills ?? rule.skills) : rule.skills);
        for (const ref of skills)
          if (!skillSlugs.has(skillSlug(ref))) errors.push(`course-tasks: ${key}/${slide.slug} uses unknown skill ${skillSlug(ref)}`);
        const common = {
          course: courseSlug,
          slide: slide.slug,
          skills,
          complexity,
          explanation: explanation(courseSlug, mod.title),
        };

        if (slide.kind === "quiz") {
          const many = slide.questions.length > 1;
          slide.questions.forEach((qq, i) => {
            const suffix = many ? ` · ${i + 1}` : "";
            tasks.push({
              ...common,
              kind: "quiz",
              slug: `${courseSlug}-${slide.slug}-${kebab(qq.id)}`.slice(0, MAX_SLUG).replace(/-+$/, ""),
              question: qq.id,
              estSeconds: QUIZ_SECONDS,
              title: { en: stripKind(slide.title.en) + suffix, uk: stripKind(slide.title.uk) + suffix },
              prompt: qq.prompt,
              quiz: { mode: qq.mode, options: qq.options },
              correct: qq.correct,
            });
          });
        } else {
          const file = slide.language === "sql" ? "query.sql" : "Program.cs";
          const hasBody = slide.body.en.trim() && slide.body.uk.trim();
          tasks.push({
            ...common,
            kind: "practice",
            slug: `${courseSlug}-${slide.slug}`.slice(0, MAX_SLUG).replace(/-+$/, ""),
            question: null,
            estSeconds: PRACTICE_SECONDS[complexity],
            title: { en: stripKind(slide.title.en), uk: stripKind(slide.title.uk) },
            prompt: hasBody ? slide.body : slide.title,
            practice: {
              runner: "output",
              language: slide.language,
              starter: slide.starter,
              ...(slide.language === "sql" && slide.setup ? { setup: slide.setup } : {}),
            },
            expectedOutput: slide.expectedOutput,
            solution: { [file]: slide.solution },
          });
        }
      }
    }
  }

  for (const key of ruleMap.keys())
    if (!used.has(key)) errors.push(`course-tasks: rule ${key} matches no module of the listed courses`);
  const seen = new Set<string>();
  for (const t of tasks) {
    if (seen.has(t.slug)) errors.push(`course-tasks: duplicate task slug ${t.slug}`);
    seen.add(t.slug);
  }
  return { tasks, errors };
}

export const courseTaskSkillSlugs = (t: CourseTask) => t.skills.map(skillSlug);
