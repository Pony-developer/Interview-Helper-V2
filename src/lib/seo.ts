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

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * Metadata for a public, indexable page: canonical, hreflang, Open Graph and Twitter.
 * Next.js merges metadata shallowly, so a page that sets `openGraph` replaces the layout's whole
 * object; this rebuilds the shared fields (site name, locales) every time. The image comes from
 * the `opengraph-image` file convention, which Next.js adds to both cards.
 */
export function publicPageMetadata({
  path,
  locale,
  title,
  description,
  openGraph,
}: {
  path: string;
  locale: string;
  title: string;
  description: string;
  openGraph?: OpenGraph;
}): Metadata {
  return {
    description,
    alternates: alternatesFor(path, locale),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url: absoluteUrl(localizedPath(path, locale)),
      locale: ogLocale(locale),
      alternateLocale: routing.locales.filter((l) => l !== locale).map(ogLocale),
      ...openGraph,
    } as OpenGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(siteConfig.twitter ? { site: siteConfig.twitter, creator: siteConfig.twitter } : {}),
    },
  };
}

export const organizationId = absoluteUrl("/#organization");
export const websiteId = absoluteUrl("/#website");

export const organizationJsonLd = {
  "@type": "Organization",
  "@id": organizationId,
  name: siteConfig.name,
  url: siteConfig.url,
  logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png"), width: 512, height: 512 },
  email: siteConfig.contactEmail,
};

/** Indexable by default; Google may show large image previews and full snippets. */
export const publicRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};

/** Pages behind sign-in (and dev tools) should never be indexed. */
export const privatePageMetadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
