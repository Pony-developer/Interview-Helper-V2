import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/site/JsonLd";

const KEYS = ["free", "adaptive", "ai", "sites", "grade", "coding"] as const;

export async function Faq() {
  const t = await getTranslations("landing.faq");
  const items = KEYS.map((k) => ({ q: t(`items.${k}.q`), a: t(`items.${k}.a`) }));

  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.6fr]">
        <h2 id="faq-title" className="font-display text-3xl font-bold text-forest-700 sm:text-4xl">
          {t("title")}
        </h2>
        <div className="divide-y divide-paper-3 border-y border-paper-3">
          {items.map((item) => (
            <details key={item.q} className="group py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-4 text-left text-lg font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-gold-600 transition-transform duration-200 group-open:rotate-45"
                />
              </summary>
              <p className="pb-5 pr-10 leading-relaxed text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((i) => ({
            "@type": "Question",
            name: i.q,
            acceptedAnswer: { "@type": "Answer", text: i.a },
          })),
        }}
      />
    </section>
  );
}
