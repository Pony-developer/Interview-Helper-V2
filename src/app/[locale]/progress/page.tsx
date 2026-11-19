import { Check, Minus, X } from "lucide-react";
import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PillLink } from "@/components/ui/PillLink";
import { Link } from "@/i18n/navigation";
import { toLocale } from "@/i18n/locale";
import { loc } from "@/lib/i18n/localized";
import { privatePageMetadata } from "@/lib/seo";
import { computeMastery, type SelTask } from "@/lib/selection/select";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/** Per-user page: always rendered at request time. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/progress">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "progressPage" });
  return { title: t("metaTitle"), ...privatePageMetadata };
}

type TaskRow = {
  id: string;
  slug: string;
  kind: "quiz" | "practice";
  complexity: number;
  est_seconds: number;
  title: Json;
  task_skills: { weight: number; skills: { id: string; slug: string; name: string } | null }[];
};

export default async function ProgressPage({ params }: PageProps<"/[locale]/progress">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "progressPage" });
  const tr = await getTranslations({ locale, namespace: "results" });
  const format = await getFormatter({ locale });
  const supabase = await createClient();

  const [{ data: interviews }, { data: progress }] = await Promise.all([
    supabase.from("interviews").select("id, status, grade, score, started_at, method").order("started_at", { ascending: false }).limit(12),
    supabase.from("user_task_progress").select("task_id, status, attempts, last_score, last_attempt_at"),
  ]);

  const attemptedIds = (progress ?? []).map((p) => p.task_id);
  const { data: attemptedTasks } = attemptedIds.length
    ? await supabase.from("tasks").select("id, task_skills(skill_id)").in("id", attemptedIds)
    : { data: [] as { id: string; task_skills: { skill_id: string }[] }[] };
  const skillIds = [...new Set((attemptedTasks ?? []).flatMap((t) => t.task_skills.map((s) => s.skill_id)))];

  // All tasks of the skills the user has touched (to show untried ones too).
  const { data: links } = skillIds.length
    ? await supabase.from("task_skills").select("task_id").in("skill_id", skillIds)
    : { data: [] as { task_id: string }[] };
  const taskIds = [...new Set((links ?? []).map((l) => l.task_id))];
  const { data: tasksRaw } = taskIds.length
    ? await supabase
        .from("tasks")
        .select("id, slug, kind, complexity, est_seconds, title, task_skills(weight, skills(id, slug, name))")
        .in("id", taskIds)
        .eq("published", true)
    : { data: [] };
  const tasks = (tasksRaw ?? []) as unknown as TaskRow[];

  const selTasks: SelTask[] = tasks.map((task) => ({
    id: task.id,
    kind: task.kind,
    complexity: task.complexity,
    estSeconds: task.est_seconds,
    skills: task.task_skills.filter((l) => l.skills).map((l) => ({ skillId: l.skills!.id, weight: l.weight })),
  }));
  const selProgress = (progress ?? []).map((p) => ({
    taskId: p.task_id,
    status: p.status,
    attempts: p.attempts,
    lastScore: p.last_score,
    lastAttemptAt: p.last_attempt_at,
  }));
  const mastery = computeMastery(skillIds, selTasks, selProgress);
  const statusByTask = new Map((progress ?? []).map((p) => [p.task_id, p.status]));

  const skills = new Map<string, { id: string; slug: string; name: string }>();
  for (const task of tasks) for (const l of task.task_skills) if (l.skills && skillIds.includes(l.skills.id)) skills.set(l.skills.id, l.skills);
  const rows = [...skills.values()]
    .map((s) => {
      const own = tasks.filter((task) => task.task_skills.some((l) => l.skills?.id === s.id));
      return {
        ...s,
        mastery: Math.round((mastery[s.id]?.mastery ?? 0.5) * 100),
        tasks: own,
        passed: own.filter((task) => statusByTask.get(task.id) === "passed").length,
        attempted: own.filter((task) => statusByTask.has(task.id)).length,
      };
    })
    .sort((a, b) => a.mastery - b.mastery);

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        <PageHero title={t("title")} intro={t("intro")}>
          <div className="mt-8">
            <PillLink href="/practice" variant="gold">
              {t("start")}
            </PillLink>
          </div>
        </PageHero>

        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_22rem]">
          <section aria-labelledby="mastery-title">
            <h2 id="mastery-title" className="font-display text-2xl font-bold text-forest-700">
              {t("mastery")}
            </h2>
            {rows.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-paper-3 p-8 text-ink-muted">{t("empty")}</p>
            ) : (
              <ul className="mt-6 space-y-4">
                {rows.map((s) => (
                  <li key={s.id}>
                    <details className="group rounded-2xl border border-paper-3 bg-white p-5 shadow-card">
                      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="font-display text-lg font-bold text-ink">{s.name}</span>
                          <span className="font-display text-lg font-bold tabular-nums text-forest-700">{s.mastery}%</span>
                        </div>
                        <div
                          role="meter"
                          aria-label={`${s.name} ${t("mastery")}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={s.mastery}
                          className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper-3"
                        >
                          <div
                            className={`h-full rounded-full ${s.mastery >= 75 ? "bg-forest-600" : s.mastery >= 50 ? "bg-gold-500" : "bg-danger"}`}
                            style={{ width: `${s.mastery}%` }}
                          />
                        </div>
                        <p className="mt-2 text-sm text-ink-muted">{t("attempted", { passed: s.passed, attempted: s.attempted })}</p>
                      </summary>
                      <ul className="mt-4 divide-y divide-paper-3 border-t border-paper-3">
                        {s.tasks.map((task) => {
                          const st = statusByTask.get(task.id) ?? "untried";
                          return (
                            <li key={task.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                              <span className="text-ink">{loc(task.title, locale)}</span>
                              <span
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium ${
                                  st === "passed" ? "bg-success-soft text-success" : st === "failed" ? "bg-danger-soft text-danger" : "bg-paper-2 text-ink-muted"
                                }`}
                              >
                                {st === "passed" ? <Check aria-hidden className="h-3.5 w-3.5" /> : st === "failed" ? <X aria-hidden className="h-3.5 w-3.5" /> : <Minus aria-hidden className="h-3.5 w-3.5" />}
                                {t(`status.${st}`)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="history-title">
            <h2 id="history-title" className="font-display text-2xl font-bold text-forest-700">
              {t("history")}
            </h2>
            {interviews?.length ? (
              <ul className="mt-6 space-y-3">
                {interviews.map((iv) => (
                  <li key={iv.id} className="rounded-2xl border border-paper-3 bg-white p-4 shadow-card">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-ink-muted">
                        {format.dateTime(new Date(iv.started_at), { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      {iv.status === "completed" ? (
                        <span className="rounded-full bg-gold-100 px-2.5 py-0.5 font-display text-sm font-bold text-gold-800">
                          {iv.grade === "ORE" ? tr("gradeNames.ORE") : iv.grade} · {Math.round(iv.score ?? 0)}%
                        </span>
                      ) : (
                        <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-sm font-medium text-forest-700">{t("inProgress")}</span>
                      )}
                    </div>
                    <Link
                      href={iv.status === "completed" ? `/results/${iv.id}` : `/interview/${iv.id}`}
                      className="mt-3 inline-block text-sm font-semibold text-forest-700 underline decoration-gold-500 decoration-2 underline-offset-4"
                    >
                      {iv.status === "completed" ? t("view") : t("resume")}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-ink-muted">{t("noHistory")}</p>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
