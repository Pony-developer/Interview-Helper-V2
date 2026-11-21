"use client";

import dynamic from "next/dynamic";
import { Eye, EyeOff, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteTaskAction, saveTaskAction, setTaskPublishedAction } from "@/app/actions/admin";
import { useRouter } from "@/i18n/navigation";
import type { TaskDef } from "@/lib/content/schema";
import { PRACTICE_TEMPLATES } from "@/lib/admin/templates";
import { countTests, FRAMEWORK_CONFIG, FRAMEWORKS, type Framework, type PracticePayload } from "@/lib/playground/frameworks";
import {
  btn,
  callAction,
  CodeArea,
  Field,
  inputCls,
  LocalizedField,
  SaveBar,
  Section,
  SourceBadge,
  type Loc,
  type SaveStatus,
} from "./fields";

const CodingGround = dynamic(() => import("@/components/playground/CodingGround").then((m) => m.CodingGround), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse rounded-2xl bg-paper-2" />,
});

const OPTION_IDS = "abcdef";

export type FileRow = {
  path: string;
  starter: string;
  solution: string;
  visible: boolean;
};

export type TaskFormState = {
  slug: string;
  kind: "quiz" | "practice";
  complexity: number;
  estSeconds: number;
  title: Loc;
  prompt: Loc;
  explanation: Loc;
  lecture: string;
  published: boolean;
  skills: { slug: string; weight: number }[];
  // quiz
  mode: "single" | "multi";
  code: string;
  codeLanguage: string;
  options: { id: string; text: Loc; code: string }[];
  correct: string[];
  // practice
  framework: Framework;
  files: FileRow[];
  activeFile: string;
  tests: string;
  dependencies: string;
};

export type TaskMeta = {
  source: "seed" | "admin";
  usedInInterviews: boolean;
  updatedAt: string;
};

function toTaskDef(s: TaskFormState): TaskDef {
  const base = {
    slug: s.slug.trim(),
    skills: s.skills.filter((k) => k.slug.trim()).map((k) => ({ slug: k.slug.trim(), weight: k.weight })),
    complexity: s.complexity,
    estSeconds: s.estSeconds,
    title: s.title,
    prompt: s.prompt,
    explanation: s.explanation,
    lecture: s.lecture.trim() || undefined,
  };
  if (s.kind === "quiz") {
    return {
      ...base,
      kind: "quiz",
      mode: s.mode,
      code: s.code.trim() ? s.code : undefined,
      codeLanguage: s.codeLanguage || "ts",
      options: s.options.map((o) => ({
        id: o.id,
        text: o.text,
        code: o.code.trim() ? o.code : undefined,
      })),
      correct: s.correct,
    };
  }
  const files = Object.fromEntries(s.files.map((f) => [f.path.trim(), f.starter]));
  const solution = Object.fromEntries(s.files.filter((f) => f.solution.trim()).map((f) => [f.path.trim(), f.solution]));
  const visible = s.files.filter((f) => f.visible).map((f) => f.path.trim());
  const dependencies = Object.fromEntries(
    s.dependencies
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const at = l.lastIndexOf("@");
        return at > 0 ? [l.slice(0, at), l.slice(at + 1)] : [l, "latest"];
      }),
  );
  return {
    ...base,
    kind: "practice",
    framework: s.framework,
    files,
    solution,
    tests: s.tests,
    visibleFiles: visible.length === s.files.length ? undefined : visible,
    activeFile: s.activeFile || undefined,
    dependencies: Object.keys(dependencies).length ? dependencies : undefined,
  };
}

function practicePayload(s: TaskFormState): PracticePayload {
  const def = toTaskDef(s);
  if (def.kind !== "practice") throw new Error("not a practice task");
  return {
    framework: def.framework,
    files: def.files,
    visibleFiles: def.visibleFiles,
    activeFile: def.activeFile,
    tests: def.tests,
    testCount: countTests(def.tests),
    dependencies: def.dependencies,
  };
}

export function TaskEditor({
  initial,
  create,
  meta,
  skillOptions,
  lectureOptions,
}: {
  initial: TaskFormState;
  create: boolean;
  meta?: TaskMeta;
  skillOptions: { slug: string; name: string }[];
  lectureOptions: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const [published, setPublished] = useState(initial.published);
  const set = <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => setS((prev) => ({ ...prev, [key]: value }));

  async function save() {
    setStatus({ kind: "saving" });
    const res = await callAction(() => saveTaskAction({ create, published, task: toTaskDef(s) }));
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    setStatus({ kind: "saved", at: Date.now() });
    if (create) router.replace(`/admin/tasks/${s.slug.trim()}`);
    else router.refresh();
  }

  async function togglePublished() {
    if (create) return setPublished((p) => !p);
    setStatus({ kind: "saving" });
    const res = await callAction(() => setTaskPublishedAction(s.slug, !published));
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    setPublished(!published);
    setStatus({ kind: "saved", at: Date.now() });
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete task "${s.slug}" permanently? This can't be undone.`)) return;
    setStatus({ kind: "saving" });
    const res = await callAction(() => deleteTaskAction(s.slug));
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    router.replace("/admin/tasks");
  }

  return (
    <div className="space-y-6">
      {meta ? (
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <SourceBadge source={meta.source} />
          <span>Last updated {new Date(meta.updatedAt).toLocaleString()}</span>
          {meta.source === "seed" ? <span>· Saving here takes it over from the repository seed.</span> : null}
        </p>
      ) : null}

      <Section title="Basics">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Slug"
            htmlFor="slug"
            hint={create ? "kebab-case, unique, can't change later" : "Can't be changed"}
            className="lg:col-span-2"
          >
            <input
              id="slug"
              value={s.slug}
              disabled={!create}
              onChange={(e) => set("slug", e.target.value)}
              className={inputCls}
              placeholder="react-use-effect-cleanup"
            />
          </Field>
          <Field label="Complexity" htmlFor="complexity" hint="1 (easy) – 5 (hard)">
            <select id="complexity" value={s.complexity} onChange={(e) => set("complexity", Number(e.target.value))} className={inputCls}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Expected time (seconds)" htmlFor="est">
            <input
              id="est"
              type="number"
              min={10}
              step={10}
              value={s.estSeconds}
              onChange={(e) => set("estSeconds", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>

        <SkillsField value={s.skills} onChange={(v) => set("skills", v)} options={skillOptions} />

        <Field label="Help lecture" htmlFor="lecture" hint='Opened by "Ask for help". Empty = the first skill’s lecture.'>
          <select id="lecture" value={s.lecture} onChange={(e) => set("lecture", e.target.value)} className={inputCls}>
            <option value="">Automatic</option>
            {lectureOptions.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.title} ({l.slug})
              </option>
            ))}
          </select>
        </Field>

        <LocalizedField id="title" label="Title" value={s.title} onChange={(v) => set("title", v)} />
        <LocalizedField id="prompt" label="Prompt (Markdown)" value={s.prompt} onChange={(v) => set("prompt", v)} rows={9} markdown />
      </Section>

      {s.kind === "quiz" ? <QuizFields s={s} set={set} /> : <PracticeFields s={s} set={set} setS={setS} create={create} />}

      <Section title="Explanation" description="Markdown shown on the results page after the interview.">
        <LocalizedField id="explanation" label="Explanation" value={s.explanation} onChange={(v) => set("explanation", v)} rows={7} markdown />
      </Section>

      <SaveBar status={status} onSave={save}>
        <button type="button" onClick={togglePublished} className={btn.secondary} aria-pressed={published}>
          {published ? <Eye aria-hidden className="h-4 w-4" /> : <EyeOff aria-hidden className="h-4 w-4" />}
          {published ? "Published" : "Unpublished"}
        </button>
        {!create && meta && !meta.usedInInterviews ? (
          <button type="button" onClick={remove} className={btn.danger}>
            <Trash2 aria-hidden className="h-4 w-4" /> Delete
          </button>
        ) : null}
        {!create && meta?.usedInInterviews ? (
          <span className="text-xs text-ink-soft">Used in interviews: unpublish instead of deleting.</span>
        ) : null}
      </SaveBar>
    </div>
  );
}

function SkillsField({
  value,
  onChange,
  options,
}: {
  value: { slug: string; weight: number }[];
  onChange: (v: { slug: string; weight: number }[]) => void;
  options: { slug: string; name: string }[];
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-ink">Skills</legend>
      <datalist id="skill-options">
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
          </option>
        ))}
      </datalist>
      <ul className="space-y-2">
        {value.map((row, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              list="skill-options"
              aria-label={`Skill ${i + 1}`}
              value={row.slug}
              placeholder="skill slug, e.g. react"
              onChange={(e) => onChange(value.map((r, j) => (j === i ? { ...r, slug: e.target.value } : r)))}
              className={`${inputCls} flex-1`}
            />
            <label className="flex items-center gap-2 text-xs text-ink-muted">
              weight
              <input
                type="number"
                min={0.1}
                max={1}
                step={0.1}
                value={row.weight}
                onChange={(e) => onChange(value.map((r, j) => (j === i ? { ...r, weight: Number(e.target.value) } : r)))}
                className={`${inputCls} w-20`}
              />
            </label>
            <button
              type="button"
              aria-label={`Remove skill ${row.slug || i + 1}`}
              disabled={value.length === 1}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className={btn.ghost}
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-ink-soft">The first skill is the main one. Weight 1 = fully about that skill.</p>
      <button type="button" onClick={() => onChange([...value, { slug: "", weight: 0.5 }])} className={`${btn.ghost} mt-2`}>
        <Plus aria-hidden className="h-4 w-4" /> Add skill
      </button>
    </fieldset>
  );
}

type SetFn = <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => void;

function QuizFields({ s, set }: { s: TaskFormState; set: SetFn }) {
  const nextId = OPTION_IDS.split("").find((id) => !s.options.some((o) => o.id === id));

  function toggleCorrect(id: string) {
    if (s.mode === "single") return set("correct", [id]);
    set("correct", s.correct.includes(id) ? s.correct.filter((c) => c !== id) : [...s.correct, id].sort());
  }

  return (
    <Section title="Quiz" description="Answers are stored privately and are never sent to the browser during an interview.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Answer mode" htmlFor="mode">
          <select
            id="mode"
            value={s.mode}
            onChange={(e) => {
              const mode = e.target.value as "single" | "multi";
              set("mode", mode);
              if (mode === "single" && s.correct.length > 1) set("correct", s.correct.slice(0, 1));
            }}
            className={inputCls}
          >
            <option value="single">Single choice</option>
            <option value="multi">Multiple choice</option>
          </select>
        </Field>
        <Field label="Code language" htmlFor="code-lang" hint="For syntax highlighting: ts, js, tsx, html, css, bash…">
          <input id="code-lang" value={s.codeLanguage} onChange={(e) => set("codeLanguage", e.target.value)} className={inputCls} />
        </Field>
      </div>
      <Field label="Code snippet (optional)" htmlFor="quiz-code">
        <CodeArea id="quiz-code" language={s.codeLanguage} value={s.code} onChange={(v) => set("code", v)} rows={6} />
      </Field>

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-ink">Options — mark the correct {s.mode === "single" ? "one" : "ones"}</legend>
        <ul className="space-y-4">
          {s.options.map((o, i) => (
            <li
              key={o.id}
              className={`rounded-xl border p-4 ${s.correct.includes(o.id) ? "border-success/50 bg-success-soft/40" : "border-paper-3"}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-forest-700 font-mono text-sm font-bold text-white">
                  {o.id}
                </span>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type={s.mode === "single" ? "radio" : "checkbox"}
                    name="correct"
                    checked={s.correct.includes(o.id)}
                    onChange={() => toggleCorrect(o.id)}
                    className="h-4 w-4 accent-forest-700"
                  />
                  Correct
                </label>
                <button
                  type="button"
                  aria-label={`Remove option ${o.id}`}
                  disabled={s.options.length <= 2}
                  onClick={() => {
                    set(
                      "options",
                      s.options.filter((_, j) => j !== i),
                    );
                    set(
                      "correct",
                      s.correct.filter((c) => c !== o.id),
                    );
                  }}
                  className={`${btn.ghost} ml-auto`}
                >
                  <Trash2 aria-hidden className="h-4 w-4" />
                </button>
              </div>
              <LocalizedField
                id={`opt-${o.id}`}
                label={`Option ${o.id} text`}
                value={o.text}
                onChange={(text) =>
                  set(
                    "options",
                    s.options.map((x, j) => (j === i ? { ...x, text } : x)),
                  )
                }
              />
              <details className="mt-3" open={Boolean(o.code)}>
                <summary className="cursor-pointer text-xs font-semibold text-ink-muted">Option code (optional)</summary>
                <div className="mt-2">
                  <CodeArea
                    ariaLabel={`Option ${o.id} code`}
                    language={s.codeLanguage}
                    value={o.code}
                    rows={3}
                    onChange={(code) =>
                      set(
                        "options",
                        s.options.map((x, j) => (j === i ? { ...x, code } : x)),
                      )
                    }
                  />
                </div>
              </details>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={!nextId}
          onClick={() => nextId && set("options", [...s.options, { id: nextId, text: { en: "", uk: "" }, code: "" }])}
          className={`${btn.ghost} mt-3`}
        >
          <Plus aria-hidden className="h-4 w-4" /> Add option
        </button>
        <p className="mt-1 text-xs text-ink-soft">2–6 options. Option ids stay fixed so past answers keep matching.</p>
      </fieldset>
    </Section>
  );
}

function PracticeFields({
  s,
  set,
  setS,
  create,
}: {
  s: TaskFormState;
  set: SetFn;
  setS: (fn: (prev: TaskFormState) => TaskFormState) => void;
  create: boolean;
}) {
  const [tab, setTab] = useState(0);
  const [ground, setGround] = useState<{
    mode: "starter" | "solution";
    key: number;
  } | null>(null);
  const file = s.files[tab] ?? s.files[0];
  const testCount = useMemo(() => countTests(s.tests), [s.tests]);

  function applyTemplate(id: string) {
    const t = PRACTICE_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    if (!confirm(`Replace the files and tests with the ${t.label} template?`)) return;
    const visible = t.visibleFiles ?? Object.keys(t.files);
    setS((prev) => ({
      ...prev,
      framework: t.framework,
      files: Object.entries(t.files).map(([path, starter]) => ({
        path,
        starter,
        solution: "",
        visible: visible.includes(path),
      })),
      activeFile: t.activeFile ?? "",
      tests: t.tests,
    }));
    setTab(0);
    setGround(null);
  }

  function updateFile(patch: Partial<FileRow>) {
    set(
      "files",
      s.files.map((f, j) => (j === tab ? { ...f, ...patch } : f)),
    );
  }

  const groundPayload = (() => {
    try {
      return practicePayload(s);
    } catch {
      return null;
    }
  })();
  const solutionFiles = Object.fromEntries(s.files.map((f) => [f.path, f.solution.trim() ? f.solution : f.starter]));

  return (
    <Section
      title="Coding task"
      description="Starter files are what the candidate edits. Solution files are shown on the results page; leave a solution empty for files the candidate shouldn't change."
      actions={
        <label className="flex items-center gap-2 text-sm">
          <span className="text-ink-muted">Template</span>
          <select
            aria-label="Load a starter template"
            value=""
            onChange={(e) => applyTemplate(e.target.value)}
            className={`${inputCls} w-auto`}
          >
            <option value="">Load…</option>
            {PRACTICE_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Framework" htmlFor="framework" hint={create ? "HTML/CSS tasks use JavaScript with an index.html" : undefined}>
          <select id="framework" value={s.framework} onChange={(e) => set("framework", e.target.value as Framework)} className={inputCls}>
            {FRAMEWORKS.map((f) => (
              <option key={f} value={f}>
                {FRAMEWORK_CONFIG[f].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Extra dependencies" htmlFor="deps" hint="One per line: name@version, e.g. rxjs@6.6.3">
          <textarea
            id="deps"
            rows={2}
            value={s.dependencies}
            onChange={(e) => set("dependencies", e.target.value)}
            className={`${inputCls} font-mono text-[13px]`}
          />
        </Field>
      </div>

      <div>
        <div role="tablist" aria-label="Files" className="flex flex-wrap items-center gap-1 border-b border-paper-3">
          {s.files.map((f, i) => (
            <button
              key={i}
              role="tab"
              type="button"
              aria-selected={i === tab}
              onClick={() => setTab(i)}
              className={`-mb-px rounded-t-lg border px-3 py-1.5 font-mono text-xs ${
                i === tab
                  ? "border-paper-3 border-b-white bg-white font-semibold text-forest-800"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {f.path || "(unnamed)"}
              {!f.visible ? <span className="ml-1 text-ink-soft">(hidden)</span> : null}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              set("files", [
                ...s.files,
                {
                  path: "/src/new-file.ts",
                  starter: "",
                  solution: "",
                  visible: true,
                },
              ]);
              setTab(s.files.length);
            }}
            className={`${btn.ghost} px-2 py-1 text-xs`}
          >
            <Plus aria-hidden className="h-3.5 w-3.5" /> File
          </button>
        </div>

        {file ? (
          <div role="tabpanel" className="space-y-4 pt-4">
            <div className="flex flex-wrap items-end gap-4">
              <Field label="Path" htmlFor="file-path" hint="Absolute sandbox path, e.g. /src/debounce.ts" className="min-w-64 flex-1">
                <input
                  id="file-path"
                  value={file.path}
                  onChange={(e) => {
                    const path = e.target.value;
                    if (s.activeFile === file.path) set("activeFile", path);
                    updateFile({ path });
                  }}
                  className={`${inputCls} font-mono`}
                />
              </Field>
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={file.visible}
                  onChange={(e) => updateFile({ visible: e.target.checked })}
                  className="h-4 w-4 accent-forest-700"
                />
                Visible tab
              </label>
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input
                  type="radio"
                  name="active-file"
                  checked={s.activeFile === file.path}
                  onChange={() => set("activeFile", file.path)}
                  className="h-4 w-4 accent-forest-700"
                />
                Opens first
              </label>
              <button
                type="button"
                disabled={s.files.length <= 1}
                onClick={() => {
                  set(
                    "files",
                    s.files.filter((_, j) => j !== tab),
                  );
                  setTab(0);
                }}
                className={`${btn.danger} mb-0.5`}
              >
                <Trash2 aria-hidden className="h-4 w-4" /> Remove file
              </button>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <Field label="Starter code" htmlFor="file-starter">
                <CodeArea id="file-starter" language={file.path} value={file.starter} onChange={(starter) => updateFile({ starter })} rows={16} />
              </Field>
              <Field label="Reference solution" htmlFor="file-solution" hint="Empty = not part of the solution">
                <CodeArea id="file-solution" language={file.path} value={file.solution} onChange={(solution) => updateFile({ solution })} rows={16} />
              </Field>
            </div>
          </div>
        ) : null}
      </div>

      <Field
        label={`Tests (${testCount} ${testCount === 1 ? "case" : "cases"})`}
        htmlFor="tests"
        hint={
          <>
            Built-in kit: <code>describe, it, expect, screen, user, waitFor</code> from <code>./test-kit</code>. Import user code relative
            to <code>/assay/</code>, e.g. <code>{'import { sum } from "../src/sum"'}</code>.
          </>
        }
      >
        <CodeArea id="tests" language="tsx" value={s.tests} onChange={(v) => set("tests", v)} rows={14} />
      </Field>

      <div className="rounded-xl border border-dashed border-paper-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="mr-auto text-sm font-semibold text-ink">Try it in the coding ground</p>
          <button
            type="button"
            disabled={!groundPayload}
            onClick={() => setGround({ mode: "solution", key: Date.now() })}
            className={btn.secondary}
          >
            Run with solution
          </button>
          <button
            type="button"
            disabled={!groundPayload}
            onClick={() => setGround({ mode: "starter", key: Date.now() })}
            className={btn.secondary}
          >
            Run with starter
          </button>
          {ground ? (
            <button type="button" onClick={() => setGround(null)} className={btn.ghost}>
              Close
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          The solution should pass every test and the starter should fail some. Re-open after editing to load your latest changes.
        </p>
        {ground && groundPayload ? (
          <div className="mt-4">
            <CodingGround
              key={ground.key}
              practice={groundPayload}
              initialFiles={ground.mode === "solution" ? solutionFiles : groundPayload.files}
            />
          </div>
        ) : null}
      </div>
    </Section>
  );
}
