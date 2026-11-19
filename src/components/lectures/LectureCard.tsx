import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { LectureSummary } from "@/lib/data/lectures";

/** News-card pattern from the reference: meta line, title link, arrow "read more", gold rule. */
export async function LectureCard({ lecture, readLabel }: { lecture: LectureSummary; readLabel: string }) {
  const t = await getTranslations("lectures");
  return (
    <article className="group relative flex h-full flex-col">
      <p className="text-sm text-ink-soft">
        <span className="font-semibold text-forest-700">{lecture.skill.name}</span>
        <span aria-hidden> · </span>
        {t("readingTime", { count: lecture.readingMinutes })}
      </p>
      <h3 className="mt-3 font-display text-xl font-bold leading-snug text-forest-700">
        <Link
          href={`/lectures/${lecture.slug}`}
          className="after:absolute after:inset-0 after:content-[''] hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-4"
        >
          {lecture.title}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 leading-relaxed text-ink-muted">{lecture.summary}</p>
      <p aria-hidden className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold uppercase tracking-[0.08em] text-forest-700">
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        {readLabel}
      </p>
      <div className="gold-rule mt-3 w-2/3 transition-[width] duration-300 group-hover:w-full" />
    </article>
  );
}
