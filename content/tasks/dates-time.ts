import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const PLAIN_STARTER = String.raw`/** A calendar date with no time and no time zone. month is 1–12. */
export type PlainDate = { year: number; month: number; day: number };

/** Parses "YYYY-MM-DD"; throws a RangeError unless it's a real calendar date. */
export function parsePlainDate(text: string): PlainDate {
  // TODO: no validation, and local-time parsing can shift the day
  const d = new Date(text);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export function toISODate(d: PlainDate): string {
  return d.year + "-" + d.month + "-" + d.day; // TODO: zero padding
}

export function addDays(d: PlainDate, days: number): PlainDate {
  return { ...d, day: d.day + days }; // TODO
}

/** Adds calendar months, clamping the day to the end of the target month (Jan 31 + 1 month → Feb 28/29). */
export function addMonths(d: PlainDate, months: number): PlainDate {
  return { ...d, month: d.month + months }; // TODO
}

/** Whole days from a to b (negative if b is earlier). */
export function daysBetween(a: PlainDate, b: PlainDate): number {
  return b.day - a.day; // TODO
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export function dayOfWeek(d: PlainDate): number {
  return 1; // TODO
}

export function formatPlainDate(d: PlainDate, locale: string, options: Intl.DateTimeFormatOptions = { dateStyle: "long" }): string {
  return new Date(d.year, d.month - 1, d.day).toLocaleDateString(locale, options); // TODO: is this time-zone safe?
}
`;

const PLAIN_SOLUTION = String.raw`export type PlainDate = { year: number; month: number; day: number };

// Every calculation happens in UTC, so the runtime's time zone and DST can never shift a day.
const toUTC = (d: PlainDate) => {
  const date = new Date(Date.UTC(2000, d.month - 1, d.day));
  date.setUTCFullYear(d.year); // Date.UTC maps years 0–99 to 1900–1999
  return date;
};
const fromUTC = (date: Date): PlainDate => ({
  year: date.getUTCFullYear(),
  month: date.getUTCMonth() + 1,
  day: date.getUTCDate(),
});
const DAY_MS = 24 * 60 * 60 * 1000;

export function parsePlainDate(text: string): PlainDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) throw new RangeError("Expected YYYY-MM-DD: " + text);
  const d = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  // Date silently rolls Feb 30 over to Mar 1, so check that nothing rolled over.
  const roundTrip = fromUTC(toUTC(d));
  if (roundTrip.year !== d.year || roundTrip.month !== d.month || roundTrip.day !== d.day) {
    throw new RangeError("Not a real date: " + text);
  }
  return d;
}

export function toISODate(d: PlainDate): string {
  return String(d.year).padStart(4, "0") + "-" + String(d.month).padStart(2, "0") + "-" + String(d.day).padStart(2, "0");
}

export function addDays(d: PlainDate, days: number): PlainDate {
  const date = toUTC(d);
  date.setUTCDate(date.getUTCDate() + days); // overflow handles month and year changes
  return fromUTC(date);
}

export function addMonths(d: PlainDate, months: number): PlainDate {
  const total = d.year * 12 + (d.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = total - year * 12 + 1;
  const lastDay = new Date(Date.UTC(2000, month, 0)); // day 0 of the next month
  lastDay.setUTCFullYear(year, month, 0);
  return { year, month, day: Math.min(d.day, lastDay.getUTCDate()) };
}

export function daysBetween(a: PlainDate, b: PlainDate): number {
  return Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / DAY_MS);
}

export function dayOfWeek(d: PlainDate): number {
  return toUTC(d).getUTCDay() || 7; // getUTCDay: 0 = Sunday
}

export function formatPlainDate(d: PlainDate, locale: string, options: Intl.DateTimeFormatOptions = { dateStyle: "long" }): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(toUTC(d));
}
`;

const PLAIN_INDEX = String.raw`import "./styles.css";
import { addDays, addMonths, daysBetween, formatPlainDate, parsePlainDate, toISODate } from "./src/plain-date";

const lines: string[] = [];
try {
  const d = parsePlainDate("2024-01-31");
  lines.push("+1 month: " + toISODate(addMonths(d, 1)));
  lines.push("+30 days: " + toISODate(addDays(d, 30)));
  lines.push("days until 2024-12-25: " + daysBetween(d, parsePlainDate("2024-12-25")));
  lines.push("uk: " + formatPlainDate(d, "uk-UA"));
  lines.push("2024-02-30 → " + toISODate(parsePlainDate("2024-02-30")));
} catch (e) {
  lines.push("error: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Plain dates</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const PLAIN_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { addDays, addMonths, dayOfWeek, daysBetween, formatPlainDate, parsePlainDate, toISODate } from "../src/plain-date";

const p = parsePlainDate;

describe("parsePlainDate and toISODate", () => {
  it("parses and prints real dates", () => {
    expect(p("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
    expect(toISODate({ year: 2024, month: 3, day: 5 })).toBe("2024-03-05");
  });
  it("rejects impossible dates and other formats", () => {
    expect(() => p("2024-02-30")).toThrow(RangeError);
    expect(() => p("2023-02-29")).toThrow(RangeError);
    expect(() => p("2024-13-01")).toThrow(RangeError);
    expect(() => p("10/03/2024")).toThrow(RangeError);
    expect(() => p("2024-3-5")).toThrow(RangeError);
  });
});

describe("arithmetic", () => {
  it("adds days across month, year and DST boundaries", () => {
    expect(toISODate(addDays(p("2024-03-30"), 1))).toBe("2024-03-31");
    expect(toISODate(addDays(p("2024-03-31"), 1))).toBe("2024-04-01");
    expect(toISODate(addDays(p("2024-10-27"), 1))).toBe("2024-10-28");
    expect(toISODate(addDays(p("2024-12-31"), 1))).toBe("2025-01-01");
    expect(toISODate(addDays(p("2024-03-01"), -1))).toBe("2024-02-29");
  });
  it("adds months, clamping to the end of shorter months", () => {
    expect(toISODate(addMonths(p("2024-01-31"), 1))).toBe("2024-02-29");
    expect(toISODate(addMonths(p("2023-01-31"), 1))).toBe("2023-02-28");
    expect(toISODate(addMonths(p("2024-03-31"), -1))).toBe("2024-02-29");
    expect(toISODate(addMonths(p("2024-12-15"), 1))).toBe("2025-01-15");
    expect(toISODate(addMonths(p("2024-05-10"), -13))).toBe("2023-04-10");
  });
  it("counts days between dates, including leap years and DST changes", () => {
    expect(daysBetween(p("2024-02-28"), p("2024-03-01"))).toBe(2);
    expect(daysBetween(p("2023-12-31"), p("2024-12-31"))).toBe(366);
    expect(daysBetween(p("2024-03-30"), p("2024-04-01"))).toBe(2);
    expect(daysBetween(p("2024-04-01"), p("2024-03-30"))).toBe(-2);
  });
  it("returns ISO weekdays", () => {
    expect(dayOfWeek(p("2024-01-01"))).toBe(1);
    expect(dayOfWeek(p("2024-03-10"))).toBe(7);
  });
});

describe("formatPlainDate", () => {
  it("formats the same calendar day in any locale, whatever the time zone", () => {
    expect(formatPlainDate(p("2024-03-10"), "en-US")).toBe("March 10, 2024");
    expect(formatPlainDate(p("2024-03-10"), "uk-UA")).toBe("10 березня 2024 р.");
  });
});
`;

const ZONES_STARTER = String.raw`/** Offset of timeZone from UTC at the given instant, in minutes (Kyiv in summer → 180). */
export function zoneOffsetMinutes(date: Date, timeZone: string): number {
  return -date.getTimezoneOffset(); // TODO: this is the runtime's own zone, not timeZone
}

/** Medium date + short time, in the given IANA time zone. */
export function formatInZone(date: Date, timeZone: string, locale = "en-GB"): string {
  return date.toLocaleString(locale); // TODO
}

/** "now", "5 minutes ago", "in 2 hours", "yesterday", "next month", "last year"… */
export function formatRelative(date: Date, now: Date = new Date(), locale = "en"): string {
  // TODO: pick the right unit
  const days = Math.round((date.getTime() - now.getTime()) / 86_400_000);
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(days, "day");
}
`;

const ZONES_SOLUTION = String.raw`export function zoneOffsetMinutes(date: Date, timeZone: string): number {
  // Format the instant as wall-clock time in the zone, read that wall time as if it were UTC,
  // and the difference from the real instant is the zone's offset at that moment.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  const wallAsUTC = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  const instant = date.getTime() - date.getUTCMilliseconds();
  return Math.round((wallAsUTC - instant) / 60_000);
}

export function formatInZone(date: Date, timeZone: string, locale = "en-GB"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone }).format(date);
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number, number]> = [
  // unit, seconds per unit, use this unit while |diff| is below this many seconds
  ["second", 1, 45],
  ["minute", 60, 45 * 60],
  ["hour", 3600, 22 * 3600],
  ["day", 86_400, 26 * 86_400],
  ["month", 30 * 86_400, 320 * 86_400],
  ["year", 365 * 86_400, Infinity],
];

export function formatRelative(date: Date, now: Date = new Date(), locale = "en"): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const seconds = (date.getTime() - now.getTime()) / 1000;
  if (Math.abs(seconds) < 45) return rtf.format(0, "second"); // "now"
  const [unit, size] = UNITS.find(([, , limit]) => Math.abs(seconds) < limit)!;
  return rtf.format(Math.round(seconds / size), unit);
}
`;

const ZONES_INDEX = String.raw`import "./styles.css";
import { formatInZone, formatRelative, zoneOffsetMinutes } from "./src/zones";

const meeting = new Date("2024-07-01T12:00:00Z");
const lines: string[] = [];
try {
  for (const zone of ["UTC", "Europe/Kyiv", "America/New_York", "Asia/Kolkata"]) {
    lines.push(zone.padEnd(18) + formatInZone(meeting, zone) + "  (UTC" + (zoneOffsetMinutes(meeting, zone) / 60).toFixed(1) + ")");
  }
  const now = new Date();
  lines.push("", formatRelative(new Date(now.getTime() - 5 * 60_000), now), formatRelative(new Date(now.getTime() - 86_400_000), now, "uk"));
} catch (e) {
  lines.push("error: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Time zones</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const ZONES_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { formatInZone, formatRelative, zoneOffsetMinutes } from "../src/zones";

const winter = new Date("2024-01-15T12:00:00Z");
const summer = new Date("2024-07-15T12:00:00Z");

describe("zoneOffsetMinutes", () => {
  it("returns each zone's offset at the given instant, including DST", () => {
    expect(zoneOffsetMinutes(winter, "Europe/Kyiv")).toBe(120);
    expect(zoneOffsetMinutes(summer, "Europe/Kyiv")).toBe(180);
    expect(zoneOffsetMinutes(winter, "America/New_York")).toBe(-300);
    expect(zoneOffsetMinutes(summer, "America/New_York")).toBe(-240);
    expect(zoneOffsetMinutes(summer, "Asia/Kolkata")).toBe(330);
    expect(zoneOffsetMinutes(summer, "UTC")).toBe(0);
  });
  it("handles instants with milliseconds and around midnight", () => {
    expect(zoneOffsetMinutes(new Date("2024-03-31T23:30:00.750Z"), "Asia/Tokyo")).toBe(540);
  });
});

describe("formatInZone", () => {
  it("shows the wall-clock time in the requested zone", () => {
    const meeting = new Date("2024-07-01T12:00:00Z");
    expect(formatInZone(meeting, "Asia/Kolkata")).toBe("1 Jul 2024, 17:30");
    expect(formatInZone(meeting, "America/New_York")).toBe("1 Jul 2024, 08:00");
  });
});

describe("formatRelative", () => {
  const now = new Date("2024-06-15T12:00:00Z");
  const at = (seconds) => new Date(now.getTime() + seconds * 1000);
  it("picks a sensible unit", () => {
    expect(formatRelative(at(-30), now)).toBe("now");
    expect(formatRelative(at(-5 * 60), now)).toBe("5 minutes ago");
    expect(formatRelative(at(2 * 3600), now)).toBe("in 2 hours");
    expect(formatRelative(at(-86_400), now)).toBe("yesterday");
    expect(formatRelative(at(-3 * 86_400), now)).toBe("3 days ago");
    expect(formatRelative(at(40 * 86_400), now)).toBe("next month");
    expect(formatRelative(at(-400 * 86_400), now)).toBe("last year");
  });
  it("localises", () => {
    expect(formatRelative(at(-86_400), now, "uk")).toBe("учора");
    expect(formatRelative(at(3 * 3600), now, "uk")).toBe("через 3 години");
  });
});
`;

export default defineTasks([
  quiz(
    "date-month-overflow",
    ["dates-time"],
    1,
    60,
    ["Zero-based months and overflow", "Місяці з нуля й переповнення"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`2 1`", "`2 1`"],
      ["`1 30`", "`1 30`"],
      ["`2 30`", "`2 30`"],
      ["`Invalid Date`", "`Invalid Date`"],
    ],
    "a",
    [
      "Months in the `Date` constructor are zero-based, so `1` is February. February 2024 has 29 days, and `Date` doesn't reject day 30: it **rolls over** to March 1. `getMonth()` is zero-based too, so March prints as `2`. Overflow is handy for arithmetic, but it means invalid input never fails loudly.",
      "Місяці в конструкторі `Date` рахуються з нуля, тож `1` означає лютий. Лютий 2024 року має 29 днів, і `Date` не відхиляє 30-те число: воно **переноситься** на 1 березня. `getMonth()` теж рахує з нуля, тож березень виводиться як `2`. Переповнення зручне для арифметики, але через нього некоректні дані ніколи не дають гучної помилки.",
    ],
    { code: "const d = new Date(2024, 1, 30);\nconsole.log(d.getMonth(), d.getDate());", codeLanguage: "js" },
  ),
  quiz(
    "date-days-in-month",
    ["dates-time"],
    2,
    60,
    ["Day zero of the next month", "Нульовий день наступного місяця"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`29 28 31`", "`29 28 31`"],
      ["`28 28 30`", "`28 28 30`"],
      ["`0 0 0`", "`0 0 0`"],
      ["`31 31 31`", "`31 31 31`"],
    ],
    "a",
    [
      "`new Date(y, m + 1, 0)` asks for day 0 of the following month, which rolls back to the **last day of month `m`**. So `getDate()` is the length of the month: 29 for February 2024 (a leap year), 28 for February 2023 and 31 for December (month 12 rolls over into January of the next year, day 0 is December 31).",
      "`new Date(y, m + 1, 0)` запитує нульовий день наступного місяця, що переноситься назад на **останній день місяця `m`**. Тож `getDate()` дає довжину місяця: 29 для лютого 2024 року (високосного), 28 для лютого 2023 і 31 для грудня (місяць 12 переноситься на січень наступного року, а нульовий день є 31 грудня).",
    ],
    { code: "const daysIn = (year, month) => new Date(year, month + 1, 0).getDate();\nconsole.log(daysIn(2024, 1), daysIn(2023, 1), daysIn(2024, 11));", codeLanguage: "js" },
  ),
  quiz(
    "date-parse-date-only",
    ["dates-time"],
    3,
    120,
    ["Date-only vs date-time strings", "Рядки лише з датою проти дати з часом"],
    ["The machine's time zone is America/New_York (UTC−5 in January). What does this print?", "Часовий пояс машини America/New_York (UTC−5 у січні). Що виведе цей код?"],
    [
      ["`14 15 2024-01-15T00:00:00.000Z 2024-01-15T05:00:00.000Z`", "`14 15 2024-01-15T00:00:00.000Z 2024-01-15T05:00:00.000Z`"],
      ["`15 15 2024-01-15T05:00:00.000Z 2024-01-15T05:00:00.000Z`", "`15 15 2024-01-15T05:00:00.000Z 2024-01-15T05:00:00.000Z`"],
      ["`15 15 2024-01-15T00:00:00.000Z 2024-01-15T00:00:00.000Z`", "`15 15 2024-01-15T00:00:00.000Z 2024-01-15T00:00:00.000Z`"],
      ["`14 14 2024-01-15T00:00:00.000Z 2024-01-15T00:00:00.000Z`", "`14 14 2024-01-15T00:00:00.000Z 2024-01-15T00:00:00.000Z`"],
    ],
    "a",
    [
      "ISO strings with only a date are parsed as **midnight UTC**, which is 19:00 on January 14 in New York, so `getDate()` is 14: the classic \"birthday shows a day early\" bug. A date-time string **without** an offset is parsed as **local** time, so it's midnight in New York (05:00 UTC). Always include `Z` or an offset in timestamps, and treat calendar dates as plain `YYYY-MM-DD` strings.",
      "Рядки ISO лише з датою розбираються як **північ за UTC**, а це 19:00 14 січня в Нью-Йорку, тож `getDate()` дає 14: класична помилка «день народження показується на день раніше». Рядок дата-час **без** зсуву розбирається як **локальний** час, тож це північ у Нью-Йорку (05:00 UTC). Завжди додавайте `Z` чи зсув до часових позначок, а календарні дати обробляйте як звичайні рядки `YYYY-MM-DD`.",
    ],
    { code: 'const a = new Date("2024-01-15");\nconst b = new Date("2024-01-15T00:00");\nconsole.log(a.getDate(), b.getDate(), a.toISOString(), b.toISOString());', codeLanguage: "js" },
  ),
  quiz(
    "date-dst-24h",
    ["dates-time"],
    4,
    150,
    ["Adding a day across a DST change", "Додавання дня через перехід на літній час"],
    [
      "The machine's time zone is Europe/Kyiv, where clocks jump from 03:00 to 04:00 on 31 March 2024. What does this print?",
      "Часовий пояс машини Europe/Kyiv, де 31 березня 2024 року годинники переводять з 03:00 на 04:00. Що виведе цей код?",
    ],
    [
      ["`13 12 23`", "`13 12 23`"],
      ["`12 12 24`", "`12 12 24`"],
      ["`11 12 23`", "`11 12 23`"],
      ["`12 13 25`", "`12 13 25`"],
    ],
    "a",
    [
      "March 31 in Kyiv is only 23 hours long. Adding 24 hours of milliseconds moves the **instant** forward 24 real hours, which lands at 13:00 local time. `setDate(getDate() + 1)` moves the **calendar day** and keeps the wall-clock time at 12:00, so the two dates are only 23 hours apart. Use calendar arithmetic for \"same time tomorrow\" and millisecond arithmetic for durations (\"in 24 hours\").",
      "31 березня в Києві триває лише 23 години. Додавання 24 годин у мілісекундах зсуває **момент** на 24 реальні години вперед, і це дає 13:00 за місцевим часом. `setDate(getDate() + 1)` зсуває **календарний день** і зберігає настінний час 12:00, тож дві дати розділяють лише 23 години. Для «того самого часу завтра» використовуйте календарну арифметику, а для тривалостей («через 24 години») арифметику в мілісекундах.",
    ],
    {
      code: "const start = new Date(2024, 2, 30, 12, 0);\nconst plus24h = new Date(start.getTime() + 24 * 60 * 60 * 1000);\nconst nextDay = new Date(start);\nnextDay.setDate(nextDay.getDate() + 1);\nconsole.log(plus24h.getHours(), nextDay.getHours(), (nextDay - start) / 3600000);",
      codeLanguage: "js",
    },
  ),
  quiz(
    "date-invalid",
    ["dates-time"],
    2,
    60,
    ["An invalid date", "Некоректна дата"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`Invalid Date NaN true`", "`Invalid Date NaN true`"],
      ["`null null false`", "`null null false`"],
      ["A `RangeError` is thrown by the constructor", "Конструктор кидає `RangeError`"],
      ["`Invalid Date 0 true`", "`Invalid Date 0 true`"],
    ],
    "a",
    [
      "Constructing a `Date` from an unparseable string doesn't throw: you get a real `Date` object whose time value is `NaN`, which prints as `Invalid Date`. It only throws later, for example in `toISOString()` (`RangeError`). Validate with `Number.isNaN(d.getTime())` right after parsing user input.",
      "Створення `Date` з рядка, який не вдається розібрати, не кидає помилку: ви отримуєте справжній об'єкт `Date` зі значенням часу `NaN`, що виводиться як `Invalid Date`. Помилку він кидає лише пізніше, наприклад у `toISOString()` (`RangeError`). Перевіряйте через `Number.isNaN(d.getTime())` одразу після розбору введення користувача.",
    ],
    { code: 'const d = new Date("not a date");\nconsole.log(String(d), d.getTime(), d instanceof Date);', codeLanguage: "js" },
  ),
  quiz(
    "date-compare",
    ["dates-time", w("type-coercion")],
    2,
    60,
    ["Comparing dates", "Порівняння дат"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`false true true true`", "`false true true true`"],
      ["`true true true true`", "`true true true true`"],
      ["`false true false true`", "`false true false true`"],
      ["`false false true false`", "`false false true false`"],
    ],
    "a",
    [
      "`===` compares object identity, so two `Date` objects for the same instant aren't equal. Relational operators (`<=`, `>=`) and unary `+` convert dates to numbers via `valueOf`, so they compare the timestamps and work. Compare with `a.getTime() === b.getTime()` for equality, which states the intent clearly.",
      "`===` порівнює ідентичність об'єктів, тож два об'єкти `Date` для того самого моменту не рівні. Оператори порівняння (`<=`, `>=`) і унарний `+` перетворюють дати на числа через `valueOf`, тож вони порівнюють часові позначки й працюють. Для рівності порівнюйте `a.getTime() === b.getTime()`, що чітко показує намір.",
    ],
    { code: "const a = new Date(0);\nconst b = new Date(0);\nconsole.log(a === b, a.getTime() === b.getTime(), a <= b && a >= b, +a === +b);", codeLanguage: "js" },
  ),
  quiz(
    "date-mutable",
    ["dates-time", w("immutability-copying")],
    2,
    75,
    ["Dates are mutable", "Дати змінні"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`8 8 true`", "`8 8 true`"],
      ["`1 8 false`", "`1 8 false`"],
      ["`1 8 true`", "`1 8 true`"],
      ["`8 1 true`", "`8 1 true`"],
    ],
    "a",
    [
      "`setDate` mutates the `Date` in place, and the function returns the same object, so the \"start\" date moved too and both variables point to one object. Helpers should copy first (`const result = new Date(date)`) or use immutable APIs: date-fns returns new dates, and Temporal types can't be mutated at all.",
      "`setDate` змінює `Date` на місці, а функція повертає той самий об'єкт, тож дата «початку» теж зсунулася, і обидві змінні вказують на один об'єкт. Помічники мають спершу копіювати (`const result = new Date(date)`) або використовувати незмінні API: date-fns повертає нові дати, а типи Temporal узагалі не можна змінити.",
    ],
    { code: "function addDays(date, n) {\n  date.setDate(date.getDate() + n);\n  return date;\n}\nconst start = new Date(2024, 0, 1);\nconst end = addDays(start, 7);\nconsole.log(start.getDate(), end.getDate(), start === end);", codeLanguage: "js" },
  ),
  quiz(
    "date-intl-zones",
    ["dates-time", w("i18n")],
    3,
    90,
    ["One instant, four zones", "Один момент, чотири пояси"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`12:00 15:00 08:00 17:30`", "`12:00 15:00 08:00 17:30`"],
      ["`12:00 14:00 07:00 17:00`", "`12:00 14:00 07:00 17:00`"],
      ["`12:00 12:00 12:00 12:00`", "`12:00 12:00 12:00 12:00`"],
      ["`12:00 15:00 16:00 06:30`", "`12:00 15:00 16:00 06:30`"],
    ],
    "a",
    [
      "A `Date` is one instant; `Intl.DateTimeFormat` with `timeZone` shows its wall-clock time anywhere, regardless of the machine's own zone. In July, Kyiv is on summer time (UTC+3) and New York on EDT (UTC−4); India uses UTC+5:30 all year. Store the instant in UTC and convert only for display.",
      "`Date` є одним моментом; `Intl.DateTimeFormat` з `timeZone` показує його настінний час будь-де, незалежно від власного поясу машини. У липні Київ живе за літнім часом (UTC+3), а Нью-Йорк за EDT (UTC−4); Індія використовує UTC+5:30 цілий рік. Зберігайте момент в UTC і перетворюйте лише для показу.",
    ],
    { code: 'const d = new Date("2024-07-01T12:00:00Z");\nconst fmt = (timeZone) => new Intl.DateTimeFormat("en-GB", { timeStyle: "short", timeZone }).format(d);\nconsole.log(fmt("UTC"), fmt("Europe/Kyiv"), fmt("America/New_York"), fmt("Asia/Kolkata"));', codeLanguage: "js" },
  ),
  quiz(
    "date-relative-time",
    ["dates-time", w("i18n")],
    2,
    60,
    ["`Intl.RelativeTimeFormat`", "`Intl.RelativeTimeFormat`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`yesterday in 2 hours today`", "`yesterday in 2 hours today`"],
      ["`1 day ago in 2 hours in 0 days`", "`1 day ago in 2 hours in 0 days`"],
      ["`-1 day 2 hours 0 day`", "`-1 day 2 hours 0 day`"],
      ["`yesterday 2 hours from now now`", "`yesterday 2 hours from now now`"],
    ],
    "a",
    [
      "`RelativeTimeFormat` turns a signed number and a unit into localised text, so you don't hand-write plural rules or word order for every language. With `numeric: \"auto\"`, it uses words like \"yesterday\" and \"today\" where the language has them; the default `numeric: \"always\"` would say \"1 day ago\" and \"in 0 days\". Choosing the unit (minutes vs hours vs days) is still up to you.",
      "`RelativeTimeFormat` перетворює число зі знаком і одиницю на локалізований текст, тож не треба вручну писати правила множини чи порядку слів для кожної мови. З `numeric: \"auto\"` він використовує слова на кшталт «вчора» й «сьогодні», де вони є в мові; типове `numeric: \"always\"` сказало б «1 day ago» і «in 0 days». Вибір одиниці (хвилини, години чи дні) все одно лишається за вами.",
    ],
    { code: 'const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });\nconsole.log(rtf.format(-1, "day"), rtf.format(2, "hour"), rtf.format(0, "day"));', codeLanguage: "js" },
  ),
  quiz(
    "date-store-birthday",
    ["dates-time", w("sql", 0.3)],
    3,
    90,
    ["Storing a birthday", "Зберігання дня народження"],
    ["Users enter their birthday in a form. How should the app store and send it?", "Користувачі вводять день народження у формі. Як застосунок має його зберігати й передавати?"],
    [
      ["As a plain calendar date: the string `\"1990-05-15\"` (or a SQL `DATE`), never converted to an instant", "Як звичайну календарну дату: рядок `\"1990-05-15\"` (чи SQL `DATE`), ніколи не перетворюючи на момент"],
      ["As `new Date(\"1990-05-15\").toISOString()`", "Як `new Date(\"1990-05-15\").toISOString()`"],
      ["As a Unix timestamp of local midnight on the user's device", "Як часову позначку Unix для локальної півночі на пристрої користувача"],
      ["As `new Date(1990, 4, 15)` serialised with `JSON.stringify`", "Як `new Date(1990, 4, 15)`, серіалізований через `JSON.stringify`"],
    ],
    "a",
    [
      "A birthday is the same calendar day everywhere; it isn't a moment in time. Converting it to an instant ties it to some time zone's midnight, so users in other zones see it shifted by a day (local midnight in Kyiv is still the previous day in UTC). Keep it as a date-only value end to end (`DATE` column, `\"YYYY-MM-DD\"` in JSON, `Temporal.PlainDate` in code).",
      "День народження є тим самим календарним днем усюди; це не момент у часі. Перетворення на момент прив'язує його до півночі якогось часового поясу, тож користувачі в інших поясах бачать його зсунутим на день (локальна північ у Києві за UTC ще попередній день). Тримайте його значенням лише з датою від початку до кінця (стовпець `DATE`, `\"YYYY-MM-DD\"` у JSON, `Temporal.PlainDate` у коді).",
    ],
  ),
  quiz(
    "date-recurring-meeting",
    ["dates-time"],
    3,
    90,
    ["A weekly meeting", "Щотижнева зустріч"],
    ["A team meets every Monday at 09:00 Kyiv time, all year. What should the calendar store?", "Команда збирається щопонеділка о 09:00 за київським часом цілий рік. Що має зберігати календар?"],
    [
      ["The local time `09:00`, the rule \"weekly on Monday\" and the IANA zone `Europe/Kyiv`, computing each occurrence's instant when needed", "Локальний час `09:00`, правило «щотижня в понеділок» і пояс IANA `Europe/Kyiv`, обчислюючи момент кожного повторення за потреби"],
      ["The first occurrence as a UTC instant, adding 7 × 24 hours for each later one", "Перше повторення як момент UTC, додаючи 7 × 24 години для кожного наступного"],
      ["The time `07:00 UTC` and the weekday", "Час `07:00 UTC` і день тижня"],
      ["The fixed offset `+02:00` together with `09:00`", "Фіксований зсув `+02:00` разом із `09:00`"],
    ],
    "a",
    [
      "Kyiv switches between UTC+2 and UTC+3, so a fixed UTC time or a fixed offset puts the meeting at 10:00 or 08:00 for half the year. Future events defined in wall-clock time must keep the **zone name** and compute instants per occurrence (which also follows law changes to DST rules). Past events, like logs and payments, are instants and belong in UTC.",
      "Київ перемикається між UTC+2 і UTC+3, тож фіксований час UTC чи фіксований зсув ставить зустріч на 10:00 чи 08:00 на пів року. Майбутні події, визначені настінним часом, мають зберігати **назву поясу** й обчислювати моменти для кожного повторення (так вони ще й враховують зміни законів про літній час). Минулі події, як-от журнали й платежі, є моментами й належать до UTC.",
    ],
  ),
  quiz(
    "date-temporal",
    ["dates-time"],
    3,
    75,
    ["What Temporal changes", "Що змінює Temporal"],
    ["Which statements about the Temporal API are true?", "Які твердження про Temporal API правдиві?"],
    [
      ["Temporal objects are immutable: methods like `add` return new objects", "Об'єкти Temporal незмінні: методи на кшталт `add` повертають нові об'єкти"],
      ["`Temporal.PlainDate` represents a calendar date with no time zone", "`Temporal.PlainDate` представляє календарну дату без часового поясу"],
      ["Months in Temporal are zero-based, like in `Date`", "Місяці в Temporal рахуються з нуля, як у `Date`"],
      ["`Temporal.ZonedDateTime` stores only a UTC offset, not a time zone name", "`Temporal.ZonedDateTime` зберігає лише зсув від UTC, а не назву часового поясу"],
    ],
    "ab",
    [
      "Temporal fixes `Date`'s design problems: values are immutable, months are 1-based, parsing is strict, and there are separate types for separate ideas: `Instant` (exact time), `PlainDate`/`PlainTime`/`PlainDateTime` (wall-clock values without a zone), `ZonedDateTime` (an instant plus an IANA time zone and calendar, so DST-aware arithmetic works) and `Duration`.",
      "Temporal виправляє вади дизайну `Date`: значення незмінні, місяці рахуються з одиниці, розбір суворий, а для різних ідей є окремі типи: `Instant` (точний час), `PlainDate`/`PlainTime`/`PlainDateTime` (настінні значення без поясу), `ZonedDateTime` (момент плюс часовий пояс IANA і календар, тож арифметика враховує літній час) і `Duration`.",
    ],
  ),
  practice({
    slug: "date-plain-dates",
    skills: ["dates-time", w("typescript")],
    complexity: 3,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Time-zone-safe calendar dates", "Календарні дати, безпечні щодо часових поясів"],
    prompt: [
      "Implement helpers for plain calendar dates (`{ year, month, day }`, months 1–12) in `src/plain-date.ts`. They must give the same results whatever the runtime's time zone, including across DST changes:\n\n- `parsePlainDate(\"YYYY-MM-DD\")` throws a `RangeError` for other formats **and for impossible dates** like `2024-02-30` or `2023-02-29` (which `Date` would silently roll over). `toISODate` pads with zeros.\n- `addDays(d, n)` and `daysBetween(a, b)` (whole days, negative if `b` is earlier).\n- `addMonths(d, n)` clamps to the end of shorter months: `2024-01-31` + 1 month is `2024-02-29`.\n- `dayOfWeek(d)` returns ISO weekdays: 1 = Monday … 7 = Sunday.\n- `formatPlainDate(d, locale, options)` formats with `Intl`, showing the same calendar day in every time zone.",
      "Реалізуйте помічники для звичайних календарних дат (`{ year, month, day }`, місяці 1–12) у `src/plain-date.ts`. Вони мають давати ті самі результати незалежно від часового поясу середовища виконання, зокрема під час переходу на літній час:\n\n- `parsePlainDate(\"YYYY-MM-DD\")` кидає `RangeError` для інших форматів **і для неможливих дат** на кшталт `2024-02-30` чи `2023-02-29` (які `Date` мовчки переніс би). `toISODate` доповнює нулями.\n- `addDays(d, n)` і `daysBetween(a, b)` (цілі дні, від'ємні, якщо `b` раніше).\n- `addMonths(d, n)` обмежує день кінцем коротших місяців: `2024-01-31` + 1 місяць дає `2024-02-29`.\n- `dayOfWeek(d)` повертає дні тижня за ISO: 1 = понеділок … 7 = неділя.\n- `formatPlainDate(d, locale, options)` форматує через `Intl`, показуючи той самий календарний день у будь-якому часовому поясі.",
    ],
    files: { "/src/plain-date.ts": PLAIN_STARTER, "/index.ts": PLAIN_INDEX },
    visibleFiles: ["/src/plain-date.ts", "/index.ts"],
    activeFile: "/src/plain-date.ts",
    tests: PLAIN_TESTS,
    solution: { "/src/plain-date.ts": PLAIN_SOLUTION },
    explanation: [
      "The trick is to do all the arithmetic on UTC midnight, where every day is exactly 24 hours long and nothing depends on the runtime's zone: `Date.UTC` plus the `getUTC*`/`setUTC*` methods, and `timeZone: \"UTC\"` when formatting. `Date`'s overflow does the hard work of crossing month and year boundaries, and a round-trip check turns that same overflow into validation. Month arithmetic counts months as `year * 12 + month` and clamps the day with the \"day 0 of the next month\" trick. `setUTCFullYear` avoids `Date.UTC`'s legacy mapping of years 0–99 to the 1900s.",
      "Хитрість у тому, щоб виконувати всю арифметику над північчю UTC, де кожен день триває рівно 24 години й ніщо не залежить від поясу середовища: `Date.UTC` плюс методи `getUTC*`/`setUTC*` і `timeZone: \"UTC\"` під час форматування. Переповнення `Date` виконує важку роботу з переходом через межі місяців і років, а перевірка туди й назад перетворює те саме переповнення на валідацію. Арифметика місяців рахує місяці як `year * 12 + month` і обмежує день прийомом «нульовий день наступного місяця». `setUTCFullYear` уникає застарілого перетворення `Date.UTC` років 0–99 на 1900-ті.",
    ],
  }),
  practice({
    slug: "date-zones-relative",
    skills: ["dates-time", w("i18n")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Time-zone offsets and relative times with Intl", "Зсуви часових поясів і відносний час через Intl"],
    prompt: [
      "Implement three display helpers in `src/zones.ts` using only built-in `Intl` APIs:\n\n- `zoneOffsetMinutes(date, timeZone)` returns the offset of an IANA zone from UTC **at that instant**, in minutes, including DST: Kyiv is 120 in January and 180 in July, New York −300 and −240, Kolkata 330. Hint: format the instant in the zone with `formatToParts`, read the parts as a UTC date, and subtract.\n- `formatInZone(date, timeZone, locale = \"en-GB\")` shows a medium date and short time in that zone (`\"1 Jul 2024, 17:30\"`).\n- `formatRelative(date, now, locale = \"en\")` uses `Intl.RelativeTimeFormat` with `numeric: \"auto\"`. Under 45 seconds it says \"now\". Otherwise it uses minutes under 45 minutes, hours under 22 hours, days under 26 days, months (30 days) under 320 days, and years (365 days) beyond that, rounding to the nearest whole unit.",
      "Реалізуйте у `src/zones.ts` три помічники для показу, використовуючи лише вбудовані API `Intl`:\n\n- `zoneOffsetMinutes(date, timeZone)` повертає зсув поясу IANA від UTC **у цей момент** у хвилинах, з урахуванням літнього часу: Київ має 120 у січні й 180 у липні, Нью-Йорк −300 і −240, Колката 330. Підказка: відформатуйте момент у поясі через `formatToParts`, прочитайте частини як дату UTC і відніміть.\n- `formatInZone(date, timeZone, locale = \"en-GB\")` показує середній формат дати й короткий час у цьому поясі (`\"1 Jul 2024, 17:30\"`).\n- `formatRelative(date, now, locale = \"en\")` використовує `Intl.RelativeTimeFormat` з `numeric: \"auto\"`. Менше 45 секунд дає «now». Інакше хвилини використовуються до 45 хвилин, години до 22 годин, дні до 26 днів, місяці (30 днів) до 320 днів, а далі роки (365 днів), з округленням до найближчої цілої одиниці.",
    ],
    files: { "/src/zones.ts": ZONES_STARTER, "/index.ts": ZONES_INDEX },
    visibleFiles: ["/src/zones.ts", "/index.ts"],
    activeFile: "/src/zones.ts",
    tests: ZONES_TESTS,
    solution: { "/src/zones.ts": ZONES_SOLUTION },
    explanation: [
      "`Intl.DateTimeFormat` knows every zone's rules (it ships the IANA time zone database), so you never hard-code offsets: formatting the instant in the zone gives its wall-clock time, and the difference between that wall time read as UTC and the real instant is the offset. `hourCycle: \"h23\"` avoids `24` appearing for midnight. `formatInZone` is just a formatter with `timeZone`. For relative times, a table of units with thresholds keeps the logic declarative, and `RelativeTimeFormat` handles wording, plurals and words like \"yesterday\" in each language.",
      "`Intl.DateTimeFormat` знає правила кожного поясу (він містить базу часових поясів IANA), тож зсуви ніколи не треба жорстко прописувати: форматування моменту в поясі дає його настінний час, а різниця між цим настінним часом, прочитаним як UTC, і справжнім моментом є зсувом. `hourCycle: \"h23\"` не дає з'явитися `24` для півночі. `formatInZone` є просто форматувальником із `timeZone`. Для відносного часу таблиця одиниць із порогами тримає логіку декларативною, а `RelativeTimeFormat` дбає про формулювання, множину й слова на кшталт «вчора» в кожній мові.",
    ],
  }),
]);
