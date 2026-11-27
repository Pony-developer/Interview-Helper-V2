import { describe, expect, it } from "vitest";
import { loadContent } from "@/lib/content/loader";
import { normalizeSkillNames } from "@/lib/skills/normalize";
import { CORE_SKILL_SLUGS, skills } from "@content/skills";
import { DOTNET_SKILLS } from "@content/course-tasks";
import { loadCourseModules } from "@/lib/content/course-loader";
import { deriveCourseTasks } from "@/lib/content/course-tasks";
import { matchSkills } from "@/lib/skills/matcher";

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

describe("interview tasks from courses", () => {
  const { courses } = loadCourseModules();
  const { tasks, errors } = deriveCourseTasks(courses, new Set(skills.map((s) => s.slug)));
  const slugsOf = (refs: (string | { slug: string })[]) => refs.map((r) => (typeof r === "string" ? r : r.slug));

  it("maps every module of the listed courses without errors", () => {
    expect(errors).toEqual([]);
    expect(tasks.length).toBeGreaterThan(500);
  });

  it("tags C# practices only with .NET skills, and SQL practices with sql", () => {
    const dotnet = new Set<string>(DOTNET_SKILLS);
    for (const t of tasks) {
      if (t.kind !== "practice") continue;
      const allowed = t.practice.language === "csharp" ? dotnet : new Set([...dotnet, "sql"]);
      for (const s of slugsOf(t.skills)) expect(allowed.has(s), `${t.slug}: ${s}`).toBe(true);
    }
  });

  it("gives every core skill some exercises", async () => {
    const { tasks: authored } = await loadContent();
    const covered = new Set([...authored, ...tasks].flatMap((t) => slugsOf(t.skills)));
    for (const slug of CORE_SKILL_SLUGS) expect(covered.has(slug), slug).toBe(true);
  });

  it("finds the .NET skills in a job post", () => {
    const found = matchSkills(
      "Senior .NET developer. Requirements: C#, ASP.NET Core Web API, Entity Framework Core, LINQ, SQL Server, Task Parallel Library.",
      skills,
    ).map((m) => m.slug);
    for (const slug of ["csharp", "dotnet", "aspnet-core", "linq", "dotnet-async", "entity-framework", "mssql"])
      expect(found, slug).toContain(slug);
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
