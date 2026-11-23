import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PillLink } from "@/components/ui/PillLink";
import { toLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { getPath, pathSlugs, type PathStage } from "@/lib/data/paths";
import { publicPageMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return pathSlugs().map((path) => ({ path }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/paths/[path]">): Promise<Metadata> {
  const { path: slug, locale: raw } = await params;
  const locale = toLocale(raw);
  const path = await getPath(slug, locale);
  if (!path) return {};
  return {
    title: path.title,
    ...publicPageMetadata({ path: `/paths/${slug}`, locale, title: path.title, description: path.summary }),
  };
}

/** Modules shown before the rest fold into a disclosure. */
const VISIBLE_MODULES = 6;

export default async function PathPage({ params }: PageProps<"/[locale]/paths/[path]">) {
  const { path: slug, locale: raw } = await params;
  const locale = toLocale(raw);
  setRequestLocale(locale);
  const path = await getPath(slug, locale);
  if (!path) notFound();

  const t = await getTranslations({ locale, namespace: "path" });
  const tp = await getTranslations({ locale, namespace: "paths" });
  const totals = {
    modules: path.stages.reduce((n, s) => n + s.modules.length, 0),
    lessons: path.stages.reduce((n, s) => n + s.lessons, 0),
    practice: path.stages.reduce((n, s) => n + s.practice, 0),
  };
  const practiceHref = `/practice?skills=${path.practiceSkills.join(",")}`;
  const first = path.stages[0];

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        <PageHero eyebrow={t("eyebrow")} title={path.title} intro={path.summary}>
          <ul className="mt-9 flex animate-rise flex-wrap gap-x-8 gap-y-3 font-mono text-sm uppercase tracking-[0.12em] text-forest-200 [animation-delay:160ms]">
            <li>{tp("courseCount", { count: path.stages.length })}</li>
            <li>{tp("moduleCount", { count: totals.modules })}</li>
            <li>{tp("lessonCount", { count: totals.lessons })}</li>
            <li>{tp("practiceCount", { count: totals.practice })}</li>
          </ul>
          <div className="mt-10 flex animate-rise flex-wrap items-center gap-4 [animation-delay:220ms]">
            {first ? <PillLink href={`/courses/${first.course.slug}`}>{t("start")}</PillLink> : null}
            <Link
              href="/paths"
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-forest-100 hover:text-white"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              {t("allPaths")}
            </Link>
          </div>
        </PageHero>

        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-20 lg:py-24">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">{t("outcomes")}</h2>
            <div className="gold-rule mt-4 w-16" />
            <ul className="mt-6 space-y-5">
              {path.outcomes.map((o) => (
                <li key={o} className="flex gap-4 leading-relaxed text-ink-muted">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-forest-700 text-white">
                    <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {o}
                </li>
              ))}
            </ul>
          </aside>

          <section aria-labelledby="route-title">
            <h2 id="route-title" className="font-display text-3xl font-extrabold text-forest-700 sm:text-4xl">
              {t("route")}
            </h2>

            {path.stages.length === 0 ? (
              <p className="mt-8 rounded-2xl border border-dashed border-paper-3 p-8 text-ink-muted">{t("stagesMissing")}</p>
            ) : (
              <ol className="relative mt-10">
                {path.stages.map((stage, i) => (
                  <Stage key={stage.course.slug} stage={stage} index={i} t={t} tp={tp} />
                ))}
                <li
                  className="relative animate-rise pl-14 sm:pl-24"
                  style={{ animationDelay: `${200 + path.stages.length * 140}ms` }}
                >
                  <span aria-hidden className="absolute left-0 top-8 grid h-11 w-11 place-items-center sm:h-14 sm:w-14">
                    <span className="h-6 w-6 rotate-45 bg-gold-500 shadow-[0_0_0_6px_var(--color-paper),0_0_0_8px_rgb(201_162_39/0.35),0_0_32px_rgb(201_162_39/0.6)] sm:h-7 sm:w-7" />
                  </span>
                  <div
                    className="grain relative overflow-hidden rounded-3xl bg-forest-900 p-6 text-white shadow-lift sm:p-10"
                    style={{
                      backgroundImage:
                        "radial-gradient(26rem 14rem at 100% 0%, rgb(201 162 39 / 0.25), transparent 60%), radial-gradient(20rem 20rem at 0% 120%, rgb(17 112 79 / 0.55), transparent 60%)",
                    }}
                  >
                    <div className="relative z-[2]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">{t("destination")}</p>
                      <h3 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{path.title}</h3>
                      <p className="mt-4 max-w-xl text-lg leading-relaxed text-forest-100">{t("destinationBody")}</p>
                      <PillLink href={practiceHref} className="mt-8">
                        {t("practise")}
                      </PillLink>
                    </div>
                  </div>
                </li>
              </ol>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

type T = Awaited<ReturnType<typeof getTranslations<"path">>>;
type TP = Awaited<ReturnType<typeof getTranslations<"paths">>>;

function Stage({ stage, index, t, tp }: { stage: PathStage; index: number; t: T; tp: TP }) {
  const number = String(index + 1).padStart(2, "0");
  const visible = stage.modules.slice(0, VISIBLE_MODULES);
  const rest = stage.modules.slice(VISIBLE_MODULES);
  const href = `/courses/${stage.course.slug}`;

  return (
    <li
      id={`stage-${index + 1}`}
      className="relative animate-rise scroll-mt-28 pb-12 pl-14 sm:pb-16 sm:pl-24"
      style={{ animationDelay: `${200 + index * 140}ms` }}
    >
      {/* Vein segment from this stage's node down to the next node (every stage is followed by one). */}
      <span
        aria-hidden
        className="route-vein absolute -bottom-12 left-[1.3125rem] top-12 w-0.5 bg-gradient-to-b from-gold-500 via-forest-600/70 to-gold-500 sm:-bottom-14 sm:left-[1.6875rem] sm:top-14"
        style={{ animationDelay: `${400 + index * 300}ms` }}
      />
      <span
        aria-hidden
        className="absolute left-0 top-8 grid h-11 w-11 place-items-center rounded-full bg-forest-900 font-mono text-sm font-semibold text-gold-300 ring-[6px] ring-paper sm:h-14 sm:w-14 sm:text-base"
      >
        {number}
      </span>

      <article className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-card ring-1 ring-paper-3 transition-shadow duration-300 hover:shadow-lift sm:p-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-4 font-display text-[9rem] font-extrabold leading-none text-forest-700/[0.05]"
        >
          {number}
        </span>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">{t("stage", { number })}</p>
          <h3 className="mt-3 font-display text-3xl font-extrabold leading-tight text-forest-700 sm:text-4xl">
            <Link href={href} className="rounded-lg hover:underline hover:decoration-gold-500 hover:decoration-2 hover:underline-offset-8">
              {stage.course.title}
            </Link>
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">{stage.course.summary}</p>

          <div className="mt-8 rounded-2xl border-l-[3px] border-gold-500 bg-gold-100/50 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-800">{t("why")}</p>
            <p className="mt-2 leading-relaxed text-ink">{stage.why}</p>
          </div>

          {stage.modules.length > 0 ? (
            <>
              <h4 className="mt-9 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">{t("modules")}</h4>
              <ModuleList modules={visible} start={0} />
              {rest.length > 0 ? (
                <details className="group/more">
                  <summary className="mt-1 inline-flex cursor-pointer list-none items-center gap-2 rounded-full px-1 py-2 text-sm font-semibold text-forest-700 hover:text-forest-900 [&::-webkit-details-marker]:hidden">
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-forest-700/30 font-mono text-xs transition-transform group-open/more:rotate-45">
                      +
                    </span>
                    {t("moreModules", { count: rest.length })}
                  </summary>
                  <ModuleList modules={rest} start={VISIBLE_MODULES} />
                </details>
              ) : null}
            </>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-paper-3 pt-6">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
              {tp("moduleCount", { count: stage.modules.length })} · {tp("lessonCount", { count: stage.lessons })} ·{" "}
              {tp("practiceCount", { count: stage.practice })}
            </p>
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-800"
            >
              {t("openCourse")}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </article>
    </li>
  );
}

function ModuleList({ modules, start }: { modules: PathStage["modules"]; start: number }) {
  return (
    <ol className="mt-3 grid list-none gap-x-8 sm:grid-cols-2">
      {modules.map((m, i) => (
        <li key={m.slug} className="flex items-baseline gap-4 border-t border-paper-3 py-3">
          <span className="font-mono text-sm tabular-nums text-forest-700">{String(start + i + 1).padStart(2, "0")}</span>
          <span className="leading-snug text-ink">{m.title}</span>
        </li>
      ))}
    </ol>
  );
}
