"use server";

import { z } from "zod";
import { runCSharp, type RunResult } from "@/lib/runner/csharp";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid();
const submitInput = z.object({
  itemId: uuid,
  answer: z
    .union([
      z.object({ selected: z.array(z.string().max(20)).max(10) }),
      // Output practice: the code plus what it printed (null when it didn't compile or failed).
      z.object({ files: z.record(z.string().max(200), z.string().max(100_000)), output: z.string().max(100_000).nullable() }),
      z.object({ files: z.record(z.string().max(200), z.string().max(100_000)) }),
    ])
    .nullable(),
  testsPassed: z.number().int().min(0).max(1000).nullable(),
  testsTotal: z.number().int().min(0).max(1000).nullable(),
  timeSpent: z.number().int().min(0).max(6 * 3600),
  skip: z.boolean(),
});

export async function submitItemAction(input: z.input<typeof submitInput>) {
  const parsed = submitInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid" };
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_item", {
    p_item_id: d.itemId,
    p_answer: d.answer,
    p_tests_passed: d.testsPassed,
    p_tests_total: d.testsTotal,
    p_time_spent: d.timeSpent,
    p_skip: d.skip,
  });
  if (error) return { ok: false as const, error: error.message.includes("already submitted") ? "duplicate" : "server" };
  return { ok: true as const };
}

export async function markHelpUsedAction(itemId: string) {
  if (!uuid.safeParse(itemId).success) return { ok: false as const };
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_help_used", { p_item_id: itemId });
  return { ok: !error };
}

export async function finishInterviewAction(interviewId: string) {
  if (!uuid.safeParse(interviewId).success) return { ok: false as const, error: "invalid" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("finish_interview", { p_interview_id: interviewId });
  if (error) return { ok: false as const, error: "server" };
  return { ok: true as const, result: data as { score: number; grade: string } };
}

/**
 * Runs the candidate's C# for an output practice of their own open interview. Only grading-free:
 * the output comes back to the browser and is submitted with the answer. Tied to an interview item
 * so the endpoint can't be used as an anonymous compiler proxy.
 */
export async function runInterviewCodeAction(
  itemId: string,
  code: string,
): Promise<{ ok: true; run: RunResult } | { ok: false; error: "invalid" | "server" }> {
  if (!uuid.safeParse(itemId).success || typeof code !== "string" || code.length > 50_000) return { ok: false, error: "invalid" };
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return { ok: false, error: "invalid" };
  // RLS: only the owner sees the item.
  const { data, error } = await supabase
    .from("interview_items")
    .select("status, tasks(practice), interviews(status)")
    .eq("id", itemId)
    .maybeSingle();
  if (error) return { ok: false, error: "server" };
  const row = data as unknown as { status: string; tasks: { practice: { runner?: string; language?: string } | null } | null; interviews: { status: string } | null } | null;
  const practice = row?.tasks?.practice;
  if (!row || row.status !== "pending" || row.interviews?.status !== "in_progress" || practice?.runner !== "output" || practice.language !== "csharp") {
    return { ok: false, error: "invalid" };
  }
  return { ok: true, run: await runCSharp(code) };
}
