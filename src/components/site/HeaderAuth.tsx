"use client";

import type { User } from "@supabase/supabase-js";
import { ChevronDown, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export function HeaderAuth() {
  const t = useTranslations("nav");
  const [user, setUser] = useState<User | null | undefined>(configured ? undefined : null);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<{ userId: string; isAdmin: boolean } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  // Role is display-only here; access control happens in the database (RLS) and on the server.
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    createClient()
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setRole({ userId, isAdmin: data?.role === "admin" });
      });
    return () => {
      alive = false;
    };
  }, [userId]);
  const isAdmin = role?.userId === userId && role?.isAdmin;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (user === undefined) {
    return <span aria-hidden className="inline-block h-10 w-28 animate-pulse rounded-full bg-white/10" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-forest-800 transition-colors hover:bg-gold-100"
      >
        <LogIn aria-hidden className="h-4 w-4" />
        {t("signIn")}
      </Link>
    );
  }

  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("account")}: ${name}`}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/25 py-1 pl-1 pr-3 text-white transition-colors hover:border-gold-300"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gold-500 font-bold text-forest-950">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <ChevronDown aria-hidden className="h-4 w-4" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-paper-3 bg-white py-2 text-ink shadow-lift"
        >
          <p className="flex items-center gap-2 px-4 pb-2 pt-1 text-xs text-ink-muted">
            <span className="truncate">{name}</span>
            {isAdmin ? (
              <span className="shrink-0 rounded-full bg-gold-100 px-2 py-0.5 font-semibold text-gold-800">{t("admin")}</span>
            ) : null}
          </p>
          <Link role="menuitem" href="/practice" className="block px-4 py-2 text-sm hover:bg-paper" onClick={() => setOpen(false)}>
            {t("practice")}
          </Link>
          <Link role="menuitem" href="/progress" className="block px-4 py-2 text-sm hover:bg-paper" onClick={() => setOpen(false)}>
            {t("progress")}
          </Link>
          {isAdmin ? (
            <Link role="menuitem" href="/admin" className="block px-4 py-2 text-sm hover:bg-paper" onClick={() => setOpen(false)}>
              {t("adminPanel")}
            </Link>
          ) : null}
          <form action="/auth/signout" method="post">
            <button role="menuitem" type="submit" className="block w-full px-4 py-2 text-left text-sm hover:bg-paper">
              {t("signOut")}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
