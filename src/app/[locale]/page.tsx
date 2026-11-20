import { toLocale } from "@/i18n/locale";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Faq } from "@/components/landing/Faq";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { Highlights } from "@/components/landing/Highlights";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LatestLectures } from "@/components/landing/LatestLectures";
import { SkillsMap } from "@/components/landing/SkillsMap";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { routing } from "@/i18n/routing";
import { localizedPath, organizationId, organizationJsonLd, publicPageMetadata, websiteId } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { absolute: t("title") },
    ...publicPageMetadata({ path: "/", locale, title: t("title"), description: t("description") }),
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  const pageUrl = absoluteUrl(localizedPath("/", locale));

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light focus:outline-none">
        <HeroCarousel />
        <Highlights />
        <HowItWorks />
        <SkillsMap />
        <LatestLectures locale={locale} />
        <Faq />
      </main>
      <SiteFooter />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            organizationJsonLd,
            {
              "@type": "WebSite",
              "@id": websiteId,
              name: siteConfig.name,
              url: absoluteUrl("/"),
              inLanguage: [...routing.locales],
              publisher: { "@id": organizationId },
            },
            {
              "@type": "WebPage",
              "@id": `${pageUrl}#webpage`,
              url: pageUrl,
              name: t("title"),
              description: t("description"),
              inLanguage: locale,
              isPartOf: { "@id": websiteId },
              about: { "@id": `${absoluteUrl("/")}#app` },
              publisher: { "@id": organizationId },
            },
            {
              "@type": "WebApplication",
              "@id": `${absoluteUrl("/")}#app`,
              name: siteConfig.name,
              url: pageUrl,
              description: t("description"),
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any (modern web browser)",
              browserRequirements: "Requires JavaScript",
              inLanguage: [...routing.locales],
              isAccessibleForFree: true,
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              publisher: { "@id": organizationId },
            },
          ],
        }}
      />
    </>
  );
}
