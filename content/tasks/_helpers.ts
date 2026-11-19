import type { PracticeDef, QuizDef } from "@/lib/content/schema";

type Pair = [en: string, uk: string];
type SkillRef = QuizDef["skills"][number];

/**
 * Compact quiz authoring:
 *   quiz("slug", ["skill"], 2, 90, ["Title", "Назва"], ["Prompt", "Питання"],
 *        [["Option A", "Варіант А"], ...], "b", ["Why", "Чому"], { code })
 * Options get ids a, b, c…; `correct` is a letter or several letters ("ac") for multi-select.
 */
export function quiz(
  slug: string,
  skills: SkillRef[],
  complexity: number,
  estSeconds: number,
  title: Pair,
  prompt: Pair,
  options: (Pair | { text: Pair; code: string })[],
  correct: string,
  explanation: Pair,
  extra: { code?: string; codeLanguage?: string; lecture?: string } = {},
): QuizDef {
  const ids = "abcdef";
  return {
    kind: "quiz",
    slug,
    skills,
    complexity,
    estSeconds,
    title: { en: title[0], uk: title[1] },
    prompt: { en: prompt[0], uk: prompt[1] },
    mode: correct.length > 1 ? "multi" : "single",
    options: options.map((o, i) =>
      Array.isArray(o)
        ? { id: ids[i], text: { en: o[0], uk: o[1] } }
        : { id: ids[i], text: { en: o.text[0], uk: o.text[1] }, code: o.code },
    ),
    correct: correct.split(""),
    explanation: { en: explanation[0], uk: explanation[1] },
    ...extra,
  };
}

export function practice(def: Omit<PracticeDef, "kind" | "title" | "prompt" | "explanation"> & {
  title: Pair;
  prompt: Pair;
  explanation: Pair;
}): PracticeDef {
  return {
    ...def,
    kind: "practice",
    title: { en: def.title[0], uk: def.title[1] },
    prompt: { en: def.prompt[0], uk: def.prompt[1] },
    explanation: { en: def.explanation[0], uk: def.explanation[1] },
  };
}

/** Skill reference with partial weight (e.g. the umbrella "javascript" skill). */
export const w = (slug: string, weight = 0.5) => ({ slug, weight });
