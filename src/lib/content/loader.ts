/**
 * Node-only loader for the authored content in /content (used by the seed builder and tests).
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { skills as catalogSkills } from "@content/skills";
import { taskFiles } from "@content/tasks";
import matter from "gray-matter";
import { countTests } from "@/lib/playground/frameworks";
import { lectureFrontmatter, skillDef, taskDef, type Localized, type Skill, type Task } from "./schema";

export type LoadedLecture = {
  slug: string;
  skill: string;
  title: Localized;
  summary: Localized;
  body: Localized;
  readingMinutes: number;
};

export type LoadedContent = {
  skills: Skill[];
  lectures: LoadedLecture[];
  tasks: (Task & { file: string })[];
  errors: string[];
};


export function loadLectures(): { lectures: LoadedLecture[]; errors: string[] } {
  // Statically scoped paths keep Next.js output tracing limited to /content.
  const dir = path.join(process.cwd(), "content", "lectures");
  const errors: string[] = [];
  const bySlug = new Map<string, Partial<Record<"en" | "uk", { data: ReturnType<typeof lectureFrontmatter.parse>; body: string }>>>();
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch {
    return { lectures: [], errors };
  }
  for (const file of files) {
    const m = /^([a-z0-9-]+)\.(en|uk)\.md$/.exec(file);
    if (!m) {
      errors.push(`lectures/${file}: expected <slug>.<en|uk>.md`);
      continue;
    }
    const [, slug, locale] = m as unknown as [string, string, "en" | "uk"];
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(readFileSync(path.join(process.cwd(), "content", "lectures", file), "utf8"));
    } catch (e) {
      errors.push(`lectures/${file}: invalid frontmatter (${(e as Error).message.split("\n")[0]}); quote values containing ':'`);
      continue;
    }
    const fm = lectureFrontmatter.safeParse(parsed.data);
    if (!fm.success) {
      errors.push(`lectures/${file}: ${fm.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
      continue;
    }
    const entry = bySlug.get(slug) ?? {};
    entry[locale] = { data: fm.data, body: parsed.content.trim() };
    bySlug.set(slug, entry);
  }

  const lectures: LoadedLecture[] = [];
  for (const [slug, entry] of bySlug) {
    if (!entry.en || !entry.uk) {
      errors.push(`lectures/${slug}: both ${slug}.en.md and ${slug}.uk.md are required`);
      continue;
    }
    if (entry.en.data.skill !== entry.uk.data.skill) errors.push(`lectures/${slug}: skill differs between locales`);
    lectures.push({
      slug,
      skill: entry.en.data.skill,
      title: { en: entry.en.data.title, uk: entry.uk.data.title },
      summary: { en: entry.en.data.summary, uk: entry.uk.data.summary },
      body: { en: entry.en.body, uk: entry.uk.body },
      readingMinutes: entry.en.data.readingMinutes,
    });
  }
  return { lectures: lectures.sort((a, b) => a.slug.localeCompare(b.slug)), errors };
}

export async function loadTasks() {
  const dir = path.join(process.cwd(), "content", "tasks");
  const errors: string[] = [];
  const tasks: (Task & { file: string })[] = [];
  // Every task file must be registered in content/tasks/index.ts (static imports work in Next and tsx).
  try {
    const onDisk = readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts" && !f.startsWith("_") && !f.endsWith(".test.ts"));
    for (const f of onDisk) if (!(f in taskFiles)) errors.push(`tasks/${f}: not registered in content/tasks/index.ts`);
  } catch {
    /* no filesystem access (e.g. serverless runtime): trust the registry */
  }
  for (const [file, list] of Object.entries(taskFiles).sort(([a], [b]) => a.localeCompare(b))) {
    if (!Array.isArray(list) || !list.length) errors.push(`tasks/${file}: default export must be a non-empty array`);
    (Array.isArray(list) ? list : []).forEach((raw, i) => {
      const parsed = taskDef.safeParse(raw);
      if (!parsed.success) {
        const slug = (raw as { slug?: string })?.slug ?? `#${i}`;
        errors.push(`tasks/${file} ${slug}: ${parsed.error.issues.map((x) => `${x.path.join(".")} ${x.message}`).join("; ")}`);
        return;
      }
      tasks.push({ ...parsed.data, file });
    });
  }
  return { tasks, errors };
}

/** Loads and cross-validates everything. */
export async function loadContent(): Promise<LoadedContent> {
  const rawSkills: unknown[] = catalogSkills;
  const errors: string[] = [];
  const skills: Skill[] = [];
  for (const raw of rawSkills) {
    const parsed = skillDef.safeParse(raw);
    if (parsed.success) skills.push(parsed.data);
    else errors.push(`skills: ${(raw as { slug?: string }).slug}: ${parsed.error.message}`);
  }

  const lectureResult = loadLectures();
  const taskResult = await loadTasks();
  errors.push(...lectureResult.errors, ...taskResult.errors);

  validate(skills, lectureResult.lectures, taskResult.tasks, errors);
  return { skills, lectures: lectureResult.lectures, tasks: taskResult.tasks, errors };
}

function dupes(values: string[]) {
  const seen = new Set<string>();
  return [...new Set(values.filter((v) => (seen.has(v) ? true : (seen.add(v), false))))];
}

export function validate(skills: Skill[], lectures: LoadedLecture[], tasks: Task[], errors: string[]) {
  const skillSlugs = new Set(skills.map((s) => s.slug));
  const lectureSlugs = new Set(lectures.map((l) => l.slug));

  for (const d of dupes(skills.map((s) => s.slug))) errors.push(`skills: duplicate slug ${d}`);
  const aliasOwner = new Map<string, string>();
  for (const s of skills) {
    for (const a of s.aliases) {
      const key = a.toLowerCase();
      const owner = aliasOwner.get(key);
      if (owner && owner !== s.slug) errors.push(`skills: alias "${a}" used by ${owner} and ${s.slug}`);
      aliasOwner.set(key, s.slug);
      if (a !== a.toLowerCase()) errors.push(`skills: alias "${a}" of ${s.slug} must be lower-case`);
    }
  }
  for (const d of dupes(tasks.map((t) => t.slug))) errors.push(`tasks: duplicate slug ${d}`);
  for (const l of lectures) if (!skillSlugs.has(l.skill)) errors.push(`lectures/${l.slug}: unknown skill ${l.skill}`);

  for (const t of tasks) {
    const where = `task ${t.slug}`;
    for (const ref of t.skills) {
      const slug = typeof ref === "string" ? ref : ref.slug;
      if (!skillSlugs.has(slug)) errors.push(`${where}: unknown skill ${slug}`);
    }
    if (t.lecture && !lectureSlugs.has(t.lecture)) errors.push(`${where}: unknown lecture ${t.lecture}`);
    if (t.kind === "quiz") {
      const ids = t.options.map((o) => o.id);
      for (const d of dupes(ids)) errors.push(`${where}: duplicate option id ${d}`);
      for (const c of t.correct) if (!ids.includes(c)) errors.push(`${where}: correct id ${c} is not an option`);
      if (t.mode === "single" && t.correct.length !== 1) errors.push(`${where}: single-choice quiz needs exactly one correct option`);
    } else {
      if (!countTests(t.tests)) errors.push(`${where}: tests contain no it()/test() cases`);
      for (const p of Object.keys(t.solution)) if (!(p in t.files)) errors.push(`${where}: solution file ${p} is not a starter file`);
      for (const p of t.visibleFiles ?? []) if (!(p in t.files)) errors.push(`${where}: visible file ${p} is missing`);
    }
  }
}

export function lectureForTask(task: Task, lectures: LoadedLecture[]) {
  if (task.lecture) return task.lecture;
  const first = typeof task.skills[0] === "string" ? task.skills[0] : task.skills[0].slug;
  return lectures.find((l) => l.skill === first)?.slug ?? null;
}
