"use server";

import { fetchJobPage } from "@/lib/jobs/fetch-job-page";

/** Development-only: job-page fetch without sign-in, for the offline preview. */
export async function devFetchJobPageAction(url: string) {
  if (process.env.NODE_ENV === "production") return { ok: false as const, error: "invalid" as const };
  return fetchJobPage(url);
}
