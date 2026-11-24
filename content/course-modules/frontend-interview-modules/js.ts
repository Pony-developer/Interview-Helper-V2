import type { ModuleDef } from "../types";
import { jsBasicsQuiz } from "./js-basics";
import { jsFunctionsQuiz, jsModernQuiz } from "./js-functions-modern";
import { jsAdvancedQuiz, jsObjectsQuiz } from "./js-objects-advanced";
import { jsArraysQuiz, jsStringsQuiz } from "./js-strings-arrays";
import {
  jsYdkjsBlockScopeQuiz,
  jsYdkjsApiAdditionsQuiz,
  jsYdkjsAsyncQuiz,
  jsYdkjsBeyondEs6Quiz,
  jsYdkjsCallbacksQuiz,
  jsYdkjsMetaQuiz,
  jsYdkjsEs6SyntaxQuiz,
  jsYdkjsEsVersionsQuiz,
  jsYdkjsGeneratorsQuiz,
  jsYdkjsGrammarQuiz,
  jsYdkjsHoistingQuiz,
  jsYdkjsNativesQuiz,
  jsYdkjsObjectsQuiz,
  jsYdkjsPrototypesQuiz,
  jsYdkjsQuiz,
  jsYdkjsScopeQuiz,
  jsYdkjsThisQuiz,
  jsYdkjsTuningQuiz,
  jsYdkjsTypesQuiz,
} from "./js-ydkjs";

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
    jsYdkjsBlockScopeQuiz,
    jsYdkjsThisQuiz,
    jsYdkjsObjectsQuiz,
    jsYdkjsPrototypesQuiz,
    jsYdkjsTypesQuiz,
    jsYdkjsNativesQuiz,
    jsYdkjsGrammarQuiz,
    jsYdkjsCallbacksQuiz,
    jsYdkjsGeneratorsQuiz,
    jsYdkjsAsyncQuiz,
    jsYdkjsTuningQuiz,
    jsYdkjsEsVersionsQuiz,
    jsYdkjsEs6SyntaxQuiz,
    jsYdkjsApiAdditionsQuiz,
    jsYdkjsBeyondEs6Quiz,
    jsYdkjsMetaQuiz,
  ],
};
