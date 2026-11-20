const FALLBACK_SITE_URL = "http://localhost:3000";

/**
 * Public origin used for canonical URLs, hreflang, sitemap, robots and Open Graph.
 * Order: NEXT_PUBLIC_SITE_URL → Vercel's production domain → localhost. Invalid values fall back
 * instead of crashing metadata generation, and a trailing slash is dropped.
 */
export function resolveSiteUrl(env: Record<string, string | undefined> = process.env): string {
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const candidates = [env.NEXT_PUBLIC_SITE_URL?.trim(), vercel ? `https://${vercel}` : undefined];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "http:" || url.protocol === "https:") return url.href.replace(/\/+$/, "");
    } catch {
      // ignore malformed values and try the next source
    }
  }
  return FALLBACK_SITE_URL;
}

export const siteConfig = {
  name: "Assay",
  url: resolveSiteUrl(),
  twitter: undefined as string | undefined,
  contactEmail: "hello@assay.dev",
};

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
