/**
 * Course content reused as mock-interview tasks.
 *
 * `npm run seed:build` turns every quiz question and every practice slide of the courses below into an
 * interview task (the same copy the admin "Import from courses" page makes, but kept in sync with the
 * course on every seed). Each module of a listed course needs a rule, so new modules are never
 * silently left out: map it, or `skip` it.
 *
 * Tagging policy (enforced by tests/unit/content.test.ts): a C# practice is tagged only with .NET
 * skills, so a frontend candidate who picks "recursion" never gets a C# program to write. Quizzes may
 * also carry a shared, language-neutral skill (sql, system-design, design-patterns…) when the module is
 * about that concept rather than C# syntax. SQL practices run in the browser (PGlite) and use `sql`.
 */
import type { QuizDef } from "@/lib/content/schema";

export type SkillRef = QuizDef["skills"][number];
type Complexity = 1 | 2 | 3 | 4 | 5;
type SlideOverride = { skills?: SkillRef[]; complexity?: Complexity } | "skip";

export type CourseTaskRule = {
  course: string;
  module: string;
  complexity: Complexity;
  /** Skills of every task from this module, the primary one first (it picks the "Ask for help" lecture). */
  skills: SkillRef[];
  /** Replaces `skills` for quiz questions. */
  quizSkills?: SkillRef[];
  /** Per-slide overrides, keyed by slide slug. */
  slides?: Record<string, SlideOverride>;
  skip?: boolean;
};

/** Skills that C# practices may carry. */
export const DOTNET_SKILLS = ["csharp", "dotnet", "aspnet-core", "linq", "dotnet-async"] as const;

/** Courses whose quizzes and practices become interview tasks. */
export const INTERVIEW_COURSES = ["csharp", "advanced-csharp", "dotnet-interview", "design-patterns"] as const;

const w = (slug: string, weight = 0.5): SkillRef => ({ slug, weight });

function rules(course: string, list: [module: string, complexity: Complexity, skills: SkillRef[], extra?: Partial<CourseTaskRule>][]) {
  return list.map(([module, complexity, skills, extra]) => ({ course, module, complexity, skills, ...extra }));
}

const CS = ["csharp"];

export const courseTaskRules: CourseTaskRule[] = [
  // ── C# (from scratch) ────────────────────────────────────────────────────
  ...rules("csharp", [
    ["first-steps", 1, CS],
    ["errors", 1, CS],
    ["branching", 1, CS],
    ["loops", 1, CS],
    ["arrays", 1, CS],
    ["collections-strings-files", 2, CS],
    ["testing", 2, CS],
    ["complexity", 2, CS, { quizSkills: ["csharp", w("big-o")] }],
    ["recursion", 2, CS],
    ["searching-sorting", 2, CS],
    ["oop-basics", 2, CS],
    ["inheritance", 2, CS],
    ["encapsulation", 2, CS],
    ["abstraction", 2, CS],
    ["polymorphism", 2, CS],
    ["structs", 2, CS],
    ["stacks-queues-generics", 2, CS],
    ["yield-return", 3, CS],
    ["lists-and-dictionaries", 2, CS],
    ["delegates", 3, CS],
    ["linq", 2, ["linq", w("csharp")]],
    ["generics-advanced", 3, CS],
    ["events", 3, CS],
    ["exceptions-advanced", 3, CS],
    ["dotnet-platform", 3, ["dotnet"]],
    ["memory-gc", 3, ["dotnet"]],
    ["multithreading", 3, ["dotnet-async"]],
    ["async-tasks", 3, ["dotnet-async"]],
    ["concurrency", 4, ["dotnet-async"]],
    ["modern-csharp", 3, CS],
    ["di-aspnet", 3, ["aspnet-core", w("csharp")]],
    ["testing-advanced", 3, CS],
  ]),

  // ── Advanced C# ──────────────────────────────────────────────────────────
  ...rules("advanced-csharp", [
    ["platform", 3, ["dotnet"]],
    ["language-basics", 3, CS],
    ["creating-types", 3, CS],
    ["interfaces-generics", 3, CS],
    ["delegates-events", 3, CS],
    ["exceptions-iterators", 3, CS],
    ["nullability-tuples", 3, CS],
    ["records-patterns", 3, CS],
    ["language-extras", 4, CS],
    ["text-dates", 3, CS],
    ["equality-order", 3, CS],
    ["collections", 3, CS],
    ["linq-queries", 3, ["linq"]],
    ["linq-operators", 4, ["linq"]],
    ["xml-json", 3, CS],
    ["disposal-gc", 4, ["dotnet"]],
    ["diagnostics", 4, ["dotnet"]],
    ["threading-tasks", 4, ["dotnet-async"]],
    ["async-await", 4, ["dotnet-async"]],
    ["streams-io", 3, CS],
    ["networking", 4, CS],
    ["assemblies", 4, ["dotnet"]],
    ["reflection", 4, ["dotnet", w("csharp")]],
    ["cryptography", 4, CS],
    ["advanced-threading", 5, ["dotnet-async"]],
    ["parallel", 4, ["dotnet-async"]],
    ["span-memory", 5, ["dotnet", w("csharp")]],
    ["interop", 5, ["dotnet"]],
    ["regex", 3, CS],
  ]),

  // ── .NET interview preparation (junior → c2, middle → c3, senior → c4) ───
  ...rules("dotnet-interview", [
    ["junior-general", 2, CS],
    ["junior-platform", 2, ["dotnet", "csharp"]],
    ["junior-types", 2, CS],
    ["junior-classes", 2, CS],
    [
      "junior-async-db-tests",
      2,
      ["csharp", w("dotnet-async")],
      { slides: { "employees-projects": { skills: ["sql"] }, "course-enrollments": { skills: ["sql"] } } },
    ],
    ["junior-practical", 2, CS],
    ["middle-general", 3, CS, { quizSkills: ["system-design", w("csharp")] }],
    [
      "middle-platform",
      3,
      ["aspnet-core", "dotnet"],
      { slides: { "response-cache": { skills: ["aspnet-core", w("csharp")] }, "dispose-pattern": { skills: ["dotnet", w("csharp")] } } },
    ],
    ["middle-collections", 3, CS],
    [
      "middle-db-parallelism",
      3,
      ["dotnet-async", w("csharp")],
      { slides: { "doctors-patients": { skills: ["sql"] }, "normalize-orders": { skills: ["sql"] } } },
    ],
    ["middle-practical", 3, CS, { slides: { "thread-safe-singleton": { skills: ["dotnet-async", w("csharp")] } } }],
    ["senior-engineering", 4, CS],
    [
      "senior-runtime",
      4,
      ["dotnet"],
      { slides: { "expression-filter-builder": { skills: ["linq", w("csharp")] }, "own-stack": { skills: CS } } },
    ],
    ["senior-databases", 4, ["sql"], { slides: { "distributed-lock": { skills: CS } } }],
    ["senior-microservices-azure", 4, CS, { quizSkills: ["microservices", w("system-design")] }],
    [
      "senior-practical",
      4,
      CS,
      { slides: { "custom-linq": { skills: ["linq", w("csharp")], complexity: 5 }, "linq-filter": { skills: ["linq"] } } },
    ],
    ["mock-interviews", 3, CS, { quizSkills: ["csharp", w("dotnet")] }],
  ]),

  // ── Design patterns (C# examples) ────────────────────────────────────────
  ...rules("design-patterns", [
    ["intro", 2, CS, { quizSkills: ["design-patterns", w("csharp")] }],
    ["creational", 2, CS, { quizSkills: ["design-patterns", w("csharp")] }],
    ["structural", 3, CS, { quizSkills: ["design-patterns", w("csharp")] }],
    ["behavioral", 3, CS, { quizSkills: ["design-patterns", w("csharp")] }],
    ["behavioral-more", 3, CS, { quizSkills: ["design-patterns", w("csharp")] }],
    ["in-practice", 3, CS, { quizSkills: ["design-patterns", w("csharp")] }],
  ]),
];
