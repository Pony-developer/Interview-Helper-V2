import "server-only";

import { cache } from "react";
import { loc } from "@/lib/i18n/localized";
import type { Json } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient, createPublicClient } from "@/lib/supabase/server";

/** Learners earn a course certificate at this share of the course's points (enforced in the database). */
export const CERTIFICATE_THRESHOLD = 90;

export type Certificate = {
  id: string;
  holderName: string;
  scorePercent: number;
  issuedAt: string;
  courseSlug: string;
  courseTitle: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Public lookup by certificate id (anyone with the link can verify a certificate). */
export const getCertificate = cache(async (id: string, locale: string): Promise<Certificate | null> => {
  if (!UUID.test(id) || !isSupabaseConfigured()) return null;
  try {
    const { data, error } = await createPublicClient().rpc("get_course_certificate", { p_id: id });
    if (error) throw error;
    if (!data) return null;
    const c = data as { id: string; holder_name: string; score_percent: number; issued_at: string; course_slug: string; course_title: Json };
    return {
      id: c.id,
      holderName: c.holder_name,
      scorePercent: c.score_percent,
      issuedAt: c.issued_at,
      courseSlug: c.course_slug,
      courseTitle: loc(c.course_title, locale),
    };
  } catch (e) {
    console.error("getCertificate failed", e);
    return null;
  }
});

/** The signed-in learner's certificates, newest first. */
export async function listMyCertificates(locale: string): Promise<Certificate[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("course_certificates")
      .select("id, holder_name, score_percent, issued_at, courses(slug, title)")
      .order("issued_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as { id: string; holder_name: string; score_percent: number; issued_at: string; courses: { slug: string; title: Json } | null }[]).map(
      (c) => ({
        id: c.id,
        holderName: c.holder_name,
        scorePercent: c.score_percent,
        issuedAt: c.issued_at,
        courseSlug: c.courses?.slug ?? "",
        courseTitle: loc(c.courses?.title, locale),
      }),
    );
  } catch (e) {
    console.error("listMyCertificates failed", e);
    return [];
  }
}
