"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteSkillAction, saveSkillAction } from "@/app/actions/admin";
import { useRouter } from "@/i18n/navigation";
import { SKILL_CATEGORIES, type SkillCategory } from "@/lib/content/schema";
import { btn, callAction, Field, inputCls, LocalizedField, SaveBar, Section, SourceBadge, type Loc, type SaveStatus } from "./fields";

export type SkillFormState = {
  slug: string;
  name: string;
  category: SkillCategory;
  aliases: string;
  caseSensitiveAliases: string;
  codeable: boolean;
  popularity: number;
  description: Loc;
};

const splitList = (v: string) =>
  v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export function SkillEditor({
  initial,
  create,
  meta,
}: {
  initial: SkillFormState;
  create: boolean;
  meta?: { source: "seed" | "admin"; hasContent: boolean; usage: number };
}) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const set = <K extends keyof SkillFormState>(key: K, value: SkillFormState[K]) => setS((prev) => ({ ...prev, [key]: value }));

  async function save() {
    setStatus({ kind: "saving" });
    const hasDescription = s.description.en.trim() || s.description.uk.trim();
    const res = await callAction(() =>
      saveSkillAction({
        create,
        skill: {
          slug: s.slug.trim(),
          name: s.name.trim(),
          category: s.category,
          aliases: splitList(s.aliases),
          caseSensitiveAliases: splitList(s.caseSensitiveAliases),
          codeable: s.codeable,
          popularity: s.popularity,
          description: hasDescription ? s.description : undefined,
        },
      }),
    );
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    setStatus({ kind: "saved", at: Date.now() });
    if (create) router.replace(`/admin/skills/${s.slug.trim()}`);
    else router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete skill "${s.slug}" permanently? This can't be undone.`)) return;
    setStatus({ kind: "saving" });
    const res = await callAction(() => deleteSkillAction(s.slug));
    if (!res.ok) return setStatus({ kind: "error", errors: res.errors });
    router.replace("/admin/skills");
  }

  return (
    <div className="space-y-6">
      {meta ? (
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <SourceBadge source={meta.source} />
          <span>{meta.hasContent ? "Has published tasks" : "No published tasks yet"}</span>
          <span>· used by {meta.usage} lectures/tasks</span>
        </p>
      ) : null}

      <Section title="Skill" description="Skills are what candidates pick on the practice page and what the job-post parser looks for.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Slug" htmlFor="slug" hint={create ? "kebab-case, can't change later" : "Can't be changed"}>
            <input id="slug" value={s.slug} disabled={!create} onChange={(e) => set("slug", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Name" htmlFor="name">
            <input id="name" value={s.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Category" htmlFor="category">
            <select
              id="category"
              value={s.category}
              onChange={(e) => set("category", e.target.value as SkillCategory)}
              className={inputCls}
            >
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Popularity" htmlFor="popularity" hint="0–100, orders chips and breaks ties">
            <input
              id="popularity"
              type="number"
              min={0}
              max={100}
              value={s.popularity}
              onChange={(e) => set("popularity", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>
        <Field
          label="Aliases"
          htmlFor="aliases"
          hint="Comma-separated, lower-case spellings the job-post parser matches, e.g. reactjs, react.js"
        >
          <input id="aliases" value={s.aliases} onChange={(e) => set("aliases", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Case-sensitive aliases" htmlFor="cs-aliases" hint='Short tokens matched only with exact case, e.g. "Go", "R"'>
          <input
            id="cs-aliases"
            value={s.caseSensitiveAliases}
            onChange={(e) => set("caseSensitiveAliases", e.target.value)}
            className={inputCls}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.codeable}
            onChange={(e) => set("codeable", e.target.checked)}
            className="h-4 w-4 accent-forest-700"
          />
          Codeable (can have live coding tasks)
        </label>
        <LocalizedField
          id="description"
          label="Description (optional, both languages)"
          value={s.description}
          onChange={(v) => set("description", v)}
          rows={2}
        />
      </Section>

      <SaveBar status={status} onSave={save}>
        {!create && meta && meta.usage === 0 ? (
          <button type="button" onClick={remove} className={btn.danger}>
            <Trash2 aria-hidden className="h-4 w-4" /> Delete
          </button>
        ) : null}
      </SaveBar>
    </div>
  );
}
