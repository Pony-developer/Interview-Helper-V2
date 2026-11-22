/** Form state shared by the course admin pages (server reads) and editors (client). */
export type Loc = { en: string; uk: string };
export type SlideKind = "lecture" | "quiz" | "practice";
export type Source = "seed" | "admin";

export type CourseFormState = {
  slug: string;
  title: Loc;
  summary: Loc;
  topics: Loc[];
  published: boolean;
  sortOrder: number;
};

export type QuestionForm = {
  id: string;
  mode: "single" | "multi";
  prompt: Loc;
  options: { id: string; text: Loc }[];
  correct: string[];
};

export type SlideFormState = {
  id: string | null;
  course: string;
  moduleId: string;
  slug: string;
  kind: SlideKind;
  title: Loc;
  body: Loc;
  questions: QuestionForm[];
  starter: string;
  solution: string;
  expectedOutput: string;
  maxScore: number;
};

export type AdminCourseStructure = {
  course: CourseFormState & { source: Source; updatedAt: string };
  modules: {
    id: string;
    slug: string;
    title: Loc;
    source: Source;
    slides: { id: string; slug: string; kind: SlideKind; title: string; maxScore: number; source: Source }[];
  }[];
};

export const emptyLoc = (): Loc => ({ en: "", uk: "" });

export const newQuestion = (n: number): QuestionForm => ({
  id: `q${n}`,
  mode: "single",
  prompt: emptyLoc(),
  options: [
    { id: "a", text: emptyLoc() },
    { id: "b", text: emptyLoc() },
  ],
  correct: [],
});

export const CSHARP_STARTER = `using System;

class Program
{
    static void Main()
    {
        // Write your code here
    }
}
`;

export function newSlideState(kind: SlideKind, course: string, moduleId: string): SlideFormState {
  return {
    id: null,
    course,
    moduleId,
    slug: "",
    kind,
    title: emptyLoc(),
    body: emptyLoc(),
    questions: kind === "quiz" ? [newQuestion(1)] : [],
    starter: kind === "practice" ? CSHARP_STARTER : "",
    solution: kind === "practice" ? CSHARP_STARTER : "",
    expectedOutput: "",
    maxScore: kind === "practice" ? 5 : 0,
  };
}
