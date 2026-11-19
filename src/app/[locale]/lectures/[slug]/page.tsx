import { toLocale } from "@/i18n/locale";
import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/content/Markdown";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PillLink } from "@/components/ui/PillLink";
import { Link } from "@/i18n/navigation";
import { getLecture, getLectures } from "@/lib/data/lectures";
import { alternatesFor, localizedPath, ogLocale } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const lectures = await getLectures(params.locale);
  return lectures.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/lectures/[slug]">): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const lecture = await getLecture(slug, locale);
  if (!lecture) return {};
  const path = `/lectures/${slug}`;
  return {
    title: lecture.title,
    description: lecture.summary,
    alternates: alternatesFor(path, locale),
    openGraph: {
      type: "article",
      title: lecture.title,
      description: lecture.summary,
      url: absoluteUrl(localizedPath(path, locale)),
      locale: ogLocale(locale),
      modifiedTime: lecture.updatedAt,
      section: lecture.skill.name,
    },
  };
}

export default async function LecturePage({ params }: PageProps<"/[locale]/lectures/[slug]">) {
  const { slug, locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);
  const lecture = await getLecture(slug, locale);
  if (!lecture) notFound();
  const t = await getTranslations({ locale, namespace: "lectures" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const url = absoluteUrl(localizedPath(`/lectures/${slug}`, locale));

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        <PageHero
          eyebrow={
            <nav aria-label={t("breadcrumb")}>
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/lectures" className="hover:text-white">
                    {nav("lectures")}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page">{lecture.skill.name}</li>
              </ol>
            </nav>
          }
          title={lecture.title}
          intro={lecture.summary}
        >
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-forest-200">
            <Clock aria-hidden className="h-4 w-4" />
            {t("readingTime", { count: lecture.readingMinutes })}
          </p>
        </PageHero>

        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,46rem)_1fr]">
          <article className="min-w-0">
            <Markdown>{lecture.body}</Markdown>
          </article>
          <aside className="lg:pt-2">
            <div className="sticky top-28 rounded-3xl border border-paper-3 bg-white p-7 shadow-card">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">{t("skill")}</p>
              <p className="mt-2 font-display text-2xl font-bold text-forest-700">{lecture.skill.name}</p>
              <div className="gold-rule my-5 w-16" />
              <PillLink href={`/practice?skills=${lecture.skill.slug}`} variant="forest">
                {t("practiseThis", { skill: lecture.skill.name })}
              </PillLink>
              <Link
                href="/lectures"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:underline"
              >
                <ArrowLeft aria-hidden className="h-4 w-4" />
                {t("backToLibrary")}
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": ["Article", "LearningResource"],
            headline: lecture.title,
            description: lecture.summary,
            inLanguage: locale,
            url,
            dateModified: lecture.updatedAt,
            timeRequired: `PT${lecture.readingMinutes}M`,
            learningResourceType: "Lecture",
            educationalLevel: "Professional",
            about: { "@type": "Thing", name: lecture.skill.name },
            publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: siteConfig.name, item: absoluteUrl(localizedPath("/", locale)) },
              { "@type": "ListItem", position: 2, name: nav("lectures"), item: absoluteUrl(localizedPath("/lectures", locale)) },
              { "@type": "ListItem", position: 3, name: lecture.title, item: url },
            ],
          },
        ]}
      />
    </>
  );
}
