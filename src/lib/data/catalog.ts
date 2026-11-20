import "server-only";

import { CORE_SKILL_SLUGS, skills as rawSkills } from "@content/skills";
import { skillDef, SKILL_CATEGORIES, type Skill, type SkillCategory } from "@/lib/content/schema";
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

/**
 * The skill catalogue for the picker and job-post matcher: the authored skills in content/skills.ts,
 * plus skills created or edited in the admin panel (`source = 'admin'`), which take precedence.
 */
export async function getSkillCatalog(): Promise<Skill[]> {
  const bySlug = new Map(rawSkills.map((s) => skillDef.parse(s)).map((s) => [s.slug, s]));
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await createPublicClient()
        .from("skills")
        .select("slug, name, category, aliases, description, codeable, popularity")
        .eq("source", "admin");
      if (error) throw error;
      for (const row of data ?? []) {
        const category = (SKILL_CATEGORIES as readonly string[]).includes(row.category) ? (row.category as SkillCategory) : "practices";
        const description = row.description as {
          en?: string;
          uk?: string;
        } | null;
        bySlug.set(row.slug, {
          slug: row.slug,
          name: row.name,
          category,
          // The database stores both alias kinds in one list; anything with upper case is case-sensitive.
          aliases: row.aliases.filter((a) => a === a.toLowerCase()),
          caseSensitiveAliases: row.aliases.filter((a) => a !== a.toLowerCase()),
          codeable: row.codeable,
          popularity: row.popularity,
          description: description?.en && description?.uk ? { en: description.en, uk: description.uk } : undefined,
        });
      }
    } catch (e) {
      console.error("getSkillCatalog failed", e);
    }
  }
  return [...bySlug.values()];
}
