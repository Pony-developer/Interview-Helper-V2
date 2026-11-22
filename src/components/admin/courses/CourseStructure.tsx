"use client";

import { ArrowDown, ArrowUp, CircleHelp, Code2, ExternalLink, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteModuleAction, deleteSlideAction, reorderAction, saveModuleAction } from "@/app/actions/admin-courses";
import { Link, useRouter } from "@/i18n/navigation";
import { emptyLoc, type AdminCourseStructure, type Loc, type SlideKind } from "@/lib/admin/course-forms";
import { btn, callAction, Field, inputCls, Section, SourceBadge, StatusMessage, type SaveStatus } from "../fields";

const KIND_ICON = { lecture: FileText, quiz: CircleHelp, practice: Code2 } as const;
const KIND_LABEL: Record<SlideKind, string> = { lecture: "Lecture", quiz: "Quiz", practice: "Practice" };

function swap<T>(list: T[], i: number, j: number) {
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Inline form for creating or renaming a module. */
function ModuleForm({
  course,
  initial,
  onDone,
}: {
  course: string;
  initial?: { id: string; slug: string; title: Loc };
  onDone: () => void;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState<Loc>(initial?.title ?? emptyLoc());
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });

  async function save() {
    setStatus({ kind: "saving" });
    const res = await callAction(() => saveModuleAction({ id: initial?.id ?? null, course, slug: slug.trim(), title }));
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    setStatus({ kind: "idle" });
    onDone();
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border border-gold-300 bg-gold-100/40 p-4">
      <div className="grid gap-3 sm:grid-cols-[12rem_1fr_1fr]">
        <Field label="Slug" htmlFor={`m-slug-${initial?.id ?? "new"}`}>
          <input id={`m-slug-${initial?.id ?? "new"}`} value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls} />
        </Field>
        {(["en", "uk"] as const).map((lang) => (
          <Field key={lang} label={`Title (${lang})`} htmlFor={`m-title-${lang}-${initial?.id ?? "new"}`}>
            <input
              id={`m-title-${lang}-${initial?.id ?? "new"}`}
              value={title[lang]}
              onChange={(e) => setTitle({ ...title, [lang]: e.target.value })}
              className={inputCls}
            />
          </Field>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} disabled={status.kind === "saving"} className={btn.primary}>
          {initial ? "Save module" : "Add module"}
        </button>
        <button type="button" onClick={onDone} className={btn.ghost}>
          Cancel
        </button>
        <StatusMessage status={status} />
      </div>
    </div>
  );
}

export function CourseStructure({ data }: { data: AdminCourseStructure }) {
  const router = useRouter();
  const course = data.course.slug;
  const [editing, setEditing] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });

  async function run(fn: () => Promise<{ ok: true } | { ok: false; errors: string[] }>) {
    setStatus({ kind: "saving" });
    const res = await callAction(fn);
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    setStatus({ kind: "idle" });
    router.refresh();
  }

  const moduleIds = data.modules.map((m) => m.id);

  return (
    <Section
      title="Modules and slides"
      description="Learners go through the modules top to bottom. Reordering or editing a slide marks it as edited in the admin panel, so the repository seed won't overwrite it."
      actions={
        <button type="button" onClick={() => setEditing("new")} className={btn.secondary}>
          <Plus aria-hidden className="h-4 w-4" /> Module
        </button>
      }
    >
      <StatusMessage status={status} />
      {editing === "new" ? <ModuleForm course={course} onDone={() => setEditing(null)} /> : null}
      {data.modules.length === 0 && editing !== "new" ? <p className="text-sm text-ink-muted">No modules yet. Add the first one.</p> : null}

      <ol className="space-y-5">
        {data.modules.map((m, mi) => (
          <li key={m.id} className="overflow-hidden rounded-xl border border-paper-3">
            {editing === m.id ? (
              <div className="p-3">
                <ModuleForm course={course} initial={m} onDone={() => setEditing(null)} />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 bg-paper-2/70 px-4 py-3">
                <span className="font-mono text-xs text-gold-700">{String(mi + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-forest-800">{m.title.en || m.slug}</p>
                  <p className="font-mono text-xs text-ink-soft">
                    {m.slug} · {m.title.uk}
                  </p>
                </div>
                <SourceBadge source={m.source} />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Move module ${m.slug} up`}
                    disabled={mi === 0}
                    onClick={() => run(() => reorderAction("module", swap(moduleIds, mi, mi - 1)))}
                    className={`${btn.ghost} px-2`}
                  >
                    <ArrowUp aria-hidden className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move module ${m.slug} down`}
                    disabled={mi === data.modules.length - 1}
                    onClick={() => run(() => reorderAction("module", swap(moduleIds, mi, mi + 1)))}
                    className={`${btn.ghost} px-2`}
                  >
                    <ArrowDown aria-hidden className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Edit module ${m.slug}`} onClick={() => setEditing(m.id)} className={`${btn.ghost} px-2`}>
                    <Pencil aria-hidden className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete module ${m.slug}`}
                    onClick={() => {
                      if (confirm(`Delete module "${m.slug}" with its ${m.slides.length} slide(s) and learners' progress on them? This can't be undone.`))
                        run(() => deleteModuleAction(m.id));
                    }}
                    className={`${btn.ghost} px-2 text-danger hover:bg-danger-soft`}
                  >
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <ul className="divide-y divide-paper-3">
              {m.slides.map((s, si) => {
                const Icon = KIND_ICON[s.kind];
                const ids = m.slides.map((x) => x.id);
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 bg-white px-4 py-2.5 text-sm">
                    <Icon aria-hidden className="h-4 w-4 shrink-0 text-ink-soft" />
                    <span className="sr-only">{KIND_LABEL[s.kind]}:</span>
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/courses/${course}/slides/${s.id}`} className="font-semibold text-forest-800 hover:underline">
                        {s.title}
                      </Link>
                      <span className="ml-2 font-mono text-xs text-ink-soft">{s.slug}</span>
                    </div>
                    {s.maxScore > 0 ? <span className="font-mono text-xs text-ink-soft">{s.maxScore} pt</span> : null}
                    <SourceBadge source={s.source} />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Move slide ${s.slug} up`}
                        disabled={si === 0}
                        onClick={() => run(() => reorderAction("slide", swap(ids, si, si - 1)))}
                        className={`${btn.ghost} px-2`}
                      >
                        <ArrowUp aria-hidden className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move slide ${s.slug} down`}
                        disabled={si === m.slides.length - 1}
                        onClick={() => run(() => reorderAction("slide", swap(ids, si, si + 1)))}
                        className={`${btn.ghost} px-2`}
                      >
                        <ArrowDown aria-hidden className="h-4 w-4" />
                      </button>
                      <Link href={`/admin/courses/${course}/slides/${s.id}`} aria-label={`Edit slide ${s.slug}`} className={`${btn.ghost} px-2`}>
                        <Pencil aria-hidden className="h-4 w-4" />
                      </Link>
                      <Link href={`/courses/${course}/${s.slug}`} target="_blank" aria-label={`View slide ${s.slug} on the site`} className={`${btn.ghost} px-2`}>
                        <ExternalLink aria-hidden className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        aria-label={`Delete slide ${s.slug}`}
                        onClick={() => {
                          if (confirm(`Delete slide "${s.slug}" and learners' progress on it? This can't be undone.`)) run(() => deleteSlideAction(s.id));
                        }}
                        className={`${btn.ghost} px-2 text-danger hover:bg-danger-soft`}
                      >
                        <Trash2 aria-hidden className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
              <li className="flex flex-wrap items-center gap-2 bg-white px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Add</span>
                {(["lecture", "quiz", "practice"] as const).map((kind) => {
                  const Icon = KIND_ICON[kind];
                  return (
                    <Link key={kind} href={`/admin/courses/${course}/slides/new?module=${m.id}&kind=${kind}`} className={btn.secondary}>
                      <Icon aria-hidden className="h-4 w-4" /> {KIND_LABEL[kind]}
                    </Link>
                  );
                })}
              </li>
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}
