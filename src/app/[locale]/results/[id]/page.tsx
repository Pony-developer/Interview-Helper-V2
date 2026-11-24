import { BookOpen, Check, CircleSlash, Clock, HelpCircle, X } from "lucide-react";
import { isOutputPractice } from "@/lib/playground/frameworks";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Markdown } from "@/components/content/Markdown";
import { formatDuration } from "@/lib/format";
import { GradeMedal } from "@/components/results/GradeMedal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PillLink } from "@/components/ui/PillLink";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/locale";
import { loadInterview } from "@/lib/data/interview";
import { highlight } from "@/lib/highlight";
import { loc } from "@/lib/i18n/localized";
import { localizedPath, privatePageMetadata } from "@/lib/seo";
import { complexityWeight } from "@/lib/selection/select";
import { createClient } from "@/lib/supabase/server";

const GRADES = ["24K", "22K", "18K", "14K", "10K", "ORE"] as const;
type Grade = (typeof GRADES)[number];

/** Per-user page: always rendered at request time. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/results/[id]">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "results" });
  return { title: t("metaTitle"), ...privatePageMetadata };
}

async function CodeView({ files, lang }: { files: Record<string, string>; lang: string }) {
  const entries = Object.entries(files);
  return (
    <div className="space-y-3">
      {await Promise.all(
        entries.map(async ([path, code]) => (
          <figure key={path}>
            <figcaption className="mb-1 font-mono text-xs text-ink-soft">{path}</figcaption>
            <div className="code-block text-sm" dangerouslySetInnerHTML={{ __html: await highlight(code, lang) }} />
          </figure>
        )),
      )}
    </div>
  );
}

export default async function ResultsPage({ params }: PageProps<"/[locale]/results/[id]">) {
  const { id, locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "results" });
  const ti = await getTranslations({ locale, namespace: "interview" });

  const data = await loadInterview(id, locale);
  if (!data) notFound();
  if (data.interview.status !== "completed") redirect(localizedPath(`/interview/${id}`, locale));

  const supabase = await createClient();
  const { data: review } = await supabase.rpc("get_interview_review", { p_interview_id: id });
  const reviewByItem = new Map((review ?? []).map((r) => [r.item_id, r]));

  const grade = (GRADES as readonly string[]).includes(data.interview.grade ?? "") ? (data.interview.grade as Grade) : "ORE";
  const score = Math.round(data.interview.score ?? 0);
  const correct = data.items.filter((i) => reviewByItem.get(i.id)?.is_correct).length;
  const spent = data.items.reduce((s, i) => s + (reviewByItem.get(i.id)?.time_spent_seconds ?? 0), 0);

  // Per-skill score (complexity-weighted), weakest first.
  const bySkill = new Map<string, { slug: string; name: string; num: number; den: number }>();
  for (const item of data.items) {
    const r = reviewByItem.get(item.id);
    const w = complexityWeight(item.task.complexity);
    for (const s of item.task.skills) {
      if (!data.interview.focus_skill_ids.includes(s.id) && item.task.skills.length > 1) continue;
      const acc = bySkill.get(s.id) ?? { slug: s.slug, name: s.name, num: 0, den: 0 };
      acc.num += (r?.score ?? 0) * w;
      acc.den += w;
      bySkill.set(s.id, acc);
    }
  }
  const skillRows = [...bySkill.values()]
    .map((s) => ({ ...s, pct: Math.round((100 * s.num) / Math.max(s.den, 1e-9)) }))
    .sort((a, b) => a.pct - b.pct);
  const weak = skillRows.filter((s) => s.pct < 75).slice(0, 4).map((s) => s.slug);

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        {/* Summary band */}
        <section className="grain relative overflow-hidden bg-forest-900 text-white">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(40rem 26rem at 20% 40%, rgb(201 162 39 / 0.28), transparent 60%)" }}
          />
          <div className="relative z-[2] mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 md:grid-cols-[auto_1fr]">
            <div className="animate-rise justify-self-center">
              <GradeMedal grade={grade} label={`${t("grade")}: ${t(`gradeNames.${grade}`)}`} />
            </div>
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
                <span aria-hidden className="h-px w-10 bg-gold-500" />
                {t("eyebrow")}
              </p>
              <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">{t(`signals.${grade}`)}</h1>
              <p className="mt-3 text-lg text-forest-100">{t("title")}</p>
              <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
                {[
                  [t("score"), `${score}%`],
                  [t("grade"), t(`gradeNames.${grade}`)],
                  [t("tasks"), t("correctCount", { correct, total: data.items.length })],
                  [t("time"), formatDuration(spent)],
                ].map(([k, v], i) => (
                  <div key={k} className={i ? "sm:border-l sm:border-gold-500/40 sm:pl-6" : ""}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-200">{k}</dt>
                    <dd className="mt-1 font-display text-xl font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                {weak.length ? (
                  <PillLink href={`/practice?skills=${weak.join(",")}`} variant="gold">
                    {t("trainWeak")}
                  </PillLink>
                ) : null}
                <PillLink href="/practice" variant="outline-light">
                  {t("newInterview")}
                </PillLink>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[20rem_1fr]">
          {/* Per-skill */}
          <section aria-labelledby="by-skill" className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="by-skill" className="font-display text-xl font-bold text-forest-700">
              {t("bySkill")}
            </h2>
            <ul className="mt-5 space-y-4">
              {skillRows.map((s) => (
                <li key={s.slug}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink">{s.name}</span>
                    <span className="tabular-nums text-ink-muted">{s.pct}%</span>
                  </div>
                  <div
                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-3"
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={s.pct}
                    aria-label={s.name}
                  >
                    <div
                      className={`h-full rounded-full ${s.pct >= 75 ? "bg-forest-600" : s.pct >= 50 ? "bg-gold-500" : "bg-danger"}`}
                      style={{ width: `${Math.max(3, s.pct)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Review */}
          <section aria-labelledby="review-title">
            <h2 id="review-title" className="font-display text-xl font-bold text-forest-700">
              {t("review")}
            </h2>
            <ol className="mt-5 space-y-4">
              {await Promise.all(
                data.items.map(async (item, i) => {
                  const r = reviewByItem.get(item.id);
                  const task = item.task;
                  const skipped = r?.status === "skipped";
                  const status = skipped ? "skipped" : r?.is_correct ? "correct" : (r?.score ?? 0) > 0 ? "partial" : "incorrect";
                  const answer = (r?.answer ?? null) as { selected?: string[]; files?: Record<string, string> } | null;
                  const explanation = loc(r?.explanation ?? null, locale);
                  const p = task.practice;
                  const lang = isOutputPractice(p)
                    ? p.language === "sql" ? "sql" : "csharp"
                    : p?.framework === "vanilla-js" ? "js" : p?.framework === "react-ts" ? "tsx" : "ts";
                  return (
                    <li key={item.id}>
                      <details className="group rounded-2xl border border-paper-3 bg-white shadow-card open:shadow-lift" open={status !== "correct"}>
                        <summary className="flex cursor-pointer list-none items-center gap-4 rounded-2xl p-5 [&::-webkit-details-marker]:hidden">
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                              status === "correct"
                                ? "bg-success-soft text-success"
                                : status === "partial"
                                  ? "bg-warning-soft text-warning"
                                  : status === "skipped"
                                    ? "bg-paper-2 text-ink-muted"
                                    : "bg-danger-soft text-danger"
                            }`}
                          >
                            {status === "correct" ? (
                              <Check aria-hidden className="h-5 w-5" />
                            ) : status === "skipped" ? (
                              <CircleSlash aria-hidden className="h-5 w-5" />
                            ) : status === "partial" ? (
                              <HelpCircle aria-hidden className="h-5 w-5" />
                            ) : (
                              <X aria-hidden className="h-5 w-5" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                              {i + 1}. {ti(task.kind)} · {task.skills.map((s) => s.name).join(", ")}
                            </span>
                            <span className="mt-0.5 block font-semibold text-ink">{task.title}</span>
                          </span>
                          <span className="hidden shrink-0 text-right text-sm sm:block">
                            <span className="block font-semibold text-ink">{t(status)}</span>
                            <span className="block text-ink-soft">{t("points", { value: Math.round((r?.score ?? 0) * 100) })}</span>
                          </span>
                        </summary>

                        <div className="space-y-6 border-t border-paper-3 p-5">
                          <Markdown>{task.prompt}</Markdown>
                          {task.quiz?.code ? (
                            <div className="code-block text-sm" dangerouslySetInnerHTML={{ __html: await highlight(task.quiz.code, task.quiz.codeLanguage ?? "ts") }} />
                          ) : null}

                          {task.quiz ? (
                            <ul className="space-y-2">
                              {task.quiz.options.map((o) => {
                                const picked = answer?.selected?.includes(o.id) ?? false;
                                const isRight = r?.correct_option_ids?.includes(o.id) ?? false;
                                return (
                                  <li
                                    key={o.id}
                                    className={`rounded-xl border p-3 ${
                                      isRight ? "border-success bg-success-soft" : picked ? "border-danger bg-danger-soft" : "border-paper-3"
                                    }`}
                                  >
                                    <Markdown className="prose-assay text-[0.95rem] [&>*+*]:mt-2">{loc(o.text, locale)}</Markdown>
                                    {picked || isRight ? (
                                      <p className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                                        {picked ? <span className="rounded-full bg-white px-2 py-0.5 text-ink">{t("yourAnswer")}</span> : null}
                                        {isRight ? <span className="rounded-full bg-success px-2 py-0.5 text-white">{t("correctAnswer")}</span> : null}
                                      </p>
                                    ) : null}
                                  </li>
                                );
                              })}
                              {!answer?.selected?.length ? <li className="text-sm text-ink-muted">{skipped ? t("skipped") : t("noAnswer")}</li> : null}
                            </ul>
                          ) : null}

                          {task.practice ? (
                            <div className="space-y-4">
                              <p className="text-sm font-semibold text-ink">
                                {r?.tests_total != null
                                  ? t("testsPassed", { passed: r.tests_passed ?? 0, total: r.tests_total })
                                  : skipped
                                    ? t("skipped")
                                    : t("noAnswer")}
                              </p>
                              <div className="grid gap-6 xl:grid-cols-2">
                                <div>
                                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">{t("yourCode")}</h3>
                                  {answer?.files ? <CodeView files={answer.files} lang={lang} /> : <p className="text-sm text-ink-muted">{t("noAnswer")}</p>}
                                </div>
                                <div>
                                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">{t("referenceSolution")}</h3>
                                  {r?.solution_files ? <CodeView files={r.solution_files as Record<string, string>} lang={lang} /> : null}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {explanation ? (
                            <div className="rounded-xl border-l-4 border-gold-500 bg-gold-100/50 p-4">
                              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gold-800">{t("explanation")}</h3>
                              <Markdown className="prose-assay mt-2 text-[0.98rem]">{explanation}</Markdown>
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
                            {r?.help_used ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 font-medium text-gold-800">
                                <BookOpen aria-hidden className="h-4 w-4" />
                                {t("helpUsed")}
                              </span>
                            ) : null}
                            <span className="inline-flex items-center gap-1.5">
                              <Clock aria-hidden className="h-4 w-4" />
                              {formatDuration(r?.time_spent_seconds ?? 0)}
                            </span>
                            {task.lectureSlug ? (
                              <Link href={`/lectures/${task.lectureSlug}`} className="font-semibold text-forest-700 underline decoration-gold-500 decoration-2 underline-offset-4">
                                {t("readLecture")}
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </details>
                    </li>
                  );
                }),
              )}
            </ol>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
