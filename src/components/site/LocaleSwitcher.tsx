"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

function Switcher({ tone }: { tone: "light" | "dark" }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const search = useSearchParams();
  const query = Object.fromEntries(search.entries());

  return (
    // A group, not a <nav>: the switcher is repeated in the header, mobile menu and footer, and
    // duplicate "Language" landmarks only add noise to the screen-reader landmark list.
    <div role="group" aria-label={t("language")} className="flex items-center gap-1.5">
      <Globe aria-hidden className={`h-4 w-4 ${tone === "light" ? "text-gold-300" : "text-forest-700"}`} />
      <ul className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
        {routing.locales.map((l) => {
          const active = l === locale;
          return (
            <li key={l}>
              <Link
                href={{ pathname, query }}
                locale={l}
                hrefLang={l}
                lang={l}
                aria-current={active ? "true" : undefined}
                className={`rounded-full px-2 py-1 transition-colors ${
                  active
                    ? tone === "light"
                      ? "bg-white/15 text-white"
                      : "bg-forest-700 text-white"
                    : tone === "light"
                      ? "text-forest-100 hover:text-white"
                      : "text-forest-800 hover:bg-forest-100"
                }`}
              >
                {l}
                <span className="sr-only"> ({t(`languages.${l}`)})</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function LocaleSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Suspense fallback={<span className="inline-block h-6 w-20" />}>
      <Switcher tone={tone} />
    </Suspense>
  );
}
