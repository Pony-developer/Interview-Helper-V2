import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const TRUNCATE_STARTER = String.raw`/** Splits text into user-perceived characters (grapheme clusters). */
export function graphemes(text: string): string[] {
  return text.split(""); // TODO: splits surrogate pairs, emoji sequences and combining marks
}

export function countGraphemes(text: string): number {
  return text.length; // TODO
}

/**
 * Shortens text to at most max user-perceived characters, including the ellipsis.
 * With wordBoundary, cuts back to the last whitespace when there is one.
 */
export function truncate(text: string, max: number, { ellipsis = "…", wordBoundary = false } = {}): string {
  // TODO: can cut an emoji in half
  return text.length <= max ? text : text.slice(0, max - ellipsis.length) + ellipsis;
}

export function reverse(text: string): string {
  return text.split("").reverse().join(""); // TODO
}
`;

const TRUNCATE_SOLUTION = String.raw`const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function graphemes(text: string): string[] {
  return Array.from(segmenter.segment(text), (s) => s.segment);
}

export function countGraphemes(text: string): number {
  let count = 0;
  for (const _ of segmenter.segment(text)) count++;
  return count;
}

export function truncate(text: string, max: number, { ellipsis = "…", wordBoundary = false } = {}): string {
  const chars = graphemes(text);
  if (chars.length <= max) return text;
  const room = max - countGraphemes(ellipsis);
  if (room <= 0) return graphemes(ellipsis).slice(0, Math.max(0, max)).join("");
  let kept = chars.slice(0, room);
  if (wordBoundary) {
    const lastSpace = kept.findLastIndex((c) => /^\s+$/u.test(c));
    if (lastSpace > 0) kept = kept.slice(0, lastSpace);
  }
  return kept.join("").trimEnd() + ellipsis;
}

export function reverse(text: string): string {
  return graphemes(text).reverse().join("");
}
`;

const TRUNCATE_INDEX = String.raw`import "./styles.css";
import { countGraphemes, reverse, truncate } from "./src/graphemes";

const samples = ["Hello 👋🏽 world", "Сім'я: 👨‍👩‍👧 🇺🇦", "Crème brûlée is delicious"];
const lines: string[] = [];
for (const s of samples) {
  try {
    lines.push(JSON.stringify(s) + ": length " + s.length + ", characters " + countGraphemes(s));
    lines.push("  truncate(…, 9): " + truncate(s, 9));
    lines.push("  reverse: " + reverse(s));
  } catch (e) {
    lines.push("error: " + (e as Error).message);
  }
}
document.getElementById("app")!.innerHTML = '<h1>Graphemes</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const TRUNCATE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { countGraphemes, graphemes, reverse, truncate } from "../src/graphemes";

const family = "👨‍👩‍👧";
const eAcute = "é"; // e + combining acute accent

describe("graphemes", () => {
  it("counts user-perceived characters", () => {
    expect(countGraphemes("abc")).toBe(3);
    expect(countGraphemes(family)).toBe(1);
    expect(countGraphemes(eAcute)).toBe(1);
    expect(countGraphemes("🇺🇦🇵🇱")).toBe(2);
    expect(countGraphemes("👍🏽")).toBe(1);
    expect(graphemes("a" + family + eAcute)).toEqual(["a", family, eAcute]);
  });
});

describe("truncate", () => {
  it("returns short text unchanged", () => {
    expect(truncate("hi " + family, 4)).toBe("hi " + family);
  });
  it("counts the ellipsis and never splits a character", () => {
    expect(truncate("Hello 👋🏽 world", 8)).toBe("Hello 👋🏽…");
    const result = truncate(family + family + family, 2);
    expect(result).toBe(family + "…");
    expect(result.isWellFormed()).toBe(true);
  });
  it("supports a custom ellipsis and tiny limits", () => {
    expect(truncate("abcdefgh", 6, { ellipsis: "..." })).toBe("abc...");
    expect(truncate("abcdef", 1)).toBe("…");
    expect(truncate("abcdef", 0)).toBe("");
  });
  it("cuts at a word boundary when asked", () => {
    expect(truncate("The quick brown fox", 12, { wordBoundary: true })).toBe("The quick…");
    expect(truncate("Supercalifragilistic", 8, { wordBoundary: true })).toBe("Superca…");
  });
  it("doesn't leave a trailing space before the ellipsis", () => {
    expect(truncate("one two three", 5)).toBe("one…");
  });
});

describe("reverse", () => {
  it("keeps emoji sequences and accents intact", () => {
    expect(reverse("ab👍🏽" + eAcute)).toBe(eAcute + "👍🏽ba");
    expect(reverse(family + "🇺🇦")).toBe("🇺🇦" + family);
  });
});
`;

const FOLD_STARTER = String.raw`/** Makes text comparable: case-, accent- and width-insensitive, but keeps non-Latin letters intact. */
export function fold(text: string): string {
  return text.toLowerCase(); // TODO
}

/** URL slug: folded, letters and digits in any script, runs of anything else become "-". */
export function slugify(text: string): string {
  // TODO: deletes every non-ASCII letter
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function includesFolded(haystack: string, needle: string): boolean {
  return haystack.includes(needle); // TODO
}

/** Human ordering: case-insensitive, numbers by value, language-aware. Doesn't mutate the input. */
export function sortNatural(list: string[], locale = "en"): string[] {
  return list.sort(); // TODO
}
`;

const FOLD_SOLUTION = String.raw`export function fold(text: string): string {
  return (
    text
      // NFKD splits accents off their letters and maps compatibility forms (full-width, ligatures) to plain ones.
      .normalize("NFKD")
      // Drop accents only from Latin letters: in Ukrainian, й and ї are distinct letters, not accented и and і.
      .replace(/(\p{Script=Latin})\p{M}+/gu, "$1")
      .toLowerCase()
      // Recompose what's left (й, ї) into single code points.
      .normalize("NFC")
  );
}

export function slugify(text: string): string {
  return fold(text)
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function includesFolded(haystack: string, needle: string): boolean {
  return fold(haystack).includes(fold(needle));
}

export function sortNatural(list: string[], locale = "en"): string[] {
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
  return [...list].sort(collator.compare);
}
`;

const FOLD_INDEX = String.raw`import "./styles.css";
import { includesFolded, slugify, sortNatural } from "./src/fold";

const lines: string[] = [];
try {
  lines.push(slugify("Crème Brûlée — 2 Ways!"));
  lines.push(slugify("Привіт, світ! Їжак і йогурт"));
  lines.push("search 'resume' in 'My Résumé': " + includesFolded("My Résumé", "resume"));
  lines.push(sortNatural(["file10.txt", "File2.txt", "file1.txt"]).join(", "));
} catch (e) {
  lines.push("error: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Folding</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const FOLD_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { fold, includesFolded, slugify, sortNatural } from "../src/fold";

describe("fold", () => {
  it("ignores case, accents and composition", () => {
    expect(fold("Crème Brûlée")).toBe("creme brulee");
    expect(fold("café")).toBe(fold("café"));
    expect(fold("NAÏVE")).toBe("naive");
  });
  it("maps full-width forms and ligatures", () => {
    expect(fold("ＲＥＳＵＭＥ")).toBe("resume");
    expect(fold("ﬁle")).toBe("file");
  });
  it("keeps Ukrainian letters that only look accented", () => {
    expect(fold("Їжак й Ґанок")).toBe("їжак й ґанок");
    expect(fold("Їжак").length).toBe(4);
  });
});

describe("slugify", () => {
  it("builds slugs from Latin text", () => {
    expect(slugify("Crème Brûlée — 2 Ways!")).toBe("creme-brulee-2-ways");
    expect(slugify("  --Hello,   World--  ")).toBe("hello-world");
  });
  it("keeps letters from other scripts", () => {
    expect(slugify("Привіт, світ! Їжак і йогурт")).toBe("привіт-світ-їжак-і-йогурт");
  });
});

describe("includesFolded", () => {
  it("matches regardless of accents and case", () => {
    expect(includesFolded("My Résumé (2024)", "RESUME")).toBe(true);
    expect(includesFolded("Kyiv", "lviv")).toBe(false);
  });
});

describe("sortNatural", () => {
  it("orders numbers by value and ignores case", () => {
    expect(sortNatural(["file10.txt", "File2.txt", "file1.txt"])).toEqual(["file1.txt", "File2.txt", "file10.txt"]);
  });
  it("uses the language's alphabet", () => {
    expect(sortNatural(["ґанок", "яма", "гора", "єнот"], "uk")).toEqual(["гора", "ґанок", "єнот", "яма"]);
  });
  it("doesn't mutate the input", () => {
    const list = ["b", "a"];
    sortNatural(list);
    expect(list).toEqual(["b", "a"]);
  });
});
`;

export default defineTasks([
  quiz(
    "uni-length",
    ["unicode-strings"],
    1,
    60,
    ["What does `length` count?", "Що рахує `length`?"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`2 8 5`", "`2 8 5`"],
      ["`1 1 1`", "`1 1 1`"],
      ["`1 3 3`", "`1 3 3`"],
      ["`2 8 1`", "`2 8 1`"],
    ],
    "a",
    [
      "`length` counts UTF-16 **code units**. 😀 is one code point above `U+FFFF`, so it takes a surrogate pair (2). The family emoji is three person emoji (2 units each) joined by two zero-width joiners (1 each): 8 units. Spreading a string iterates **code points**: 3 emoji + 2 joiners = 5. To a user it's still one character, which only `Intl.Segmenter` counts.",
      "`length` рахує **кодові одиниці** UTF-16. 😀 є однією кодовою точкою вище `U+FFFF`, тож займає сурогатну пару (2). Емодзі родини складається з трьох емодзі людей (по 2 одиниці), з'єднаних двома символами нульової ширини (по 1): 8 одиниць. Розгортання рядка перебирає **кодові точки**: 3 емодзі + 2 з'єднувачі = 5. Для користувача це все одно один символ, і порахувати його так уміє лише `Intl.Segmenter`.",
    ],
    { code: 'console.log("😀".length, "👨‍👩‍👧".length, [..."👨‍👩‍👧"].length);', codeLanguage: "js" },
  ),
  quiz(
    "uni-codepoint-vs-charcode",
    ["unicode-strings"],
    2,
    75,
    ["`charCodeAt` vs `codePointAt`", "`charCodeAt` проти `codePointAt`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`d83d 1f600 de00`", "`d83d 1f600 de00`"],
      ["`1f600 1f600 0`", "`1f600 1f600 0`"],
      ["`d83d d83d de00`", "`d83d d83d de00`"],
      ["`1f600 1f600 de00`", "`1f600 1f600 de00`"],
    ],
    "a",
    [
      "`charCodeAt(0)` returns the first code unit, the high surrogate `d83d`. `codePointAt(0)` sees that it starts a surrogate pair and combines both units into the real code point `1f600`. At index 1 there's only the low surrogate left, so it returns `de00`. Iterate with `for…of` (which steps by code points) to avoid landing in the middle of a pair.",
      "`charCodeAt(0)` повертає першу кодову одиницю, верхній сурогат `d83d`. `codePointAt(0)` бачить, що з нього починається сурогатна пара, і поєднує обидві одиниці в справжню кодову точку `1f600`. На індексі 1 лишається тільки нижній сурогат, тож вона повертає `de00`. Перебирайте через `for…of` (він іде по кодових точках), щоб не потрапити в середину пари.",
    ],
    { code: 'const s = "😀";\nconsole.log(s.charCodeAt(0).toString(16), s.codePointAt(0).toString(16), s.codePointAt(1).toString(16));', codeLanguage: "js" },
  ),
  quiz(
    "uni-normalize",
    ["unicode-strings"],
    2,
    75,
    ["Two ways to write é", "Два способи записати é"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`false 4 5 true`", "`false 4 5 true`"],
      ["`true 4 4 true`", "`true 4 4 true`"],
      ["`false 4 5 false`", "`false 4 5 false`"],
      ["`true 4 5 true`", "`true 4 5 true`"],
    ],
    "a",
    [
      "`\\u00e9` is the precomposed é (NFC), while `e` + `\\u0301` is a base letter plus a combining accent (NFD). They render identically but are different code point sequences, so `===` fails and the lengths differ. `normalize()` (NFC by default) converts both to the same form. Normalise user input before comparing, storing or using it as a key.",
      "`\\u00e9` є готовою літерою é (NFC), а `e` + `\\u0301` є базовою літерою з комбінованим наголосом (NFD). Вони виглядають однаково, але є різними послідовностями кодових точок, тож `===` не проходить, а довжини різні. `normalize()` (за замовчуванням NFC) перетворює обидва в ту саму форму. Нормалізуйте введення користувача перед порівнянням, збереженням чи використанням як ключа.",
    ],
    { code: 'const a = "caf\\u00e9";\nconst b = "cafe\\u0301";\nconsole.log(a === b, a.length, b.length, a.normalize() === b.normalize());', codeLanguage: "js" },
  ),
  quiz(
    "uni-sharp-s",
    ["unicode-strings"],
    2,
    60,
    ["Uppercasing can change length", "Великі літери можуть змінити довжину"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`STRASSE 7`", "`STRASSE 7`"],
      ["`STRAßE 6`", "`STRAßE 6`"],
      ["`STRAẞE 6`", "`STRAẞE 6`"],
      ["`STRASSE 6`", "`STRASSE 6`"],
    ],
    "a",
    [
      "Unicode's default case mapping turns German `ß` into two letters, `SS`, so the string grows from 6 to 7 characters. Code that uppercases and then reuses indexes or lengths from the original string breaks. Case mapping can also depend on the language (Turkish i), so compare case-insensitively with `localeCompare` or `Intl.Collator` instead of uppercasing both sides.",
      "Типове перетворення регістру в Unicode перетворює німецьку `ß` на дві літери `SS`, тож рядок зростає з 6 до 7 символів. Код, що переводить у верхній регістр, а потім використовує індекси чи довжини з початкового рядка, ламається. Перетворення регістру може ще й залежати від мови (турецька i), тож порівнюйте без урахування регістру через `localeCompare` чи `Intl.Collator`, а не переводячи обидва боки у верхній регістр.",
    ],
    { code: 'console.log("straße".toUpperCase(), "straße".toUpperCase().length);', codeLanguage: "js" },
  ),
  quiz(
    "uni-turkish-i",
    ["unicode-strings", w("i18n")],
    3,
    75,
    ["Locale-sensitive case mapping", "Перетворення регістру з урахуванням локалі"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`I İ ı`", "`I İ ı`"],
      ["`I I i`", "`I I i`"],
      ["`I İ i`", "`I İ i`"],
      ["`İ İ ı`", "`İ İ ı`"],
    ],
    "a",
    [
      "Turkish and Azerbaijani have both dotted (`i`/`İ`) and dotless (`ı`/`I`) letters. `toUpperCase` uses language-neutral rules, while `toLocaleUpperCase(\"tr\")` maps `i` to `İ` and `toLocaleLowerCase(\"tr\")` maps `I` to `ı`. Using locale-neutral mapping for Turkish user names, or locale-specific mapping for identifiers and protocol keywords, are both real bugs.",
      "У турецькій та азербайджанській є літери з крапкою (`i`/`İ`) і без неї (`ı`/`I`). `toUpperCase` використовує мовно-нейтральні правила, а `toLocaleUpperCase(\"tr\")` перетворює `i` на `İ`, і `toLocaleLowerCase(\"tr\")` перетворює `I` на `ı`. Нейтральне перетворення для турецьких імен користувачів і локальне для ідентифікаторів чи ключових слів протоколу є реальними помилками.",
    ],
    { code: 'console.log("i".toUpperCase(), "i".toLocaleUpperCase("tr"), "I".toLocaleLowerCase("tr"));', codeLanguage: "js" },
  ),
  quiz(
    "uni-default-sort",
    ["unicode-strings", w("arrays-strings")],
    2,
    75,
    ["The default sort order", "Типовий порядок сортування"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'Z', 'a', 'b', 'item10', 'item2', 'é' ]`", "`[ 'Z', 'a', 'b', 'item10', 'item2', 'é' ]`"],
      ["`[ 'a', 'b', 'é', 'item2', 'item10', 'Z' ]`", "`[ 'a', 'b', 'é', 'item2', 'item10', 'Z' ]`"],
      ["`[ 'a', 'b', 'item2', 'item10', 'Z', 'é' ]`", "`[ 'a', 'b', 'item2', 'item10', 'Z', 'é' ]`"],
      ["`[ 'Z', 'a', 'b', 'é', 'item10', 'item2' ]`", "`[ 'Z', 'a', 'b', 'é', 'item10', 'item2' ]`"],
    ],
    "a",
    [
      "Without a comparator, `sort` compares UTF-16 code units: uppercase letters (`Z` = 90) come before lowercase (`a` = 97), accented letters (`é` = 233) after all ASCII letters, and digits character by character, so `\"item10\" < \"item2\"`. For text shown to people, sort with `new Intl.Collator(locale, { numeric: true }).compare`.",
      "Без функції порівняння `sort` порівнює кодові одиниці UTF-16: великі літери (`Z` = 90) йдуть перед малими (`a` = 97), літери з наголосами (`é` = 233) після всіх літер ASCII, а цифри посимвольно, тож `\"item10\" < \"item2\"`. Для тексту, який бачать люди, сортуйте через `new Intl.Collator(locale, { numeric: true }).compare`.",
    ],
    { code: 'console.log(["b", "a", "Z", "é", "item10", "item2"].sort());', codeLanguage: "js" },
  ),
  quiz(
    "uni-collator",
    ["unicode-strings", w("i18n")],
    3,
    90,
    ["`Intl.Collator` options", "Параметри `Intl.Collator`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'item1', 'Item2', 'item10' ] 0`", "`[ 'item1', 'Item2', 'item10' ] 0`"],
      ["`[ 'Item2', 'item1', 'item10' ] -1`", "`[ 'Item2', 'item1', 'item10' ] -1`"],
      ["`[ 'item1', 'item10', 'Item2' ] 0`", "`[ 'item1', 'item10', 'Item2' ] 0`"],
      ["`[ 'item1', 'Item2', 'item10' ] -1`", "`[ 'item1', 'Item2', 'item10' ] -1`"],
    ],
    "a",
    [
      "`numeric: true` compares digit runs as numbers (2 < 10), and `sensitivity: \"base\"` ignores case and accents, so `Item2` sorts as `item2` and `\"resume\"` equals `\"Résumé\"` (compare returns `0`). Create the collator once and reuse its `compare`: constructing one per comparison is slow.",
      "`numeric: true` порівнює послідовності цифр як числа (2 < 10), а `sensitivity: \"base\"` ігнорує регістр і наголоси, тож `Item2` сортується як `item2`, а `\"resume\"` дорівнює `\"Résumé\"` (порівняння повертає `0`). Створюйте колатор один раз і повторно використовуйте його `compare`: створення нового для кожного порівняння повільне.",
    ],
    { code: 'const c = new Intl.Collator("en", { numeric: true, sensitivity: "base" });\nconsole.log(["item10", "Item2", "item1"].sort(c.compare), c.compare("resume", "Résumé"));', codeLanguage: "js" },
  ),
  quiz(
    "uni-lone-surrogate",
    ["unicode-strings"],
    3,
    90,
    ["Slicing through an emoji", "Розрізання емодзі"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`3 false \"hi\\ud83d\"`", "`3 false \"hi\\ud83d\"`"],
      ["`3 true \"hi😀\"`", "`3 true \"hi😀\"`"],
      ["`2 true \"hi\"`", "`2 true \"hi\"`"],
      ["`4 true \"hi😀\"`", "`4 true \"hi😀\"`"],
    ],
    "a",
    [
      "`slice` works on code units, so `slice(0, 3)` keeps `h`, `i` and only the high surrogate of 😀. The result is a **lone surrogate**, which isn't valid Unicode: `isWellFormed()` reports it, `JSON.stringify` escapes it as `\\ud83d`, and encoding it to UTF-8 produces a replacement character. Cut by graphemes (or at least code points) instead, or repair with `toWellFormed()`.",
      "`slice` працює з кодовими одиницями, тож `slice(0, 3)` зберігає `h`, `i` і лише верхній сурогат 😀. Результатом є **самотній сурогат**, що не є коректним Unicode: `isWellFormed()` це показує, `JSON.stringify` екранує його як `\\ud83d`, а кодування в UTF-8 дає символ заміни. Ріжте за графемами (чи хоча б за кодовими точками) або виправляйте через `toWellFormed()`.",
    ],
    { code: 'const cut = "hi😀".slice(0, 3);\nconsole.log(cut.length, cut.isWellFormed(), JSON.stringify(cut));', codeLanguage: "js" },
  ),
  quiz(
    "uni-regex-flags",
    ["unicode-strings", w("regex")],
    3,
    90,
    ["Regexes and the `u` flag", "Регулярні вирази й прапорець `u`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`false true false true`", "`false true false true`"],
      ["`true true true true`", "`true true true true`"],
      ["`false true true true`", "`false true true true`"],
      ["`false false false true`", "`false false false true`"],
    ],
    "a",
    [
      "Without `u`, `.` matches one code unit, so it can't match the two units of 😀 as a whole. With `u`, the regex works on code points. But `\\w` stays ASCII-only (`[A-Za-z0-9_]`) even with `u`, so it doesn't match `é`. Unicode property escapes like `\\p{L}` (any letter in any script) need the `u` or `v` flag and are the right tool for international text.",
      "Без `u` `.` збігається з однією кодовою одиницею, тож не може збігтися з двома одиницями 😀 як цілим. З `u` регулярний вираз працює з кодовими точками. Але `\\w` лишається лише ASCII (`[A-Za-z0-9_]`) навіть з `u`, тож не збігається з `é`. Екранування властивостей Unicode на кшталт `\\p{L}` (будь-яка літера будь-якої писемності) потребують прапорця `u` чи `v` і є правильним інструментом для міжнародного тексту.",
    ],
    { code: 'console.log(/^.$/.test("😀"), /^.$/u.test("😀"), /\\w/u.test("é"), /\\p{L}/u.test("é"));', codeLanguage: "js" },
  ),
  quiz(
    "uni-segmenter",
    ["unicode-strings"],
    3,
    90,
    ["Three ways to count", "Три способи рахувати"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`10 6 3`", "`10 6 3`"],
      ["`3 3 3`", "`3 3 3`"],
      ["`10 10 3`", "`10 10 3`"],
      ["`6 6 3`", "`6 6 3`"],
    ],
    "a",
    [
      "👍🏽 is a thumbs-up plus a skin-tone modifier (2 code points, 4 units), 🇺🇦 is two regional-indicator letters (2 code points, 4 units), and é here is `e` plus a combining accent (2 code points, 2 units). So: 10 code units, 6 code points, and 3 graphemes, the number a person would count. Use the grapheme count for character limits and cursor movement.",
      "👍🏽 складається з піднятого пальця й модифікатора тону шкіри (2 кодові точки, 4 одиниці), 🇺🇦 з двох регіональних літер-індикаторів (2 кодові точки, 4 одиниці), а é тут є `e` з комбінованим наголосом (2 кодові точки, 2 одиниці). Тож: 10 кодових одиниць, 6 кодових точок і 3 графеми, тобто стільки, скільки нарахувала б людина. Використовуйте кількість графем для обмежень символів і переміщення курсора.",
    ],
    { code: 'const seg = new Intl.Segmenter("en", { granularity: "grapheme" });\nconst s = "👍🏽🇺🇦e\\u0301";\nconsole.log(s.length, [...s].length, [...seg.segment(s)].length);', codeLanguage: "js" },
  ),
  quiz(
    "uni-utf8-bytes",
    ["unicode-strings", w("http-rest")],
    2,
    75,
    ["Characters vs bytes", "Символи проти байтів"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 1, 2, 3, 4 ]`", "`[ 1, 2, 3, 4 ]`"],
      ["`[ 1, 1, 1, 2 ]`", "`[ 1, 1, 1, 2 ]`"],
      ["`[ 2, 2, 2, 4 ]`", "`[ 2, 2, 2, 4 ]`"],
      ["`[ 1, 2, 2, 4 ]`", "`[ 1, 2, 2, 4 ]`"],
    ],
    "a",
    [
      "`TextEncoder` produces UTF-8, where ASCII takes 1 byte, Latin accents and Cyrillic 2, most other BMP characters like `€` 3, and emoji 4. Byte sizes, not `length`, matter for database column limits, HTTP header sizes, `Content-Length`, and storage quotas.",
      "`TextEncoder` створює UTF-8, де ASCII займає 1 байт, латинські літери з наголосами й кирилиця 2, більшість інших символів BMP на кшталт `€` 3, а емодзі 4. Для обмежень стовпців бази даних, розмірів заголовків HTTP, `Content-Length` і квот сховища важливий розмір у байтах, а не `length`.",
    ],
    { code: 'const enc = new TextEncoder();\nconsole.log(["a", "é", "€", "😀"].map((c) => enc.encode(c).length));', codeLanguage: "js" },
  ),
  practice({
    slug: "uni-graphemes",
    skills: ["unicode-strings", w("arrays-strings"), w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Emoji-safe counting, truncation and reversal", "Безпечні для емодзі підрахунок, обрізання й перевертання"],
    prompt: [
      "Implement grapheme-aware helpers in `src/graphemes.ts` (use `Intl.Segmenter`):\n\n- `graphemes(text)` returns user-perceived characters, and `countGraphemes(text)` counts them. A family emoji, a flag, an emoji with a skin tone and `e` + a combining accent each count as **one**.\n- `truncate(text, max, { ellipsis = \"…\", wordBoundary = false })` returns text of at most `max` characters **including the ellipsis**, never splitting a character. Short text comes back unchanged, trailing whitespace before the ellipsis is removed, and if `max` leaves no room for any text it returns as much of the ellipsis as fits. With `wordBoundary`, it cuts back to the last whitespace when one exists.\n- `reverse(text)` reverses by characters, keeping emoji sequences and accents intact.",
      "Реалізуйте помічники з урахуванням графем у `src/graphemes.ts` (використайте `Intl.Segmenter`):\n\n- `graphemes(text)` повертає символи, як їх сприймає користувач, а `countGraphemes(text)` рахує їх. Емодзі родини, прапор, емодзі з тоном шкіри й `e` з комбінованим наголосом рахуються як **один** символ кожен.\n- `truncate(text, max, { ellipsis = \"…\", wordBoundary = false })` повертає текст щонайбільше з `max` символів **разом із трикрапкою**, ніколи не розрізаючи символ. Короткий текст повертається без змін, пробіли в кінці перед трикрапкою прибираються, а якщо `max` не лишає місця для тексту, повертається стільки трикрапки, скільки вміщується. З `wordBoundary` обрізання відступає до останнього пробілу, якщо він є.\n- `reverse(text)` перевертає рядок за символами, зберігаючи послідовності емодзі й наголоси.",
    ],
    files: { "/src/graphemes.ts": TRUNCATE_STARTER, "/index.ts": TRUNCATE_INDEX },
    visibleFiles: ["/src/graphemes.ts", "/index.ts"],
    activeFile: "/src/graphemes.ts",
    tests: TRUNCATE_TESTS,
    solution: { "/src/graphemes.ts": TRUNCATE_SOLUTION },
    explanation: [
      "`Intl.Segmenter` with grapheme granularity implements Unicode's text segmentation rules: it keeps surrogate pairs, zero-width-joiner sequences, skin-tone modifiers, regional-indicator pairs and combining marks together. Once text is an array of graphemes, counting, slicing and reversing are plain array operations that can't produce lone surrogates or detached accents. Create the segmenter once at module level, since constructing `Intl` objects is relatively expensive.",
      "`Intl.Segmenter` з гранулярністю графем реалізує правила сегментації тексту Unicode: він тримає разом сурогатні пари, послідовності з з'єднувачем нульової ширини, модифікатори тону шкіри, пари регіональних індикаторів і комбіновані знаки. Щойно текст стає масивом графем, підрахунок, вирізання й перевертання є звичайними операціями з масивом, що не можуть створити самотніх сурогатів чи відірваних наголосів. Створюйте сегментатор один раз на рівні модуля, бо створення об'єктів `Intl` відносно дороге.",
    ],
  }),
  practice({
    slug: "uni-fold-slugify",
    skills: ["unicode-strings", w("i18n"), w("regex")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Accent-insensitive search, slugs and natural sorting", "Пошук без урахування наголосів, слаги й природне сортування"],
    prompt: [
      "Implement text helpers for a multilingual site in `src/fold.ts`:\n\n- `fold(text)` makes text comparable: case-insensitive, accent-insensitive for **Latin** letters (`Crème` → `creme`), full-width forms and ligatures mapped to plain letters (`ＲＥＳＵＭＥ` → `resume`, `ﬁ` → `fi`). Ukrainian letters like `й` and `ї` must survive unchanged: they're separate letters, not accented ones.\n- `slugify(text)` folds the text, keeps letters and digits **of any script**, turns every run of anything else into a single `-`, and trims dashes at the ends.\n- `includesFolded(haystack, needle)` searches with folding on both sides.\n- `sortNatural(list, locale)` returns a sorted **copy**: case-insensitive, numbers by value (`file2` before `file10`), and in the alphabet order of the locale (in Ukrainian, `ґ` comes right after `г`).",
      "Реалізуйте помічники для тексту на багатомовному сайті в `src/fold.ts`:\n\n- `fold(text)` робить текст порівнюваним: без урахування регістру, без урахування наголосів для **латинських** літер (`Crème` → `creme`), повноширинні форми й лігатури перетворені на звичайні літери (`ＲＥＳＵＭＥ` → `resume`, `ﬁ` → `fi`). Українські літери на кшталт `й` і `ї` мають лишатися без змін: це окремі літери, а не літери з наголосами.\n- `slugify(text)` згортає текст, зберігає літери й цифри **будь-якої писемності**, перетворює кожну послідовність усього іншого на один `-` і прибирає дефіси на краях.\n- `includesFolded(haystack, needle)` шукає зі згортанням з обох боків.\n- `sortNatural(list, locale)` повертає відсортовану **копію**: без урахування регістру, числа за значенням (`file2` перед `file10`) і в алфавітному порядку локалі (в українській `ґ` іде одразу після `г`).",
    ],
    files: { "/src/fold.ts": FOLD_STARTER, "/index.ts": FOLD_INDEX },
    visibleFiles: ["/src/fold.ts", "/index.ts"],
    activeFile: "/src/fold.ts",
    tests: FOLD_TESTS,
    solution: { "/src/fold.ts": FOLD_SOLUTION },
    explanation: [
      "NFKD normalisation splits letters from their combining marks and replaces compatibility characters with their plain equivalents. Removing marks blindly would turn `й` into `и` and `ї` into `і`, so the regex only strips marks that follow a Latin letter (`\\p{Script=Latin}`), and a final NFC recomposes the Cyrillic letters. `\\p{L}` and `\\p{N}` keep letters and digits of every script in slugs. For ordering, `Intl.Collator` with `numeric` and `sensitivity: \"base\"` implements the locale's real alphabet, which raw code-unit comparison gets wrong.",
      "Нормалізація NFKD відокремлює літери від комбінованих знаків і замінює символи сумісності їхніми звичайними відповідниками. Сліпе видалення знаків перетворило б `й` на `и`, а `ї` на `і`, тож регулярний вираз прибирає лише знаки після латинської літери (`\\p{Script=Latin}`), а фінальна NFC знову складає кириличні літери. `\\p{L}` і `\\p{N}` зберігають у слагах літери й цифри всіх писемностей. Для впорядкування `Intl.Collator` з `numeric` і `sensitivity: \"base\"` реалізує справжній алфавіт локалі, а сире порівняння кодових одиниць помиляється.",
    ],
  }),
]);
