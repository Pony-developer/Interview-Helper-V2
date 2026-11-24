import type { ModuleDef } from "../types";
import { extraAdvancedQuiz } from "./extra-advanced";
import { extraBeginnerQuiz } from "./extra-beginner";
import { extraIntermediateQuiz } from "./extra-intermediate";

/**
 * Additional questions: another popular list split into beginner, intermediate and advanced levels,
 * keeping only the questions the Junior, Middle and Senior modules don't already cover.
 */
export const extraModule: ModuleDef = {
  slug: "additional-interview-questions",
  title: { en: "Additional questions", uk: "Додаткові питання" },
  slides: [
    { kind: "lecture", slug: "extra-questions", title: { en: "Questions", uk: "Питання" } },
    extraBeginnerQuiz,
    extraIntermediateQuiz,
    extraAdvancedQuiz,
  ],
};
