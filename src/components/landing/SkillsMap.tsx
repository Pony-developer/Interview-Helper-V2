import { getTranslations } from "next-intl/server";
import { PillLink } from "@/components/ui/PillLink";
import { CORE_SKILL_SLUGS, skills } from "@content/skills";
import type { SkillCategory } from "@/lib/content/schema";

/** Hand-placed constellation, like mine sites on the reference's world map. */
const LAYOUT: Record<SkillCategory, [number, number]> = {
  languages: [130, 120],
  "javascript-core": [300, 205],
  "web-platform": [440, 110],
  "frontend-frameworks": [560, 225],
  "state-and-data": [690, 130],
  styling: [395, 315],
  "build-tooling": [250, 345],
  "cs-fundamentals": [110, 285],
  backend: [800, 250],
  databases: [905, 140],
  "devops-cloud": [905, 345],
  testing: [655, 345],
  mobile: [770, 400],
  "data-ml": [1030, 255],
  security: [520, 395],
  practices: [1020, 410],
};

export async function SkillsMap() {
  const t = await getTranslations("landing.map");
  const tc = await getTranslations("categories");
  const core = new Set<string>(CORE_SKILL_SLUGS);

  const groups = (Object.keys(LAYOUT) as SkillCategory[])
    .map((category) => ({ category, items: skills.filter((s) => s.category === category) }))
    .filter((g) => g.items.length);

  const edges: [SkillCategory, SkillCategory][] = [
    ["languages", "javascript-core"],
    ["javascript-core", "web-platform"],
    ["javascript-core", "frontend-frameworks"],
    ["frontend-frameworks", "state-and-data"],
    ["frontend-frameworks", "styling"],
    ["styling", "build-tooling"],
    ["cs-fundamentals", "javascript-core"],
    ["frontend-frameworks", "testing"],
    ["backend", "databases"],
    ["backend", "devops-cloud"],
    ["state-and-data", "backend"],
    ["testing", "security"],
    ["devops-cloud", "practices"],
    ["databases", "data-ml"],
    ["backend", "mobile"],
  ];

  return (
    <section aria-labelledby="map-title" className="grain relative overflow-hidden bg-forest-950 py-20 text-white sm:py-24">
      <div className="relative z-[2] mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <h2 id="map-title" className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            {t("title")}
          </h2>
          <div>
            <p className="text-lg leading-relaxed text-forest-100">{t("body")}</p>
            <div className="mt-8">
              <PillLink href="/lectures" variant="light">
                {t("cta")}
              </PillLink>
            </div>
          </div>
        </div>

        <figure className="mt-14">
          <svg viewBox="0 0 1140 470" className="h-auto w-full" aria-hidden focusable="false">
            <defs>
              <pattern id="map-dots" width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.1" fill="#1d5c48" />
              </pattern>
            </defs>
            <rect width="1140" height="470" fill="url(#map-dots)" opacity="0.7" rx="24" />
            {edges.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={LAYOUT[a][0]}
                y1={LAYOUT[a][1]}
                x2={LAYOUT[b][0]}
                y2={LAYOUT[b][1]}
                stroke="#c9a227"
                strokeOpacity="0.25"
                strokeDasharray="2 6"
              />
            ))}
            {groups.map(({ category, items }) => {
              const [cx, cy] = LAYOUT[category];
              const ring = 20 + Math.sqrt(items.length) * 6;
              return (
                <g key={category}>
                  <circle cx={cx} cy={cy} r={ring + 10} fill="#0b5a43" opacity="0.35" />
                  {items.map((s, i) => {
                    const angle = (i / items.length) * Math.PI * 2;
                    const r = ring + ((i % 3) - 1) * 5;
                    return (
                      <circle
                        key={s.slug}
                        cx={cx + Math.cos(angle) * r}
                        cy={cy + Math.sin(angle) * r}
                        r={core.has(s.slug) ? 3.6 : 2.2}
                        fill={core.has(s.slug) ? "#e6cf86" : "#9fc2b2"}
                        opacity={core.has(s.slug) ? 1 : 0.75}
                      />
                    );
                  })}
                  <circle cx={cx} cy={cy} r="6" fill="#fff" />
                  <text x={cx} y={cy + ring + 30} textAnchor="middle" fill="#e3eee8" fontSize="15" fontWeight="600">
                    {tc(category)}
                  </text>
                </g>
              );
            })}
          </svg>
          <figcaption className="mt-4 text-sm text-forest-200">{t("legend")}</figcaption>
        </figure>

        <ul className="sr-only">
          {groups.map(({ category, items }) => (
            <li key={category}>
              {tc(category)}: {t("skills", { count: items.length })}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
