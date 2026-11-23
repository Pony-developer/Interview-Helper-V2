import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PathCard } from "@/components/paths/PathCard";
import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { toLocale } from "@/i18n/locale";
import { getPaths } from "@/lib/data/paths";
import { publicPageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/paths">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "paths" });
  return {
    title: t("title"),
    ...publicPageMetadata({ path: "/paths", locale, title: t("title"), description: t("description") }),
  };
}

export default async function PathsPage({ params }: PageProps<"/[locale]/paths">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "paths" });
  const paths = await getPaths(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
        <div className="mx-auto max-w-7xl space-y-10 px-5 py-16 sm:px-8">
          {paths.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-paper-3 p-8 text-ink-muted">{t("empty")}</p>
          ) : (
            paths.map((path) => (
              <PathCard
                key={path.slug}
                path={path}
                labels={{
                  route: t("route"),
                  destination: t("destination"),
                  open: t("open"),
                  stats: [
                    t("courseCount", { count: path.courseTitles.length }),
                    t("moduleCount", { count: path.modules }),
                    t("lessonCount", { count: path.lessons }),
                  ],
                }}
              />
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
