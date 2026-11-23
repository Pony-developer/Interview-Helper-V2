import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { CourseSidebar } from "@/components/courses/player/CourseSidebar";
import { MobileContents } from "@/components/courses/player/MobileContents";
import { SlideFrame } from "@/components/courses/player/SlideFrame";
import { SiteHeader } from "@/components/site/SiteHeader";
import { toLocale } from "@/i18n/locale";
import { CERTIFICATE_THRESHOLD } from "@/lib/data/certificates";
import { coursePercent, getCourseOutline, getCourseProgress } from "@/lib/data/course-player";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Props = { children: ReactNode; params: Promise<{ locale: string; course: string }> };

/**
 * The course player's frame: header and contents sidebar stay mounted while moving between slides,
 * so only the slide area (the `[slide]` segment, with its own loading and error states) is swapped.
 */
export default async function CoursePlayerLayout({ children, params }: Props) {
  const { locale: raw, course } = await params;
  const locale = toLocale(raw);
  setRequestLocale(locale);

  const outline = await getCourseOutline(course, locale);
  if (!outline) notFound();
  const progress = await getCourseProgress(outline);

  const accounts = isSupabaseConfigured();
  const certificate = accounts
    ? {
        courseId: outline.id,
        percent: coursePercent(outline, progress.bySlide),
        certificateId: progress.certificateId,
        signedIn: progress.signedIn,
        threshold: CERTIFICATE_THRESHOLD,
      }
    : null;
  const sidebar = <CourseSidebar outline={outline} progress={progress.bySlide} certificate={certificate} />;
  const all = outline.modules.flatMap((m) => m.slides);
  const done = all.filter((s) => progress.bySlide[s.id]?.completed).length;

  return (
    <>
      <SiteHeader />
      <div className="lg:grid lg:grid-cols-[minmax(19rem,23rem)_1fr]">
        <aside className="sticky top-[4.5rem] hidden h-[calc(100dvh-4.5rem)] overflow-y-auto border-r border-paper-3 bg-paper-2 lg:block">
          {sidebar}
        </aside>

        <main id="main" tabIndex={-1} className="on-light min-w-0 focus:outline-none">
          {/* Small screens: the contents fold away above the slide. */}
          <MobileContents done={done} total={all.length}>
            {sidebar}
          </MobileContents>
          <SlideFrame>{children}</SlideFrame>
        </main>
      </div>
    </>
  );
}
