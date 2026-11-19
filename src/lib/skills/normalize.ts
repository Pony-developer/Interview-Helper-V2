import Fuse from "fuse.js";
import { insensitiveAliasesOf, matchSkills, type CatalogSkill } from "./matcher";

/**
 * Maps free-form skill names (e.g. from the on-device LLM) onto catalogue slugs.
 * Order: exact name/alias → keyword matcher on the phrase → fuzzy search. Unknown names are dropped.
 */
export function normalizeSkillNames(names: string[], catalog: readonly CatalogSkill[]) {
  const exact = new Map<string, CatalogSkill>();
  for (const skill of catalog) {
    exact.set(skill.name.toLowerCase(), skill);
    exact.set(skill.slug, skill);
    for (const a of insensitiveAliasesOf(skill)) if (!exact.has(a)) exact.set(a, skill);
    for (const a of skill.caseSensitiveAliases ?? []) if (!exact.has(a.toLowerCase())) exact.set(a.toLowerCase(), skill);
  }
  const fuse = new Fuse(
    catalog.map((s) => ({ slug: s.slug, name: s.name, aliases: [...(s.aliases ?? []), ...(s.caseSensitiveAliases ?? [])] })),
    { keys: [{ name: "name", weight: 2 }, "aliases"], threshold: 0.25, ignoreLocation: true, minMatchCharLength: 2 },
  );
  const bySlug = new Map(catalog.map((s) => [s.slug, s]));

  return names.map((raw) => {
    const name = raw.trim();
    const key = name.toLowerCase().replace(/\s+/g, " ");
    const direct = exact.get(key) ?? exact.get(key.replace(/\.js$/, "")) ?? exact.get(key.replace(/ api$/, ""));
    if (direct) return { name, slug: direct.slug };
    const viaMatcher = matchSkills(name, catalog)[0];
    if (viaMatcher) return { name, slug: viaMatcher.slug };
    const fuzzy = fuse.search(name)[0];
    if (fuzzy && (fuzzy.score ?? 1) <= 0.25) return { name, slug: bySlug.get(fuzzy.item.slug)!.slug };
    return { name, slug: null };
  });
}
