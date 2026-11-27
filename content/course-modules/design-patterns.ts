import { behavioralModule, behavioralMoreModule } from "./design-patterns-modules/behavioral";
import { creationalModule } from "./design-patterns-modules/creational";
import { inPracticeModule } from "./design-patterns-modules/in-practice";
import { introModule } from "./design-patterns-modules/intro";
import { structuralModule } from "./design-patterns-modules/structural";
import type { ModuleDef } from "./types";

/**
 * The "Design Patterns" course: the classic patterns explained in plain words, with real-life analogies,
 * short C# examples, quizzes and coding practices, and a closing module on patterns in .NET and Dynamics 365.
 * Lecture and task texts live in content/course-modules/design-patterns/<slide>.<en|uk>.md.
 * The C# practices (design-patterns-modules/practices.ts) are checked with:
 *   npx tsx scripts/verify-course-practice.ts
 */
export const designPatternsModules: ModuleDef[] = [
  introModule,
  creationalModule,
  structuralModule,
  behavioralModule,
  behavioralMoreModule,
  inPracticeModule,
];
