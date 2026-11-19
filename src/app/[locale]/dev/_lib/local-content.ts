import "server-only";

import type { SelectionContext } from "@/app/actions/interview";
import { loadContent } from "@/lib/content/loader";
import { countTests, type PracticePayload } from "@/lib/playground/frameworks";

/** Offline stand-in for the database, built from /content (development preview only). */
export async function localSelectionContext(): Promise<SelectionContext> {
  const { skills, tasks } = await loadContent();
  const withContent = new Set(tasks.flatMap((t) => t.skills.map((r) => (typeof r === "string" ? r : r.slug))));
  return {
    ok: true,
    skills: skills.map((s) => ({ id: s.slug, slug: s.slug, name: s.name, codeable: s.codeable, hasContent: withContent.has(s.slug) })),
    tasks: tasks.map((t) => ({
      id: t.slug,
      slug: t.slug,
      kind: t.kind,
      complexity: t.complexity,
      estSeconds: t.estSeconds,
      skills: t.skills.map((r) => (typeof r === "string" ? { skillId: r, weight: 1 } : { skillId: r.slug, weight: r.weight })),
    })),
    progress: [],
  };
}

export async function localTasks(slugs: string[], withSolution = false) {
  const { tasks, lectures, skills } = await loadContent();
  const bySlug = new Map(tasks.map((t) => [t.slug, t]));
  const skillName = new Map(skills.map((s) => [s.slug, s.name]));
  return slugs
    .map((s) => bySlug.get(s))
    .filter((t): t is NonNullable<typeof t> => !!t)
    .map((t) => {
      const firstSkill = typeof t.skills[0] === "string" ? t.skills[0] : t.skills[0].slug;
      const lecture = t.lecture ?? lectures.find((l) => l.skill === firstSkill)?.slug ?? null;
      const practice: PracticePayload | null =
        t.kind === "practice"
          ? {
              framework: t.framework,
              files: withSolution ? { ...t.files, ...t.solution } : t.files,
              visibleFiles: t.visibleFiles,
              activeFile: t.activeFile,
              tests: t.tests,
              testCount: countTests(t.tests),
              dependencies: t.dependencies,
            }
          : null;
      return {
        task: t,
        lecture,
        practice,
        skillNames: t.skills.map((r) => skillName.get(typeof r === "string" ? r : r.slug) ?? ""),
      };
    });
}
