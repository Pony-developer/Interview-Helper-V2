"use client";

import type { WebWorkerMLCEngine } from "@mlc-ai/web-llm";

export type LlmSkill = { name: string; importance: "required" | "nice" };
export type LlmExtraction = { skills: LlmSkill[]; level: "junior" | "middle" | "senior" | "unknown" };

const MAX_TOKENS = 480;

const SCHEMA = JSON.stringify({
  type: "object",
  properties: {
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          importance: { type: "string", enum: ["required", "nice"] },
        },
        required: ["name", "importance"],
      },
    },
    level: { type: "string", enum: ["junior", "middle", "senior", "unknown"] },
  },
  required: ["skills", "level"],
});

const SYSTEM = [
  "You extract technical skills from software job descriptions written in English or Ukrainian.",
  "Return ONLY JSON matching this schema: " + SCHEMA,
  "Rules:",
  "- Use canonical English names: languages, frameworks, libraries, tools, platforms and CS topics (e.g. \"TypeScript\", \"React\", \"RxJS\", \"REST API\", \"Data structures\", \"Unit testing\").",
  "- Include skills that are clearly implied (\"SPA with hooks\" implies React).",
  "- importance is \"nice\" for items listed as a plus, bonus, preferred, \"буде плюсом\" or \"як перевага\"; otherwise \"required\".",
  "- Ignore benefits, perks and soft skills except English.",
  "- level: the seniority the role asks for, or \"unknown\".",
  "- At most 20 skills, no duplicates.",
].join("\n");

/** Rough budget so the prompt fits a 4k context: Cyrillic tokenises ~2× worse than Latin. */
export function truncateForModel(text: string) {
  const cyr = (text.match(/\p{Script=Cyrillic}/gu) ?? []).length / Math.max(text.length, 1);
  const limit = cyr > 0.3 ? 3200 : 6000;
  return text.length > limit ? text.slice(0, limit) : text;
}

export function parseExtraction(raw: string): LlmExtraction {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const json = start >= 0 && end > start ? raw.slice(start, end + 1) : "{}";
  try {
    const data = JSON.parse(json) as Partial<LlmExtraction>;
    const skills = Array.isArray(data.skills)
      ? data.skills
          .filter((s): s is LlmSkill => !!s && typeof s.name === "string" && s.name.trim().length > 0)
          .map((s) => ({ name: s.name.trim(), importance: s.importance === "nice" ? "nice" as const : "required" as const }))
      : [];
    const level = ["junior", "middle", "senior"].includes(String(data.level)) ? (data.level as LlmExtraction["level"]) : "unknown";
    return { skills, level };
  } catch {
    return { skills: [], level: "unknown" };
  }
}

/** Runs the extraction; `onProgress` gets generated-tokens / max-tokens (a real, monotonic measure). */
export async function extractSkillsWithLlm(
  engine: WebWorkerMLCEngine,
  text: string,
  onProgress: (fraction: number, partial: string) => void,
): Promise<LlmExtraction> {
  const stream = await engine.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Job description:\n"""\n${truncateForModel(text)}\n"""\nReturn the JSON now.` },
    ],
    temperature: 0,
    max_tokens: MAX_TOKENS,
    stream: true,
    response_format: { type: "json_object", schema: SCHEMA },
  });

  let out = "";
  let tokens = 0;
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    if (delta) {
      out += delta;
      tokens += 1;
      onProgress(Math.min(0.98, tokens / MAX_TOKENS), out);
    }
  }
  onProgress(1, out);
  return parseExtraction(out);
}
