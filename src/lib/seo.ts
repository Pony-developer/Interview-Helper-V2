import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { absoluteUrl, siteConfig } from "./site";

/** Path for a locale under `localePrefix: "as-needed"` (default locale has no prefix). */
export function localizedPath(path: string, locale: string) {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

/** Canonical + hreflang alternates (incl. x-default) for a public page. */
export function alternatesFor(path: string, locale: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = absoluteUrl(localizedPath(path, l));
  languages["x-default"] = absoluteUrl(localizedPath(path, routing.defaultLocale));
  return { canonical: absoluteUrl(localizedPath(path, locale)), languages };
}

export function ogLocale(locale: Locale | string) {
  return locale === "uk" ? "uk_UA" : "en_US";
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: absoluteUrl("/icon-512.png"),
};

/** Pages behind sign-in should never be indexed. */
export const privatePageMetadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};
