import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Markdown } from "@/components/content/Markdown";
import { AdminSlideBar } from "@/components/courses/player/AdminSlideBar";
import { KindIcon } from "@/components/courses/player/kind-icon";
import { MarkViewed } from "@/components/courses/player/MarkViewed";
import { PracticeSlide } from "@/components/courses/player/PracticeSlide";
import { QuizSlide } from "@/components/courses/player/QuizSlide";
import { toLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { getCourseOutline, getCourseProgress, getCourseSlide } from "@/lib/data/course-player";
import { isAdmin } from "@/lib/auth/roles";
import { localizedPath } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Params = PageProps<"/[locale]/courses/[course]/[slide]">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, course, slide } = await params;
  const locale = toLocale(raw);
  const outline = await getCourseOutline(course, locale);
  const s = outline?.modules.flatMap((m) => m.slides).find((x) => x.slug === slide);
  if (!outline || !s) return {};
  return { title: `${s.title} · ${outline.title}` };
}

export default async function CourseSlidePage({ params }: Params) {
  const { locale: raw, course, slide: slideSlug } = await params;
  const locale = toLocale(raw);
  setRequestLocale(locale);

  const outline = await getCourseOutline(course, locale);
  if (!outline) notFound();
  const [slide, progress, t] = await Promise.all([
    getCourseSlide(outline, slideSlug, locale),
    getCourseProgress(outline),
    getTranslations({ locale, namespace: "course" }),
  ]);
  if (!slide) notFound();

  const all = outline.modules.flatMap((m) => m.slides);
  const index = all.findIndex((s) => s.slug === slide.slug);
  const prev = all[index - 1];
  const next = all[index + 1];
  const mod = outline.modules.find((m) => m.slug === slide.moduleSlug)!;
  const mine = progress.bySlide[slide.id];

  // Anonymous visitors can read and take quizzes; saving progress and running code needs an account.
  const accounts = isSupabaseConfigured();
  const admin = accounts && progress.signedIn ? await isAdmin() : false;
  const afterDelete = next ?? prev;
  const signInNote =
    accounts && !progress.signedIn ? (
      <span className="text-sm text-forest-100">
        {t("signInToSave")}{" "}
        <Link
          href={{ pathname: "/login", query: { next: localizedPath(`/courses/${outline.slug}/${slide.slug}`, locale) } }}
          className="font-semibold text-gold-300 underline decoration-gold-500/60 underline-offset-4 hover:text-gold-100"
        >
          {t("signIn")}
        </Link>
      </span>
    ) : null;

  // Header, sidebar and <main> come from the (player) layout; this page is only the slide area.
  return (
    <div className="relative overflow-hidden">
      {/* Faint assay grid behind the heading. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-paper-3) 1px, transparent 1px), linear-gradient(90deg, var(--color-paper-3) 1px, transparent 1px)",
          backgroundSize: "2.5rem 2.5rem",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        {admin ? (
          <AdminSlideBar
            course={outline.slug}
            slideId={slide.id}
            slideSlug={slide.slug}
            afterDeleteHref={afterDelete ? `/courses/${outline.slug}/${afterDelete.slug}` : `/admin/courses/${outline.slug}`}
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-700 px-3 py-1 font-semibold text-gold-300">
            <KindIcon kind={slide.kind} className="h-3.5 w-3.5" />
            {t(`kinds.${slide.kind}`)}
          </span>
          <span className="font-semibold text-forest-700">{mod.title}</span>
          <span aria-hidden className="text-ink-soft">
            ·
          </span>
          <span className="font-mono text-xs tabular-nums text-ink-soft">{t("slideOf", { current: index + 1, total: all.length })}</span>
          {slide.maxScore > 0 ? (
            <span className="ml-auto inline-flex items-center gap-2 font-mono text-xs tabular-nums text-ink-muted">
              {t("maxScore", { count: slide.maxScore })}
              {mine ? (
                <span className="rounded-full bg-gold-100 px-2.5 py-0.5 font-bold text-gold-800">
                  {mine.score}/{slide.maxScore}
                </span>
              ) : null}
            </span>
          ) : mine?.completed ? (
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-success">
              <Check aria-hidden className="h-3.5 w-3.5" />
              {t("read")}
            </span>
          ) : null}
        </div>

        <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] text-forest-700 sm:text-5xl">{slide.title}</h1>
        <div className="gold-rule mt-6 w-24" />

        <div className="mt-10 space-y-8">
          {slide.body ? (
            <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-paper-3 sm:p-10">
              <Markdown>{slide.body}</Markdown>
            </article>
          ) : null}

          {slide.kind === "lecture" && progress.signedIn && !mine?.completed ? <MarkViewed slideId={slide.id} /> : null}

          {slide.kind === "quiz" && slide.questions ? (
            <QuizSlide
              slideId={slide.id}
              signedIn={progress.signedIn}
              signInNote={signInNote}
              questions={slide.questions.map((q) => ({
                id: q.id,
                mode: q.mode,
                prompt: <Markdown>{q.prompt}</Markdown>,
                options: q.options.map((o) => ({ id: o.id, content: <Markdown>{o.text}</Markdown> })),
              }))}
            />
          ) : null}

          {slide.kind === "practice" && slide.practice ? (
            <PracticeSlide
              key={slide.id}
              slideId={slide.id}
              language={slide.practice.language}
              setup={slide.practice.setup}
              starter={slide.practice.starter}
              savedCode={mine?.lastCode ?? null}
              maxScore={slide.maxScore}
              canRun={!accounts || progress.signedIn}
              signInNote={signInNote}
            />
          ) : null}
        </div>

        <nav aria-label={t("pager")} className="mt-14 flex items-center justify-between gap-4 border-t border-paper-3 pt-8">
          {prev ? (
            <Link
              href={`/courses/${outline.slug}/${prev.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-paper-3 bg-white px-6 py-3 font-semibold text-forest-700 shadow-card transition hover:border-forest-600"
            >
              <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              {t("prev")}
            </Link>
          ) : (
            <span />
          )}
          <Link
            href={next ? `/courses/${outline.slug}/${next.slug}` : "/courses"}
            className="group inline-flex items-center gap-3 rounded-full bg-forest-700 py-3 pl-7 pr-3 font-semibold text-white shadow-lift transition hover:bg-forest-600"
          >
            <span className="flex flex-col items-end leading-tight">
              <span>{next ? t("next") : t("finish")}</span>
              {next ? (
                <span className="hidden max-w-[14rem] truncate text-xs font-normal text-forest-100 sm:block">{next.title}</span>
              ) : null}
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-forest-950 transition-transform group-hover:translate-x-0.5">
              <ArrowRight aria-hidden className="h-4 w-4" />
            </span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
