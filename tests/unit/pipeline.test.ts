/**
 * The analysis pipeline's error classification when no interview can be built.
 * Server actions and the WebLLM engine are replaced, so this runs in plain Node.
 */
import { createTranslator } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { skillDef } from "@/lib/content/schema";
import en from "../../messages/en.json";
import uk from "../../messages/uk.json";
import { skills as rawSkills } from "@content/skills";

vi.mock("@/app/actions/interview", () => ({
  createInterviewAction: vi.fn(),
  fetchJobPageAction: vi.fn(),
  getSelectionContext: vi.fn(),
}));
vi.mock("@/lib/llm/engine", () => ({ loadEngine: vi.fn() }));

const { runAnalysis } = await import("@/lib/pipeline/run-analysis");
type Request = Parameters<typeof runAnalysis>[0];
type Deps = NonNullable<Parameters<typeof runAnalysis>[1]["deps"]>;

const catalog = rawSkills.map((s) => skillDef.parse(s));

/** A selection context in which none of the requested skills has any tasks. */
const emptyContext: Deps["getSelectionContext"] = async (slugs) => ({
  ok: true,
  skills: slugs.map((slug) => {
    const skill = catalog.find((s) => s.slug === slug)!;
    return { id: `id-${slug}`, slug, name: skill.name, codeable: skill.codeable, hasContent: false };
  }),
  tasks: [],
  progress: [],
});

function request(overrides: Partial<Request>): Request {
  return {
    id: "r1",
    method: "url",
    skills: [],
    url: "https://jobs.example.test/123",
    text: "",
    level: "middle",
    length: "standard",
    model: "default",
    keywordFallback: false,
    createdAt: 0,
    ...overrides,
  } as Request;
}

async function run(req: Request, pageText = "") {
  const deps: Partial<Deps> = {
    fetchJobPage: (async () => ({ ok: true, text: pageText, title: "Job" })) as unknown as Deps["fetchJobPage"],
    getSelectionContext: emptyContext,
  };
  return runAnalysis(req, { catalog, locale: "en", onUpdate: () => undefined, deps });
}

describe("runAnalysis without matching content", () => {
  it("reports no_tech_skills when a job post yields only non-technical skills", async () => {
    const result = await run(request({ method: "url" }), "Requirements:\n- Upper-Intermediate English\n- Experience with Jira");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("no_tech_skills");
    expect(result.error.detail).toContain("English");
  });

  it("keeps no_content when the post names technical skills we have no tasks for", async () => {
    const result = await run(request({ method: "url" }), "Requirements:\n- Python and Django\n- Upper-Intermediate English");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("no_content");
    expect(result.error.detail).toContain("Python");
  });

  it("formats the progress and error messages with correct plurals", () => {
    const tEn = createTranslator({ locale: "en", messages: en, namespace: "analyzing" });
    const tUk = createTranslator({ locale: "uk", messages: uk, namespace: "analyzing" });
    expect(tEn("details.matched", { count: 1 })).toBe("1 skill found");
    expect(tEn("details.matched", { count: 3 })).toBe("3 skills found");
    expect(tEn("details.historyDone", { tasks: 0, attempts: 1 })).toBe("0 candidate tasks · 1 past attempt");
    expect(tUk("details.extracted", { lines: 1, chars: 3 })).toBe("1 рядок, 3 символи");
    expect(tUk("details.extracted", { lines: 5, chars: 21 })).toBe("5 рядків, 21 символ");
    expect(tEn("errors.no_tech_skills", { detail: "English" })).toContain("(English)");
    expect(tUk("errors.no_tech_skills", { detail: "English" })).toContain("(English)");
  });

  it("keeps no_content for manual picks, even of non-technical skills", async () => {
    const result = await run(request({ method: "manual", skills: ["english"] }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("no_content");
  });
});
