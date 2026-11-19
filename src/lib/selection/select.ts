/**
 * Adaptive interview assembly (pure, deterministic for a given seed).
 *
 * 1. Mastery per skill: Beta-style estimate from the user's last results on that skill's tasks,
 *    weighted by complexity, task↔skill weight and recency (30-day half-life).
 * 2. Focus skills: the weakest/least-proven skills, scaled by how prominent they are in the job post.
 * 3. Slots: spread in proportion to weakness (≥1 per focus skill, largest-remainder rounding).
 * 4. Tasks: prefer previously failed (remediation), then unseen; skip recently passed;
 *    match complexity to the target level adjusted by mastery; ~30% practice tasks.
 * 5. Order: easy → hard, practice tasks not back-to-back.
 */

export type Level = "junior" | "middle" | "senior";

export type SelSkill = { id: string; slug: string; name?: string; priority: number; codeable?: boolean };
export type SelTask = {
  id: string;
  kind: "quiz" | "practice";
  complexity: number;
  estSeconds: number;
  skills: { skillId: string; weight: number }[];
};
export type SelProgress = {
  taskId: string;
  status: "passed" | "failed";
  attempts: number;
  lastScore: number;
  lastAttemptAt: string;
};

export type SkillMastery = { mastery: number; confidence: number };

export type SelectionInput = {
  skills: SelSkill[];
  tasks: SelTask[];
  progress: SelProgress[];
  level: Level;
  length: number;
  now?: Date;
  seed?: number;
};

export type SelectionResult = {
  focusSkillIds: string[];
  items: { taskId: string; skillId: string }[];
  budgetSeconds: number;
  mastery: Record<string, SkillMastery>;
  /** Requested skills that have no exercises yet. */
  gaps: string[];
};

const DAY = 86_400_000;
const LEVEL_TARGET: Record<Level, number> = { junior: 2, middle: 3, senior: 4 };
export const FOCUS_BY_LENGTH = (length: number) => (length <= 6 ? 3 : length <= 10 ? 4 : 5);
const PRACTICE_SHARE = 0.3;
const RECENT_PASS_DAYS = 14;
const RECENT_FAIL_HOURS = 24;

export function complexityWeight(c: number) {
  return 1 + 0.25 * (c - 1);
}

/** Mulberry32 PRNG — small, fast, deterministic. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function computeMastery(
  skillIds: string[],
  tasks: SelTask[],
  progress: SelProgress[],
  now = new Date(),
): Record<string, SkillMastery> {
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const acc = new Map<string, { num: number; den: number }>(skillIds.map((id) => [id, { num: 0, den: 0 }]));
  for (const p of progress) {
    const task = taskById.get(p.taskId);
    if (!task) continue;
    const ageDays = Math.max(0, (now.getTime() - new Date(p.lastAttemptAt).getTime()) / DAY);
    const decay = Math.pow(0.5, ageDays / 30);
    for (const link of task.skills) {
      const slot = acc.get(link.skillId);
      if (!slot) continue;
      const w = link.weight * complexityWeight(task.complexity) * decay;
      // A pass that needed several attempts is weaker evidence than a first-try pass.
      const retryDiscount = p.status === "passed" && p.attempts > 1 ? 0.85 : 1;
      slot.num += w * Math.min(1, Math.max(0, p.lastScore * retryDiscount));
      slot.den += w;
    }
  }
  const out: Record<string, SkillMastery> = {};
  for (const [id, { num, den }] of acc) out[id] = { mastery: (1 + num) / (2 + den), confidence: den };
  return out;
}

type Candidate = { task: SelTask; skillId: string; score: number };

export function selectInterview(input: SelectionInput): SelectionResult {
  const now = input.now ?? new Date();
  const random = rng(input.seed ?? now.getTime());
  const length = Math.max(1, Math.round(input.length));
  const skillIds = input.skills.map((s) => s.id);
  const mastery = computeMastery(skillIds, input.tasks, input.progress, now);
  const progressByTask = new Map(input.progress.map((p) => [p.taskId, p]));

  const tasksBySkill = new Map<string, SelTask[]>();
  for (const task of input.tasks) {
    for (const link of task.skills) {
      if (!skillIds.includes(link.skillId)) continue;
      const list = tasksBySkill.get(link.skillId) ?? [];
      list.push(task);
      tasksBySkill.set(link.skillId, list);
    }
  }

  const gaps = input.skills.filter((s) => !tasksBySkill.get(s.id)?.length).map((s) => s.id);
  const eligible = input.skills.filter((s) => tasksBySkill.get(s.id)?.length);
  if (!eligible.length) return { focusSkillIds: [], items: [], budgetSeconds: 0, mastery, gaps };

  const need = (s: SelSkill) => {
    const m = mastery[s.id];
    return 1 - m.mastery + 0.5 / (1 + m.confidence);
  };
  const maxPriority = Math.max(...eligible.map((s) => s.priority), 1e-9);

  const focus = [...eligible]
    .map((s) => ({ s, rank: (0.35 + 0.65 * (s.priority / maxPriority)) * need(s) + random() * 1e-3 }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, Math.min(FOCUS_BY_LENGTH(length), length))
    .map((x) => x.s);
  const focusIds = new Set(focus.map((s) => s.id));

  // Slot allocation (largest remainder), at least 1 per focus skill.
  const needs = focus.map(need);
  const total = needs.reduce((a, b) => a + b, 0);
  const extra = length - focus.length;
  const raw = needs.map((n) => (n / total) * extra);
  const slots = raw.map((r) => 1 + Math.floor(r));
  let left = length - slots.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => ({ i, rem: r - Math.floor(r) }))
    .sort((a, b) => b.rem - a.rem)
    .forEach(({ i }) => {
      if (left > 0) {
        slots[i]++;
        left--;
      }
    });

  // Candidate scoring per focus skill.
  const scoreTask = (task: SelTask, skill: SelSkill, allowRecentPass: boolean): number | null => {
    const p = progressByTask.get(task.id);
    let score = 0;
    if (!p) score += 2;
    else if (p.status === "failed") {
      const hours = (now.getTime() - new Date(p.lastAttemptAt).getTime()) / 3_600_000;
      score += hours < RECENT_FAIL_HOURS ? 0.5 : 3;
    } else {
      const days = (now.getTime() - new Date(p.lastAttemptAt).getTime()) / DAY;
      if (days < RECENT_PASS_DAYS) {
        if (!allowRecentPass) return null;
        score -= 5;
      } else score += 0.5;
    }
    const m = mastery[skill.id];
    const shift = m.confidence > 1 ? (m.mastery > 0.75 ? 1 : m.mastery < 0.35 ? -1 : 0) : 0;
    const target = Math.min(5, Math.max(1, LEVEL_TARGET[input.level] + shift));
    score -= Math.abs(task.complexity - target);
    score += 0.75 * task.skills.filter((l) => l.skillId !== skill.id && focusIds.has(l.skillId)).length;
    score += random() * 0.5;
    return score;
  };

  const candidates = (allowRecentPass: boolean) =>
    new Map(
      focus.map((s) => [
        s.id,
        (tasksBySkill.get(s.id) ?? [])
          .map((task) => ({ task, skillId: s.id, score: scoreTask(task, s, allowRecentPass) }))
          .filter((c): c is Candidate => c.score !== null)
          .sort((a, b) => b.score - a.score),
      ]),
    );

  const picked: Candidate[] = [];
  const used = new Set<string>();
  const remainingSlots = new Map(focus.map((s, i) => [s.id, slots[i]]));
  const take = (c: Candidate) => {
    picked.push(c);
    used.add(c.task.id);
    remainingSlots.set(c.skillId, (remainingSlots.get(c.skillId) ?? 0) - 1);
  };

  const fill = (pool: Map<string, Candidate[]>) => {
    const practiceCap = Math.max(1, Math.round(length * PRACTICE_SHARE));
    const practiceCount = () => picked.filter((c) => c.task.kind === "practice").length;

    // 1) Practice tasks first (round-robin over the neediest skills), up to ~30%.
    let progressMade = true;
    while (practiceCount() < practiceCap && progressMade) {
      progressMade = false;
      for (const s of focus) {
        if (practiceCount() >= practiceCap) break;
        if ((remainingSlots.get(s.id) ?? 0) <= 0) continue;
        const c = pool.get(s.id)?.find((x) => x.task.kind === "practice" && !used.has(x.task.id));
        if (c) {
          take(c);
          progressMade = true;
        }
      }
    }
    // 2) Fill each skill's remaining slots, preferring quizzes.
    for (const s of focus) {
      const list = pool.get(s.id) ?? [];
      while ((remainingSlots.get(s.id) ?? 0) > 0) {
        const c =
          list.find((x) => x.task.kind === "quiz" && !used.has(x.task.id)) ??
          (practiceCount() < practiceCap + 1 ? list.find((x) => !used.has(x.task.id)) : undefined);
        if (!c) break;
        take(c);
      }
    }
    // 3) Redistribute unfilled slots to any focus skill that still has candidates.
    let missing = length - picked.length;
    for (const s of focus) {
      for (const c of pool.get(s.id) ?? []) {
        if (missing <= 0) break;
        if (used.has(c.task.id)) continue;
        if (c.task.kind === "practice" && practiceCount() >= practiceCap + 1) continue;
        take(c);
        missing--;
      }
    }
  };

  fill(candidates(false));
  if (picked.length < length) fill(candidates(true)); // last resort: recently passed tasks

  // Order: easy → hard, then keep practice tasks apart.
  const ordered = [...picked].sort((a, b) => a.task.complexity - b.task.complexity || a.task.estSeconds - b.task.estSeconds);
  const isPractice = (k: number) => ordered[k]?.task.kind === "practice";
  for (let i = 1; i < ordered.length; i++) {
    if (!(isPractice(i) && isPractice(i - 1))) continue;
    // Swap with the nearest quiz whose new neighbours are not practice tasks.
    for (let d = 1; d < ordered.length; d++) {
      const j = [i + d, i - 1 - d].find(
        (k) =>
          k >= 0 &&
          k < ordered.length &&
          !isPractice(k) &&
          (k - 1 === i || !isPractice(k - 1)) &&
          (k + 1 === i || !isPractice(k + 1)),
      );
      if (j !== undefined) {
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
        break;
      }
    }
  }

  const budgetSeconds = Math.round(ordered.reduce((sum, c) => sum + c.task.estSeconds, 0) * 1.1);
  return {
    focusSkillIds: focus.map((s) => s.id),
    items: ordered.map((c) => ({ taskId: c.task.id, skillId: c.skillId })),
    budgetSeconds,
    mastery,
    gaps,
  };
}
