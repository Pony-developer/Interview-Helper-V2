import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PillLink } from "@/components/ui/PillLink";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="on-light grid flex-1 place-items-center px-6 py-24 focus:outline-none">
        <div className="max-w-lg text-center">
          <p aria-hidden className="font-display text-8xl font-extrabold text-transparent [-webkit-text-stroke:2px_var(--color-gold-500)]">
            404
          </p>
          <h1 className="mt-6 font-display text-3xl font-bold text-forest-700">{t("title")}</h1>
          <p className="mt-4 text-lg text-ink-muted">{t("body")}</p>
          <div className="mt-10 flex justify-center">
            <PillLink href="/" variant="forest">
              {t("home")}
            </PillLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
