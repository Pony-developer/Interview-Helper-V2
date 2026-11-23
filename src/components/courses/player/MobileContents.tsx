"use client";

import { ListTree } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

/** Small screens: the course contents fold away above the slide, and fold again after picking a slide. */
export function MobileContents({ done, total, children }: { done: number; total: number; children: ReactNode }) {
  const t = useTranslations("course");
  const { slide } = useParams<{ slide?: string }>();
  const ref = useRef<HTMLDetailsElement>(null);

  // The layout stays mounted between slides, so close the panel ourselves once the slide changes.
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [slide]);

  return (
    <details ref={ref} className="group border-b border-paper-3 bg-paper-2 lg:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 font-semibold text-forest-700 sm:px-8 [&::-webkit-details-marker]:hidden">
        <ListTree aria-hidden className="h-5 w-5" />
        <span className="flex-1">{t("contents")}</span>
        <span className="font-mono text-xs tabular-nums text-ink-soft">
          {done}/{total}
        </span>
      </summary>
      <div className="border-t border-paper-3">{children}</div>
    </details>
  );
}
