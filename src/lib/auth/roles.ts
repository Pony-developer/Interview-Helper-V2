import "server-only";

import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import type { Enums } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type AppRole = Enums<"app_role">;
export type CurrentUser = { id: string; role: AppRole };

/** The signed-in user and their role, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub as string | undefined;
  if (!id) return null;

  // RLS lets every user read their own profile row.
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
  return { id, role: profile?.role ?? "user" };
});

export async function isAdmin() {
  return (await getCurrentUser())?.role === "admin";
}

/**
 * Guard for admin-only pages, actions and route handlers.
 * Signed-out users go to the login page; signed-in non-admins get a 404 so the page's existence isn't revealed.
 * The database enforces the same rule independently through RLS and `public.is_admin()`.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") notFound();
  return user;
}
