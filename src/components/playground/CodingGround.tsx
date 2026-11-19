"use client";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
  type SandpackTheme,
} from "@codesandbox/sandpack-react";
import { CheckCircle2, CircleDashed, Loader2, RotateCcw, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import {
  buildSandpackFiles,
  FRAMEWORK_CONFIG,
  TOOLCHAIN_DEV_DEPENDENCIES,
  visibleFilesOf,
  type PracticePayload,
} from "@/lib/playground/frameworks";
import type { TestRun, TestRunState } from "@/lib/playground/types";

export type CodingGroundHandle = {
  /** Reloads the preview (fresh app state), waits for the test run and returns its result. */
  runTests: () => Promise<TestRun>;
  /** Current content of the user-editable files. */
  getFiles: () => Record<string, string>;
};

type Props = {
  practice: PracticePayload;
  /** localStorage key for draft autosave; omit to disable drafts. */
  storageKey?: string;
  /** Initial files (e.g. a submitted answer in read-only review). */
  initialFiles?: Record<string, string>;
  readOnly?: boolean;
  ref?: Ref<CodingGroundHandle>;
  onRunChange?: (state: TestRunState) => void;
  className?: string;
};

/** First builds (npm deps, Angular) can take ~30 s on a cold cache. */
const RUN_TIMEOUT_MS = 45_000;

export const assayTheme: SandpackTheme = {
  colors: {
    surface1: "#04241c",
    surface2: "#0a4a38",
    surface3: "#0b5a43",
    clickable: "#9fc2b2",
    base: "#e8efe9",
    disabled: "#5d7d70",
    hover: "#ffffff",
    accent: "#e6cf86",
    error: "#ffb4a8",
    errorSurface: "#3b1410",
    warning: "#f5d48a",
    warningSurface: "#3a2a07",
  },
  syntax: {
    plain: "#e8efe9",
    comment: { color: "#7f9d90", fontStyle: "italic" },
    keyword: "#e6cf86",
    tag: "#8fd3b0",
    punctuation: "#a9c4b8",
    definition: "#ffffff",
    property: "#b8e0cc",
    static: "#f0a868",
    string: "#d9e9a5",
  },
  font: {
    body: "var(--font-plex-sans), sans-serif",
    mono: "var(--font-plex-mono), ui-monospace, monospace",
    size: "13.5px",
    lineHeight: "1.6",
  },
};

function readDraft(key: string | undefined): Record<string, string> | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

export function CodingGround({ practice, storageKey, initialFiles, readOnly, ref, onRunChange, className }: Props) {
  const [startFiles] = useState(() => {
    const draft = typeof window === "undefined" ? null : readDraft(storageKey);
    return { ...practice.files, ...(initialFiles ?? {}), ...(draft ?? {}) };
  });
  const files = useMemo(() => buildSandpackFiles(practice, startFiles), [practice, startFiles]);
  const cfg = FRAMEWORK_CONFIG[practice.framework];
  const visible = visibleFilesOf(practice);

  return (
    <div className={`overflow-hidden rounded-2xl border border-forest-800 bg-forest-950 shadow-lift ${className ?? ""}`}>
      <SandpackProvider
        template={cfg.template}
        files={files}
        theme={assayTheme}
        customSetup={{
          dependencies: practice.dependencies ?? {},
          devDependencies: TOOLCHAIN_DEV_DEPENDENCIES[practice.framework],
        }}
        options={{
          visibleFiles: visible,
          activeFile: practice.activeFile ?? visible[0],
          recompileMode: "delayed",
          recompileDelay: 700,
          autorun: true,
          initMode: "immediate",
        }}
      >
        <GroundInner
          ref={ref}
          practice={practice}
          storageKey={storageKey}
          readOnly={readOnly}
          onRunChange={onRunChange}
        />
      </SandpackProvider>
    </div>
  );
}

function GroundInner({
  practice,
  storageKey,
  readOnly,
  ref,
  onRunChange,
}: Pick<Props, "practice" | "storageKey" | "readOnly" | "ref" | "onRunChange">) {
  const t = useTranslations("playground");
  const { sandpack, dispatch, listen } = useSandpack();
  const [state, setState] = useState<TestRunState>({ status: "waiting" });
  const waiters = useRef<((run: TestRun) => void)[]>([]);
  const userPaths = useMemo(() => visibleFilesOf(practice), [practice]);

  const update = useCallback(
    (next: TestRunState) => {
      setState(next);
      onRunChange?.(next);
    },
    [onRunChange],
  );

  // Results are posted by the in-preview test kit.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as { source?: string; type?: string } & Record<string, unknown>;
      if (!data || data.source !== "assay-tests") return;
      if (!/^https:\/\/([a-z0-9-]+\.)*(codesandbox\.io|csb\.app)$/.test(event.origin)) return;
      if (data.type === "started") {
        update({ status: "running", total: Number(data.total) || 0 });
      } else if (data.type === "results") {
        const run: TestRun = {
          total: Number(data.total) || 0,
          passed: Number(data.passed) || 0,
          ms: Number(data.ms) || 0,
          tests: Array.isArray(data.tests) ? (data.tests as TestRun["tests"]) : [],
        };
        update({ status: "done", run });
        waiters.current.splice(0).forEach((resolve) => resolve(run));
      } else if (data.type === "runtime-error") {
        update({ status: "error", message: String(data.message ?? "Runtime error") });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [update]);

  // A new bundle starts after each edit: mark the run as pending.
  useEffect(() => {
    return listen((msg) => {
      if (msg.type === "start") update({ status: "waiting" });
      if (msg.type === "action" && msg.action === "show-error") {
        update({ status: "error", message: String((msg as { message?: string }).message ?? "Compilation error") });
      }
    });
  }, [listen, update]);

  // Draft autosave.
  useEffect(() => {
    if (!storageKey || readOnly) return;
    const id = window.setTimeout(() => {
      const draft: Record<string, string> = {};
      for (const path of userPaths) draft[path] = sandpack.files[path]?.code ?? "";
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        /* storage full or blocked */
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [sandpack.files, storageKey, readOnly, userPaths]);

  const getFiles = useCallback(() => {
    const out: Record<string, string> = {};
    for (const path of userPaths) out[path] = sandpack.files[path]?.code ?? "";
    return out;
  }, [sandpack.files, userPaths]);

  const runTests = useCallback(() => {
    return new Promise<TestRun>((resolve) => {
      const timer = window.setTimeout(() => {
        const failed: TestRun = {
          total: practice.testCount,
          passed: 0,
          ms: 0,
          tests: [],
          timedOut: true,
        };
        waiters.current = waiters.current.filter((w) => w !== done);
        update({ status: "error", message: t("timeout") });
        resolve(failed);
      }, RUN_TIMEOUT_MS);
      const done = (run: TestRun) => {
        window.clearTimeout(timer);
        resolve(run);
      };
      waiters.current.push(done);
      update({ status: "waiting" });
      dispatch({ type: "refresh" });
    });
  }, [dispatch, practice.testCount, t, update]);

  useImperativeHandle(ref, () => ({ runTests, getFiles }), [runTests, getFiles]);

  return (
    <>
      <SandpackLayout className="!rounded-none !border-0">
        <SandpackCodeEditor
          showTabs
          showLineNumbers
          wrapContent
          readOnly={readOnly}
          showReadOnly={false}
          style={{ height: "min(62vh, 560px)" }}
          className="min-w-0 basis-1/2"
        />
        <div className="flex min-w-0 basis-1/2 flex-col" style={{ height: "min(62vh, 560px)" }}>
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton
            showNavigator={false}
            className="min-h-0 flex-1"
            style={{ background: "#fff" }}
          />
          <TestPanel state={state} onRerun={() => void runTests()} />
        </div>
      </SandpackLayout>
    </>
  );
}

function TestPanel({ state, onRerun }: { state: TestRunState; onRerun: () => void }) {
  const t = useTranslations("playground");
  const summary =
    state.status === "done"
      ? t("summary", { passed: state.run.passed, total: state.run.total })
      : state.status === "running"
        ? t("running")
        : state.status === "error"
          ? t("error")
          : t("waiting");

  return (
    <section
      aria-label={t("results")}
      className="flex max-h-[45%] min-h-[9rem] flex-col border-t border-forest-800 bg-forest-950 text-sm text-forest-100"
    >
      <div className="flex items-center justify-between gap-3 border-b border-forest-800/80 px-4 py-2">
        <p className="flex items-center gap-2 font-medium" role="status" aria-live="polite">
          {state.status === "done" && state.run.passed === state.run.total && state.run.total > 0 ? (
            <CheckCircle2 className="h-4 w-4 text-[#8fd3b0]" aria-hidden />
          ) : state.status === "done" || state.status === "error" ? (
            <XCircle className="h-4 w-4 text-[#ffb4a8]" aria-hidden />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-gold-300" aria-hidden />
          )}
          {summary}
        </p>
        <button
          type="button"
          onClick={onRerun}
          className="inline-flex items-center gap-1.5 rounded-full border border-forest-600 px-3 py-1 text-xs font-medium text-gold-300 transition hover:border-gold-500 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {t("rerun")}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
        {state.status === "error" ? (
          <pre className="whitespace-pre-wrap font-mono text-xs text-[#ffb4a8]">{state.message}</pre>
        ) : null}
        {state.status === "done" ? (
          <ul className="space-y-1.5">
            {state.run.tests.map((test, i) => (
              <li key={i} className="flex items-start gap-2">
                {test.status === "pass" ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8fd3b0]" aria-label={t("passed")} />
                ) : (
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ffb4a8]" aria-label={t("failed")} />
                )}
                <div className="min-w-0">
                  <p className="leading-snug">{test.name}</p>
                  {test.error ? (
                    <p className="mt-0.5 break-words font-mono text-xs text-[#ffcfc7]">{test.error}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {state.status === "waiting" || state.status === "running" ? (
          <p className="flex items-center gap-2 text-forest-200">
            <CircleDashed className="h-3.5 w-3.5" aria-hidden />
            {t("autoRun")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
