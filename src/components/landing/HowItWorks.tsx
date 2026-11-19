import { getTranslations } from "next-intl/server";
import { PillLink } from "@/components/ui/PillLink";

const STEPS = ["one", "two", "three", "four"] as const;

export async function HowItWorks() {
  const t = await getTranslations("landing.how");

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="grain relative bg-forest-700 py-20 text-white sm:py-24">
      <div className="relative z-[2] mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="how-title" className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-forest-100">{t("intro")}</p>
        </div>
        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step, i) => (
            <li key={step} className="relative">
              <span
                aria-hidden
                className="block font-display text-6xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-gold-400)]"
              >
                0{i + 1}
              </span>
              <div className="gold-rule mt-5 w-16" />
              <h3 className="mt-5 font-display text-xl font-bold">{t(`steps.${step}.title`)}</h3>
              <p className="mt-3 leading-relaxed text-forest-100">{t(`steps.${step}.body`)}</p>
            </li>
          ))}
        </ol>
        <div className="mt-16 flex justify-center">
          <PillLink href="/practice" variant="light">
            {t("cta")}
          </PillLink>
        </div>
      </div>
    </section>
  );
}
