import { getTranslations } from "next-intl/server";
import { PillLink } from "@/components/ui/PillLink";
import { LectureCard } from "@/components/lectures/LectureCard";
import { getLectures } from "@/lib/data/lectures";

export async function LatestLectures({ locale }: { locale: string }) {
  const t = await getTranslations("landing.lectures");
  const lectures = (await getLectures(locale)).slice(0, 4);

  return (
    <section aria-labelledby="lectures-title" className="bg-paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="lectures-title" className="font-display text-3xl font-bold text-forest-700 sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">{t("intro")}</p>
          </div>
          <PillLink href="/lectures" variant="forest" className="self-start sm:self-auto">
            {t("all")}
          </PillLink>
        </div>
        {lectures.length ? (
          <ul className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {lectures.map((lecture) => (
              <li key={lecture.slug}>
                <LectureCard lecture={lecture} readLabel={t("read")} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-12 rounded-2xl border border-dashed border-paper-3 p-8 text-ink-muted">{t("empty")}</p>
        )}
      </div>
    </section>
  );
}
