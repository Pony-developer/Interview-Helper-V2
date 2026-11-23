/**
 * Authored course structure. A course has modules; a module has slides.
 * Lecture and practice text lives next to the definition as Markdown:
 *   content/course-modules/<course>/<slide-slug>.<en|uk>.md
 * The loader (src/lib/content/course-loader.ts) reads those files and validates everything.
 */
export type Localized = { en: string; uk: string };

export type QuizQuestionDef = {
  id: string;
  mode: "single" | "multi";
  prompt: Localized;
  options: { id: string; text: Localized }[];
  /** Option ids that make the answer fully correct. Never sent to the browser. */
  correct: string[];
};

export type SlideDef =
  | { kind: "lecture"; slug: string; title: Localized }
  | { kind: "quiz"; slug: string; title: Localized; questions: QuizQuestionDef[] }
  | {
      kind: "practice";
      slug: string;
      title: Localized;
      /** "csharp" runs on Wandbox; "sql" runs on PostgreSQL (PGlite) in the learner's browser. */
      language: "csharp" | "sql";
      /** SQL only: creates the tables and data the task works on. Shown to the learner, run before their code. */
      setup?: string;
      /** Code the editor starts with. */
      starter: string;
      /** Reference solution, used to verify `expectedOutput`. Never sent to the browser. */
      solution: string;
      /** Exact program output that passes. Never sent to the browser. */
      expectedOutput: string;
      maxScore?: number;
    };

export type ModuleDef = { slug: string; title: Localized; slides: SlideDef[] };
