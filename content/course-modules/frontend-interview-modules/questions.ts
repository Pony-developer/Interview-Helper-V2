import type { ModuleDef } from "../types";
import { algorithmsQuiz } from "./algorithms";
import { backendQuiz } from "./backend";
import { browserApiQuiz } from "./browser-api";
import { cssAdvancedQuiz, cssQuiz } from "./css";
import { frameworksQuiz } from "./frameworks";
import { generalQuiz } from "./general";
import { gitQuiz } from "./git";
import { htmlQuiz } from "./html";
import { javascriptQuiz } from "./javascript";
import { networkQuiz } from "./network";
import { performanceQuiz } from "./performance";
import { accessibilityQuiz, testingQuiz } from "./testing";
import { typescriptQuiz } from "./typescript";

/**
 * Junior Front-end Developer: the full list of interview questions, then one quiz per section
 * with a quiz question for each interview question.
 */
export const questionsModule: ModuleDef = {
  slug: "interview-questions",
  title: { en: "Junior Front-end Developer", uk: "Junior Front-end Developer" },
  slides: [
    { kind: "lecture", slug: "questions", title: { en: "Questions", uk: "Питання" } },
    generalQuiz,
    htmlQuiz,
    cssQuiz,
    cssAdvancedQuiz,
    performanceQuiz,
    javascriptQuiz,
    typescriptQuiz,
    browserApiQuiz,
    frameworksQuiz,
    networkQuiz,
    backendQuiz,
    algorithmsQuiz,
    gitQuiz,
    testingQuiz,
    accessibilityQuiz,
  ],
};
