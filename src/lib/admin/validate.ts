import type { z } from "zod";
import type { Task } from "@/lib/content/schema";
import { countTests } from "@/lib/playground/frameworks";

/** Flattens zod issues into short, field-prefixed messages for the admin forms. */
export function formatIssues(error: z.ZodError) {
  return error.issues.slice(0, 8).map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message));
}

/**
 * Cross-field checks the zod schema can't express. Mirrors `validate()` in src/lib/content/loader.ts,
 * so a task saved in the admin panel meets the same rules as one authored in content/.
 */
export function taskIssues(task: Task): string[] {
  const issues: string[] = [];
  const skillSlugs = task.skills.map((s) => (typeof s === "string" ? s : s.slug));
  if (new Set(skillSlugs).size !== skillSlugs.length) issues.push("skills: each skill can be linked once");

  if (task.kind === "quiz") {
    const ids = task.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) issues.push("options: option ids must be unique");
    for (const c of task.correct) if (!ids.includes(c)) issues.push(`correct: "${c}" is not an option id`);
    if (task.mode === "single" && task.correct.length !== 1) issues.push("correct: a single-choice quiz needs exactly one correct option");
  } else {
    if (!Object.keys(task.files).length) issues.push("files: add at least one starter file");
    if (!countTests(task.tests)) issues.push("tests: no it()/test() cases found");
    for (const p of Object.keys(task.solution)) if (!(p in task.files)) issues.push(`solution: ${p} is not a starter file`);
    for (const p of task.visibleFiles ?? []) if (!(p in task.files)) issues.push(`visibleFiles: ${p} is not a starter file`);
    if (task.activeFile && !(task.activeFile in task.files)) issues.push(`activeFile: ${task.activeFile} is not a starter file`);
  }
  return issues;
}
