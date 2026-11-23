import type { QuizQuestionDef } from "../types";

/** English and Ukrainian text, in that order. */
export type L = [en: string, uk: string];

/**
 * A quiz question in compact form: options get the ids a, b, c, d in the order given.
 * A single answer id makes a single-choice question; an array of ids makes a multiple-choice one.
 */
export function question(id: string, prompt: L, options: L[], correct: string | string[]): QuizQuestionDef {
  return {
    id,
    mode: typeof correct === "string" ? "single" : "multi",
    prompt: { en: prompt[0], uk: prompt[1] },
    options: options.map(([en, uk], i) => ({ id: "abcdefgh"[i], text: { en, uk } })),
    correct: typeof correct === "string" ? [correct] : correct,
  };
}
