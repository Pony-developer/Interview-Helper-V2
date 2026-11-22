"use client";

import { Check, Link2, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

/** Print / copy / LinkedIn buttons under a certificate. Hidden when printing. */
export function CertificateActions({ url, linkedInUrl }: { url: string; linkedInUrl: string }) {
  const t = useTranslations("certificate");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked: the URL is printed on the certificate anyway */
    }
  }

  const base = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition";
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
      <button type="button" onClick={() => window.print()} className={`${base} bg-forest-700 text-white shadow-lift hover:bg-forest-600`}>
        <Printer aria-hidden className="h-4 w-4" />
        {t("print")}
      </button>
      <button type="button" onClick={copy} className={`${base} border border-paper-3 bg-white text-forest-700 hover:border-forest-600`}>
        {copied ? <Check aria-hidden className="h-4 w-4" /> : <Link2 aria-hidden className="h-4 w-4" />}
        <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
      </button>
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} border border-paper-3 bg-white text-forest-700 hover:border-forest-600`}
      >
        {t("linkedin")}
      </a>
    </div>
  );
}
