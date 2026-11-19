import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { skills } from "@content/skills";
import { detectSeniority, matchSkills } from "./matcher";

const en = readFileSync("tests/fixtures/job-en.txt", "utf8");
const uk = readFileSync("tests/fixtures/job-uk.txt", "utf8");

const slugs = (text: string) => matchSkills(text, skills).map((m) => m.slug);

describe("matchSkills (English post)", () => {
  const result = matchSkills(en, skills);
  const found = result.map((m) => m.slug);

  it("finds the required core skills", () => {
    for (const slug of ["javascript", "typescript", "react", "redux", "html", "css", "http-rest", "graphql", "jest", "unit-testing", "git", "ci-cd", "english", "nodejs"]) {
      expect(found, slug).toContain(slug);
    }
  });

  it("marks nice-to-have skills as optional", () => {
    for (const slug of ["nextjs", "docker", "aws", "web-accessibility"]) {
      const m = result.find((r) => r.slug === slug);
      expect(m, slug).toBeDefined();
      expect(m!.required, slug).toBe(false);
    }
    expect(result.find((r) => r.slug === "react")!.required).toBe(true);
  });

  it("ignores English words that look like skills", () => {
    // "react quickly", "Rest of the team", "Promise to", "go the extra mile"
    expect(found).not.toContain("go");
    expect(result.find((r) => r.slug === "react")!.mentions).toBe(4); // incl. "React Testing Library"
    expect(result.find((r) => r.slug === "http-rest")!.mentions).toBe(1);
    expect(found).not.toContain("async-javascript");
  });

  it("ranks required skills before optional ones", () => {
    const firstOptional = result.findIndex((r) => !r.required);
    expect(result.slice(firstOptional).every((r) => !r.required)).toBe(true);
  });
});

describe("matchSkills (Ukrainian post)", () => {
  const result = matchSkills(uk, skills);
  const found = result.map((m) => m.slug);

  it("finds skills in Ukrainian text", () => {
    for (const slug of ["angular", "typescript", "rxjs", "ngrx", "html", "sass", "responsive-design", "algorithms", "data-structures", "http-rest", "english"]) {
      expect(found, slug).toContain(slug);
    }
  });

  it("treats 'Буде плюсом' as nice-to-have", () => {
    for (const slug of ["nodejs", "nestjs", "jest", "cypress"]) {
      expect(result.find((r) => r.slug === slug)?.required, slug).toBe(false);
    }
  });
});

describe("special tokens", () => {
  it("matches symbols and dotted names", () => {
    expect(slugs("We use C#, C++ and ASP.NET Core with Node.js")).toEqual(expect.arrayContaining(["csharp", "cpp", "dotnet", "nodejs"]));
  });
  it("matches hyphen/space variants", () => {
    expect(slugs("react-native and end to end testing")).toEqual(expect.arrayContaining(["react-native", "e2e-testing"]));
  });
  it("does not match lower-case ambiguous tokens", () => {
    expect(slugs("let's go and react to the rest")).toEqual([]);
  });
});

describe("detectSeniority", () => {
  it("reads the title", () => {
    expect(detectSeniority(en)).toBe("senior");
    expect(detectSeniority(uk)).toBe("middle");
  });
  it("falls back to years of experience", () => {
    expect(detectSeniority("Frontend developer\n\nWe need 1 year of experience")).toBe("junior");
    expect(detectSeniority("Frontend developer\n\n3+ years with React")).toBe("middle");
    expect(detectSeniority("Frontend developer\n\n6 years with React")).toBe("senior");
  });
});

describe("sections", () => {
  it("ignores perks sections", () => {
    const text = "Requirements:\n- React\n\nWe offer:\n- English classes\n- Docker workshops";
    expect(slugs(text)).toEqual(["react"]);
  });
});
