"use client";

import "@/lib/react-aria-dev-shim";

import { BookOpen, ExternalLink, Loader2, LogOut, SkipForward } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { finishInterviewAction, markHelpUsedAction, submitItemAction } from "@/app/actions/attempt";
import { AssayMark } from "@/components/brand/Logo";
import type { CodingGroundHandle } from "@/components/playground/CodingGround";
import { PillArrow, pillClasses } from "@/components/ui/PillLink";
import { Link, useRouter } from "@/i18n/navigation";
import { isOutputPractice, type TaskPractice } from "@/lib/playground/frameworks";
import type { TestRunState } from "@/lib/playground/types";
import { InterviewTimer } from "./InterviewTimer";
import type { OutputGroundHandle } from "./OutputGround";
import { ProgressRail, type RailStep } from "./ProgressRail";
import { QuizStep, type QuizVM } from "./QuizStep";

const CodingGround = dynamic(() => import("@/components/playground/CodingGround").then((m) => m.CodingGround), {
  ssr: false,
  loading: () => <div className="h-[min(62vh,560px)] animate-pulse rounded-2xl bg-forest-900" />,
});

const OutputGround = dynamic(() => import("./OutputGround").then((m) => m.OutputGround), {
  ssr: false,
  loading: () => <div className="h-[min(50vh,460px)] animate-pulse rounded-2xl bg-forest-900" />,
});

export type StepVM = {
  itemId: string;
  status: "pending" | "answered" | "skipped";
  helpUsed: boolean;
  kind: "quiz" | "practice";
  title: string;
  complexity: number;
  estSeconds: number;
  skills: string[];
  previously: "passed" | "failed" | null;
  lectureHref: string | null;
  prompt: ReactNode;
  code?: ReactNode;
  quiz?: QuizVM;
  practice?: TaskPractice;
};

export type RunnerActions = {
  submitItem: typeof submitItemAction;
  markHelpUsed: typeof markHelpUsedAction;
  finishInterview: typeof finishInterviewAction;
};

const serverActions: RunnerActions = {
  submitItem: submitItemAction,
  markHelpUsed: markHelpUsedAction,
  finishInterview: finishInterviewAction,
};

type Props = {
  interviewId: string;
  startedAt: string;
  budgetSeconds: number;
  steps: StepVM[];
  /** Offline dev preview only. */
  actions?: RunnerActions;
  resultsPath?: (id: string) => string;
};

export function InterviewRunner({
  interviewId,
  startedAt,
  budgetSeconds,
  steps: initialSteps,
  actions = serverActions,
  resultsPath = (id) => `/results/${id}`,
}: Props) {
  const t = useTranslations("interview");
  const tc = useTranslations("common");
  const router = useRouter();
  const [steps, setSteps] = useState(initialSteps);
  const firstPending = steps.findIndex((s) => s.status === "pending");
  const [index, setIndex] = useState(firstPending === -1 ? steps.length - 1 : firstPending);
  const [selected, setSelected] = useState<string[]>([]);
  const [phase, setPhase] = useState<"idle" | "testing" | "submitting" | "finishing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [testState, setTestState] = useState<TestRunState>({ status: "waiting" });
  const [skipOpen, setSkipOpen] = useState(false);
  const groundRef = useRef<CodingGroundHandle>(null);
  const outputRef = useRef<OutputGroundHandle>(null);
  const stepStartedAt = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const finishing = useRef(false);

  const step = steps[index];
  const busy = phase !== "idle";

  // New step: start its clock and move focus to its heading (refs only; state resets in advance()).
  useEffect(() => {
    stepStartedAt.current = Date.now();
    headingRef.current?.focus();
  }, [index]);

  async function finish() {
    if (finishing.current) return;
    finishing.current = true;
    setPhase("finishing");
    const res = await actions.finishInterview(interviewId);
    if (!res.ok) {
      finishing.current = false;
      setPhase("idle");
      setError(t("submitError"));
      return;
    }
    router.push(resultsPath(interviewId));
  }

  function advance(status: "answered" | "skipped") {
    const next = steps.map((s, i) => (i === index ? { ...s, status } : s));
    setSteps(next);
    setSelected([]);
    setError(null);
    setTestState({ status: "waiting" });
    const nextIndex = next.findIndex((s) => s.status === "pending");
    if (nextIndex === -1) void finish();
    else setIndex(nextIndex);
  }

  async function submit() {
    if (!step || busy) return;
    setError(null);
    const timeSpent = Math.round((Date.now() - stepStartedAt.current) / 1000);

    if (step.kind === "quiz") {
      if (!selected.length) {
        setError(t("answerRequired"));
        return;
      }
      setPhase("submitting");
      const res = await actions.submitItem({
        itemId: step.itemId,
        answer: { selected },
        testsPassed: null,
        testsTotal: null,
        timeSpent,
        skip: false,
      });
      setPhase("idle");
      if (!res.ok && res.error !== "duplicate") return setError(t("submitError"));
      return advance("answered");
    }

    // Output practice (C# / SQL): run the code once more and submit what it printed.
    if (isOutputPractice(step.practice)) {
      setPhase("testing");
      const run = await outputRef.current!.run();
      if (run.status === "unavailable") {
        // The code never ran: don't grade it, let the user retry (or skip).
        setPhase("idle");
        return setError(t("runnerUnavailable", { reason: run.message }));
      }
      setPhase("submitting");
      const res = await actions.submitItem({
        itemId: step.itemId,
        answer: { files: outputRef.current!.getFiles(), output: run.output },
        testsPassed: null,
        testsTotal: null,
        timeSpent,
        skip: false,
      });
      setPhase("idle");
      if (!res.ok && res.error !== "duplicate") return setError(t("submitError"));
      try {
        window.localStorage.removeItem(`assay:draft:${step.itemId}`);
      } catch {
        /* ignore */
      }
      return advance("answered");
    }

    // Practice: tests always run right before submitting.
    setPhase("testing");
    const run = await groundRef.current!.runTests();
    if (run.timedOut) {
      // Never grade a run that didn't report: let the user retry (or skip) instead.
      setPhase("idle");
      return setError(t("testsTimedOut"));
    }
    const files = groundRef.current!.getFiles();
    setPhase("submitting");
    const testCount = step.practice && !isOutputPractice(step.practice) ? step.practice.testCount : 1;
    const total = run.total > 0 ? run.total : Math.max(1, testCount ?? 1);
    const res = await actions.submitItem({
      itemId: step.itemId,
      answer: { files },
      testsPassed: Math.min(run.passed, total),
      testsTotal: total,
      timeSpent,
      skip: false,
    });
    setPhase("idle");
    if (!res.ok && res.error !== "duplicate") return setError(t("submitError"));
    try {
      window.localStorage.removeItem(`assay:draft:${step.itemId}`);
    } catch {
      /* ignore */
    }
    advance("answered");
  }

  async function skip() {
    setSkipOpen(false);
    if (!step || busy) return;
    setPhase("submitting");
    const res = await actions.submitItem({
      itemId: step.itemId,
      answer: null,
      testsPassed: null,
      testsTotal: null,
      timeSpent: Math.round((Date.now() - stepStartedAt.current) / 1000),
      skip: true,
    });
    setPhase("idle");
    if (!res.ok && res.error !== "duplicate") return setError(t("submitError"));
    advance("skipped");
  }

  function onHelp() {
    if (!step || step.helpUsed) return;
    setSteps((all) => all.map((s, i) => (i === index ? { ...s, helpUsed: true } : s)));
    void actions.markHelpUsed(step.itemId);
  }

  const rail: RailStep[] = steps.map((s, i) => ({
    id: s.itemId,
    kind: s.kind,
    state: s.status === "answered" ? "done" : s.status === "skipped" ? "skipped" : i === index ? "current" : "pending",
  }));

  if (!step) return null;
  const isPractice = step.kind === "practice";
  const headingId = `step-title-${step.itemId}`;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-30 bg-forest-800 text-white shadow-[0_8px_24px_-16px_rgb(4_36_28/0.8)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <Link href="/" aria-label="Assay" className="shrink-0 rounded-lg">
            <AssayMark className="h-9 w-9" />
          </Link>
          <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
            <ProgressRail steps={rail} />
          </div>
          <InterviewTimer startedAt={startedAt} budgetSeconds={budgetSeconds} />
          <Link
            href="/progress"
            className="ml-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-forest-100 hover:bg-white/10 sm:ml-0"
          >
            <LogOut aria-hidden className="h-4 w-4" />
            <span className="sr-only md:not-sr-only">{t("exit")}</span>
          </Link>
        </div>
      </header>

      <main id="main" className={`on-light mx-auto w-full flex-1 px-5 py-10 sm:px-8 ${isPractice ? "max-w-7xl" : "max-w-3xl"}`}>
        <div key={step.itemId} className="animate-rise">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-forest-700 px-3 py-1 font-semibold text-white">
              {t("step", { current: index + 1, total: steps.length })}
            </span>
            <span className="rounded-full bg-gold-100 px-3 py-1 font-semibold text-gold-800">{t(step.kind)}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-paper-3 px-3 py-1 text-ink-muted" role="img" aria-label={t("complexity", { value: step.complexity })}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} aria-hidden className={`h-1.5 w-1.5 rounded-full ${i < step.complexity ? "bg-gold-500" : "bg-paper-3"}`} />
              ))}
            </span>
            <span className="text-ink-soft">{t("estimate", { minutes: Math.max(1, Math.round(step.estSeconds / 60)) })}</span>
            {step.previously === "failed" ? (
              <span className="rounded-full bg-danger-soft px-3 py-1 font-medium text-danger">{t("previouslyFailed")}</span>
            ) : step.previously === "passed" ? (
              <span className="rounded-full bg-success-soft px-3 py-1 font-medium text-success">{t("previouslyPassed")}</span>
            ) : null}
            {step.skills.map((s) => (
              <span key={s} className="rounded-full border border-forest-200 px-3 py-1 text-forest-700">
                {s}
              </span>
            ))}
          </div>

          <h1
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            className="mt-6 font-display text-3xl font-bold leading-tight text-forest-800 outline-none sm:text-4xl"
          >
            {step.title}
          </h1>
          <div className="mt-5 [&_.prose-assay]:text-[1.05rem]">{step.prompt}</div>
          {step.code ? <div className="mt-5">{step.code}</div> : null}

          <div className="mt-8">
            {step.quiz ? (
              <QuizStep
                quiz={step.quiz}
                selected={selected}
                onChange={(ids) => {
                  setSelected(ids);
                  setError(null);
                }}
                disabled={busy}
                error={error === t("answerRequired") ? error : undefined}
                labelId={headingId}
              />
            ) : null}
            {isOutputPractice(step.practice) ? (
              <OutputGround
                key={step.itemId}
                ref={outputRef}
                itemId={step.itemId}
                practice={step.practice}
                storageKey={`assay:draft:${step.itemId}`}
                disabled={busy}
              />
            ) : step.practice ? (
              <>
                <CodingGround
                  key={step.itemId}
                  ref={groundRef}
                  practice={step.practice}
                  storageKey={`assay:draft:${step.itemId}`}
                  onRunChange={setTestState}
                />
                <p className="mt-3 text-sm text-ink-muted" role="status">
                  {phase === "testing"
                    ? t(isOutputPractice(step.practice) ? "runningCode" : "runningTests")
                    : testState.status === "done"
                      ? t("testsSummary", { passed: testState.run.passed, total: testState.run.total })
                      : ""}
                </p>
              </>
            ) : null}
          </div>

          {error && error !== t("answerRequired") ? (
            <p role="alert" className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="mt-10 flex flex-col-reverse gap-4 border-t border-paper-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              {step.lectureHref ? (
                <a
                  href={step.lectureHref}
                  target="_blank"
                  rel="noopener"
                  onClick={onHelp}
                  aria-describedby="help-hint"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-forest-700 px-4 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-700 hover:text-white"
                >
                  <BookOpen aria-hidden className="h-4 w-4" />
                  {step.helpUsed ? t("helpUsed") : t("help")}
                  <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                  <span className="sr-only">{tc("opensInNewTab")}</span>
                </a>
              ) : null}
              <p id="help-hint" className="text-xs text-ink-soft">
                {t("helpHint")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSkipOpen(true)}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-ink-muted transition hover:bg-paper-2 disabled:opacity-50"
              >
                <SkipForward aria-hidden className="h-4 w-4" />
                {t("skip")}
              </button>
              <button type="button" onClick={submit} disabled={busy} className={pillClasses("forest", "whitespace-nowrap disabled:opacity-70")}>
                {busy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <PillArrow />}
                <span>
                  {phase === "testing"
                    ? t(isOutputPractice(step.practice) ? "runningCode" : "runningTests")
                    : phase === "submitting"
                      ? t("submitting")
                      : phase === "finishing"
                        ? t("finishing")
                        : isPractice
                          ? t("submitCode")
                          : t("submit")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <ModalOverlay
        isOpen={skipOpen}
        onOpenChange={setSkipOpen}
        isDismissable
        className="fixed inset-0 z-50 grid place-items-center bg-forest-950/60 p-4 backdrop-blur-sm"
      >
        <Modal className="w-full max-w-md rounded-3xl bg-white p-7 shadow-lift">
          <Dialog className="outline-none">
            <Heading slot="title" className="font-display text-xl font-bold text-forest-800">
              {t("skip")}
            </Heading>
            <p className="mt-3 text-ink-muted">{t("confirmSkip")}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onPress={() => setSkipOpen(false)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink-muted outline-none hover:bg-paper-2 data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-gold-500"
              >
                {t("cancel")}
              </Button>
              <Button
                onPress={skip}
                autoFocus
                className="rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-forest-800 data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-gold-500"
              >
                {t("skip")}
              </Button>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
