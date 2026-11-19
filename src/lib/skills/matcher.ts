/**
 * Keyword skill matcher for job descriptions (EN + UK).
 * - Aliases are matched on letter/number boundaries, so "c#", "c++", ".net" and "node.js" work.
 * - Spaces inside aliases also match hyphens/underscores ("react native" ≈ "react-native").
 * - Short or ambiguous tokens ("Go", "React", "REST") only match case-sensitively.
 * - Mentions inside "nice to have" sections count half.
 */

export type CatalogSkill = {
  slug: string;
  name: string;
  aliases?: string[];
  caseSensitiveAliases?: string[];
  popularity?: number;
  category?: string;
};

export type SkillMatch = {
  slug: string;
  name: string;
  /** Raw number of mentions. */
  mentions: number;
  /** Mentions weighted by section (required = 1, nice-to-have = 0.5). */
  weight: number;
  /** True if at least one mention was outside a nice-to-have section. */
  required: boolean;
};

export type Seniority = "junior" | "middle" | "senior";

const BOUNDARY_BEFORE = "(?<![\\p{L}\\p{N}_#+])";
const BOUNDARY_AFTER = "(?![\\p{L}\\p{N}_#+])";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

const SEPARATORS = /[\s\-_]+/;

/** "end-to-end testing" → "end to end testing" (used for map keys and lookups). */
function aliasKey(alias: string) {
  return alias.trim().split(SEPARATORS).join(" ");
}

function aliasPattern(alias: string) {
  return alias.trim().split(SEPARATORS).map(escapeRegex).join("[\\s\\-_]+");
}

export function normalizeText(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/ /g, " ");
}

type CompiledMatcher = {
  insensitive: RegExp | null;
  sensitive: RegExp | null;
  byInsensitive: Map<string, CatalogSkill>;
  bySensitive: Map<string, CatalogSkill>;
  /** Cyrillic aliases are matched by stem, since Ukrainian nouns inflect ("структури" → "структур"). */
  inflected: { re: RegExp; skill: CatalogSkill }[];
};

const CYRILLIC = /\p{Script=Cyrillic}/u;

/** "структури даних" → /структур\p{L}{0,4}[\s\-_]+дан\p{L}{0,4}/ */
function inflectedPattern(alias: string) {
  const words = alias.trim().split(SEPARATORS).map((word) => {
    if (!CYRILLIC.test(word) || word.length < 5) return escapeRegex(word);
    const stem = word.replace(/[аеєиіїоуюяьй]{1,2}$/u, "");
    return escapeRegex(stem) + "\\p{L}{0,4}";
  });
  return new RegExp(`${BOUNDARY_BEFORE}${words.join("[\\s\\-_]+")}${BOUNDARY_AFTER}`, "giu");
}

const cache = new WeakMap<readonly CatalogSkill[], CompiledMatcher>();

/** Aliases a skill is matched by (the name is added unless it is short or case-sensitive). */
export function insensitiveAliasesOf(skill: CatalogSkill) {
  const out = new Set((skill.aliases ?? []).map((a) => a.toLowerCase().trim()).filter(Boolean));
  const name = skill.name.toLowerCase().trim();
  if (!(skill.caseSensitiveAliases?.length) && name.length > 2 && !name.includes(" / ")) out.add(name);
  return [...out];
}

function compile(catalog: readonly CatalogSkill[]): CompiledMatcher {
  const hit = cache.get(catalog);
  if (hit) return hit;

  const byInsensitive = new Map<string, CatalogSkill>();
  const bySensitive = new Map<string, CatalogSkill>();
  const inflected: CompiledMatcher["inflected"] = [];
  for (const skill of catalog) {
    for (const alias of insensitiveAliasesOf(skill)) {
      if (CYRILLIC.test(alias)) {
        inflected.push({ re: inflectedPattern(alias), skill });
        continue;
      }
      const key = aliasKey(alias);
      if (!byInsensitive.has(key)) byInsensitive.set(key, skill);
    }
    for (const alias of skill.caseSensitiveAliases ?? []) {
      const key = aliasKey(alias);
      if (!bySensitive.has(key)) bySensitive.set(key, skill);
    }
  }

  const build = (keys: string[], flags: string) => {
    if (!keys.length) return null;
    const sorted = [...keys].sort((a, b) => b.length - a.length).map(aliasPattern);
    return new RegExp(`${BOUNDARY_BEFORE}(?:${sorted.join("|")})${BOUNDARY_AFTER}`, flags);
  };

  const compiled: CompiledMatcher = {
    insensitive: build([...byInsensitive.keys()], "giu"),
    sensitive: build([...bySensitive.keys()], "gu"),
    byInsensitive,
    bySensitive,
    inflected,
  };
  cache.set(catalog, compiled);
  return compiled;
}

const OPTIONAL_HEADER =
  /(nice[\s-]to[\s-]have|would be (a )?(plus|bonus|advantage)|will be (a )?(plus|bonus|advantage)|is a (plus|bonus)|as a plus|bonus points|preferred|optional|буде плюсом|буде перевагою|як перевага|бажано|було б добре|додатково|буде великим плюсом|буде супер|переваг(ою|и))/iu;
const REQUIRED_HEADER =
  /(requirements|required|must[\s-]have|what we expect|you have|you will need|qualifications|who you are|your skills|вимоги|необхідні|обов'язково|що ми очікуємо|ми очікуємо|потрібн[оі]|твій досвід|ваш досвід|про тебе)/iu;
const RESPONSIBILITIES_HEADER =
  /(responsibilities|what you('| wi)ll do|about (the )?(company|project|us|role)|обов'язки|що потрібно робити|про компанію|про проєкт|про проект)/iu;
/** Perks sections ("English classes", "Udemy courses") say nothing about required skills. */
const BENEFITS_HEADER =
  /(we offer|what we offer|benefits|perks|why join|what you get|ми пропонуємо|що ми пропонуємо|пропонуємо|бонуси|що ти отримаєш|умови роботи)/iu;

function isHeader(line: string) {
  const trimmed = line.trim();
  return trimmed.length > 0 && trimmed.length <= 80 && (/[:：]$/.test(trimmed) || /^#{1,6}\s/.test(trimmed) || trimmed.split(/\s+/).length <= 6);
}

/** Splits text into lines tagged with their section: nice-to-have (optional) or perks (ignored). */
export function sectionize(text: string) {
  const lines = normalizeText(text).split(/\r?\n/);
  let optional = false;
  let ignored = false;
  return lines.map((line) => {
    if (isHeader(line)) {
      if (BENEFITS_HEADER.test(line)) {
        ignored = true;
        optional = false;
      } else if (OPTIONAL_HEADER.test(line)) {
        optional = true;
        ignored = false;
      } else if (REQUIRED_HEADER.test(line) || RESPONSIBILITIES_HEADER.test(line)) {
        optional = false;
        ignored = false;
      }
    }
    const inlineOptional = OPTIONAL_HEADER.test(line) && !isHeader(line);
    return { line, optional: optional || inlineOptional, ignored };
  });
}

function scanLine(
  line: string,
  optional: boolean,
  compiled: CompiledMatcher,
  acc: Map<string, SkillMatch>,
) {
  const add = (skill: CatalogSkill) => {
    const current = acc.get(skill.slug) ?? { slug: skill.slug, name: skill.name, mentions: 0, weight: 0, required: false };
    current.mentions += 1;
    current.weight += optional ? 0.5 : 1;
    current.required ||= !optional;
    acc.set(skill.slug, current);
  };
  const hits: { start: number; end: number; skill: CatalogSkill }[] = [];
  const push = (m: RegExpMatchArray, skill: CatalogSkill | undefined) => {
    if (skill) hits.push({ start: m.index!, end: m.index! + m[0].length, skill });
  };
  if (compiled.insensitive) {
    for (const m of line.matchAll(compiled.insensitive)) push(m, compiled.byInsensitive.get(aliasKey(m[0].toLowerCase())));
  }
  if (compiled.sensitive) {
    for (const m of line.matchAll(compiled.sensitive)) push(m, compiled.bySensitive.get(aliasKey(m[0])));
  }
  if (compiled.inflected.length && CYRILLIC.test(line)) {
    for (const { re, skill } of compiled.inflected) for (const m of line.matchAll(re)) push(m, skill);
  }

  // One mention per span and skill: "REST APIs" hits both "rest apis" and "REST",
  // "англійська мова" hits two stems. Different skills may overlap ("React Testing Library").
  hits.sort((a, b) => b.end - b.start - (a.end - a.start));
  const kept: typeof hits = [];
  for (const hit of hits) {
    if (kept.some((k) => k.skill === hit.skill && hit.start < k.end && k.start < hit.end)) continue;
    kept.push(hit);
    add(hit.skill);
  }
}

function rank(acc: Map<string, SkillMatch>, catalog: readonly CatalogSkill[]) {
  const popularity = new Map(catalog.map((s) => [s.slug, s.popularity ?? 0]));
  return [...acc.values()].sort(
    (a, b) =>
      Number(b.required) - Number(a.required) ||
      b.weight - a.weight ||
      (popularity.get(b.slug) ?? 0) - (popularity.get(a.slug) ?? 0),
  );
}

export function matchSkills(text: string, catalog: readonly CatalogSkill[]): SkillMatch[] {
  const compiled = compile(catalog);
  const acc = new Map<string, SkillMatch>();
  for (const { line, optional, ignored } of sectionize(text)) if (!ignored) scanLine(line, optional, compiled, acc);
  return rank(acc, catalog);
}

/**
 * Same as matchSkills but yields to the event loop between chunks and reports progress,
 * so the loading screen can show real progress and stream skills as they are found.
 */
export async function matchSkillsProgressive(
  text: string,
  catalog: readonly CatalogSkill[],
  onProgress: (fraction: number, found: SkillMatch[]) => void,
  chunkLines = 12,
) {
  const compiled = compile(catalog);
  const acc = new Map<string, SkillMatch>();
  const lines = sectionize(text);
  for (let i = 0; i < lines.length; i += chunkLines) {
    for (const { line, optional, ignored } of lines.slice(i, i + chunkLines)) if (!ignored) scanLine(line, optional, compiled, acc);
    onProgress(Math.min(1, (i + chunkLines) / Math.max(lines.length, 1)), rank(acc, catalog));
    await new Promise((r) => setTimeout(r, 0));
  }
  onProgress(1, rank(acc, catalog));
  return rank(acc, catalog);
}

/** Best-effort seniority guess from the job text. */
export function detectSeniority(text: string): Seniority | null {
  const t = normalizeText(text).toLowerCase();
  const head = t.slice(0, 400);
  const pick = (scope: string): Seniority | null => {
    if (/(senior|sr\.|lead|principal|staff engineer|architect|сеньйор|синьйор|сеніор|старший)/u.test(scope)) return "senior";
    if (/(middle|mid[\s-]?level|\bmid\b|intermediate developer|мідл|міддл|middle\+)/u.test(scope)) return "middle";
    if (/(junior|trainee|intern\b|entry[\s-]level|джун|джуніор|молодший|стажер)/u.test(scope)) return "junior";
    return null;
  };
  const fromTitle = pick(head);
  if (fromTitle) return fromTitle;

  const years = [...t.matchAll(/(\d{1,2})\s*\+?\s*(?:years?|yrs?|рок(?:и|ів|у)?)/gu)].map((m) => Number(m[1]));
  if (years.length) {
    const y = Math.max(...years.filter((n) => n < 20));
    if (y >= 5) return "senior";
    if (y >= 2) return "middle";
    return "junior";
  }
  return pick(t);
}
