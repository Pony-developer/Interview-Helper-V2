import type { ModuleDef } from "../types";
import { middleFrameworksQuiz } from "./middle-frameworks";
import { middleGeneralQuiz } from "./middle-general";
import { middleHtmlCss2Quiz, middleHtmlCssQuiz } from "./middle-html-css";
import { middleJavascriptQuiz } from "./middle-javascript";
import { middlePerformanceQuiz } from "./middle-performance";
import { middleAccessibilityQuiz, middleTestingQuiz } from "./middle-testing";

/**
 * Middle Front-end Developer: its own list of interview questions (numbered from 1),
 * then one quiz per section with a quiz question for each interview question.
 */
export const middleModule: ModuleDef = {
  slug: "middle-interview-questions",
  title: { en: "Middle Front-end Developer", uk: "Middle Front-end Developer" },
  slides: [
    { kind: "lecture", slug: "middle-questions", title: { en: "Questions", uk: "Питання" } },
    middleGeneralQuiz,
    middleHtmlCssQuiz,
    middleHtmlCss2Quiz,
    middlePerformanceQuiz,
    middleJavascriptQuiz,
    middleFrameworksQuiz,
    middleTestingQuiz,
    middleAccessibilityQuiz,
  ],
};
