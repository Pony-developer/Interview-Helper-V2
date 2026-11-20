import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PracticeForm } from "@/components/practice/PracticeForm";
import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { toLocale } from "@/i18n/locale";
import { getSkillCatalog, getSkillsWithContent } from "@/lib/data/catalog";
import type { Method } from "@/lib/pipeline/request-store";
import { privatePageMetadata } from "@/lib/seo";

const METHODS: Method[] = ["manual", "url", "llm_url", "llm_text"];

/** Per-user page: always rendered at request time. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/practice">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "practice" });
  return { title: t("metaTitle"), ...privatePageMetadata };
}

export default async function PracticePage({ params, searchParams }: PageProps<"/[locale]/practice">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "practice" });

  const catalog = await getSkillCatalog();
  const known = new Set(catalog.map((s) => s.slug));
  const initialSkills = (typeof sp.skills === "string" ? sp.skills.split(",") : [])
    .map((s) => s.trim())
    .filter((s) => known.has(s))
    .slice(0, 12);
  const initialMethod = METHODS.includes(sp.method as Method) ? (sp.method as Method) : "manual";
  const withContent = await getSkillsWithContent();

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <PracticeForm
            catalog={catalog}
            withContent={withContent}
            initialSkills={initialSkills}
            initialMethod={initialMethod}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
