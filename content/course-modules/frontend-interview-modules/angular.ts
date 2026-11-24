import type { ModuleDef } from "../types";
import { angularAdvancedQuiz } from "./angular-advanced";
import { angularBasicsQuiz } from "./angular-basics";
import { angularIntermediateQuiz } from "./angular-intermediate";

/**
 * Angular questions: an Angular-focused list (basics, intermediate, advanced and scenarios),
 * keeping only what the other modules don't cover and merging repeats.
 */
export const angularModule: ModuleDef = {
  slug: "angular-interview-questions",
  title: { en: "Angular questions", uk: "Питання з Angular" },
  slides: [
    { kind: "lecture", slug: "angular-questions", title: { en: "Questions", uk: "Питання" } },
    angularBasicsQuiz,
    angularIntermediateQuiz,
    angularAdvancedQuiz,
  ],
};
