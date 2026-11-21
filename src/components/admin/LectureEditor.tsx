"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { deleteLectureAction, saveLectureAction } from "@/app/actions/admin";
import { Link, useRouter } from "@/i18n/navigation";
import {
  btn,
  callAction,
  Field,
  inputCls,
  LocalizedField,
  SaveBar,
  Section,
  SourceBadge,
  type Loc,
  type SaveStatus,
} from "./fields";
import { MarkdownArea } from "./MarkdownArea";

export type LectureFormState = {
  slug: string;
  skill: string;
  title: Loc;
  summary: Loc;
  body: Loc;
  readingMinutes: number;
};

export function LectureEditor({
  initial,
  create,
  meta,
  skillOptions,
}: {
  initial: LectureFormState;
  create: boolean;
  meta?: { source: "seed" | "admin"; updatedAt: string };
  skillOptions: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [lang, setLang] = useState<"en" | "uk">("en");
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const set = <K extends keyof LectureFormState>(key: K, value: LectureFormState[K]) => setS((prev) => ({ ...prev, [key]: value }));

  async function save() {
    setStatus({ kind: "saving" });
    const res = await callAction(() =>
      saveLectureAction({
        create,
        lecture: { ...s, slug: s.slug.trim(), skill: s.skill.trim() },
      }),
    );
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    setStatus({ kind: "saved", at: Date.now() });
    if (create) router.replace(`/admin/lectures/${s.slug.trim()}`);
    else router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete lecture "${s.slug}" permanently? Tasks that link to it lose their help link. This can't be undone.`)) return;
    setStatus({ kind: "saving" });
    const res = await callAction(() => deleteLectureAction(s.slug));
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    router.replace("/admin/lectures");
  }

  const words = s.body[lang].trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {meta ? (
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <SourceBadge source={meta.source} />
          <span>Last updated {new Date(meta.updatedAt).toLocaleString()}</span>
          <Link
            href={`/lectures/${s.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 font-semibold text-forest-700 hover:underline"
          >
            View on site <ExternalLink aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </p>
      ) : null}

      <Section title="Basics">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Slug" htmlFor="slug" hint={create ? "Becomes the URL: /lectures/<slug>" : "Can't be changed"}>
            <input id="slug" value={s.slug} disabled={!create} onChange={(e) => set("slug", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Skill" htmlFor="skill">
            <input
              id="skill"
              list="lecture-skill-options"
              value={s.skill}
              onChange={(e) => set("skill", e.target.value)}
              className={inputCls}
            />
            <datalist id="lecture-skill-options">
              {skillOptions.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </datalist>
          </Field>
          <Field label="Reading time (minutes)" htmlFor="minutes">
            <input
              id="minutes"
              type="number"
              min={1}
              max={120}
              value={s.readingMinutes}
              onChange={(e) => set("readingMinutes", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>
        <LocalizedField id="title" label="Title" value={s.title} onChange={(v) => set("title", v)} />
        <LocalizedField id="summary" label="Summary" value={s.summary} onChange={(v) => set("summary", v)} rows={2} />
      </Section>

      <Section
        title="Body (Markdown)"
        description="GitHub-flavoured Markdown. Fenced code blocks get syntax highlighting on the site."
        actions={
          <div className="flex items-center gap-2">
            <div role="tablist" aria-label="Language" className="flex rounded-full border border-paper-3 p-0.5">
              {(["en", "uk"] as const).map((l) => (
                <button
                  key={l}
                  role="tab"
                  type="button"
                  aria-selected={lang === l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${lang === l ? "bg-forest-700 text-white" : "text-ink-muted"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setPreview((p) => !p)} aria-pressed={preview} className={btn.secondary}>
              {preview ? "Hide preview" : "Preview"}
            </button>
          </div>
        }
      >
        <div className={preview ? "grid gap-4 xl:grid-cols-2" : ""}>
          <MarkdownArea ariaLabel={`Body (${lang})`} badge={lang} preview={false} value={s.body[lang]} onChange={(v) => set("body", { ...s.body, [lang]: v })} rows={28} />
          {preview ? (
            <div className="prose-assay max-h-[44rem] overflow-auto rounded-xl border border-paper-3 bg-paper p-5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.body[lang]}</ReactMarkdown>
            </div>
          ) : null}
        </div>
        <p className="text-xs text-ink-soft">
          {words} words in {lang.toUpperCase()} · about {Math.max(1, Math.round(words / 200))} min at 200 wpm
        </p>
      </Section>

      <SaveBar status={status} onSave={save}>
        {!create ? (
          <button type="button" onClick={remove} className={btn.danger}>
            <Trash2 aria-hidden className="h-4 w-4" /> Delete
          </button>
        ) : null}
      </SaveBar>
    </div>
  );
}
