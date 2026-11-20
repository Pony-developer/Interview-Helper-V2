import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code below contains "${", which can't live inside String.raw: "#{" stands for "${". */
const js = (source: string) => source.replace(/#\{/g, "${");

const QUERY_STARTER = String.raw`export type ParsedQuery = { filters: Record<string, string[]>; text: string };

/**
 * Parses a GitHub-style search query:
 *   'is:open label:"good first issue" fix crash'
 *   → { filters: { is: ["open"], label: ["good first issue"] }, text: "fix crash" }
 */
export function parseQuery(input: string): ParsedQuery {
  // TODO: quoted values, repeated keys, case-insensitive keys, and things like "10:30" that aren't filters
  const filters: Record<string, string[]> = {};
  const words: string[] = [];
  for (const token of input.split(" ")) {
    const i = token.indexOf(":");
    if (i > 0) filters[token.slice(0, i)] = [token.slice(i + 1)];
    else if (token) words.push(token);
  }
  return { filters, text: words.join(" ") };
}
`;

const QUERY_SOLUTION = String.raw`export type ParsedQuery = { filters: Record<string, string[]>; text: string };

// key:value or key:"quoted value", as a whole whitespace-separated token. Keys start with a letter.
const FILTER = /(?<=^|\s)(?<key>[a-z][\w-]*):(?:"(?<quoted>[^"]*)"|(?<bare>[^\s"]+))(?=\s|$)/gi;

export function parseQuery(input: string): ParsedQuery {
  const filters: Record<string, string[]> = {};
  for (const match of input.matchAll(FILTER)) {
    const key = match.groups!.key.toLowerCase();
    const value = match.groups!.quoted ?? match.groups!.bare;
    (filters[key] ??= []).push(value);
  }
  const text = input.replace(FILTER, " ").replace(/\s+/g, " ").trim();
  return { filters, text };
}
`;

const QUERY_INDEX = String.raw`import "./styles.css";
import { parseQuery } from "./src/query";

const input = 'is:open label:"good first issue" author:ada fix crash';
document.getElementById("app")!.innerHTML = "<h1>Search query</h1><p><code></code></p><pre></pre>";
document.querySelector("code")!.textContent = input;
document.querySelector("pre")!.textContent = JSON.stringify(parseQuery(input), null, 2);
`;

const QUERY_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { parseQuery } from "../src/query";

describe("parseQuery", () => {
  it("splits filters, quoted values and free text", () => {
    expect(parseQuery('is:open label:"good first issue" author:ada fix crash')).toEqual({
      filters: { is: ["open"], label: ["good first issue"], author: ["ada"] },
      text: "fix crash",
    });
  });
  it("collects repeated keys in order", () => {
    expect(parseQuery('label:bug crash label:"ui polish"')).toEqual({ filters: { label: ["bug", "ui polish"] }, text: "crash" });
  });
  it("treats keys case-insensitively but keeps values as written", () => {
    expect(parseQuery("IS:Open")).toEqual({ filters: { is: ["Open"] }, text: "" });
  });
  it("normalises whitespace in the remaining text", () => {
    expect(parseQuery("  hello   world  ")).toEqual({ filters: {}, text: "hello world" });
  });
  it("doesn't treat times, empty keys or mid-word colons as filters", () => {
    expect(parseQuery("meeting at 10:30")).toEqual({ filters: {}, text: "meeting at 10:30" });
    expect(parseQuery("note: remember is:open")).toEqual({ filters: { is: ["open"] }, text: "note: remember" });
    expect(parseQuery("a=b:c")).toEqual({ filters: {}, text: "a=b:c" });
  });
  it("supports empty quotes and leaves unclosed quotes as text", () => {
    expect(parseQuery('label:"" bug')).toEqual({ filters: { label: [""] }, text: "bug" });
    expect(parseQuery('label:"oops bug')).toEqual({ filters: {}, text: 'label:"oops bug' });
  });
});
`;

const HL_STARTER = String.raw`/** Escapes characters that have a special meaning in regular expressions. */
export function escapeRegExp(s: string): string {
  // TODO
  return s;
}

/** Returns safe HTML for text with every case-insensitive match of any query word wrapped in <mark>. */
export function highlight(text: string, query: string): string {
  // TODO: special characters, several words, and HTML escaping
  if (!query.trim()) return text;
  return text.replace(new RegExp(query, "gi"), (m) => "<mark>" + m + "</mark>");
}
`;

const HL_SOLUTION = js(String.raw`export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^#{}()|[\]\\]/g, "\\$&");
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

export function highlight(text: string, query: string): string {
  // Longest words first, so "javascript" wins over "java" at the same position.
  const words = query.split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length);
  if (!words.length) return escapeHtml(text);
  const re = new RegExp(words.map(escapeRegExp).join("|"), "gi");
  let out = "";
  let last = 0;
  for (const match of text.matchAll(re)) {
    const start = match.index!;
    out += escapeHtml(text.slice(last, start)) + "<mark>" + escapeHtml(match[0]) + "</mark>";
    last = start + match[0].length;
  }
  return out + escapeHtml(text.slice(last));
}
`);

const HL_INDEX = String.raw`import "./styles.css";
import { highlight } from "./src/highlight";

const titles = ["Learn React in 30 days", "React vs Vue", "Testing React hooks"];
document.getElementById("app")!.innerHTML =
  "<h1>Search results</h1><ul>" + titles.map((t) => "<li>" + highlight(t, "react") + "</li>").join("") + "</ul>";
`;

const HL_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { escapeRegExp, highlight } from "../src/highlight";

describe("escapeRegExp", () => {
  it("escapes special characters so they match literally", () => {
    expect(escapeRegExp("a.b*c(d)")).toBe("a\\.b\\*c\\(d\\)");
    expect(new RegExp(escapeRegExp("c++")).test("I like c++")).toBe(true);
    expect(new RegExp("^" + escapeRegExp("a.b") + "$").test("axb")).toBe(false);
  });
});

describe("highlight", () => {
  it("marks every case-insensitive match", () => {
    expect(highlight("Learn React and react hooks", "react")).toBe("Learn <mark>React</mark> and <mark>react</mark> hooks");
  });
  it("handles several words, preferring the longest match", () => {
    expect(highlight("JavaScript and Java", "java javascript")).toBe("<mark>JavaScript</mark> and <mark>Java</mark>");
  });
  it("treats special characters in the query literally", () => {
    expect(highlight("C++ is not C#", "c++")).toBe("<mark>C++</mark> is not C#");
  });
  it("escapes HTML in the text and in matches", () => {
    expect(highlight("<b>bold</b> move", "bold")).toBe("&lt;b&gt;<mark>bold</mark>&lt;/b&gt; move");
    expect(highlight("a < b", "<")).toBe("a <mark>&lt;</mark> b");
  });
  it("returns escaped text for an empty query", () => {
    expect(highlight("x < y", "   ")).toBe("x &lt; y");
  });
});
`;

export default defineTasks([
  quiz(
    "regex-anchors",
    ["regex"],
    1,
    60,
    ["Anchors", "Якорі"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ true, false, true ]`", "`[ true, false, true ]`"],
      ["`[ true, true, true ]`", "`[ true, true, true ]`"],
      ["`[ true, false, false ]`", "`[ true, false, false ]`"],
      ["`[ false, false, true ]`", "`[ false, false, true ]`"],
    ],
    "a",
    [
      "`^` and `$` anchor the pattern to the start and end of the input, so `/^\\d{3}$/` matches exactly three digits and rejects `\"1234\"`. Without anchors, `/\\d{3}/` finds three digits anywhere, so it matches inside `\"1234\"`. Forgetting anchors is the most common validation bug.",
      "`^` і `$` прив'язують шаблон до початку й кінця вхідних даних, тож `/^\\d{3}$/` відповідає рівно трьом цифрам і відхиляє `\"1234\"`. Без якорів `/\\d{3}/` знаходить три цифри будь-де, тож збігається всередині `\"1234\"`. Забуті якорі є найпоширенішим багом валідації.",
    ],
    { code: 'console.log([/^\\d{3}$/.test("123"), /^\\d{3}$/.test("1234"), /\\d{3}/.test("1234")]);', codeLanguage: "js" },
  ),
  quiz(
    "regex-greedy-lazy",
    ["regex"],
    2,
    90,
    ["Greedy vs lazy", "Жадібний і лінивий"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`<b>a</b><b>c</b>` then `<b>a</b>`", "`<b>a</b><b>c</b>`, потім `<b>a</b>`"],
      ["`<b>a</b>` then `<b>a</b>`", "`<b>a</b>`, потім `<b>a</b>`"],
      ["`<b>a</b>` then `<b>a</b><b>c</b>`", "`<b>a</b>`, потім `<b>a</b><b>c</b>`"],
      ["`a` then `a`", "`a`, потім `a`"],
    ],
    "a",
    [
      "`.*` is greedy: it runs to the end of the string and backtracks only as far as needed to match the final `</b>`, which is the last one. `.*?` is lazy: it extends one character at a time and stops at the first `</b>`. `[^<]*` is often clearer and faster than a lazy dot.",
      "`.*` жадібний: доходить до кінця рядка й відступає лише настільки, щоб збігся завершальний `</b>`, тобто останній. `.*?` лінивий: розширюється по одному символу й зупиняється на першому `</b>`. `[^<]*` часто зрозуміліший і швидший за ліниву крапку.",
    ],
    { code: 'const html = "<b>a</b><b>c</b>";\nconsole.log(html.match(/<b>.*<\\/b>/)[0]);\nconsole.log(html.match(/<b>.*?<\\/b>/)[0]);', codeLanguage: "js" },
  ),
  quiz(
    "regex-lastindex",
    ["regex", w("javascript")],
    2,
    90,
    ["A stateful regex", "Регулярний вираз зі станом"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ true, false, true ]`", "`[ true, false, true ]`"],
      ["`[ true, true, true ]`", "`[ true, true, true ]`"],
      ["`[ true, false, false ]`", "`[ true, false, false ]`"],
      ["`[ false, true, false ]`", "`[ false, true, false ]`"],
    ],
    "a",
    [
      "With the `g` flag, `test` starts searching at `re.lastIndex` and updates it. After the first match `lastIndex` is 1, so the second search starts past the end of `\"a\"`, fails, and resets `lastIndex` to 0, so the third call succeeds again. Don't use `g` with `test` on a shared regex.",
      "З прапорцем `g` метод `test` починає пошук із `re.lastIndex` і оновлює його. Після першого збігу `lastIndex` дорівнює 1, тож другий пошук починається за кінцем `\"a\"`, не вдається й скидає `lastIndex` до 0, тож третій виклик знову успішний. Не використовуйте `g` з `test` для спільного регулярного виразу.",
    ],
    { code: 'const re = /a/g;\nconsole.log(["a", "a", "a"].map((s) => re.test(s)));', codeLanguage: "js" },
  ),
  quiz(
    "regex-named-replace",
    ["regex"],
    3,
    90,
    ["Named groups in replace", "Іменовані групи в replace"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`15.03.2025`", "`15.03.2025`"],
      ["`2025.03.15`", "`2025.03.15`"],
      ["`$<d>.$<m>.$<y>`", "`$<d>.$<m>.$<y>`"],
      ["`15-03-2025`", "`15-03-2025`"],
    ],
    "a",
    [
      "`(?<name>…)` names a capture group, and `$<name>` inserts it in the replacement string (`$1`, `$2` work for numbered groups). Names make patterns self-documenting and survive reordering. For logic, pass a function: `(match, …groups) => …`.",
      "`(?<name>…)` дає назву групі із захопленням, а `$<name>` вставляє її в рядок заміни (для нумерованих груп працюють `$1`, `$2`). Назви роблять шаблони самодокументованими й не ламаються при перестановці. Для логіки передавайте функцію: `(match, …groups) => …`.",
    ],
    { code: 'console.log("2025-03-15".replace(/(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})/, "$<d>.$<m>.$<y>"));', codeLanguage: "js" },
  ),
  quiz(
    "regex-match-global",
    ["regex"],
    3,
    90,
    ["`match` with and without `g`", "`match` з `g` і без"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ '1', '22', '333' ] [ 'x', '42' ]`", "`[ '1', '22', '333' ] [ 'x', '42' ]`"],
      ["`[ '1' ] [ 'x-42', 'x', '42' ]`", "`[ '1' ] [ 'x-42', 'x', '42' ]`"],
      ["`[ '1', '22', '333' ] [ 'x-42' ]`", "`[ '1', '22', '333' ] [ 'x-42' ]`"],
      ["`[ '1', '2', '2', '3', '3', '3' ] [ 'x', '42' ]`", "`[ '1', '2', '2', '3', '3', '3' ] [ 'x', '42' ]`"],
    ],
    "a",
    [
      "With `g`, `match` returns every full match but no groups. Without `g`, it returns the first match as an array of `[fullMatch, group1, group2, …]` (plus `index` and `groups`), so `.slice(1)` gives the captures. Use `matchAll` when you need all matches **with** their groups.",
      "З `g` метод `match` повертає всі повні збіги, але без груп. Без `g` він повертає перший збіг як масив `[повний збіг, група1, група2, …]` (плюс `index` і `groups`), тож `.slice(1)` дає захоплення. Використовуйте `matchAll`, коли потрібні всі збіги **разом** із групами.",
    ],
    { code: 'console.log("a1b22c333".match(/\\d+/g), "x-42".match(/(\\w)-(\\d+)/).slice(1));', codeLanguage: "js" },
  ),
  quiz(
    "regex-user-input",
    ["regex", w("web-security")],
    3,
    90,
    ["Regexes from user input", "Регулярні вирази з даних користувача"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`SyntaxError true`", "`SyntaxError true`"],
      ["`false false`", "`false false`"],
      ["`true true`", "`true true`"],
      ["`SyntaxError false`", "`SyntaxError false`"],
    ],
    "a",
    [
      "`new RegExp(text)` parses the text as a pattern: `+` after `+` has nothing to repeat, so it throws, and `.` matches any character, so `\"a.b\"` matches `\"axb\"`. Always escape user input first (`s.replace(/[.*+?^${}()|[\\]\\\\]/g, \"\\\\$&\")`), or use string methods like `includes` when you don't need patterns.",
      "`new RegExp(text)` розбирає текст як шаблон: `+` після `+` не має що повторювати, тож кидається помилка, а `.` відповідає будь-якому символу, тож `\"a.b\"` збігається з `\"axb\"`. Завжди спершу екрануйте дані користувача (`s.replace(/[.*+?^${}()|[\\]\\\\]/g, \"\\\\$&\")`) або використовуйте рядкові методи на кшталт `includes`, коли шаблони не потрібні.",
    ],
    { code: 'let result;\ntry {\n  new RegExp("c++");\n  result = "ok";\n} catch (e) {\n  result = e.constructor.name;\n}\nconsole.log(result, new RegExp("a.b").test("axb"));', codeLanguage: "js" },
  ),
  quiz(
    "regex-lookahead",
    ["regex"],
    4,
    120,
    ["Lookaheads for password rules", "Перевірки вперед для правил пароля"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ false, true, false, false ]`", "`[ false, true, false, false ]`"],
      ["`[ false, true, true, false ]`", "`[ false, true, true, false ]`"],
      ["`[ true, true, false, false ]`", "`[ true, true, false, false ]`"],
      ["`[ false, true, false, true ]`", "`[ false, true, false, true ]`"],
    ],
    "a",
    [
      "Each `(?=…)` checks a condition from the start without consuming characters: at least one digit, one lowercase and one uppercase letter; then `.{8,}$` requires 8+ characters. `password` has no digit or uppercase, `PASSWORD1` has no lowercase, and `Pass1` is too short. For real forms, separate checks give better error messages than one regex.",
      "Кожна `(?=…)` перевіряє умову з початку, не споживаючи символів: щонайменше одна цифра, одна мала й одна велика літера; потім `.{8,}$` вимагає 8+ символів. У `password` немає цифри й великої літери, у `PASSWORD1` немає малої, а `Pass1` закороткий. У реальних формах окремі перевірки дають кращі повідомлення про помилки, ніж один вираз.",
    ],
    { code: 'const strong = /^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;\nconsole.log(["password", "Password1", "PASSWORD1", "Pass1"].map((p) => strong.test(p)));', codeLanguage: "js" },
  ),
  quiz(
    "regex-unicode",
    ["regex", w("arrays-strings")],
    4,
    120,
    ["The `u` flag", "Прапорець `u`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`2 false true true`", "`2 false true true`"],
      ["`1 true true true`", "`1 true true true`"],
      ["`2 true false true`", "`2 true false true`"],
      ["`2 false true false`", "`2 false true false`"],
    ],
    "a",
    [
      "JavaScript strings are UTF-16, and 😀 is a surrogate pair: length 2, and a plain `.` matches only half of it. The `u` flag makes the regex work on code points, so `.` matches the whole emoji, and it enables property escapes like `\\p{L}` (any letter in any script, including Cyrillic).",
      "Рядки JavaScript є UTF-16, а 😀 є сурогатною парою: довжина 2, а звичайна `.` відповідає лише половині. Прапорець `u` змушує вираз працювати з кодовими точками, тож `.` відповідає всьому емодзі, і вмикає екранування властивостей на кшталт `\\p{L}` (будь-яка літера будь-якої писемності, зокрема кирилиця).",
    ],
    { code: 'console.log("😀".length, /^.$/.test("😀"), /^.$/u.test("😀"), /^\\p{L}+$/u.test("Київ"));', codeLanguage: "js" },
  ),
  quiz(
    "regex-redos",
    ["regex", w("web-performance")],
    5,
    150,
    ["A regex that freezes the page", "Регулярний вираз, що заморожує сторінку"],
    ["This validator is fine on normal input but freezes the tab for about a minute on `\"a\".repeat(30) + \"!\"`. Why?", "Цей валідатор нормально працює на звичайних даних, але заморожує вкладку приблизно на хвилину на `\"a\".repeat(30) + \"!\"`. Чому?"],
    [
      ["Nested quantifiers let the engine split the letters between `\\w+` and the outer `*` in exponentially many ways before concluding there's no match (catastrophic backtracking)", "Вкладені квантифікатори дають рушію експоненційно багато способів розподілити літери між `\\w+` і зовнішнім `*`, перш ніж він вирішить, що збігу немає (катастрофічний бектрекінг)"],
      ["`\\w` is slow on long strings", "`\\w` повільний на довгих рядках"],
      ["`test` always scans the input twice", "`test` завжди сканує вхідні дані двічі"],
      ["The `!` character is invalid in regular expressions", "Символ `!` недопустимий у регулярних виразах"],
    ],
    "a",
    [
      "On a failing input, a backtracking engine tries every way of dividing `aaaa…` into `(\\w+\\s?)` repetitions, and that number grows exponentially with the length. With user-controlled input this is a ReDoS vulnerability. Rewrite without nested or overlapping quantifiers (`/^\\w+(\\s\\w+)*$/`), cap input length, or validate in steps.",
      "На вхідних даних без збігу рушій із бектрекінгом перебирає всі способи поділити `aaaa…` на повторення `(\\w+\\s?)`, і їхня кількість зростає експоненційно з довжиною. З даними, які контролює користувач, це вразливість ReDoS. Перепишіть без вкладених чи перекривних квантифікаторів (`/^\\w+(\\s\\w+)*$/`), обмежте довжину або перевіряйте поетапно.",
    ],
    { code: "// Validates \"words separated by single spaces\"\nconst isValid = (s) => /^(\\w+\\s?)*$/.test(s);", codeLanguage: "js" },
  ),
  practice({
    slug: "regex-search-query",
    skills: ["regex", w("arrays-strings"), w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Parse a search query", "Розбір пошукового запиту"],
    prompt: [
      "Parse GitHub-style search queries in `src/query.ts` with a regular expression. `parseQuery(input)` returns `{ filters, text }`:\n\n- A filter is a whole whitespace-separated token `key:value` or `key:\"quoted value\"`. Keys start with a letter and may contain letters, digits, `_` and `-`; they're case-insensitive (stored lower-case). Values keep their case; quoted values may contain spaces and may be empty.\n- Repeated keys collect values in order: `label:bug label:ui` → `{ label: [\"bug\", \"ui\"] }`.\n- Everything else is free `text`, with whitespace collapsed to single spaces and trimmed.\n- Not filters: `10:30` (key must start with a letter), `note:` with no value, `a=b:c` (the key must start a token), and an unclosed quote like `label:\"oops`.\n\nHints: named groups, `matchAll`, an alternation for quoted vs bare values, and a lookbehind/lookahead for token boundaries.",
      "Розбирайте пошукові запити в стилі GitHub у `src/query.ts` за допомогою регулярного виразу. `parseQuery(input)` повертає `{ filters, text }`:\n\n- Фільтр є цілим токеном, відокремленим пробілами: `key:value` або `key:\"значення в лапках\"`. Ключі починаються з літери й можуть містити літери, цифри, `_` і `-`; вони нечутливі до регістру (зберігаються малими літерами). Значення зберігають регістр; значення в лапках можуть містити пробіли й бути порожніми.\n- Повторені ключі збирають значення по порядку: `label:bug label:ui` → `{ label: [\"bug\", \"ui\"] }`.\n- Усе інше є вільним `text`, де пробіли зведено до одинарних і обрізано по краях.\n- Не є фільтрами: `10:30` (ключ має починатися з літери), `note:` без значення, `a=b:c` (ключ має починати токен) і незакриті лапки на кшталт `label:\"oops`.\n\nПідказки: іменовані групи, `matchAll`, альтернатива для значень у лапках і без, а також перевірки назад і вперед для меж токенів.",
    ],
    files: { "/src/query.ts": QUERY_STARTER, "/index.ts": QUERY_INDEX },
    visibleFiles: ["/src/query.ts", "/index.ts"],
    activeFile: "/src/query.ts",
    tests: QUERY_TESTS,
    solution: { "/src/query.ts": QUERY_SOLUTION },
    explanation: [
      "One pattern does the work: `(?<=^|\\s)` and `(?=\\s|$)` make a filter a complete token, `[a-z][\\w-]*` keeps times like `10:30` out, and the alternation `\"(?<quoted>[^\"]*)\"|(?<bare>[^\\s\"]+)` handles both value styles (an unclosed quote matches neither). `matchAll` with named groups collects the filters, and `replace` with the same global regex removes them to leave the free text.",
      "Усю роботу робить один шаблон: `(?<=^|\\s)` і `(?=\\s|$)` роблять фільтр цілим токеном, `[a-z][\\w-]*` не пропускає час на кшталт `10:30`, а альтернатива `\"(?<quoted>[^\"]*)\"|(?<bare>[^\\s\"]+)` обробляє обидва види значень (незакриті лапки не збігаються з жодним). `matchAll` з іменованими групами збирає фільтри, а `replace` з тим самим глобальним виразом прибирає їх, лишаючи вільний текст.",
    ],
  }),
  practice({
    slug: "regex-highlight",
    skills: ["regex", w("web-security")],
    complexity: 2,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Highlight search matches safely", "Безпечне підсвічування збігів"],
    prompt: [
      "Implement search-result highlighting in `src/highlight.ts`:\n\n- **`escapeRegExp(s)`** escapes `. * + ? ^ $ { } ( ) | [ ] \\` so the string matches literally inside a `RegExp`.\n- **`highlight(text, query)`** returns **safe HTML**: the text with every case-insensitive match of any query word wrapped in `<mark>…</mark>`.\n  - Split the query on whitespace; when words overlap, prefer the **longest** (`java javascript` marks `JavaScript` whole).\n  - Special characters in the query are literal (`c++` must not throw).\n  - Escape `& < > \" '` in the text and inside the marks; an empty query returns the escaped text.",
      "Реалізуйте підсвічування результатів пошуку в `src/highlight.ts`:\n\n- **`escapeRegExp(s)`** екранує `. * + ? ^ $ { } ( ) | [ ] \\`, щоб рядок збігався буквально всередині `RegExp`.\n- **`highlight(text, query)`** повертає **безпечний HTML**: текст, де кожен збіг будь-якого слова запиту без урахування регістру обгорнуто в `<mark>…</mark>`.\n  - Розбивайте запит за пробілами; коли слова перекриваються, віддавайте перевагу **найдовшому** (`java javascript` позначає `JavaScript` цілком).\n  - Спеціальні символи в запиті буквальні (`c++` не повинен кидати помилку).\n  - Екрануйте `& < > \" '` у тексті й усередині позначок; порожній запит повертає екранований текст.",
    ],
    files: { "/src/highlight.ts": HL_STARTER, "/index.ts": HL_INDEX },
    visibleFiles: ["/src/highlight.ts", "/index.ts"],
    activeFile: "/src/highlight.ts",
    tests: HL_TESTS,
    solution: { "/src/highlight.ts": HL_SOLUTION },
    explanation: [
      "Escaping turns user text into a literal pattern, so `c++` neither throws nor matches unexpected strings. Sorting words by length makes the alternation try `javascript` before `java` at each position. Walking the matches with `matchAll` and escaping the text between and inside them builds the HTML piece by piece, so neither the text nor the query can inject markup.",
      "Екранування перетворює текст користувача на буквальний шаблон, тож `c++` не кидає помилку й не збігається з несподіваними рядками. Сортування слів за довжиною змушує альтернативу пробувати `javascript` раніше за `java` на кожній позиції. Прохід збігами через `matchAll` з екрануванням тексту між ними й усередині будує HTML частинами, тож ні текст, ні запит не можуть вставити розмітку.",
    ],
  }),
]);
