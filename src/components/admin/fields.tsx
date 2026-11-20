"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

export type Loc = { en: string; uk: string };
export const emptyLoc = (): Loc => ({ en: "", uk: "" });

export const inputCls =
  "w-full rounded-xl border border-paper-3 bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-600/20 disabled:bg-paper-2 disabled:text-ink-muted";
export const monoCls = `${inputCls} font-mono text-[13px] leading-relaxed`;
export const btnCls =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
export const btn = {
  primary: `${btnCls} bg-forest-700 text-white hover:bg-forest-800`,
  secondary: `${btnCls} border border-paper-3 bg-white text-ink hover:border-forest-600 hover:text-forest-700`,
  danger: `${btnCls} border border-danger/30 bg-white text-danger hover:bg-danger-soft`,
  ghost: `${btnCls} text-forest-700 hover:bg-forest-50`,
};

export function Section({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-paper-3 bg-white p-5 shadow-card sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-forest-800">{title}</h2>
          {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

/** Tab inserts two spaces instead of leaving the field (Esc, then Tab, still moves focus). */
function onCodeKeyDown(e: KeyboardEvent<HTMLTextAreaElement>, onChange: (v: string) => void) {
  if (e.key !== "Tab" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
  const el = e.currentTarget;
  if (el.dataset.tabEscape === "1") return;
  e.preventDefault();
  const { selectionStart: s, selectionEnd: end, value } = el;
  const next = value.slice(0, s) + "  " + value.slice(end);
  onChange(next);
  requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
}

export function CodeArea({
  id,
  value,
  onChange,
  rows = 10,
  placeholder,
  ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <textarea
      id={id}
      aria-label={ariaLabel}
      value={value}
      rows={rows}
      spellCheck={false}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") e.currentTarget.dataset.tabEscape = "1";
        else if (e.key !== "Tab") delete e.currentTarget.dataset.tabEscape;
        onCodeKeyDown(e, onChange);
      }}
      onBlur={(e) => delete e.currentTarget.dataset.tabEscape}
      className={`${monoCls} resize-y whitespace-pre`}
    />
  );
}

/** One bilingual field: English and Ukrainian side by side. */
export function LocalizedField({
  id,
  label,
  hint,
  value,
  onChange,
  rows,
  mono,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  value: Loc;
  onChange: (v: Loc) => void;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-ink">{label}</legend>
      <div className="grid gap-3 lg:grid-cols-2">
        {(["en", "uk"] as const).map((lang) => (
          <div key={lang} className="relative">
            <span className="pointer-events-none absolute right-2 top-2 rounded bg-paper-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
              {lang}
            </span>
            {rows ? (
              mono ? (
                <CodeArea
                  id={`${id}-${lang}`}
                  ariaLabel={`${label} (${lang})`}
                  value={value[lang]}
                  rows={rows}
                  onChange={(v) => onChange({ ...value, [lang]: v })}
                />
              ) : (
                <textarea
                  id={`${id}-${lang}`}
                  aria-label={`${label} (${lang})`}
                  value={value[lang]}
                  rows={rows}
                  onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
                  className={`${inputCls} resize-y pr-10`}
                />
              )
            ) : (
              <input
                id={`${id}-${lang}`}
                aria-label={`${label} (${lang})`}
                value={value[lang]}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
                className={`${inputCls} pr-10`}
              />
            )}
          </div>
        ))}
      </div>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </fieldset>
  );
}

/** Runs a server action, turning a thrown error (network, server crash) into a form error. */
export async function callAction<T extends { ok: boolean }>(fn: () => Promise<T>): Promise<T | { ok: false; errors: string[] }> {
  try {
    return await fn();
  } catch {
    return {
      ok: false,
      errors: ["The server didn't respond. Check your connection and try again."],
    };
  }
}

export type SaveStatus = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; at: number } | { kind: "error"; errors: string[] };

export function StatusMessage({ status }: { status: SaveStatus }) {
  if (status.kind === "saving")
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-ink-muted">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Saving…
      </p>
    );
  if (status.kind === "saved")
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-semibold text-success">
        <CheckCircle2 aria-hidden className="h-4 w-4" /> Saved
      </p>
    );
  if (status.kind === "error")
    return (
      <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
        <p className="flex items-center gap-2 font-semibold">
          <AlertTriangle aria-hidden className="h-4 w-4" /> Not saved
        </p>
        <ul className="mt-1 list-disc pl-6">
          {status.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </div>
    );
  return null;
}

/** Sticky footer with the save button and the last result. */
export function SaveBar({ status, onSave, children }: { status: SaveStatus; onSave: () => void; children?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-5 border-t border-paper-3 bg-paper/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onSave} disabled={status.kind === "saving"} className={btn.primary}>
          Save
        </button>
        {children}
        <div className="ml-auto min-w-0">
          <StatusMessage status={status} />
        </div>
      </div>
    </div>
  );
}

export function SourceBadge({ source }: { source: "seed" | "admin" }) {
  return source === "admin" ? (
    <span
      className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-800"
      title="Edited in the admin panel; the repository seed won't overwrite it"
    >
      admin
    </span>
  ) : (
    <span
      className="rounded-full bg-paper-2 px-2 py-0.5 text-xs font-semibold text-ink-muted"
      title="Comes from content/ in the repository"
    >
      repo
    </span>
  );
}
