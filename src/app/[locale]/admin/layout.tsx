import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { SiteHeader } from "@/components/site/SiteHeader";
import { toLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { privatePageMetadata } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  ...privatePageMetadata,
};

/**
 * Admin area: signed-out users are redirected to /login (proxy + requireAdmin), non-admins get a 404.
 * Every page and server action checks the role again, and the database enforces it in the admin RPCs.
 */
export default async function AdminLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  setRequestLocale(toLocale((await params).locale));
  if (!isSupabaseConfigured()) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <h1 className="font-display text-2xl font-bold text-forest-800">Admin</h1>
          <p className="mt-4 text-ink-muted">The admin panel edits content in Supabase. Configure Supabase in .env.local to use it.</p>
        </main>
      </>
    );
  }
  await requireAdmin();

  return (
    <>
      <SiteHeader />
      <AdminNav />
      <main id="main" tabIndex={-1} className="on-light flex-1 bg-paper focus:outline-none">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">{children}</div>
      </main>
    </>
  );
}
