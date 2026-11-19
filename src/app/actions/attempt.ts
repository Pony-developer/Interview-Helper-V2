"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid();
const submitInput = z.object({
  itemId: uuid,
  answer: z
    .union([
      z.object({ selected: z.array(z.string().max(20)).max(10) }),
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
