import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { Database } from "./database.types";
import { isSupabaseConfigured } from "./env";

export type PendingCookies = {
  cookies: { name: string; value: string; options?: Record<string, unknown> }[];
  headers: Record<string, string>;
};

/**
 * Refreshes the Supabase session for this request.
 * Refreshed cookies are written onto `request.cookies` (so downstream Server Components
 * see them — next-intl forwards request headers on rewrite) and returned so the caller
 * can attach them to the final response.
 */
export async function refreshSession(request: NextRequest) {
  const pending: PendingCookies = { cookies: [], headers: {} };
  // Unconfigured or malformed settings mean "no session" (protected pages redirect to login),
  // rather than an exception that turns every protected route into an error page.
  if (!isSupabaseConfigured()) return { userId: null as string | null, pending };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        pending.cookies.push(...cookiesToSet);
        Object.assign(pending.headers, headers ?? {});
      },
    },
  });

  // Do not run code between createServerClient and getClaims (see @supabase/ssr docs).
  const { data } = await supabase.auth.getClaims();
  return { userId: (data?.claims?.sub as string | undefined) ?? null, pending };
}
