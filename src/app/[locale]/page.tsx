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
import { alternatesFor, localizedPath, ogLocale, organizationJsonLd } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { absolute: t("title") },
    description: t("description"),
    alternates: alternatesFor("/", locale),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: absoluteUrl(localizedPath("/", locale)),
      locale: ogLocale(locale),
    },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });

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
        data={[
          organizationJsonLd,
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: absoluteUrl(localizedPath("/", locale)),
            inLanguage: locale,
            description: t("description"),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: siteConfig.name,
            url: absoluteUrl(localizedPath("/", locale)),
            applicationCategory: "EducationalApplication",
            operatingSystem: "Any (modern web browser)",
            inLanguage: ["en", "uk"],
            description: t("description"),
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
        ]}
      />
    </>
  );
}
