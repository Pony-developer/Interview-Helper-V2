"use client";

import { Database, Play, RotateCcw, TerminalSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition, type KeyboardEvent, type ReactNode } from "react";
import { runPracticeAction, submitSqlPracticeAction, type RunResponse } from "@/app/actions/course";
import { CodeEditor } from "@/components/admin/CodeEditor";
import { useRouter } from "@/i18n/navigation";
import type { RunResult } from "@/lib/runner/csharp";
import { preloadSql, runSqlInBrowser } from "@/lib/runner/sql-client";
import { CertificateEarned } from "./CertificateMeter";

const draftKey = (slideId: string) => `assay:course-draft:${slideId}`;

function readDraft(slideId: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(draftKey(slideId));
  } catch {
    return null;
  }
}

function writeDraft(slideId: string, code: string | null) {
  try {
    if (code === null) window.localStorage.removeItem(draftKey(slideId));
    else window.localStorage.setItem(draftKey(slideId), code);
  } catch {
    /* storage unavailable: the draft just isn't kept */
  }
}

/**
 * SQL runs in the browser, so its run is reported in the C# shapes: a query error becomes a
 * "runtime error" next to the output, and a failure to start PostgreSQL is "unavailable".
 */
type SqlFailure = "sqlTimeout" | "sqlLoad" | "tooLarge";

export function PracticeSlide({
  slideId,
  language = "csharp",
  setup = "",
  starter,
  savedCode,
  maxScore,
  canRun,
  signInNote,
}: {
  slideId: string;
  language?: "csharp" | "sql";
  /** SQL only: the script that creates the practice database. */
  setup?: string;
  starter: string;
  /** The code from the visitor's last run, when signed in. */
  savedCode: string | null;
  maxScore: number;
  /** False for anonymous visitors on a site with accounts: running code needs a sign-in. */
  canRun: boolean;
  signInNote: ReactNode;
}) {
  const t = useTranslations("course.practice");
  const router = useRouter();
  // An unsaved draft from this browser is newer than the code saved on the last run. The editor
  // mounts on the client only, so reading storage here can't cause a hydration mismatch.
  const [code, setCode] = useState(() => readDraft(slideId) ?? savedCode ?? starter);
  const [response, setResponse] = useState<RunResponse | null>(null);
  const [pending, startTransition] = useTransition();
  const [sqlFailure, setSqlFailure] = useState<SqlFailure | null>(null);
  const sql = language === "sql";
  // SQL runs locally, so anyone can run it; only saving the score needs an account.
  const runnable = sql || canRun;

  useEffect(() => {
    if (sql) preloadSql();
  }, [sql]);

  function change(next: string) {
    setCode(next);
    writeDraft(slideId, next === starter ? null : next);
  }

  function run() {
    if (!runnable || pending) return;
    startTransition(async () => {
      setSqlFailure(null);
      const res = sql ? await runSql() : await runPracticeAction(slideId, code);
      setResponse(res);
      if (res?.ok && res.outcome?.saved) router.refresh();
    });
  }

  async function runSql(): Promise<RunResponse | null> {
    const result = await runSqlInBrowser(setup, code);
    if (result.status === "unavailable") {
      setSqlFailure(result.reason === "timeout" ? "sqlTimeout" : result.reason === "load" ? "sqlLoad" : "tooLarge");
      return null;
    }
    const failed = result.status === "error";
    const graded = await submitSqlPracticeAction(slideId, code, failed ? null : result.output);
    const run: RunResult = { status: "ok", output: result.output, exitCode: failed ? 1 : 0, runtimeError: failed ? result.error : null };
    if (!graded.ok) return { ok: true, run, outcome: null };
    return { ok: true, run, outcome: graded.outcome };
  }

  function onKeyDownCapture(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      run();
    }
  }

  const run_ = response?.ok ? response.run : null;
  const outcome = response?.ok ? response.outcome : null;
  const failure = response && !response.ok ? response.error : null;

  let status: { tone: "pass" | "fail" | "warn"; text: string } | null = null;
  if (sqlFailure) status = { tone: "warn", text: t(sqlFailure) };
  else if (sql && run_?.status === "ok" && run_.runtimeError) status = { tone: "fail", text: t("sqlError") };
  else if (failure) status = { tone: "warn", text: t(failure === "sign-in" ? "signInToRun" : failure === "invalid" ? "tooLarge" : "server") };
  else if (run_?.status === "unavailable") status = { tone: "warn", text: t(run_.reason === "too-large" ? "tooLarge" : run_.reason) };
  else if (run_?.status === "compile-error") status = { tone: "fail", text: t("compileError") };
  else if (outcome) status = { tone: outcome.passed ? "pass" : "fail", text: outcome.passed ? t("passed") : t("failed") };

  return (
    <div className="space-y-5">
      {sql && setup.trim() ? (
        <details className="group overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-paper-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 font-semibold text-forest-700 marker:hidden sm:px-6">
            <Database aria-hidden className="h-4 w-4 text-gold-600" />
            {t("schema")}
            <span className="ml-auto text-xs font-normal text-ink-muted group-open:hidden">{t("schemaShow")}</span>
          </summary>
          <pre className="max-h-96 overflow-auto border-t border-paper-3 bg-paper px-5 py-4 font-mono text-[0.8rem] leading-relaxed text-ink sm:px-6">
            {setup.trim()}
          </pre>
        </details>
      ) : null}
      <div className="overflow-hidden rounded-3xl bg-forest-900 shadow-lift ring-1 ring-forest-800" onKeyDownCapture={onKeyDownCapture}>
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2">
            <span aria-hidden className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-gold-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </span>
            <span className="ml-2 rounded-md bg-white/10 px-2.5 py-1 font-mono text-xs text-forest-50">{sql ? "query.sql" : "Program.cs"}</span>
          </div>
          <button
            type="button"
            onClick={() => change(starter)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-forest-100 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw aria-hidden className="h-3.5 w-3.5" />
            {t("reset")}
          </button>
        </div>
        <div className="p-2 sm:p-3">
          <CodeEditor value={code} onChange={change} language={language} rows={sql ? 12 : 16} ariaLabel={t(sql ? "sqlEditor" : "editor")} />
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs leading-relaxed text-forest-200">
            {sql ? (
              <>
                {t("sqlPoweredBy")} {canRun ? null : signInNote}
              </>
            ) : canRun ? (
              t("poweredBy")
            ) : (
              signInNote
            )}
          </p>
          <button
            type="button"
            onClick={run}
            disabled={!runnable || pending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-2.5 font-bold text-forest-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play aria-hidden className="h-4 w-4 fill-current" />
            {pending ? t(sql ? "sqlRunning" : "running") : t("run")}
            <kbd className="hidden rounded border border-forest-950/20 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold sm:inline">{t("shortcut")}</kbd>
          </button>
        </div>
      </div>

      {!pending && outcome?.certificate?.new ? <CertificateEarned id={outcome.certificate.id} /> : null}

      {pending || response ? (
        <section aria-live="polite" aria-busy={pending} className="overflow-hidden rounded-3xl bg-forest-950 text-forest-50 shadow-card">
          <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-gold-300">
              <TerminalSquare aria-hidden className="h-4 w-4" />
              {t("output")}
            </span>
            {outcome?.passed ? (
              <span className="rounded-full bg-gold-500 px-3 py-1 font-mono text-xs font-bold text-forest-950">
                {outcome.score}/{maxScore}
              </span>
            ) : null}
          </header>

          {pending ? (
            <div className="px-5 py-6">
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-full animate-shimmer rounded-full bg-[linear-gradient(90deg,transparent,var(--color-gold-400),transparent)] bg-[length:50%_100%] bg-no-repeat" />
              </div>
              <p className="mt-3 font-mono text-sm text-forest-200">{t(sql ? "sqlRunning" : "running")}</p>
            </div>
          ) : (
            <div className="space-y-4 px-5 py-5">
              {status ? (
                <p
                  role={status.tone === "pass" ? undefined : "status"}
                  className={`font-semibold ${
                    status.tone === "pass" ? "text-gold-300" : status.tone === "fail" ? "text-[#f4a39a]" : "text-gold-100"
                  }`}
                >
                  {status.text}
                  {outcome?.saved ? <span className="ml-2 font-normal text-forest-200">{t("saved")}</span> : null}
                </p>
              ) : null}
              {run_?.status === "compile-error" ? (
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-gold-100">{run_.messages}</pre>
              ) : null}
              {run_?.status === "ok" ? (
                <>
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black/25 p-4 font-mono text-sm leading-relaxed">
                    {run_.output || <span className="italic text-forest-200">{t(sql ? "sqlNoOutput" : "noOutput")}</span>}
                  </pre>
                  {run_.runtimeError ? (
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#f4a39a]">{t(sql ? "sqlErrorLabel" : "runtimeError")}</p>
                      <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#f4a39a]">
                        {run_.runtimeError}
                      </pre>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
