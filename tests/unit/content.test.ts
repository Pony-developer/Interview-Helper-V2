import { describe, expect, it } from "vitest";
import { loadContent } from "@/lib/content/loader";
import { normalizeSkillNames } from "@/lib/skills/normalize";
import { CORE_SKILL_SLUGS, skills } from "@content/skills";

describe("authored content", () => {
  it("passes validation (slugs, aliases, skills, translations, answers, tests)", async () => {
    const { errors, skills: loaded, tasks } = await loadContent();
    expect(errors).toEqual([]);
    expect(loaded.length).toBeGreaterThan(200);
    expect(tasks.length).toBeGreaterThan(0);
  });

  it("every core skill exists in the catalogue", () => {
    const slugs = new Set(skills.map((s) => s.slug));
    for (const slug of CORE_SKILL_SLUGS) expect(slugs.has(slug), slug).toBe(true);
  });
});

describe("normalizeSkillNames", () => {
  it("maps model output onto catalogue slugs", () => {
    const out = normalizeSkillNames(
      ["React.js", "Typescript", "REST API", "Data structures", "RxJS", "Unit testing", "Angular 17", "Totally unknown thing"],
      skills,
    );
    expect(out.map((o) => o.slug)).toEqual([
      "react",
      "typescript",
      "http-rest",
      "data-structures",
      "rxjs",
      "unit-testing",
      "angular",
      null,
    ]);
  });
});
