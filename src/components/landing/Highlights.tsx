import { Code2, Gem, Layers3, ScanSearch, ShieldCheck, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { skills } from "@content/skills";

const ITEMS: { key: "skills" | "methods" | "grounds" | "privacy" | "grade"; icon: LucideIcon }[] = [
  { key: "skills", icon: Layers3 },
  { key: "methods", icon: ScanSearch },
  { key: "grounds", icon: Code2 },
  { key: "privacy", icon: ShieldCheck },
  { key: "grade", icon: Gem },
];

export async function Highlights() {
  const t = await getTranslations("landing.highlights");
  const skillsValue = `${Math.floor(skills.length / 10) * 10}+`;

  return (
    <section aria-labelledby="highlights-title" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 id="highlights-title" className="text-center font-display text-3xl font-bold text-forest-700 sm:text-4xl">
          {t("title")}
        </h2>
        <ul className="mt-14 grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map(({ key, icon: Icon }, i) => (
            <li
              key={key}
              className={`flex flex-col items-center px-6 text-center ${
                i > 0 ? "lg:border-l lg:border-gold-300" : ""
              } ${i % 2 === 1 ? "sm:border-l sm:border-gold-300 lg:border-l" : ""} ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <div className="flex items-center gap-4">
                <Icon aria-hidden className="h-11 w-11 text-forest-700" strokeWidth={1.4} />
                <p className="font-display text-4xl font-extrabold tracking-tight text-forest-700">
                  {key === "skills" ? skillsValue : t(`items.${key}.value`)}
                </p>
              </div>
              <p className="mt-3 max-w-[14rem] text-[0.95rem] leading-snug text-ink-muted">{t(`items.${key}.label`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
