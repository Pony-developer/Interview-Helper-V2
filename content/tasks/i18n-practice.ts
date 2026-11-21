import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const PLURAL_STARTER = code`export type Forms = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

/**
 * Picks the form for count using the locale's plural rules, then fills {count} with the
 * number formatted for that locale (so 1234 is "1,234" in English and "1 234" in Ukrainian).
 */
export function plural(locale: string, count: number, forms: Forms): string {
  // TODO: "count === 1 ? one : other" is wrong for Ukrainian and most other languages
  return forms.other;
}
`;

const PLURAL_SOLUTION = code`export type Forms = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

export function plural(locale: string, count: number, forms: Forms): string {
  // Intl.PluralRules knows each language's categories (e.g. Ukrainian has one, few, many and other).
  const category = new Intl.PluralRules(locale).select(count) as keyof Forms;
  // A form the language needs but the translator didn't write falls back to "other".
  const template = forms[category] ?? forms.other;
  return template.replace("{count}", new Intl.NumberFormat(locale).format(count));
}
`;

const PLURAL_INDEX = code`import "./styles.css";
import { plural } from "./src/plural";

const files = { one: "{count} файл", few: "{count} файли", many: "{count} файлів", other: "{count} файлу" };
document.getElementById("app")!.innerHTML = '<h1>Plurals</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = [1, 2, 5, 21, 22].map((n) => plural("uk", n, files)).join("\n");
`;

const PLURAL_TESTS = code`import { describe, it, expect } from "./test-kit";
import { plural } from "../src/plural";

const en = { one: "{count} file", other: "{count} files" };
const uk = { one: "{count} файл", few: "{count} файли", many: "{count} файлів", other: "{count} файлу" };
const grouped = (locale, n) => new Intl.NumberFormat(locale).format(n);

describe("plural", () => {
  it("uses the English one and other forms", () => {
    expect(plural("en", 1, en)).toBe("1 file");
    expect(plural("en", 0, en)).toBe("0 files");
    expect(plural("en", 2, en)).toBe("2 files");
  });
  it("formats large numbers for the locale", () => {
    expect(plural("en", 1000, en)).toBe(grouped("en", 1000) + " files");
  });
  it("picks the Ukrainian forms for whole numbers", () => {
    expect(plural("uk", 1, uk)).toBe("1 файл");
    expect(plural("uk", 21, uk)).toBe("21 файл");
    expect(plural("uk", 101, uk)).toBe("101 файл");
    expect(plural("uk", 2, uk)).toBe("2 файли");
    expect(plural("uk", 23, uk)).toBe("23 файли");
    expect(plural("uk", 5, uk)).toBe("5 файлів");
    expect(plural("uk", 11, uk)).toBe("11 файлів");
    expect(plural("uk", 13, uk)).toBe("13 файлів");
    expect(plural("uk", 0, uk)).toBe("0 файлів");
  });
  it("tells 12 to 14 apart from the other teens", () => {
    expect(plural("uk", 112, uk)).toBe(grouped("uk", 112) + " файлів");
    expect(plural("uk", 102, uk)).toBe(grouped("uk", 102) + " файли");
  });
  it("falls back to other when a form is missing", () => {
    expect(plural("en", 1, { other: "{count} things" })).toBe("1 things");
  });
  it("uses the locale's number format", () => {
    expect(plural("uk", 1234, uk)).toBe(grouped("uk", 1234) + " файли");
  });
});
`;

export default defineTasks([
  quiz(
    "i18n-plural-categories",
    ["i18n", w("type-coercion", 0.3)],
    2,
    75,
    ["Why `count === 1` isn't enough", "Чому `count === 1` недостатньо"],
    ["Why is `count === 1 ? \"file\" : \"files\"` wrong for a multilingual app?", "Чому `count === 1 ? \"file\" : \"files\"` неправильно для багатомовного застосунку?"],
    [
      ["Some languages have more plural forms than one and other, for example Ukrainian has one, few and many for whole numbers", "У деяких мовах більше форм множини, ніж одна й інша: наприклад, в українській для цілих чисел є one, few і many"],
      ["Only English has plural forms", "Лише в англійській є форми множини"],
      ["Numbers can't be compared to 1 in JavaScript", "Числа в JavaScript не можна порівнювати з 1"],
      ["The plural form depends only on the font", "Форма множини залежить лише від шрифту"],
    ],
    "a",
    [
      "Plural rules come from CLDR, and they differ by language: Arabic has six categories, Polish has one, few, many and other, and Ukrainian uses the last two digits of the number. Use `Intl.PluralRules` (or an ICU message library) and provide a form for each category the language needs.",
      "Правила множини беруться з CLDR і відрізняються між мовами: в арабській шість категорій, у польській one, few, many і other, а в українській вирішують останні дві цифри числа. Використовуйте `Intl.PluralRules` (або бібліотеку ICU-повідомлень) і подавайте форму для кожної категорії, яку потребує мова.",
    ],
  ),
  practice({
    slug: "i18n-plural-forms",
    skills: ["i18n", w("typescript"), w("browser-apis", 0.3)],
    complexity: 3,
    estSeconds: 1020,
    framework: "vanilla-ts",
    title: ["Pluralize messages for any language", "Множина повідомлень для будь-якої мови"],
    prompt: [
      "Implement `plural(locale, count, forms)` in `src/plural.ts`. `forms` holds the text for each plural category the translator wrote (`one`, `few`, `many`, `other`, and so on), and `{count}` in the text is replaced with the number formatted for that locale.\n\n- Use `Intl.PluralRules` to pick the category, so English gets `one` for 1 and `other` otherwise, and Ukrainian gets `one` for 1, 21 and 101 but not 11, `few` for 2–4, 22–24 and 102 but not 12–14, and `many` for the rest of the whole numbers.\n- If the language needs a category the translator didn't write, use `other`.\n- Format the number with `Intl.NumberFormat(locale)`, so 1234 comes out with the locale's grouping separator.",
      "Реалізуйте `plural(locale, count, forms)` у `src/plural.ts`. `forms` містить текст для кожної категорії множини, яку написав перекладач (`one`, `few`, `many`, `other` тощо), а `{count}` у тексті замінюється на число, відформатоване для цієї локалі.\n\n- Використовуйте `Intl.PluralRules`, щоб обрати категорію: в англійській `one` для 1 і `other` в інших випадках, а в українській `one` для 1, 21 і 101, але не для 11, `few` для 2–4, 22–24 і 102, але не для 12–14, і `many` для решти цілих чисел.\n- Якщо мові потрібна категорія, якої перекладач не написав, використовуйте `other`.\n- Форматуйте число через `Intl.NumberFormat(locale)`, щоб 1234 мало роздільник розрядів цієї локалі.",
    ],
    files: {
      "/src/plural.ts": PLURAL_STARTER,
      "/index.ts": PLURAL_INDEX,
    },
    visibleFiles: ["/src/plural.ts"],
    activeFile: "/src/plural.ts",
    tests: PLURAL_TESTS,
    solution: { "/src/plural.ts": PLURAL_SOLUTION },
    explanation: [
      "Hard-coding `count === 1` works for English and breaks for most other languages, so the rule has to come from data. `Intl.PluralRules` ships the CLDR rules for every locale, which is also why the translator writes one string per category instead of computing grammar in code. `Intl.NumberFormat` handles the number itself, including grouping separators (a non-breaking space in Ukrainian) that a string template can't guess. The fallback to `other` keeps the app readable when a translation is incomplete. For sentences with several variables, an ICU MessageFormat library does the same job with one message per language.",
      "Жорстко записане `count === 1` працює для англійської й ламається для більшості інших мов, тож правило має походити з даних. `Intl.PluralRules` містить правила CLDR для кожної локалі, тому перекладач пише один рядок на категорію, а не обчислює граматику в коді. `Intl.NumberFormat` обробляє саме число, включно з роздільниками розрядів (нерозривний пробіл в українській), які шаблон рядка вгадати не може. Запасний варіант `other` тримає застосунок читабельним, коли переклад неповний. Для речень з кількома змінними ту саму роботу виконує бібліотека ICU MessageFormat з одним повідомленням на мову.",
    ],
  }),
]);
