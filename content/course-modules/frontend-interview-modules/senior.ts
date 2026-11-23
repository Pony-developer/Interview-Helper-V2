import type { ModuleDef } from "../types";
import { seniorAlgorithmsQuiz } from "./senior-algorithms";
import { seniorArchitectureQuiz } from "./senior-architecture";
import { seniorFrameworksQuiz } from "./senior-frameworks";
import { seniorGeneralQuiz } from "./senior-general";
import { seniorHtmlCssQuiz } from "./senior-html-css";
import { seniorJavascriptQuiz } from "./senior-javascript";
import { seniorPerformanceQuiz } from "./senior-performance";
import { seniorAccessibilityQuiz, seniorSecurityQuiz } from "./senior-security";
import { seniorTestingQuiz } from "./senior-testing";

/**
 * Senior Front-end Developer: its own list of interview questions (numbered from 1),
 * then one quiz per section with a quiz question for each interview question.
 */
export const seniorModule: ModuleDef = {
  slug: "senior-interview-questions",
  title: { en: "Senior Front-end Developer", uk: "Senior Front-end Developer" },
  slides: [
    { kind: "lecture", slug: "senior-questions", title: { en: "Questions", uk: "Питання" } },
    seniorGeneralQuiz,
    seniorHtmlCssQuiz,
    seniorPerformanceQuiz,
    seniorJavascriptQuiz,
    seniorFrameworksQuiz,
    seniorTestingQuiz,
    seniorAlgorithmsQuiz,
    seniorArchitectureQuiz,
    seniorSecurityQuiz,
    seniorAccessibilityQuiz,
  ],
};
