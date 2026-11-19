export const siteConfig = {
  name: "Assay",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  twitter: undefined as string | undefined,
  contactEmail: "hello@assay.dev",
};

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
