import { z } from "zod";
import { FRAMEWORKS } from "@/lib/playground/frameworks";

/** Bilingual text. Both locales are required for authored content. */
export const localized = z.object({ en: z.string().min(1), uk: z.string().min(1) });
export type Localized = z.infer<typeof localized>;

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "kebab-case slug");

export const SKILL_CATEGORIES = [
  "languages",
  "web-platform",
  "javascript-core",
  "frontend-frameworks",
  "state-and-data",
  "styling",
  "build-tooling",
  "cs-fundamentals",
  "backend",
  "databases",
  "devops-cloud",
  "testing",
  "mobile",
  "data-ml",
  "security",
  "practices",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const skillDef = z.object({
  slug,
  name: z.string().min(1),
  category: z.enum(SKILL_CATEGORIES),
  /** Lower-case alternative spellings used by the job-post matcher. */
  aliases: z.array(z.string().min(1)).default([]),
  /** Short tokens that are only matched case-sensitively (e.g. "Go", "R"). */
  caseSensitiveAliases: z.array(z.string().min(1)).default([]),
  codeable: z.boolean().default(false),
  /** 0–100, used to order chips and break ties. */
  popularity: z.number().int().min(0).max(100).default(30),
  description: localized.optional(),
});
export type SkillDef = z.input<typeof skillDef>;
export type Skill = z.output<typeof skillDef>;

const skillRef = z.union([slug, z.object({ slug, weight: z.number().gt(0).lte(1) })]);

const taskBase = z.object({
  slug,
  skills: z.array(skillRef).min(1),
  complexity: z.number().int().min(1).max(5),
  /** Expected time to solve, in seconds. */
  estSeconds: z.number().int().positive(),
  title: localized,
  /** Markdown. */
  prompt: localized,
  /** Lecture slug opened by the "Ask for help" button (defaults to the first skill's lecture). */
  lecture: slug.optional(),
  /** Markdown shown on the results page. */
  explanation: localized,
});

export const quizDef = taskBase.extend({
  kind: z.literal("quiz"),
  mode: z.enum(["single", "multi"]).default("single"),
  /** Optional code snippet shown with the question. */
  code: z.string().optional(),
  codeLanguage: z.string().default("ts"),
  options: z
    .array(z.object({ id: z.string().min(1), text: localized, code: z.string().optional() }))
    .min(2)
    .max(6),
  correct: z.array(z.string().min(1)).min(1),
});

export const practiceDef = taskBase.extend({
  kind: z.literal("practice"),
  framework: z.enum(FRAMEWORKS),
  files: z.record(z.string().startsWith("/"), z.string()),
  visibleFiles: z.array(z.string()).optional(),
  activeFile: z.string().optional(),
  tests: z.string().min(1),
  solution: z.record(z.string().startsWith("/"), z.string()),
  dependencies: z.record(z.string(), z.string()).optional(),
});

export const taskDef = z.discriminatedUnion("kind", [quizDef, practiceDef]);

/** Admin-only: a practice graded by its program output (C# or PostgreSQL), usually copied from a course. */
export const outputPracticeDef = taskBase.extend({
  kind: z.literal("practice"),
  runner: z.literal("output"),
  language: z.enum(["csharp", "sql"]),
  starter: z.string(),
  /** SQL only: the script that creates the practice database. */
  setup: z.string().optional(),
  expectedOutput: z.string().min(1, "the expected output is required"),
  /** Reference solution shown on the results page. */
  solution: z.string().optional(),
});
export const adminTaskDef = z.union([outputPracticeDef, taskDef]);
export type OutputPracticeDef = z.input<typeof outputPracticeDef>;
export type AdminTaskDef = z.input<typeof adminTaskDef>;
export type QuizDef = z.input<typeof quizDef>;
export type PracticeDef = z.input<typeof practiceDef>;
export type TaskDef = z.input<typeof taskDef>;
export type Task = z.output<typeof taskDef>;

export const lectureFrontmatter = z.object({
  skill: slug,
  title: z.string().min(1),
  summary: z.string().min(1),
  readingMinutes: z.number().int().positive(),
});

/** Helpers for authoring typed content files. */
export const defineSkills = (skills: SkillDef[]) => skills;
export const defineTasks = (tasks: TaskDef[]) => tasks;
