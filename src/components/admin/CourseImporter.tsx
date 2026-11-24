"use client";

import { CheckCircle2, Code2, Database, ListChecks } from "lucide-react";
import { useMemo, useState } from "react";
import { importCourseItemsAction } from "@/app/actions/admin";
import { Link, useRouter } from "@/i18n/navigation";
import type { ImportCourse, ImportSlide } from "@/lib/data/admin-import";
import { btn, callAction, Field, inputCls, Section, StatusMessage, type SaveStatus } from "./fields";
import { SkillsField } from "./TaskEditor";

/** A picked item: a quiz question ("<slide>/<question>") or a practice slide ("<slide>/"). */
const key = (slide: string, question: string | null) => `${slide}/${question ?? ""}`;

function slideKeys(s: ImportSlide) {
  return s.kind === "quiz"
    ? s.questions.filter((q) => !q.importedAs).map((q) => key(s.id, q.id))
    : s.importedAs
      ? []
      : [key(s.id, null)];
}

export function CourseImporter({
  courses,
  skillOptions,
  lectureOptions,
}: {
  courses: ImportCourse[];
  skillOptions: { slug: string; name: string }[];
  lectureOptions: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const [courseSlug, setCourseSlug] = useState(courses[0]?.slug ?? "");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [skills, setSkills] = useState([{ slug: "", weight: 1 }]);
  const [complexity, setComplexity] = useState(2);
  const [quizSeconds, setQuizSeconds] = useState(90);
  const [practiceMinutes, setPracticeMinutes] = useState(10);
  const [lecture, setLecture] = useState("");
  const [published, setPublished] = useState(false);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const [created, setCreated] = useState<{ slugs: string[]; skipped: number } | null>(null);

  const course = courses.find((c) => c.slug === courseSlug);
  const counts = useMemo(() => {
    let quiz = 0;
    let practice = 0;
    for (const k of picked) {
      if (k.endsWith("/")) practice++;
      else quiz++;
    }
    return { quiz, practice };
  }, [picked]);

  function toggle(keys: string[], on: boolean) {
    setPicked((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (on) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }

  async function runImport() {
    setStatus({ kind: "saving" });
    setCreated(null);
    const items = [...picked].map((k) => {
      const [slide, question] = k.split("/");
      return { slide, question: question || null };
    });
    const res = await callAction(() =>
      importCourseItemsAction({
        items,
        skills: skills.filter((s) => s.slug.trim()).map((s) => ({ slug: s.slug.trim(), weight: s.weight })),
        complexity,
        quizSeconds,
        practiceSeconds: practiceMinutes * 60,
        lecture: lecture || null,
        published,
      }),
    );
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    setStatus({ kind: "saved", at: Date.now() });
    setCreated({ slugs: res.created, skipped: res.skipped });
    setPicked(new Set());
    router.refresh();
  }

  if (!courses.length) return <p className="text-ink-muted">There are no courses yet.</p>;

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-ink-muted">
        Each quiz question becomes a quiz task and each practice becomes a coding task graded by its output (C# or PostgreSQL). The tasks are
        copies: editing the course later doesn&apos;t change them. Anything already copied is marked and can&apos;t be copied twice.
      </p>

      <Section title="1. Pick questions and practices">
        <Field label="Course" htmlFor="import-course" className="max-w-sm">
          <select id="import-course" value={courseSlug} onChange={(e) => setCourseSlug(e.target.value)} className={inputCls}>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
                {c.published ? "" : " (draft)"}
              </option>
            ))}
          </select>
        </Field>

        {course?.modules.length ? (
          <div className="space-y-4">
            {course.modules.map((m) => {
              const moduleKeys = m.slides.flatMap(slideKeys);
              const allOn = moduleKeys.length > 0 && moduleKeys.every((k) => picked.has(k));
              return (
                <fieldset key={m.id} className="rounded-xl border border-paper-3">
                  <legend className="sr-only">{m.title}</legend>
                  <div className="flex items-center justify-between gap-3 border-b border-paper-3 bg-paper px-4 py-2.5">
                    <h3 className="font-semibold text-forest-800">{m.title}</h3>
                    <label className="flex items-center gap-2 text-sm text-ink-muted">
                      <input
                        type="checkbox"
                        checked={allOn}
                        disabled={!moduleKeys.length}
                        onChange={(e) => toggle(moduleKeys, e.target.checked)}
                      />
                      Select all
                    </label>
                  </div>
                  <ul className="divide-y divide-paper-3">
                    {m.slides.map((s) => (
                      <SlideRow key={s.id} slide={s} picked={picked} onToggle={toggle} />
                    ))}
                  </ul>
                </fieldset>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">This course has no quizzes or practices.</p>
        )}
      </Section>

      <Section title="2. Settings for the new tasks" description="Applied to every imported task; you can change each one later in its editor.">
        <SkillsField value={skills} onChange={setSkills} options={skillOptions} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Complexity" htmlFor="import-complexity" hint="1 (easy) – 5 (hard)">
            <input
              id="import-complexity"
              type="number"
              min={1}
              max={5}
              value={complexity}
              onChange={(e) => setComplexity(Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Quiz time (seconds)" htmlFor="import-quiz-seconds">
            <input
              id="import-quiz-seconds"
              type="number"
              min={10}
              max={3600}
              value={quizSeconds}
              onChange={(e) => setQuizSeconds(Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Practice time (minutes)" htmlFor="import-practice-minutes">
            <input
              id="import-practice-minutes"
              type="number"
              min={1}
              max={240}
              value={practiceMinutes}
              onChange={(e) => setPracticeMinutes(Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Help lecture" htmlFor="import-lecture" hint="Empty: the first skill's lecture">
            <select id="import-lecture" value={lecture} onChange={(e) => setLecture(e.target.value)} className={inputCls}>
              <option value="">Automatic</option>
              {lectureOptions.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publish right away (otherwise they&apos;re saved as unpublished drafts to review first)
        </label>
      </Section>

      {created ? (
        <div role="status" className="rounded-2xl border border-success/30 bg-success-soft px-5 py-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-success">
            <CheckCircle2 aria-hidden className="h-4 w-4" />
            Created {created.slugs.length} task{created.slugs.length === 1 ? "" : "s"}
            {created.skipped ? `, skipped ${created.skipped} already imported` : ""}.
          </p>
          {created.slugs.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {created.slugs.map((slug) => (
                <li key={slug}>
                  <Link href={`/admin/tasks/${slug}`} className="rounded-full bg-white px-3 py-1 font-mono text-xs text-forest-700 hover:underline">
                    {slug}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-5 border-t border-paper-3 bg-paper/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={runImport} disabled={status.kind === "saving" || picked.size === 0} className={btn.primary}>
            Import {picked.size || ""} item{picked.size === 1 ? "" : "s"}
          </button>
          <span className="text-sm text-ink-muted">
            {counts.quiz} quiz question{counts.quiz === 1 ? "" : "s"} · {counts.practice} practice{counts.practice === 1 ? "" : "s"}
          </span>
          {picked.size ? (
            <button type="button" onClick={() => setPicked(new Set())} className={btn.ghost}>
              Clear
            </button>
          ) : null}
          <div className="ml-auto min-w-0">{status.kind === "error" || status.kind === "saving" ? <StatusMessage status={status} /> : null}</div>
        </div>
      </div>
    </div>
  );
}

function ImportedTag({ slug }: { slug: string }) {
  return (
    <Link href={`/admin/tasks/${slug}`} className="shrink-0 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success hover:underline">
      Imported
    </Link>
  );
}

function SlideRow({
  slide: s,
  picked,
  onToggle,
}: {
  slide: ImportSlide;
  picked: Set<string>;
  onToggle: (keys: string[], on: boolean) => void;
}) {
  if (s.kind === "practice") {
    const k = key(s.id, null);
    const Icon = s.language === "sql" ? Database : Code2;
    return (
      <li className="flex items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          id={`pick-${k}`}
          checked={picked.has(k)}
          disabled={!!s.importedAs}
          onChange={(e) => onToggle([k], e.target.checked)}
        />
        <label htmlFor={`pick-${k}`} className="flex min-w-0 flex-1 items-center gap-2">
          <Icon aria-hidden className="h-4 w-4 shrink-0 text-gold-600" />
          <span className="truncate font-medium">{s.title}</span>
          <span className="shrink-0 rounded-full bg-paper-2 px-2 py-0.5 text-xs text-ink-muted">
            {s.language === "sql" ? "PostgreSQL practice" : "C# practice"}
          </span>
        </label>
        {s.importedAs ? <ImportedTag slug={s.importedAs} /> : null}
      </li>
    );
  }

  const open = s.questions.filter((q) => !q.importedAs).map((q) => key(s.id, q.id));
  const allOn = open.length > 0 && open.every((k) => picked.has(k));
  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          aria-label={`All questions of ${s.title}`}
          checked={allOn}
          disabled={!open.length}
          onChange={(e) => onToggle(open, e.target.checked)}
        />
        <ListChecks aria-hidden className="h-4 w-4 shrink-0 text-gold-600" />
        <span className="font-medium">{s.title}</span>
        <span className="rounded-full bg-paper-2 px-2 py-0.5 text-xs text-ink-muted">
          Quiz · {s.questions.length} question{s.questions.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="mt-2 space-y-1.5 pl-7">
        {s.questions.map((q) => {
          const k = key(s.id, q.id);
          return (
            <li key={q.id} className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                id={`pick-${k}`}
                className="mt-0.5"
                checked={picked.has(k)}
                disabled={!!q.importedAs || q.options < 2}
                onChange={(e) => onToggle([k], e.target.checked)}
              />
              <label htmlFor={`pick-${k}`} className="min-w-0 flex-1 text-ink-muted">
                {q.prompt || <em>No question text</em>}
              </label>
              {q.importedAs ? <ImportedTag slug={q.importedAs} /> : null}
            </li>
          );
        })}
      </ul>
    </li>
  );
}
