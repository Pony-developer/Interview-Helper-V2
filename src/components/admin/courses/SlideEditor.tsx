"use client";

import { ArrowDown, ArrowUp, ExternalLink, Play, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { adminRunCSharpAction, deleteSlideAction, saveSlideAction } from "@/app/actions/admin-courses";
import { Link, useRouter } from "@/i18n/navigation";
import { emptyLoc, newQuestion, type QuestionForm, type SlideFormState, type Source } from "@/lib/admin/course-forms";
import { btn, callAction, CodeArea, Field, inputCls, LocalizedField, monoCls, SaveBar, Section, SourceBadge, type SaveStatus } from "../fields";

const LETTERS = "abcdefghij";
const KIND_LABEL = { lecture: "Lecture", quiz: "Quiz", practice: "Practice" } as const;

function QuestionEditor({
  q,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  q: QuestionForm;
  index: number;
  total: number;
  onChange: (q: QuestionForm) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const toggleCorrect = (id: string) => {
    if (q.mode === "single") return onChange({ ...q, correct: [id] });
    onChange({ ...q, correct: q.correct.includes(id) ? q.correct.filter((c) => c !== id) : [...q.correct, id] });
  };
  const addOption = () => {
    const id = [...LETTERS].find((l) => !q.options.some((o) => o.id === l));
    if (id) onChange({ ...q, options: [...q.options, { id, text: emptyLoc() }] });
  };

  return (
    <fieldset className="space-y-4 rounded-xl border border-paper-3 p-4">
      <legend className="px-1 font-display text-sm font-bold text-forest-800">Question {index + 1}</legend>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Id" htmlFor={`q-id-${index}`} className="w-32">
          <input id={`q-id-${index}`} value={q.id} onChange={(e) => onChange({ ...q, id: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Answers" htmlFor={`q-mode-${index}`} className="w-48">
          <select
            id={`q-mode-${index}`}
            value={q.mode}
            onChange={(e) => {
              const mode = e.target.value as QuestionForm["mode"];
              onChange({ ...q, mode, correct: mode === "single" ? q.correct.slice(0, 1) : q.correct });
            }}
            className={inputCls}
          >
            <option value="single">One correct answer</option>
            <option value="multi">Several correct answers</option>
          </select>
        </Field>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" aria-label={`Move question ${index + 1} up`} disabled={index === 0} onClick={() => onMove(-1)} className={`${btn.ghost} px-2`}>
            <ArrowUp aria-hidden className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Move question ${index + 1} down`}
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            className={`${btn.ghost} px-2`}
          >
            <ArrowDown aria-hidden className="h-4 w-4" />
          </button>
          <button type="button" onClick={onRemove} className={btn.danger}>
            <Trash2 aria-hidden className="h-4 w-4" /> Remove
          </button>
        </div>
      </div>
      <LocalizedField id={`q-prompt-${index}`} label="Question (Markdown)" value={q.prompt} onChange={(prompt) => onChange({ ...q, prompt })} rows={2} />

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Options · tick the correct {q.mode === "single" ? "one" : "ones"}</p>
        <ul className="space-y-2">
          {q.options.map((o, oi) => (
            <li key={o.id} className="flex items-center gap-3">
              <label className="flex w-16 shrink-0 items-center gap-2 font-mono text-sm">
                <input
                  type={q.mode === "single" ? "radio" : "checkbox"}
                  name={`q-correct-${index}`}
                  checked={q.correct.includes(o.id)}
                  onChange={() => toggleCorrect(o.id)}
                  className="h-4 w-4 accent-forest-700"
                  aria-label={`Option ${o.id.toUpperCase()} is correct`}
                />
                {o.id.toUpperCase()}
              </label>
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                {(["en", "uk"] as const).map((lang) => (
                  <input
                    key={lang}
                    aria-label={`Option ${o.id.toUpperCase()} (${lang})`}
                    placeholder={lang.toUpperCase()}
                    value={o.text[lang]}
                    onChange={(e) =>
                      onChange({ ...q, options: q.options.map((x, xi) => (xi === oi ? { ...x, text: { ...x.text, [lang]: e.target.value } } : x)) })
                    }
                    className={inputCls}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={`Remove option ${o.id.toUpperCase()}`}
                onClick={() => onChange({ ...q, options: q.options.filter((x) => x.id !== o.id), correct: q.correct.filter((c) => c !== o.id) })}
                className={`${btn.ghost} px-2`}
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={addOption} disabled={q.options.length >= LETTERS.length} className={`${btn.ghost} mt-2`}>
          <Plus aria-hidden className="h-4 w-4" /> Option
        </button>
      </div>
    </fieldset>
  );
}

export function SlideEditor({
  initial,
  meta,
  modules,
}: {
  initial: SlideFormState;
  meta?: { source: Source; updatedAt: string };
  modules: { id: string; title: string }[];
}) {
  const router = useRouter();
  const create = initial.id === null;
  const [s, setS] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const [runNote, setRunNote] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [running, setRunning] = useState(false);
  const set = <K extends keyof SlideFormState>(key: K, value: SlideFormState[K]) => setS((prev) => ({ ...prev, [key]: value }));
  const backHref = `/admin/courses/${s.course}`;

  async function save() {
    setStatus({ kind: "saving" });
    const res = await callAction(() => saveSlideAction({ ...s, slug: s.slug.trim() }));
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    setStatus({ kind: "saved", at: Date.now() });
    if (create && "id" in res && res.id) router.replace(`/admin/courses/${s.course}/slides/${res.id}`);
    else router.refresh();
  }

  async function remove() {
    if (!s.id || !confirm(`Delete slide "${s.slug}" and learners' progress on it? This can't be undone.`)) return;
    setStatus({ kind: "saving" });
    const res = await callAction(() => deleteSlideAction(s.id!));
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    router.replace(backHref);
  }

  async function runSolution() {
    setRunning(true);
    setRunNote(null);
    const res = await callAction(() => adminRunCSharpAction(s.solution));
    setRunning(false);
    if (!res.ok) return setRunNote({ tone: "error", text: res.errors.join(" ") });
    const run = res.run;
    if (run.status === "compile-error") return setRunNote({ tone: "error", text: `The solution doesn't compile:\n${run.messages}` });
    if (run.status === "unavailable") return setRunNote({ tone: "error", text: `Wandbox is unavailable (${run.reason}). Try again in a minute.` });
    set("expectedOutput", run.output);
    setRunNote({
      tone: run.runtimeError ? "error" : "ok",
      text: run.runtimeError ? `Output copied, but the program also failed:\n${run.runtimeError}` : "Expected output filled in from the solution.",
    });
  }

  const updateQuestion = (i: number, q: QuestionForm) => set("questions", s.questions.map((x, xi) => (xi === i ? q : x)));
  const moveQuestion = (i: number, dir: -1 | 1) => {
    const next = [...s.questions];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    set("questions", next);
  };

  return (
    <div className="space-y-6">
      {meta ? (
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <SourceBadge source={meta.source} />
          <span>Last updated {new Date(meta.updatedAt).toLocaleString()}</span>
          <Link href={`/courses/${s.course}/${initial.slug}`} target="_blank" className="inline-flex items-center gap-1 font-semibold text-forest-700 hover:underline">
            View on site <ExternalLink aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </p>
      ) : null}

      <Section title={`${KIND_LABEL[s.kind]} slide`}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Slug" htmlFor="slide-slug" hint={`URL: /courses/${s.course}/<slug>. Changing it breaks old links.`}>
            <input id="slide-slug" value={s.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Module" htmlFor="slide-module" hint={create ? undefined : "Moving a slide puts it at the end of the other module."}>
            <select id="slide-module" value={s.moduleId} onChange={(e) => set("moduleId", e.target.value)} className={inputCls}>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <LocalizedField id="slide-title" label="Title" value={s.title} onChange={(v) => set("title", v)} />
      </Section>

      <Section
        title={s.kind === "lecture" ? "Lecture text" : s.kind === "quiz" ? "Introduction (optional)" : "Task statement"}
        description="GitHub-flavoured Markdown. Use ```csharp fences for highlighted code."
      >
        <LocalizedField id="slide-body" label="Markdown" value={s.body} onChange={(v) => set("body", v)} rows={s.kind === "lecture" ? 22 : 10} markdown />
      </Section>

      {s.kind === "quiz" ? (
        <Section
          title="Questions"
          description="Each fully correct answer is worth one point, so the quiz is worth as many points as it has questions."
          actions={
            <button type="button" onClick={() => set("questions", [...s.questions, newQuestion(s.questions.length + 1)])} className={btn.secondary}>
              <Plus aria-hidden className="h-4 w-4" /> Question
            </button>
          }
        >
          {s.questions.map((q, i) => (
            <QuestionEditor
              key={i}
              q={q}
              index={i}
              total={s.questions.length}
              onChange={(next) => updateQuestion(i, next)}
              onMove={(dir) => moveQuestion(i, dir)}
              onRemove={() => set("questions", s.questions.filter((_, xi) => xi !== i))}
            />
          ))}
        </Section>
      ) : null}

      {s.kind === "practice" ? (
        <Section
          title="C# practice"
          description="Learners start from the starter code. A run passes when the program prints exactly the expected output (trailing spaces and blank lines are ignored)."
        >
          <Field label="Starter code" htmlFor="slide-starter">
            <CodeArea id="slide-starter" ariaLabel="Starter code" language="csharp" value={s.starter} onChange={(v) => set("starter", v)} rows={14} />
          </Field>
          <Field label="Reference solution" htmlFor="slide-solution" hint="Never shown to learners.">
            <CodeArea id="slide-solution" ariaLabel="Reference solution" language="csharp" value={s.solution} onChange={(v) => set("solution", v)} rows={14} />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={runSolution} disabled={running || !s.solution.trim()} className={btn.secondary}>
              <Play aria-hidden className="h-4 w-4" /> {running ? "Running on Wandbox…" : "Run solution and fill expected output"}
            </button>
            {runNote ? (
              <pre className={`whitespace-pre-wrap font-sans text-sm ${runNote.tone === "ok" ? "text-success" : "text-danger"}`}>{runNote.text}</pre>
            ) : null}
          </div>
          <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
            <Field label="Expected output" htmlFor="slide-expected" hint="Never shown to learners. Put it in the task statement if they should see it.">
              <textarea
                id="slide-expected"
                rows={6}
                value={s.expectedOutput}
                onChange={(e) => set("expectedOutput", e.target.value)}
                className={`${monoCls} resize-y`}
              />
            </Field>
            <Field label="Points" htmlFor="slide-score">
              <input
                id="slide-score"
                type="number"
                min={1}
                max={100}
                value={s.maxScore}
                onChange={(e) => set("maxScore", Number(e.target.value))}
                className={inputCls}
              />
            </Field>
          </div>
        </Section>
      ) : null}

      <SaveBar status={status} onSave={save}>
        <Link href={backHref} className={btn.ghost}>
          Back to course
        </Link>
        {!create ? (
          <button type="button" onClick={remove} className={btn.danger}>
            <Trash2 aria-hidden className="h-4 w-4" /> Delete slide
          </button>
        ) : null}
      </SaveBar>
    </div>
  );
}
