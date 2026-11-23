"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

/** A slide that fails to render shows this in the content area instead of blanking the whole page. */
export default function SlideError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslations();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="grid min-h-[60dvh] place-items-center px-5 text-center">
      <div>
        <p className="font-display text-2xl font-bold text-forest-700">{t("course.slideError")}</p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-6 rounded-full bg-forest-700 px-6 py-3 font-semibold text-white shadow-lift transition hover:bg-forest-600"
        >
          {t("common.retry")}
        </button>
      </div>
    </div>
  );
}
