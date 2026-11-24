"use client";

import { Database, Play, RotateCcw, TerminalSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { runInterviewCodeAction } from "@/app/actions/attempt";
import { CodeEditor } from "@/components/admin/CodeEditor";
import { outputPracticeFile, type OutputPractice } from "@/lib/playground/frameworks";
import { preloadSql, runSqlInBrowser } from "@/lib/runner/sql-client";

/**
 * What a run produced. `output` is what gets graded: null when the code didn't compile or the
 * query failed. `unavailable` means the code never ran (compiler service down, PGlite didn't load):
 * such a run must not be submitted.
 */
export type OutputRun =
  | { status: "ran"; output: string | null; shown: string; error: string | null; label: "compileError" | "runtimeError" | "sqlErrorLabel" | null }
  | { status: "unavailable"; message: string };

export type OutputGroundHandle = {
  /** Runs the current code and returns the result (also shown in the output panel). */
  run: () => Promise<OutputRun>;
  /** The answer files: {"Program.cs" | "query.sql": code}. */
  getFiles: () => Record<string, string>;
};

function readDraft(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeDraft(key: string, code: string | null) {
  try {
    if (code === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, code);
  } catch {
    /* storage unavailable: the draft just isn't kept */
  }
}

/** Editor + run button for a practice graded by its output (C# on Wandbox, SQL on PGlite). */
export function OutputGround({
  itemId,
  practice,
  storageKey,
  disabled,
  ref,
}: {
  itemId: string;
  practice: OutputPractice;
  storageKey: string;
  disabled?: boolean;
  ref?: Ref<OutputGroundHandle>;
}) {
  const t = useTranslations("course.practice");
  const ti = useTranslations("interview");
  const sql = practice.language === "sql";
  const file = outputPracticeFile(practice.language);
  // The editor is loaded on the client only (dynamic import in the runner), so storage is safe here.
  const [code, setCode] = useState(() => readDraft(storageKey) ?? practice.starter);
  const codeRef = useRef(code);
  const [result, setResult] = useState<OutputRun | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (sql) preloadSql();
  }, [sql]);

  function change(next: string) {
    setCode(next);
    codeRef.current = next;
    writeDraft(storageKey, next === practice.starter ? null : next);
  }

  const execute = useCallback(async (): Promise<OutputRun> => {
    const current = codeRef.current;
    if (sql) {
      const r = await runSqlInBrowser(practice.setup ?? "", current);
      if (r.status === "unavailable") {
        return { status: "unavailable", message: t(r.reason === "timeout" ? "sqlTimeout" : r.reason === "load" ? "sqlLoad" : "tooLarge") };
      }
      return r.status === "ok"
        ? { status: "ran", output: r.output, shown: r.output, error: null, label: null }
        : { status: "ran", output: null, shown: r.output, error: r.error, label: "sqlErrorLabel" };
    }
    const res = await runInterviewCodeAction(itemId, current);
    if (!res.ok) return { status: "unavailable", message: t(res.error === "invalid" ? "tooLarge" : "server") };
    const run = res.run;
    if (run.status === "unavailable") return { status: "unavailable", message: t(run.reason === "too-large" ? "tooLarge" : run.reason) };
    if (run.status === "compile-error") return { status: "ran", output: null, shown: "", error: run.messages, label: "compileError" };
    // Like course practice, a runtime error still grades whatever the program printed.
    return { status: "ran", output: run.output, shown: run.output, error: run.runtimeError, label: run.runtimeError ? "runtimeError" : null };
  }, [itemId, practice.setup, sql, t]);

  const run = useCallback(async () => {
    setPending(true);
    try {
      const r = await execute();
      setResult(r);
      return r;
    } catch {
      const r: OutputRun = { status: "unavailable", message: t("server") };
      setResult(r);
      return r;
    } finally {
      setPending(false);
    }
  }, [execute, t]);

  useImperativeHandle(ref, () => ({ run, getFiles: () => ({ [file]: codeRef.current }) }), [run, file]);

  function onKeyDownCapture(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      if (!pending && !disabled) void run();
    }
  }

  return (
    <div className="space-y-4">
      {sql && practice.setup?.trim() ? (
        <details className="group overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-paper-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3.5 font-semibold text-forest-700 marker:hidden">
            <Database aria-hidden className="h-4 w-4 text-gold-600" />
            {t("schema")}
            <span className="ml-auto text-xs font-normal text-ink-muted group-open:hidden">{t("schemaShow")}</span>
          </summary>
          <pre className="max-h-96 overflow-auto border-t border-paper-3 bg-paper px-5 py-4 font-mono text-[0.8rem] leading-relaxed text-ink">
            {practice.setup.trim()}
          </pre>
        </details>
      ) : null}

      <div className="overflow-hidden rounded-2xl bg-forest-900 shadow-lift ring-1 ring-forest-800" onKeyDownCapture={onKeyDownCapture}>
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
          <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-xs text-forest-50">{file}</span>
          <button
            type="button"
            onClick={() => change(practice.starter)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-forest-100 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RotateCcw aria-hidden className="h-3.5 w-3.5" />
            {t("reset")}
          </button>
        </div>
        <div className="p-2 sm:p-3">
          <CodeEditor value={code} onChange={change} language={practice.language} rows={sql ? 12 : 18} ariaLabel={t(sql ? "sqlEditor" : "editor")} />
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-forest-200">{t(sql ? "sqlPoweredBy" : "poweredBy")}</p>
          <button
            type="button"
            onClick={() => void run()}
            disabled={pending || disabled}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-2 text-sm font-bold text-forest-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play aria-hidden className="h-4 w-4 fill-current" />
            {pending ? t(sql ? "sqlRunning" : "running") : ti("runCode")}
            <kbd className="hidden rounded border border-forest-950/20 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold sm:inline">{t("shortcut")}</kbd>
          </button>
        </div>
      </div>

      {pending || result ? (
        <section aria-live="polite" aria-busy={pending} className="overflow-hidden rounded-2xl bg-forest-950 text-forest-50 shadow-card">
          <header className="flex items-center gap-2 border-b border-white/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-gold-300">
            <TerminalSquare aria-hidden className="h-4 w-4" />
            {t("output")}
          </header>
          <div className="space-y-4 px-5 py-4">
            {pending ? (
              <p className="font-mono text-sm text-forest-200">{t(sql ? "sqlRunning" : "running")}</p>
            ) : result?.status === "unavailable" ? (
              <p role="status" className="font-semibold text-gold-100">
                {result.message}
              </p>
            ) : result ? (
              <>
                {result.label !== "compileError" ? (
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black/25 p-4 font-mono text-sm leading-relaxed">
                    {result.shown || <span className="italic text-forest-200">{t(sql ? "sqlNoOutput" : "noOutput")}</span>}
                  </pre>
                ) : null}
                {result.error ? (
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#f4a39a]">{t(result.label ?? "runtimeError")}</p>
                    <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#f4a39a]">{result.error}</pre>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
