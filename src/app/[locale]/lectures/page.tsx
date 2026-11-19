import { toLocale } from "@/i18n/locale";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LectureCard } from "@/components/lectures/LectureCard";
import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getLectures } from "@/lib/data/lectures";
import { alternatesFor, localizedPath, ogLocale } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/lectures">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "lectures" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/lectures", locale),
    openGraph: { title: t("title"), description: t("description"), url: absoluteUrl(localizedPath("/lectures", locale)), locale: ogLocale(locale) },
  };
}

export default async function LecturesPage({ params }: PageProps<"/[locale]/lectures">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "lectures" });
  const tl = await getTranslations({ locale, namespace: "landing.lectures" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const lectures = await getLectures(locale);

  const byCategory = new Map<string, typeof lectures>();
  for (const l of lectures) {
    const list = byCategory.get(l.skill.category) ?? [];
    list.push(l);
    byCategory.set(l.skill.category, list);
  }

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        <PageHero title={t("title")} intro={t("intro")} />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          {lectures.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-paper-3 p-8 text-ink-muted">{t("empty")}</p>
          ) : (
            [...byCategory.entries()]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, list]) => (
                <section key={category} aria-labelledby={`cat-${category}`} className="mb-16 last:mb-0">
                  <h2 id={`cat-${category}`} className="font-display text-2xl font-bold text-forest-700">
                    {tc.has(category as never) ? tc(category as never) : category}
                  </h2>
                  <div className="gold-rule mt-3 w-20" />
                  <ul className="mt-8 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((lecture) => (
                      <li key={lecture.slug}>
                        <LectureCard lecture={lecture} readLabel={tl("read")} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
