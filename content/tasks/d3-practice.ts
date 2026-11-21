import { defineTasks } from "@/lib/content/schema";
import { practice, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const SCALE_STARTER = code`export type Scale = {
  (value: number): number;
  invert(pixel: number): number;
  ticks(count?: number): number[];
};

/** A "nice" tick step: 1, 2, 5 or 10 times a power of ten, giving roughly count intervals. */
export function niceStep(min: number, max: number, count: number): number {
  // TODO
  return 1;
}

/** Maps numbers from the domain onto the range, linearly. The range may run backwards (for a y axis). */
export function linearScale(domain: [number, number], range: [number, number]): Scale {
  // TODO: the scale, invert, and ticks (ascending, within the domain, no floating-point noise)
  return Object.assign((value: number) => 0, { invert: (pixel: number) => 0, ticks: (count?: number) => [] as number[] });
}
`;

const SCALE_SOLUTION = code`export type Scale = {
  (value: number): number;
  invert(pixel: number): number;
  ticks(count?: number): number[];
};

export function niceStep(min: number, max: number, count: number): number {
  if (!(count >= 1)) throw new RangeError("count must be at least 1");
  const raw = Math.abs(max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  // Round the raw step up to the nearest 1, 2, 5 or 10 times a power of ten.
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * magnitude;
}

export function linearScale(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  if (d0 === d1) throw new RangeError("Domain must not be empty");

  const scale = (value: number) => r0 + ((value - d0) * (r1 - r0)) / (d1 - d0);
  const invert = (pixel: number) => d0 + ((pixel - r0) * (d1 - d0)) / (r1 - r0);
  const ticks = (count = 5): number[] => {
    const lo = Math.min(d0, d1);
    const hi = Math.max(d0, d1);
    const step = niceStep(lo, hi, count);
    const out: number[] = [];
    for (let k = Math.ceil(lo / step); k <= Math.floor(hi / step); k++) {
      // toPrecision removes the floating-point noise of k * step (3 * 0.1 is 0.30000000000000004).
      out.push(Number((k * step).toPrecision(12)));
    }
    return out;
  };
  return Object.assign(scale, { invert, ticks });
}
`;

const SCALE_INDEX = code`import "./styles.css";
import { linearScale } from "./src/scale";

const x = linearScale([0, 100], [0, 500]);
document.getElementById("app")!.innerHTML = '<h1>Scale</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = "x(25) = " + x(25) + ", ticks: " + x.ticks().join(", ");
`;

const SCALE_TESTS = code`import { describe, it, expect } from "./test-kit";
import { linearScale, niceStep } from "../src/scale";

describe("linearScale", () => {
  it("maps the domain onto the range", () => {
    const x = linearScale([0, 100], [0, 500]);
    expect(x(0)).toBe(0);
    expect(x(50)).toBe(250);
    expect(x(100)).toBe(500);
  });
  it("supports a backwards range, like a y axis", () => {
    const y = linearScale([0, 10], [300, 0]);
    expect(y(0)).toBe(300);
    expect(y(5)).toBe(150);
    expect(y(10)).toBe(0);
  });
  it("inverts pixels back to values", () => {
    expect(linearScale([0, 100], [0, 500]).invert(250)).toBe(50);
    expect(linearScale([0, 10], [300, 0]).invert(150)).toBe(5);
  });
  it("rejects an empty domain", () => {
    expect(() => linearScale([5, 5], [0, 1])).toThrow("Domain must not be empty");
  });
});

describe("niceStep", () => {
  it("rounds the raw step up to 1, 2, 5 or 10 times a power of ten", () => {
    expect(niceStep(0, 100, 5)).toBe(20);
    expect(niceStep(0, 7, 4)).toBe(2);
    expect(niceStep(0, 1, 10)).toBeCloseTo(0.1);
    expect(niceStep(-50, 50, 4)).toBe(50);
  });
  it("needs at least one interval", () => {
    expect(() => niceStep(0, 1, 0)).toThrow(RangeError);
  });
});

describe("ticks", () => {
  it("covers the domain with round numbers", () => {
    expect(linearScale([0, 100], [0, 1]).ticks()).toEqual([0, 20, 40, 60, 80, 100]);
  });
  it("only includes values inside the domain", () => {
    expect(linearScale([3, 17], [0, 1]).ticks(4)).toEqual([5, 10, 15]);
  });
  it("handles negative domains", () => {
    expect(linearScale([-50, 50], [0, 1]).ticks(4)).toEqual([-50, 0, 50]);
  });
  it("produces clean decimals without floating-point noise", () => {
    expect(linearScale([0, 1], [0, 1]).ticks(10)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
  });
});
`;

export default defineTasks([
  practice({
    slug: "d3-linear-scale",
    skills: ["d3", w("typescript"), w("data-analysis", 0.3)],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["A linear scale with nice ticks", "Лінійна шкала з гарними поділками"],
    prompt: [
      "Chart libraries like D3 map data values to pixels with **scales**. Implement the core of one in `src/scale.ts`:\n\n- `linearScale(domain, range)` returns a function that maps a value from the domain to the range linearly. The range may run backwards (`[300, 0]` for a y axis, where larger values are higher up).\n- The scale also has `invert(pixel)`, which maps back to a value, and `ticks(count = 5)`, which returns ascending tick values inside the domain.\n- `niceStep(min, max, count)` gives the step for those ticks: the raw step `(max - min) / count` rounded **up** to 1, 2, 5 or 10 times a power of ten. Ticks must be clean numbers, so `0.30000000000000004` must come out as `0.3`.\n- An empty domain (`[5, 5]`) is a `RangeError`.",
      "Бібліотеки діаграм на кшталт D3 перетворюють значення даних на пікселі за допомогою **шкал**. Реалізуйте основу однієї в `src/scale.ts`:\n\n- `linearScale(domain, range)` повертає функцію, яка лінійно перетворює значення з домену в діапазон. Діапазон може йти назад (`[300, 0]` для осі y, де більші значення вище).\n- Шкала також має `invert(pixel)`, що повертає значення назад, і `ticks(count = 5)`, що повертає поділки в порядку зростання всередині домену.\n- `niceStep(min, max, count)` дає крок для поділок: сирий крок `(max - min) / count`, округлений **вгору** до 1, 2, 5 або 10 помножених на степінь десяти. Поділки мають бути чистими числами, тож `0.30000000000000004` має стати `0.3`.\n- Порожній домен (`[5, 5]`) — це `RangeError`.",
    ],
    files: {
      "/src/scale.ts": SCALE_STARTER,
      "/index.ts": SCALE_INDEX,
    },
    visibleFiles: ["/src/scale.ts"],
    activeFile: "/src/scale.ts",
    tests: SCALE_TESTS,
    solution: { "/src/scale.ts": SCALE_SOLUTION },
    explanation: [
      "A scale is just a linear function with its inputs and outputs swapped in meaning: `pixel = r0 + (value - d0) * (r1 - r0) / (d1 - d0)`, and `invert` is the same equation solved backwards, which is what makes mouse-to-value lookups work. Ticks need a \"nice\" step so people read round numbers: taking the raw step and rounding it up to 1, 2, 5 or 10 times a power of ten gives steps that always look sensible. The floating-point detail matters more than it looks: `k * 0.1` is not exact in binary, so the ticks are rounded with `toPrecision` before they reach the axis. Also notice that the tick loop only uses integers `k`, which keeps the values exact multiples of the step.",
      "Шкала — це просто лінійна функція, у якій вхід і вихід міняються місцями: `піксель = r0 + (значення − d0) * (r1 − r0) / (d1 − d0)`, а `invert` — це те саме рівняння, розв'язане назад, через що працює пошук значення за позицією миші. Поділкам потрібен «гарний» крок, щоб люди бачили круглі числа: сирий крок, округлений вгору до 1, 2, 5 або 10 помножених на степінь десяти, завжди дає правдоподібні кроки. Деталь з плаваючою комою важливіша, ніж здається: `k * 0.1` не точно в двійковій системі, тож поділки округлюються через `toPrecision` до того, як потраплять на вісь. Також зверніть увагу, що цикл поділок використовує лише цілі `k`, тож значення є точними кратними кроку.",
    ],
  }),
]);
