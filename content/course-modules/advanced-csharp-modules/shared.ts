import type { QuizQuestionDef, SlideDef } from "../types";

/** A lecture slide; its text lives in content/course-modules/advanced-csharp/<slug>.<en|uk>.md. */
export const lecture = (slug: string, en: string, uk: string): SlideDef => ({ kind: "lecture", slug, title: { en, uk } });

/** A quiz slide titled "Quiz: <topic>". */
export const quiz = (slug: string, en: string, uk: string, questions: QuizQuestionDef[]): SlideDef => ({
  kind: "quiz",
  slug,
  title: { en: `Quiz: ${en}`, uk: `Квіз «${uk}»` },
  questions,
});

/**
 * A C# practice slide titled "Practice: <topic>"; its task text lives in <slug>.<en|uk>.md.
 * Practices run on Wandbox's Mono compiler, so they stick to C# 7.0 without NuGet packages.
 */
export const practice = (
  slug: string,
  en: string,
  uk: string,
  code: { starter: string; solution: string; expectedOutput: string; maxScore?: number },
): SlideDef => ({
  kind: "practice",
  slug,
  title: { en: `Practice: ${en}`, uk: `Практика «${uk}»` },
  language: "csharp",
  maxScore: 3,
  ...code,
});

/** The body a learner replaces in a starter. */
export const TODO = "        // Write your code here\n        throw new NotImplementedException();";
