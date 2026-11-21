import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const HIST_STARTER = code`/**
 * A latency histogram with fixed buckets. Each bound is an upper limit (le), inclusive;
 * anything above the last bound goes to an overflow bucket with bound Infinity.
 */
export function createHistogram(bounds: number[]) {
  return {
    observe(value: number): void {
      // TODO
    },
    get count(): number {
      return 0; // TODO
    },
    mean(): number {
      return NaN; // TODO
    },
    /** Cumulative counts per bucket, the last one (Infinity) equal to count. */
    buckets(): Array<{ le: number; count: number }> {
      return []; // TODO
    },
    /** Estimated percentile: the upper bound of the first bucket that holds ceil(p × count) observations. */
    percentile(p: number): number {
      return NaN; // TODO
    },
  };
}
`;

const HIST_SOLUTION = code`export function createHistogram(bounds: number[]) {
  if (bounds.length === 0 || bounds.some((b, i) => i > 0 && b <= bounds[i - 1])) {
    throw new RangeError("Bucket bounds must be strictly ascending");
  }
  // One counter per bound, plus the overflow bucket for values above the last bound.
  const counts: number[] = new Array(bounds.length + 1).fill(0);
  let count = 0;
  let sum = 0;

  const histogram = {
    observe(value: number): void {
      count++;
      sum += value;
      const index = bounds.findIndex((bound) => value <= bound); // inclusive upper bound
      counts[index === -1 ? bounds.length : index]++;
    },
    get count(): number {
      return count;
    },
    mean(): number {
      return count === 0 ? NaN : sum / count;
    },
    buckets(): Array<{ le: number; count: number }> {
      let running = 0;
      return [...bounds, Infinity].map((le, i) => {
        running += counts[i];
        return { le, count: running };
      });
    },
    percentile(p: number): number {
      if (count === 0) return NaN;
      const rank = Math.max(1, Math.ceil(p * count));
      const found = histogram.buckets().find((bucket) => bucket.count >= rank);
      return found ? found.le : Infinity;
    },
  };
  return histogram;
}
`;

const HIST_INDEX = code`import "./styles.css";
import { createHistogram } from "./src/histogram";

const latency = createHistogram([10, 50, 100, 500]);
[12, 35, 48, 90, 120, 800].forEach((ms) => latency.observe(ms));
document.getElementById("app")!.innerHTML = '<h1>Latency</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = "p50 ≤ " + latency.percentile(0.5) + " ms, p95 ≤ " + latency.percentile(0.95) + " ms, mean " + latency.mean().toFixed(1) + " ms";
`;

const HIST_TESTS = code`import { describe, it, expect } from "./test-kit";
import { createHistogram } from "../src/histogram";

function filled() {
  const h = createHistogram([1, 2, 5, 10]);
  [1, 2, 3, 10].forEach((v) => h.observe(v));
  return h;
}

describe("createHistogram", () => {
  it("counts observations and computes the mean", () => {
    const h = filled();
    expect(h.count).toBe(4);
    expect(h.mean()).toBe(4);
  });
  it("keeps cumulative counts per bucket, with the overflow bucket last", () => {
    expect(filled().buckets()).toEqual([
      { le: 1, count: 1 },
      { le: 2, count: 2 },
      { le: 5, count: 3 },
      { le: 10, count: 4 },
      { le: Infinity, count: 4 },
    ]);
  });
  it("counts a value equal to a bound in that bound's bucket", () => {
    expect(filled().buckets()[1].count).toBe(2);
  });
  it("estimates percentiles from the bucket bounds", () => {
    const h = filled();
    expect(h.percentile(0.5)).toBe(2);
    expect(h.percentile(0.75)).toBe(5);
    expect(h.percentile(0.95)).toBe(10);
    expect(h.percentile(1)).toBe(10);
  });
  it("reports overflow values as Infinity", () => {
    const h = createHistogram([10]);
    h.observe(50);
    expect(h.percentile(1)).toBe(Infinity);
    expect(h.mean()).toBe(50);
  });
  it("is NaN before any observation", () => {
    const h = createHistogram([10]);
    expect(h.percentile(0.5)).toBeNaN();
    expect(h.mean()).toBeNaN();
  });
  it("needs strictly ascending bounds", () => {
    expect(() => createHistogram([2, 1])).toThrow(RangeError);
    expect(() => createHistogram([])).toThrow(RangeError);
  });
});
`;

export default defineTasks([
  quiz(
    "mon-percentiles-vs-average",
    ["monitoring", w("web-performance", 0.3)],
    2,
    75,
    ["Why p95 instead of the average", "Навіщо p95, а не середнє"],
    ["Why do dashboards show the 95th percentile latency next to the average?", "Чому дашборди показують 95-й перцентиль затримки поруч із середнім?"],
    [
      ["An average hides slow outliers: if 5% of requests take ten seconds, the mean can still look healthy, while p95 shows what the slowest users experience", "Середнє приховує повільні викиди: якщо 5% запитів тривають десять секунд, середнє все одно може виглядати добре, а p95 показує, що відчувають найповільніші користувачі"],
      ["Percentiles are always lower than averages, so they look better", "Перцентилі завжди нижчі за середні, тож виглядають краще"],
      ["The average can't be computed from histograms", "Середнє не можна обчислити з гістограм"],
      ["p95 is the number of requests per second", "p95 — це кількість запитів на секунду"],
    ],
    "a",
    [
      "Latency distributions are long-tailed: most requests are fast, and a few very slow ones barely move the mean. Percentiles describe the tail directly, which is where users notice problems and where timeouts and queues hurt. Histograms with fixed buckets, as in this task, let you compute percentiles across many servers without storing every sample.",
      "Розподіли затримок мають довгий хвіст: більшість запитів швидкі, а кілька дуже повільних майже не рухають середнє. Перцентилі описують хвіст безпосередньо, саме там користувачі помічають проблеми і там шкодять тайм-аути та черги. Гістограми з фіксованими коробками, як у цій задачі, дають рахувати перцентилі на багатьох серверах без зберігання кожного виміру.",
    ],
  ),
  practice({
    slug: "mon-latency-histogram",
    skills: ["monitoring", w("web-performance"), w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["A latency histogram with percentiles", "Гістограма затримок із перцентилями"],
    prompt: [
      "Monitoring systems don't store every request's latency: they count observations into buckets and estimate percentiles from the counts, which works across many servers. Implement `createHistogram(bounds)` in `src/histogram.ts`:\n\n- Each bound is an inclusive upper limit (`le`). A value equal to a bound counts in that bound's bucket. Values above the last bound go to an overflow bucket whose bound is `Infinity`.\n- `observe(value)` records a value; `count` and `mean()` describe everything observed so far (`mean()` is `NaN` before any observation).\n- `buckets()` returns **cumulative** counts: each bucket counts everything at or below its bound, and the last one equals `count`.\n- `percentile(p)` returns the bound of the first bucket holding at least `ceil(p × count)` observations (at least 1), and `Infinity` if that lands in the overflow bucket.\n- Bounds must be strictly ascending, or a `RangeError`.",
      "Системи моніторингу не зберігають затримку кожного запиту: вони рахують виміри по коробках і оцінюють перцентилі за підрахунками, а це працює на багатьох серверах. Реалізуйте `createHistogram(bounds)` у `src/histogram.ts`:\n\n- Кожна межа — це включна верхня границя (`le`). Значення, що дорівнює межі, рахується в коробці цієї межі. Значення понад останню межу потрапляють у коробку переповнення з межею `Infinity`.\n- `observe(value)` записує значення; `count` і `mean()` описують усе спостережене (`mean()` дорівнює `NaN` до першого спостереження).\n- `buckets()` повертає **накопичувальні** підрахунки: кожна коробка рахує все, що не перевищує її межу, а остання дорівнює `count`.\n- `percentile(p)` повертає межу першої коробки, де є щонайменше `ceil(p × count)` спостережень (принаймні 1), а `Infinity`, якщо це потрапило в коробку переповнення.\n- Межі мають бути строго зростаючими, інакше `RangeError`.",
    ],
    files: {
      "/src/histogram.ts": HIST_STARTER,
      "/index.ts": HIST_INDEX,
    },
    visibleFiles: ["/src/histogram.ts"],
    activeFile: "/src/histogram.ts",
    tests: HIST_TESTS,
    solution: { "/src/histogram.ts": HIST_SOLUTION },
    explanation: [
      "A histogram trades precision for constant memory: a few counters regardless of traffic, and the percentile is only known to the resolution of the buckets. The percentile is the bound of the first cumulative bucket that reaches the rank, so it's an upper estimate (\"at most 10 ms\"), which is the conservative direction for alerting. Because bucket counts simply add up, histograms from many servers merge into one by summing counters, which averages and percentiles of raw samples cannot do. Choose bounds around your SLO: a bucket edge exactly at the target tells you whether you meet it.",
      "Гістограма обмінює точність на сталу пам'ять: кілька лічильників незалежно від трафіку, а перцентиль відомий лише з точністю до коробок. Перцентиль — це межа першої накопичувальної коробки, яка досягає рангу, тож це верхня оцінка («не більше 10 мс»), а для сповіщень це консервативний напрямок. Оскільки підрахунки коробок просто додаються, гістограми з багатьох серверів зливаються в одну простим сумуванням лічильників, чого не можна зробити з середніми чи перцентилями сирих вимірів. Вибирайте межі навколо свого SLO: межа коробки саме на цільовому значенні показує, чи ви його дотримуєтесь.",
    ],
  }),
]);
