import "server-only";

import { CORE_SKILL_SLUGS } from "@content/skills";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";

/** Slugs of skills that currently have published exercises. */
export async function getSkillsWithContent(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await createPublicClient().from("skills").select("slug").eq("has_content", true);
      if (!error && data) return data.map((s) => s.slug);
    } catch {
      /* fall back to the local list */
    }
  }
  return [...CORE_SKILL_SLUGS, "algorithms"];
}
