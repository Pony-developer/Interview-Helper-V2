import "server-only";

import { loc } from "@/lib/i18n/localized";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";

export type LectureSummary = {
  slug: string;
  title: string;
  summary: string;
  readingMinutes: number;
  updatedAt: string;
  skill: { slug: string; name: string; category: string };
};

export type Lecture = LectureSummary & { body: string };

type Row = {
  slug: string;
  title: unknown;
  summary: unknown;
  body?: unknown;
  reading_minutes: number;
  updated_at: string;
  skills: { slug: string; name: string; category: string } | null;
};

function toSummary(row: Row, locale: string): LectureSummary {
  return {
    slug: row.slug,
    title: loc(row.title as never, locale),
    summary: loc(row.summary as never, locale),
    readingMinutes: row.reading_minutes,
    updatedAt: row.updated_at,
    skill: row.skills ?? { slug: "", name: "", category: "" },
  };
}

/** Local fallback (no Supabase configured): read the authored Markdown from /content. */
async function fromContent(locale: string): Promise<Lecture[]> {
  const [{ loadLectures }, { skills }] = await Promise.all([import("@/lib/content/loader"), import("@content/skills")]);
  const bySlug = new Map(skills.map((s) => [s.slug, s]));
  return loadLectures().lectures.map((l) => {
    const skill = bySlug.get(l.skill);
    return {
      slug: l.slug,
      title: loc(l.title, locale),
      summary: loc(l.summary, locale),
      body: loc(l.body, locale),
      readingMinutes: l.readingMinutes,
      updatedAt: new Date(0).toISOString(),
      skill: { slug: l.skill, name: skill?.name ?? l.skill, category: skill?.category ?? "" },
    };
  });
}

/** All lectures (public catalogue). Returns [] when the database is unreachable. */
export async function getLectures(locale: string): Promise<LectureSummary[]> {
  if (!isSupabaseConfigured()) return (await fromContent(locale)).map(({ body: _body, ...rest }) => rest);
  try {
    const { data, error } = await createPublicClient()
      .from("lectures")
      .select("slug, title, summary, reading_minutes, updated_at, skills(slug, name, category)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as Row[]).map((r) => toSummary(r, locale));
  } catch (e) {
    console.error("getLectures failed", e);
    return [];
  }
}

export async function getLecture(slug: string, locale: string): Promise<Lecture | null> {
  if (!isSupabaseConfigured()) return (await fromContent(locale)).find((l) => l.slug === slug) ?? null;
  try {
    const { data, error } = await createPublicClient()
      .from("lectures")
      .select("slug, title, summary, body, reading_minutes, updated_at, skills(slug, name, category)")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as unknown as Row;
    return { ...toSummary(row, locale), body: loc(row.body as never, locale) };
  } catch (e) {
    console.error("getLecture failed", e);
    return null;
  }
}
