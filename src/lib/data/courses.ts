import "server-only";

import { courses as localCourses } from "@content/courses";
import { loc } from "@/lib/i18n/localized";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";

export type Course = {
  slug: string;
  title: string;
  summary: string;
  topics: string[];
};

type Row = {
  slug: string;
  title: unknown;
  summary: unknown;
  topics: unknown;
};

function toCourse(row: Row, locale: string): Course {
  const topics = Array.isArray(row.topics) ? row.topics : [];
  return {
    slug: row.slug,
    title: loc(row.title as never, locale),
    summary: loc(row.summary as never, locale),
    topics: topics.map((t) => loc(t as never, locale)).filter(Boolean),
  };
}

/** Published courses in display order. Falls back to the local copy without a database, and returns [] when the database is unreachable. */
export async function getCourses(locale: string): Promise<Course[]> {
  if (!isSupabaseConfigured()) {
    return localCourses.map((c) => ({
      slug: c.slug,
      title: loc(c.title, locale),
      summary: loc(c.summary, locale),
      topics: c.topics.map((t) => loc(t, locale)),
    }));
  }
  try {
    const { data, error } = await createPublicClient()
      .from("courses")
      .select("slug, title, summary, topics")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as unknown as Row[]).map((r) => toCourse(r, locale));
  } catch (e) {
    console.error("getCourses failed", e);
    return [];
  }
}
