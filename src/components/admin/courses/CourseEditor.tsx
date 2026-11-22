"use client";

import { ExternalLink, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { deleteCourseAction, saveCourseAction } from "@/app/actions/admin-courses";
import { Link, useRouter } from "@/i18n/navigation";
import { emptyLoc, type CourseFormState, type Source } from "@/lib/admin/course-forms";
import { btn, callAction, Field, inputCls, LocalizedField, SaveBar, Section, SourceBadge, type SaveStatus } from "../fields";

export function CourseEditor({
  initial,
  create,
  meta,
}: {
  initial: CourseFormState;
  create: boolean;
  meta?: { source: Source; updatedAt: string };
}) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const set = <K extends keyof CourseFormState>(key: K, value: CourseFormState[K]) => setS((prev) => ({ ...prev, [key]: value }));

  async function save() {
    setStatus({ kind: "saving" });
    const res = await callAction(() => saveCourseAction({ create, course: { ...s, slug: s.slug.trim() } }));
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    setStatus({ kind: "saved", at: Date.now() });
    if (create) router.replace(`/admin/courses/${s.slug.trim()}`);
    else router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete course "${s.slug}" with all its modules, slides and every learner's progress in it? This can't be undone.`)) return;
    setStatus({ kind: "saving" });
    const res = await callAction(() => deleteCourseAction(s.slug));
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    router.replace("/admin/courses");
  }

  return (
    <div className="space-y-6">
      {meta ? (
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <SourceBadge source={meta.source} />
          <span>Last updated {new Date(meta.updatedAt).toLocaleString()}</span>
          <Link href={`/courses/${s.slug}`} target="_blank" className="inline-flex items-center gap-1 font-semibold text-forest-700 hover:underline">
            Open course <ExternalLink aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </p>
      ) : null}

      <Section title="Course">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Slug" htmlFor="course-slug" hint={create ? "Becomes the URL: /courses/<slug>" : "Can't be changed"}>
            <input id="course-slug" value={s.slug} disabled={!create} onChange={(e) => set("slug", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Position on /courses" htmlFor="course-order" hint="Lower comes first">
            <input
              id="course-order"
              type="number"
              min={0}
              max={1000}
              value={s.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Visibility" htmlFor="course-published">
            <label className="flex h-[38px] items-center gap-2 text-sm">
              <input id="course-published" type="checkbox" checked={s.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-forest-700" />
              Published (visible to learners)
            </label>
          </Field>
        </div>
        <LocalizedField id="course-title" label="Title" value={s.title} onChange={(v) => set("title", v)} />
        <LocalizedField id="course-summary" label="Summary" value={s.summary} onChange={(v) => set("summary", v)} rows={3} />
      </Section>

      <Section
        title="Topics"
        description="The outline shown on the course card at /courses."
        actions={
          <button type="button" onClick={() => set("topics", [...s.topics, emptyLoc()])} className={btn.secondary}>
            <Plus aria-hidden className="h-4 w-4" /> Topic
          </button>
        }
      >
        {s.topics.length === 0 ? <p className="text-sm text-ink-muted">No topics yet.</p> : null}
        <ol className="space-y-3">
          {s.topics.map((topic, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-2 w-6 shrink-0 font-mono text-xs text-gold-700">{String(i + 1).padStart(2, "0")}</span>
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                {(["en", "uk"] as const).map((lang) => (
                  <input
                    key={lang}
                    aria-label={`Topic ${i + 1} (${lang})`}
                    placeholder={lang.toUpperCase()}
                    value={topic[lang]}
                    onChange={(e) => set("topics", s.topics.map((t, j) => (j === i ? { ...t, [lang]: e.target.value } : t)))}
                    className={inputCls}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={`Remove topic ${i + 1}`}
                onClick={() => set("topics", s.topics.filter((_, j) => j !== i))}
                className={`${btn.ghost} px-2`}
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ol>
      </Section>

      <SaveBar status={status} onSave={save}>
        {!create ? (
          <button type="button" onClick={remove} className={btn.danger}>
            <Trash2 aria-hidden className="h-4 w-4" /> Delete course
          </button>
        ) : null}
      </SaveBar>
    </div>
  );
}
