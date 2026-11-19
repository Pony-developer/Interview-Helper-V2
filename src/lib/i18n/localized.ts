import type { Json } from "@/lib/supabase/database.types";

export type LocalizedText = { en?: string; uk?: string };

/** Picks the text for a locale from a {en, uk} JSON value, falling back to English. */
export function loc(value: Json | LocalizedText | null | undefined, locale: string): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return typeof value === "string" ? value : "";
  const v = value as Record<string, unknown>;
  const text = v[locale] ?? v.en ?? Object.values(v)[0];
  return typeof text === "string" ? text : "";
}
