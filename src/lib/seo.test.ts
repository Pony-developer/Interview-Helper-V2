import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/components/site/JsonLd";
import { alternatesFor, localizedPath, publicPageMetadata } from "./seo";
import { resolveSiteUrl, siteConfig } from "./site";

describe("resolveSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL and drops the trailing slash", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://assay.example/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" })).toBe(
      "https://assay.example",
    );
  });

  it("falls back to the Vercel production domain, then localhost", () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "assay.vercel.app" })).toBe("https://assay.vercel.app");
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });

  it("ignores malformed or non-http values", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "not a url" })).toBe("http://localhost:3000");
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" })).toBe("http://localhost:3000");
  });
});

describe("localized URLs", () => {
  it("keeps the default locale unprefixed", () => {
    expect(localizedPath("/", "en")).toBe("/");
    expect(localizedPath("/", "uk")).toBe("/uk");
    expect(localizedPath("/lectures", "uk")).toBe("/uk/lectures");
  });

  it("builds canonical and hreflang alternates with x-default", () => {
    expect(alternatesFor("/", "uk")).toEqual({
      canonical: `${siteConfig.url}/uk`,
      languages: { en: `${siteConfig.url}/`, uk: `${siteConfig.url}/uk`, "x-default": `${siteConfig.url}/` },
    });
  });
});

describe("publicPageMetadata", () => {
  it("keeps shared Open Graph fields and fills the Twitter card", () => {
    const meta = publicPageMetadata({ path: "/", locale: "uk", title: "T", description: "D" });
    expect(meta.openGraph).toMatchObject({
      type: "website",
      siteName: "Assay",
      url: `${siteConfig.url}/uk`,
      locale: "uk_UA",
      alternateLocale: ["en_US"],
    });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", title: "T", description: "D" });
  });

  it("lets a page override the Open Graph type", () => {
    const meta = publicPageMetadata({ path: "/x", locale: "en", title: "T", description: "D", openGraph: { type: "article" } });
    expect(meta.openGraph).toMatchObject({ type: "article", siteName: "Assay" });
  });
});

describe("serializeJsonLd", () => {
  it("cannot close the script element but round-trips the data", () => {
    const data = { name: "</script><script>alert(1)</script> & more" };
    const out = serializeJsonLd(data);
    expect(out).not.toMatch(/[<>&]/);
    expect(JSON.parse(out)).toEqual(data);
  });
});
