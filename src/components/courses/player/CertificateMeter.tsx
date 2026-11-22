"use client";

import { Award, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { claimCertificateAction } from "@/app/actions/course";
import { Link, useRouter } from "@/i18n/navigation";

export type CertificateState = {
  courseId: string;
  /** Share of the course's points earned, 0–100; null when the course has no graded slides. */
  percent: number | null;
  certificateId: string | null;
  signedIn: boolean;
  threshold: number;
};

/** Sidebar block: how close the learner is to the certificate, or a link to it once earned. */
export function CertificateMeter({ state }: { state: CertificateState }) {
  const t = useTranslations("course.certificateMeter");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const { percent, certificateId, signedIn, threshold } = state;
  if (percent === null) return null;

  if (certificateId) {
    return (
      <Link
        href={`/certificates/${certificateId}`}
        className="group mt-6 flex items-center gap-3 rounded-2xl bg-forest-900 px-4 py-3 text-white shadow-lift transition hover:bg-forest-800"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-500 text-forest-950">
          <Award aria-hidden className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-sm font-bold text-gold-300">{t("earned")}</span>
          <span className="block text-xs text-forest-100">{t("view")}</span>
        </span>
        <ArrowRight aria-hidden className="h-4 w-4 text-gold-300 transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  }

  const qualifies = signedIn && percent >= threshold;
  function claim() {
    setError(false);
    startTransition(async () => {
      const res = await claimCertificateAction(state.courseId);
      if (res.ok && res.certificate) router.push(`/certificates/${res.certificate.id}`);
      else setError(true);
    });
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-gold-500/60 bg-gold-100/40 px-4 py-3">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold-800">
        <Award aria-hidden className="h-4 w-4" />
        {t("label")}
      </p>
      {signedIn ? (
        <>
          <div className="relative mt-3 h-2 rounded-full bg-paper-3" aria-hidden>
            <div
              className="h-full rounded-full bg-gradient-to-r from-forest-600 to-forest-700 transition-[width] duration-700"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
            {/* The pass mark. */}
            <span className="absolute -top-1 h-4 w-0.5 rounded bg-gold-600" style={{ left: `${threshold}%` }} />
          </div>
          <p className="mt-2 font-mono text-xs tabular-nums text-ink">{t("score", { percent })}</p>
        </>
      ) : null}
      {qualifies ? (
        <button
          type="button"
          onClick={claim}
          disabled={pending}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-forest-950 transition hover:bg-gold-400 disabled:opacity-60"
        >
          <Award aria-hidden className="h-4 w-4" />
          {pending ? t("claiming") : t("claim")}
        </button>
      ) : (
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{signedIn ? t("goal", { threshold }) : t("signIn")}</p>
      )}
      {error ? (
        <p role="alert" className="mt-2 text-xs font-semibold text-danger">
          {t("error")}
        </p>
      ) : null}
    </div>
  );
}

/** Shown in a quiz or practice result when that submission earned the certificate. */
export function CertificateEarned({ id }: { id: string }) {
  const t = useTranslations("course.certificateMeter");
  return (
    <Link
      href={`/certificates/${id}`}
      className="group flex items-center gap-3 rounded-2xl bg-gold-500 px-4 py-3 font-semibold text-forest-950 shadow-lift transition hover:bg-gold-400"
    >
      <Award aria-hidden className="h-6 w-6 shrink-0" />
      <span className="flex-1">{t("new")}</span>
      <span className="inline-flex items-center gap-1 text-sm font-bold">
        {t("view")}
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
