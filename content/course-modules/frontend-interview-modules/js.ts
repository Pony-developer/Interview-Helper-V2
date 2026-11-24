import type { ModuleDef } from "../types";
import { jsBasicsQuiz } from "./js-basics";
import { jsFunctionsQuiz, jsModernQuiz } from "./js-functions-modern";
import { jsAdvancedQuiz, jsObjectsQuiz } from "./js-objects-advanced";
import { jsArraysQuiz, jsStringsQuiz } from "./js-strings-arrays";
import { jsYdkjsHoistingQuiz, jsYdkjsQuiz, jsYdkjsScopeQuiz } from "./js-ydkjs";

/**
 * JavaScript questions: a large list focused on the language itself (tricky expressions, `this`,
 * strings, arrays, objects), keeping only what the other modules don't cover and merging repeats.
 */
export const jsModule: ModuleDef = {
  slug: "javascript-interview-questions",
  title: { en: "JavaScript questions", uk: "Питання з JavaScript" },
  slides: [
    { kind: "lecture", slug: "js-questions", title: { en: "Questions", uk: "Питання" } },
    jsBasicsQuiz,
    jsStringsQuiz,
    jsArraysQuiz,
    jsObjectsQuiz,
    jsAdvancedQuiz,
    jsFunctionsQuiz,
    jsModernQuiz,
    jsYdkjsQuiz,
    jsYdkjsScopeQuiz,
    jsYdkjsHoistingQuiz,
  ],
};
