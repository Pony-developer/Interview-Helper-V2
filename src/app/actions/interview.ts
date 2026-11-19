"use server";

import { z } from "zod";
import { fetchJobPage, type JobPageResult } from "@/lib/jobs/fetch-job-page";
import type { SelProgress, SelTask } from "@/lib/selection/select";
import { createClient } from "@/lib/supabase/server";

type ActionError = { ok: false; error: "unauthenticated" | "rate_limited" | "invalid" | "server" };

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  return { supabase, userId };
}

// Best-effort per-instance limiter for outbound fetches (10/min per user).
const hits = new Map<string, number[]>();
function rateLimited(userId: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(userId, recent);
  return recent.length > limit;
}

export async function fetchJobPageAction(url: string): Promise<JobPageResult | ActionError> {
  const { userId } = await requireUser();
  if (!userId) return { ok: false, error: "unauthenticated" };
  if (typeof url !== "string" || url.length > 2048) return { ok: false, error: "invalid" };
  if (rateLimited(userId)) return { ok: false, error: "rate_limited" };
  return fetchJobPage(url);
}

export type SelectionContext = {
  ok: true;
  skills: { id: string; slug: string; name: string; codeable: boolean; hasContent: boolean }[];
  tasks: (SelTask & { slug: string })[];
  progress: SelProgress[];
};

const slugList = z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1).max(40);

/** Loads the catalogue slice + the user's history needed to pick tasks. */
export async function getSelectionContext(skillSlugs: string[]): Promise<SelectionContext | ActionError> {
  const parsed = slugList.safeParse(skillSlugs);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { supabase, userId } = await requireUser();
  if (!userId) return { ok: false, error: "unauthenticated" };

  const { data: skills, error: e1 } = await supabase
    .from("skills")
    .select("id, slug, name, codeable, has_content")
    .in("slug", parsed.data);
  if (e1) return { ok: false, error: "server" };

  const skillIds = (skills ?? []).map((s) => s.id);
  const { data: links, error: e2 } = skillIds.length
    ? await supabase.from("task_skills").select("task_id").in("skill_id", skillIds)
    : { data: [], error: null };
  if (e2) return { ok: false, error: "server" };
  const taskIds = [...new Set((links ?? []).map((l) => l.task_id))];

  const [tasksRes, allLinksRes, progressRes] = taskIds.length
    ? await Promise.all([
        supabase.from("tasks").select("id, slug, kind, complexity, est_seconds").in("id", taskIds).eq("published", true),
        supabase.from("task_skills").select("task_id, skill_id, weight").in("task_id", taskIds),
        supabase.from("user_task_progress").select("task_id, status, attempts, last_score, last_attempt_at").in("task_id", taskIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }];
  if (tasksRes.error || allLinksRes.error || progressRes.error) return { ok: false, error: "server" };

  const linksByTask = new Map<string, { skillId: string; weight: number }[]>();
  for (const l of allLinksRes.data ?? []) {
    const list = linksByTask.get(l.task_id) ?? [];
    list.push({ skillId: l.skill_id, weight: l.weight });
    linksByTask.set(l.task_id, list);
  }

  return {
    ok: true,
    skills: (skills ?? []).map((s) => ({ id: s.id, slug: s.slug, name: s.name, codeable: s.codeable, hasContent: s.has_content })),
    tasks: (tasksRes.data ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      kind: t.kind,
      complexity: t.complexity,
      estSeconds: t.est_seconds,
      skills: linksByTask.get(t.id) ?? [],
    })),
    progress: (progressRes.data ?? []).map((p) => ({
      taskId: p.task_id,
      status: p.status,
      attempts: p.attempts,
      lastScore: p.last_score,
      lastAttemptAt: p.last_attempt_at,
    })),
  };
}

const createInput = z.object({
  method: z.enum(["manual", "url", "llm_url", "llm_text"]),
  level: z.enum(["junior", "middle", "senior"]),
  locale: z.enum(["en", "uk"]),
  sourceUrl: z.string().url().max(2048).nullable(),
  detectedSkillIds: z.array(z.string().uuid()).max(60),
  focusSkillIds: z.array(z.string().uuid()).min(1).max(8),
  taskIds: z.array(z.string().uuid()).min(1).max(20),
});

export async function createInterviewAction(
  input: z.input<typeof createInput>,
): Promise<{ ok: true; id: string } | ActionError> {
  const parsed = createInput.safeParse(input);
  if (!parsed.success || new Set(parsed.data.taskIds).size !== parsed.data.taskIds.length) {
    return { ok: false, error: "invalid" };
  }
  const { supabase, userId } = await requireUser();
  if (!userId) return { ok: false, error: "unauthenticated" };
  const data = parsed.data;

  // Never trust client-side estimates: the budget comes from the catalogue.
  const { data: tasks, error: e1 } = await supabase
    .from("tasks")
    .select("id, est_seconds")
    .in("id", data.taskIds)
    .eq("published", true);
  if (e1 || !tasks || tasks.length !== data.taskIds.length) return { ok: false, error: "invalid" };
  const budget = Math.round(tasks.reduce((sum, t) => sum + t.est_seconds, 0) * 1.1);

  const { data: interview, error: e2 } = await supabase
    .from("interviews")
    .insert({
      method: data.method,
      level: data.level,
      locale: data.locale,
      source_url: data.sourceUrl,
      detected_skill_ids: data.detectedSkillIds,
      focus_skill_ids: data.focusSkillIds,
      budget_seconds: Math.max(60, budget),
    })
    .select("id")
    .single();
  if (e2 || !interview) return { ok: false, error: "server" };

  const { error: e3 } = await supabase
    .from("interview_items")
    .insert(data.taskIds.map((taskId, position) => ({ interview_id: interview.id, task_id: taskId, position })));
  if (e3) return { ok: false, error: "server" };

  return { ok: true, id: interview.id };
}
