import { describe, expect, it } from "vitest";
import { computeMastery, selectInterview, type SelProgress, type SelSkill, type SelTask } from "./select";

const NOW = new Date("2026-11-19T12:00:00Z");
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();

function makeTasks(skillId: string, count: number, kind: "quiz" | "practice" = "quiz", complexity = 3): SelTask[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${skillId}-${kind}-${i}`,
    kind,
    complexity,
    estSeconds: kind === "quiz" ? 90 : 600,
    skills: [{ skillId, weight: 1 }],
  }));
}

const skills: SelSkill[] = [
  { id: "react", slug: "react", priority: 1, codeable: true },
  { id: "search", slug: "searching-algorithms", priority: 1, codeable: true },
  { id: "css", slug: "css", priority: 1 },
];

const tasks: SelTask[] = [
  ...makeTasks("react", 8),
  ...makeTasks("react", 2, "practice"),
  ...makeTasks("search", 8),
  ...makeTasks("search", 2, "practice"),
  ...makeTasks("css", 8),
];

describe("computeMastery", () => {
  it("starts at 0.5 with no evidence", () => {
    expect(computeMastery(["react"], tasks, [], NOW).react).toEqual({ mastery: 0.5, confidence: 0 });
  });

  it("moves towards results, and old results matter less", () => {
    const fresh: SelProgress[] = [0, 1, 2].map((i) => ({ taskId: `react-quiz-${i}`, status: "failed", attempts: 1, lastScore: 0, lastAttemptAt: daysAgo(1) }));
    const old: SelProgress[] = fresh.map((p) => ({ ...p, lastAttemptAt: daysAgo(120) }));
    const m1 = computeMastery(["react"], tasks, fresh, NOW).react;
    const m2 = computeMastery(["react"], tasks, old, NOW).react;
    expect(m1.mastery).toBeLessThan(0.3);
    expect(m2.mastery).toBeGreaterThan(m1.mastery);
    expect(m2.confidence).toBeLessThan(m1.confidence);
  });
});

describe("selectInterview", () => {
  it("is deterministic for a seed and returns the requested length", () => {
    const a = selectInterview({ skills, tasks, progress: [], level: "middle", length: 10, now: NOW, seed: 7 });
    const b = selectInterview({ skills, tasks, progress: [], level: "middle", length: 10, now: NOW, seed: 7 });
    expect(a).toEqual(b);
    expect(a.items).toHaveLength(10);
    expect(new Set(a.items.map((i) => i.taskId)).size).toBe(10);
  });

  it("gives more slots to the weak skill", () => {
    // Strong at React and CSS, weak at search.
    const progress: SelProgress[] = [
      ...[0, 1, 2, 3].map((i) => ({ taskId: `react-quiz-${i}`, status: "passed" as const, attempts: 1, lastScore: 1, lastAttemptAt: daysAgo(20) })),
      ...[0, 1, 2, 3].map((i) => ({ taskId: `css-quiz-${i}`, status: "passed" as const, attempts: 1, lastScore: 1, lastAttemptAt: daysAgo(20) })),
      ...[0, 1, 2].map((i) => ({ taskId: `search-quiz-${i}`, status: "failed" as const, attempts: 1, lastScore: 0, lastAttemptAt: daysAgo(3) })),
    ];
    const r = selectInterview({ skills, tasks, progress, level: "middle", length: 10, now: NOW, seed: 1 });
    const count = (id: string) => r.items.filter((i) => i.skillId === id).length;
    expect(count("search")).toBeGreaterThan(count("react"));
    expect(count("search")).toBeGreaterThan(count("css"));
    expect(r.mastery.search.mastery).toBeLessThan(r.mastery.react.mastery);
  });

  it("retries failed tasks and skips recently passed ones", () => {
    const progress: SelProgress[] = [
      { taskId: "search-quiz-0", status: "failed", attempts: 1, lastScore: 0, lastAttemptAt: daysAgo(3) },
      { taskId: "search-quiz-1", status: "passed", attempts: 1, lastScore: 1, lastAttemptAt: daysAgo(2) },
    ];
    const r = selectInterview({ skills: [skills[1]], tasks, progress, level: "middle", length: 6, now: NOW, seed: 3 });
    const ids = r.items.map((i) => i.taskId);
    expect(ids).toContain("search-quiz-0");
    expect(ids).not.toContain("search-quiz-1");
  });

  it("does not immediately repeat a task failed minutes ago when alternatives exist", () => {
    const progress: SelProgress[] = [{ taskId: "css-quiz-0", status: "failed", attempts: 1, lastScore: 0, lastAttemptAt: daysAgo(0.01) }];
    const r = selectInterview({ skills: [skills[2]], tasks, progress, level: "middle", length: 3, now: NOW, seed: 5 });
    expect(r.items.map((i) => i.taskId)).not.toContain("css-quiz-0");
  });

  it("includes about 30% practice tasks and keeps them apart", () => {
    const r = selectInterview({ skills, tasks, progress: [], level: "middle", length: 10, now: NOW, seed: 11 });
    const kinds = r.items.map((i) => tasks.find((t) => t.id === i.taskId)!.kind);
    const practice = kinds.filter((k) => k === "practice").length;
    expect(practice).toBeGreaterThanOrEqual(2);
    expect(practice).toBeLessThanOrEqual(4);
    for (let i = 1; i < kinds.length; i++) expect(kinds[i] === "practice" && kinds[i - 1] === "practice").toBe(false);
  });

  it("matches complexity to the level", () => {
    const mixed: SelTask[] = [1, 2, 3, 4, 5].flatMap((c) =>
      makeTasks("search", 3, "quiz", c).map((t) => ({ ...t, id: `${t.id}-c${c}` })),
    );
    const avg = (level: "junior" | "senior") => {
      const r = selectInterview({ skills: [skills[1]], tasks: mixed, progress: [], level, length: 4, now: NOW, seed: 2 });
      return r.items.reduce((s, i) => s + mixed.find((t) => t.id === i.taskId)!.complexity, 0) / r.items.length;
    };
    expect(avg("junior")).toBeLessThan(avg("senior"));
  });

  it("reports skills without exercises as gaps", () => {
    const r = selectInterview({
      skills: [...skills, { id: "kotlin", slug: "kotlin", priority: 1 }],
      tasks,
      progress: [],
      level: "middle",
      length: 6,
      now: NOW,
      seed: 4,
    });
    expect(r.gaps).toEqual(["kotlin"]);
    expect(r.focusSkillIds).not.toContain("kotlin");
  });

  it("limits the number of focus skills by length and prefers prominent skills", () => {
    const many: SelSkill[] = Array.from({ length: 8 }, (_, i) => ({ id: `s${i}`, slug: `s${i}`, priority: i === 7 ? 10 : 1 }));
    const manyTasks = many.flatMap((s) => makeTasks(s.id, 4));
    const r = selectInterview({ skills: many, tasks: manyTasks, progress: [], level: "middle", length: 6, now: NOW, seed: 9 });
    expect(r.focusSkillIds).toHaveLength(3);
    expect(r.focusSkillIds).toContain("s7");
  });

  it("orders from easy to hard and computes a budget", () => {
    const mixed: SelTask[] = [3, 1, 5, 2].map((c, i) => ({ id: `t${i}`, kind: "quiz", complexity: c, estSeconds: 100, skills: [{ skillId: "css", weight: 1 }] }));
    const r = selectInterview({ skills: [skills[2]], tasks: mixed, progress: [], level: "middle", length: 4, now: NOW, seed: 1 });
    const cs = r.items.map((i) => mixed.find((t) => t.id === i.taskId)!.complexity);
    expect(cs).toEqual([...cs].sort((a, b) => a - b));
    expect(r.budgetSeconds).toBe(440);
  });

  describe("kinds filter", () => {
    const kindOf = (id: string) => tasks.find((t) => t.id === id)!.kind;

    it("quiz only never picks practice tasks", () => {
      const r = selectInterview({ skills, tasks, progress: [], level: "middle", length: 10, kinds: ["quiz"], now: NOW, seed: 4 });
      expect(r.items).toHaveLength(10);
      expect(r.items.every((i) => kindOf(i.taskId) === "quiz")).toBe(true);
    });

    it("practice only picks practice tasks beyond the usual 30% share", () => {
      const r = selectInterview({ skills: skills.slice(0, 2), tasks, progress: [], level: "middle", length: 4, kinds: ["practice"], now: NOW, seed: 4 });
      expect(r.items).toHaveLength(4);
      expect(r.items.every((i) => kindOf(i.taskId) === "practice")).toBe(true);
    });

    it("reports skills without tasks of the chosen kind as gaps", () => {
      const r = selectInterview({ skills, tasks, progress: [], level: "middle", length: 6, kinds: ["practice"], now: NOW, seed: 4 });
      expect(r.gaps).toEqual(["css"]);
    });
  });
});
