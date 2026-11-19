import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/** Cookie-aware client for Server Components, Server Actions and Route Handlers. */
export async function createClient() {
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes sessions, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Cookie-less client for public catalog reads (lectures, skills) so those pages
 * can be statically generated / revalidated without opting into dynamic rendering.
 */
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();
  return createPlainClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
