import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnalyzingView } from "@/components/analyzing/AnalyzingView";
import { Logo } from "@/components/brand/Logo";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/locale";
import { skillDef } from "@/lib/content/schema";
import { privatePageMetadata } from "@/lib/seo";
import { skills as rawSkills } from "@content/skills";

export async function generateMetadata({ params }: PageProps<"/[locale]/practice/analyzing">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "analyzing" });
  return { title: t("metaTitle"), ...privatePageMetadata };
}

export default async function AnalyzingPage({ params }: PageProps<"/[locale]/practice/analyzing">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const catalog = rawSkills.map((s) => skillDef.parse(s));

  return (
    <div className="grain relative flex min-h-screen flex-col overflow-hidden bg-forest-950">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(50rem 30rem at 30% 60%, rgb(201 162 39 / 0.16), transparent 60%), radial-gradient(40rem 40rem at 100% 0%, rgb(17 112 79 / 0.5), transparent 60%)",
        }}
      />
      <header className="relative z-[2] mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8">
        <Link href="/" className="inline-block rounded-lg">
          <Logo />
        </Link>
      </header>
      <main id="main" tabIndex={-1} className="relative z-[2] flex-1 focus:outline-none">
        <AnalyzingView catalog={catalog} />
      </main>
    </div>
  );
}
