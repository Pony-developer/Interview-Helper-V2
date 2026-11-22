import { toLocale } from "@/i18n/locale";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CourseCard } from "@/components/courses/CourseCard";
import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getCourses } from "@/lib/data/courses";
import { publicPageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]/courses">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "courses" });
  return {
    title: t("title"),
    ...publicPageMetadata({ path: "/courses", locale, title: t("title"), description: t("description") }),
  };
}

export default async function CoursesPage({ params }: PageProps<"/[locale]/courses">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "courses" });
  const courses = await getCourses(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        <PageHero title={t("title")} intro={t("intro")} />
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-10">
          {courses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-paper-3 p-8 text-ink-muted lg:col-span-2">{t("empty")}</p>
          ) : (
            courses.map((course, index) => (
              <CourseCard
                key={course.slug}
                course={course}
                index={index}
                dark={index % 2 === 0}
                topicsLabel={t("topics")}
                topicCount={t("topicCount", { count: course.topics.length })}
                openLabel={t("open")}
              />
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
