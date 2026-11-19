import { toLocale } from "@/i18n/locale";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AssayMark, Logo } from "@/components/brand/Logo";
import { Link } from "@/i18n/navigation";
import { safeNextPath } from "@/lib/auth/safe-next";
import { localizedPath } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const ERROR_KEYS = ["provider", "missing_code", "exchange"] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("title"), robots: { index: false, follow: true } };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "auth" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const next = safeNextPath(typeof sp.next === "string" ? sp.next : null, localizedPath("/practice", locale));
  const errorKey = typeof sp.error === "string" ? ERROR_KEYS.find((k) => k === sp.error) : undefined;

  return (
    <main id="main" tabIndex={-1} className="grid min-h-screen focus:outline-none lg:grid-cols-[1.1fr_1fr]">
      <section className="grain relative hidden overflow-hidden bg-forest-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(40rem 30rem at 80% 20%, rgb(201 162 39 / 0.25), transparent 60%), radial-gradient(40rem 40rem at 0% 100%, rgb(17 112 79 / 0.7), transparent 60%)",
          }}
        />
        <Link href="/" className="relative z-[2] w-fit rounded-lg">
          <Logo />
        </Link>
        <div className="relative z-[2]">
          <AssayMark className="mb-10 h-28 w-28 animate-[node-pulse_4s_ease-in-out_infinite]" />
          <p className="max-w-md font-display text-4xl font-extrabold leading-tight">{tc("brandTagline")}</p>
        </div>
        <p className="relative z-[2] text-sm text-forest-200">assay · 24K · 22K · 18K · 14K · 10K</p>
      </section>

      <section className="on-light flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-12 inline-block rounded-lg lg:hidden">
            <Logo tone="dark" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-forest-700">{t("title")}</h1>
          <p className="mt-4 leading-relaxed text-ink-muted">{t("subtitle")}</p>
          {errorKey ? (
            <p role="alert" className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
              {t(`errors.${errorKey}`)}
            </p>
          ) : null}
          <div className="mt-8">
            <GoogleSignInButton next={next} configured={isSupabaseConfigured()} />
          </div>
          <p className="mt-8 text-sm leading-relaxed text-ink-soft">{t("terms")}</p>
        </div>
      </section>
    </main>
  );
}
