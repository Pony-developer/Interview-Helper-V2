import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { toLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import { getCourseOutline, getCourseProgress } from "@/lib/data/course-player";

/** Opens a course at the first slide the visitor hasn't finished (or the first slide). */
export default async function CourseEntryPage({ params }: PageProps<"/[locale]/courses/[course]">) {
  const { locale: raw, course } = await params;
  const locale = toLocale(raw);
  setRequestLocale(locale);

  const outline = await getCourseOutline(course, locale);
  if (!outline) notFound();

  const slides = outline.modules.flatMap((m) => m.slides);
  if (slides.length > 0) {
    const progress = await getCourseProgress(outline);
    const next = slides.find((s) => !progress.bySlide[s.id]?.completed) ?? slides[0];
    redirect({ href: `/courses/${outline.slug}/${next.slug}`, locale });
  }

  const t = await getTranslations({ locale, namespace: "course" });
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        <PageHero title={outline.title} intro={t("empty")} />
      </main>
      <SiteFooter />
    </>
  );
}
