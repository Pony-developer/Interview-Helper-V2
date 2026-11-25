"use client";

import { useId, useState, type FormEvent } from "react";
import { Check, Copy, Send } from "lucide-react";
import { useTranslations } from "next-intl";

export const CONTACT_TOPICS = ["general", "content", "bug", "partnership"] as const;
type Topic = (typeof CONTACT_TOPICS)[number];

const fieldClass =
  "peer w-full border-0 border-b-2 border-paper-3 bg-transparent px-0 pb-2 pt-1 text-lg text-ink placeholder:text-ink-soft/70 transition-colors focus:border-forest-600 focus:outline-none focus:ring-0";

/**
 * A letter-style contact form. There is no backend inbox, so submitting composes the
 * message in the visitor's mail client (mailto:) with the topic as the subject prefix.
 */
export function ContactForm({ email }: { email: string }) {
  const t = useTranslations("contact.form");
  const id = useId();
  const [topic, setTopic] = useState<Topic>("general");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const from = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = `[${t(`topics.${topic}`)}] ${t("subjectFrom", { name })}`;
    const body = `${message}\n\n— ${name}${from ? ` <${from}>` : ""}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative animate-rise rounded-[1.75rem] border border-paper-3 bg-white p-7 shadow-[0_30px_60px_-30px_rgb(7_56_41/0.35)] [animation-delay:160ms] sm:p-10"
    >
      {/* Postmark seal that reflects the chosen topic */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-3 -top-6 hidden h-28 w-28 rotate-[10deg] place-items-center rounded-full border-2 border-dashed border-gold-500 bg-gold-100/80 text-center sm:grid"
      >
        <div className="grid h-[5.6rem] w-[5.6rem] place-items-center rounded-full border border-gold-600">
          <span className="px-2 font-display text-[0.6rem] font-bold uppercase leading-tight tracking-[0.12em] text-gold-800">
            {t(`topics.${topic}`)}
          </span>
        </div>
      </div>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">{t("topicLabel")}</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {CONTACT_TOPICS.map((value) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="topic"
                value={value}
                checked={topic === value}
                onChange={() => setTopic(value)}
                className="peer sr-only"
              />
              <span className="inline-flex rounded-full border border-paper-3 px-4 py-2 text-sm font-semibold text-ink-muted transition peer-checked:border-forest-700 peer-checked:bg-forest-700 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500 hover:border-forest-600 hover:text-forest-700 peer-checked:hover:text-white">
                {t(`topics.${value}`)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="text-sm font-semibold text-forest-800">
            {t("name")}
          </label>
          <input id={`${id}-name`} name="name" required autoComplete="name" placeholder={t("namePlaceholder")} className={fieldClass} />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="text-sm font-semibold text-forest-800">
            {t("email")}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mt-8">
        <label htmlFor={`${id}-message`} className="text-sm font-semibold text-forest-800">
          {t("message")}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={6}
          placeholder={t("messagePlaceholder")}
          className={`${fieldClass} resize-y bg-[repeating-linear-gradient(transparent,transparent_2.2rem,var(--color-paper-2)_2.2rem,var(--color-paper-2)_calc(2.2rem+1px))] leading-[2.2rem]`}
        />
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-sm text-ink-soft" aria-live="polite">
          {sent ? t("opened") : t("hint")}
        </p>
        <button
          type="submit"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-7 py-3 font-bold text-forest-950 transition hover:bg-gold-400"
        >
          {t("submit")}
          <Send aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
}

export function CopyEmail({ email }: { email: string }) {
  const t = useTranslations("contact");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-forest-100 transition hover:border-gold-400 hover:text-white"
    >
      {copied ? <Check aria-hidden className="h-4 w-4 text-gold-300" /> : <Copy aria-hidden className="h-4 w-4" />}
      <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
    </button>
  );
}
