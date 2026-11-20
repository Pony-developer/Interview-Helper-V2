import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const BENCH_STARTER = String.raw`export type Summary = {
  n: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  /** Sample standard deviation (divide by n - 1); 0 when n === 1. */
  stdDev: number;
  /** Nearest-rank 95th percentile. */
  p95: number;
  /** 95% margin of error of the mean: 1.96 × stdDev / √n. */
  moe: number;
  /** Relative margin of error, in percent of the mean. */
  rme: number;
};

export function summarize(samples: number[]): Summary {
  // TODO: only the mean is computed
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return { n: samples.length, mean, median: mean, min: 0, max: 0, stdDev: 0, p95: 0, moe: 0, rme: 0 };
}

/** "faster" if a's times are reliably lower than b's, "slower" if reliably higher, else "same". */
export function compare(a: number[], b: number[]): "faster" | "slower" | "same" {
  // TODO: a raw comparison of means ignores noise
  return summarize(a).mean < summarize(b).mean ? "faster" : "slower";
}

/** Results of measured calls are stored here so the engine can't optimise the work away. */
export const blackhole: { value: unknown } = { value: undefined };

export type MeasureOptions = { warmup?: number; runs?: number; batch?: number; now?: () => number };

/** Returns one sample per run: the average time of one call within a batch. */
export function measure(fn: () => unknown, { warmup = 5, runs = 20, batch = 1, now = () => performance.now() }: MeasureOptions = {}): number[] {
  // TODO: no warm-up, no batching, results are thrown away
  const samples: number[] = [];
  for (let r = 0; r < runs; r++) {
    const start = now();
    fn();
    samples.push(now() - start);
  }
  return samples;
}
`;

const BENCH_SOLUTION = String.raw`export type Summary = {
  n: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  p95: number;
  moe: number;
  rme: number;
};

export function summarize(samples: number[]): Summary {
  const n = samples.length;
  if (n === 0) throw new RangeError("No samples");
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = samples.reduce((sum, x) => sum + x, 0) / n;
  const mid = Math.floor(n / 2);
  const median = n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const variance = n > 1 ? samples.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (n - 1) : 0;
  const stdDev = Math.sqrt(variance);
  const p95 = sorted[Math.ceil(0.95 * n) - 1];
  const moe = (1.96 * stdDev) / Math.sqrt(n);
  const rme = mean === 0 ? 0 : (moe / mean) * 100;
  return { n, mean, median, min: sorted[0], max: sorted[n - 1], stdDev, p95, moe, rme };
}

export function compare(a: number[], b: number[]): "faster" | "slower" | "same" {
  const sa = summarize(a);
  const sb = summarize(b);
  // Only call it a difference when the 95% confidence intervals don't overlap.
  if (sa.mean + sa.moe < sb.mean - sb.moe) return "faster";
  if (sa.mean - sa.moe > sb.mean + sb.moe) return "slower";
  return "same";
}

export const blackhole: { value: unknown } = { value: undefined };

export type MeasureOptions = { warmup?: number; runs?: number; batch?: number; now?: () => number };

export function measure(fn: () => unknown, { warmup = 5, runs = 20, batch = 1, now = () => performance.now() }: MeasureOptions = {}): number[] {
  if (runs < 1 || batch < 1) throw new RangeError("runs and batch must be at least 1");
  // Warm-up calls let the JIT optimise before we start measuring.
  for (let i = 0; i < warmup; i++) blackhole.value = fn();
  const samples: number[] = [];
  for (let r = 0; r < runs; r++) {
    const start = now();
    // Batching measures many calls per timer read, beating coarse timer resolution.
    for (let i = 0; i < batch; i++) blackhole.value = fn();
    samples.push((now() - start) / batch);
  }
  return samples;
}
`;

const BENCH_INDEX = String.raw`import "./styles.css";
import { compare, measure, summarize } from "./src/bench";

const data = Array.from({ length: 2000 }, (_, i) => i);
const lines: string[] = [];
try {
  const forLoop = measure(() => {
    let s = 0;
    for (let i = 0; i < data.length; i++) s += data[i];
    return s;
  }, { batch: 50 });
  const reduce = measure(() => data.reduce((a, b) => a + b, 0), { batch: 50 });
  const f = summarize(forLoop);
  const r = summarize(reduce);
  lines.push("for:    " + f.median.toFixed(4) + " ms ±" + f.rme.toFixed(1) + "%");
  lines.push("reduce: " + r.median.toFixed(4) + " ms ±" + r.rme.toFixed(1) + "%");
  lines.push("for is " + compare(forLoop, reduce) + " than reduce");
} catch (e) {
  lines.push("error: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Benchmark</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const BENCH_TESTS = String.raw`import { describe, it, expect, fn } from "./test-kit";
import { blackhole, compare, measure, summarize } from "../src/bench";

describe("summarize", () => {
  it("computes the basic statistics", () => {
    const s = summarize([10, 12, 11, 13, 9]);
    expect(s.n).toBe(5);
    expect(s.mean).toBe(11);
    expect(s.median).toBe(11);
    expect(s.min).toBe(9);
    expect(s.max).toBe(13);
    expect(s.stdDev).toBeCloseTo(1.5811, 3);
    expect(s.p95).toBe(13);
    expect(s.moe).toBeCloseTo(1.3859, 3);
    expect(s.rme).toBeCloseTo(12.599, 2);
  });
  it("averages the middle values for an even count and doesn't mutate the input", () => {
    const samples = [4, 1, 3, 2];
    expect(summarize(samples).median).toBe(2.5);
    expect(samples).toEqual([4, 1, 3, 2]);
  });
  it("handles a single sample and rejects none", () => {
    const s = summarize([5]);
    expect(s.stdDev).toBe(0);
    expect(s.moe).toBe(0);
    expect(s.p95).toBe(5);
    expect(() => summarize([])).toThrow(RangeError);
  });
  it("uses the nearest-rank 95th percentile", () => {
    const samples = Array.from({ length: 40 }, (_, i) => i + 1);
    expect(summarize(samples).p95).toBe(38);
  });
});

describe("compare", () => {
  const fast = [1, 1.1, 0.9, 1, 1];
  const slow = [2, 2.1, 1.9, 2, 2];
  const noisy = [0.5, 3, 1, 2.5, 1.5];
  it("reports a difference only when the intervals don't overlap", () => {
    expect(compare(fast, slow)).toBe("faster");
    expect(compare(slow, fast)).toBe("slower");
    expect(compare(noisy, slow)).toBe("same");
  });
});

describe("measure", () => {
  it("warms up, then records the per-call time of each batch", () => {
    let t = 0;
    const work = fn(() => {
      t += 2;
      return 42;
    });
    const samples = measure(work, { warmup: 3, runs: 4, batch: 5, now: () => t });
    expect(samples).toEqual([2, 2, 2, 2]);
    expect(work).toHaveBeenCalledTimes(3 + 4 * 5);
  });
  it("keeps results so the work can't be optimised away", () => {
    measure(() => "result", { warmup: 0, runs: 1 });
    expect(blackhole.value).toBe("result");
  });
  it("defaults to real time", () => {
    const samples = measure(() => Math.sqrt(2), { runs: 3 });
    expect(samples.length).toBe(3);
    expect(samples.every((s) => s >= 0)).toBe(true);
  });
});
`;

const DISPOSER_STARTER = String.raw`/**
 * Collects cleanups (listeners, timers, subscriptions) and runs them all on dispose(),
 * so components and services don't leak.
 */
export class Disposer {
  private cleanups: Array<() => void> = [];

  /** Registers a cleanup and returns it. */
  add(cleanup: () => void): () => void {
    this.cleanups.push(cleanup);
    return cleanup;
  }

  listen(target: EventTarget, type: string, handler: (event: Event) => void): void {
    // TODO: this listener is never removed
    target.addEventListener(type, handler);
  }

  interval(callback: () => void, ms: number): void {
    // TODO: this interval is never cleared
    setInterval(callback, ms);
  }

  /** A nested disposer that is disposed together with this one. */
  child(): Disposer {
    // TODO
    return new Disposer();
  }

  get disposed(): boolean {
    return false; // TODO
  }

  dispose(): void {
    // TODO: reverse order, run once, keep going after errors
    for (const cleanup of this.cleanups) cleanup();
  }
}
`;

const DISPOSER_SOLUTION = String.raw`export class Disposer {
  #cleanups: Array<() => void> = [];
  #disposed = false;

  add(cleanup: () => void): () => void {
    // Registering after dispose (e.g. when an await finishes late) cleans up right away instead of leaking.
    if (this.#disposed) cleanup();
    else this.#cleanups.push(cleanup);
    return cleanup;
  }

  listen(target: EventTarget, type: string, handler: (event: Event) => void): void {
    target.addEventListener(type, handler);
    this.add(() => target.removeEventListener(type, handler));
  }

  interval(callback: () => void, ms: number): void {
    const id = setInterval(callback, ms);
    this.add(() => clearInterval(id));
  }

  child(): Disposer {
    const child = new Disposer();
    const disposeChild = this.add(() => child.dispose());
    // If the child is disposed on its own, stop tracking it.
    child.add(() => {
      const i = this.#cleanups.indexOf(disposeChild);
      if (i !== -1) this.#cleanups.splice(i, 1);
    });
    return child;
  }

  get disposed(): boolean {
    return this.#disposed;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    const errors: unknown[] = [];
    // Last in, first out: undo things in the reverse order they were set up.
    while (this.#cleanups.length > 0) {
      const cleanup = this.#cleanups.pop()!;
      try {
        cleanup();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length > 0) throw new AggregateError(errors, "Some cleanups failed");
  }
}
`;

const DISPOSER_INDEX = String.raw`import "./styles.css";
import { Disposer } from "./src/disposer";

document.getElementById("app")!.innerHTML =
  '<h1>Disposer</h1><button id="toggle">Stop</button><p>ticks: <span id="ticks">0</span>, clicks: <span id="clicks">0</span></p>';
let ticks = 0;
let clicks = 0;
const d = new Disposer();
// Practise what we preach: once the demo is no longer on the page, clean everything up.
const show = (id: string, value: number) => {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
  else d.dispose();
};
d.interval(() => show("ticks", ++ticks), 500);
d.listen(document, "click", () => show("clicks", ++clicks));
document.getElementById("toggle")!.addEventListener("click", () => d.dispose());
`;

const DISPOSER_TESTS = String.raw`import { describe, it, expect, fn } from "./test-kit";
import { Disposer } from "../src/disposer";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Disposer", () => {
  it("removes event listeners on dispose", () => {
    const target = new EventTarget();
    const handler = fn();
    const d = new Disposer();
    d.listen(target, "ping", handler);
    target.dispatchEvent(new Event("ping"));
    d.dispose();
    target.dispatchEvent(new Event("ping"));
    expect(handler).toHaveBeenCalledTimes(1);
  });
  it("clears intervals on dispose", async () => {
    const tick = fn();
    const d = new Disposer();
    d.interval(tick, 5);
    await sleep(40);
    d.dispose();
    const count = tick.mock.calls.length;
    expect(count).toBeGreaterThan(1);
    await sleep(40);
    expect(tick.mock.calls.length).toBe(count);
  });
  it("runs cleanups in reverse order, exactly once", () => {
    const log = [];
    const d = new Disposer();
    d.add(() => log.push("a"));
    d.add(() => log.push("b"));
    d.add(() => log.push("c"));
    d.dispose();
    d.dispose();
    expect(log).toEqual(["c", "b", "a"]);
    expect(d.disposed).toBe(true);
  });
  it("keeps going when a cleanup throws, then reports every error", () => {
    const log = [];
    const d = new Disposer();
    d.add(() => log.push("a"));
    d.add(() => {
      throw new Error("bad cleanup");
    });
    d.add(() => log.push("c"));
    let error;
    try {
      d.dispose();
    } catch (e) {
      error = e;
    }
    expect(log).toEqual(["c", "a"]);
    expect(error).toBeInstanceOf(AggregateError);
    expect(error.errors.map((e) => e.message)).toEqual(["bad cleanup"]);
  });
  it("cleans up immediately when something is added after dispose", () => {
    const d = new Disposer();
    d.dispose();
    const late = fn();
    d.add(late);
    expect(late).toHaveBeenCalledTimes(1);
  });
  it("disposes children with their parent, and lets them go early", () => {
    const parent = new Disposer();
    const a = parent.child();
    const b = parent.child();
    const cleanA = fn();
    const cleanB = fn();
    a.add(cleanA);
    b.add(cleanB);
    b.dispose();
    expect(cleanB).toHaveBeenCalledTimes(1);
    parent.dispose();
    expect(cleanA).toHaveBeenCalledTimes(1);
    expect(cleanB).toHaveBeenCalledTimes(1);
    expect(a.disposed).toBe(true);
  });
});
`;

export default defineTasks([
  quiz(
    "eng-jit-warmup",
    ["js-engine-performance"],
    1,
    60,
    ["Why code gets faster as it runs", "Чому код пришвидшується під час виконання"],
    [
      "A function runs slowly the first few hundred times it's called and much faster afterwards. What's the most likely reason?",
      "Функція працює повільно перші кілька сотень викликів, а потім значно швидше. Яка найімовірніша причина?",
    ],
    [
      ["The engine first interprets it while collecting type feedback, then a JIT compiler turns the hot function into optimised machine code", "Рушій спершу інтерпретує її, збираючи зворотний зв'язок про типи, а потім JIT-компілятор перетворює гарячу функцію на оптимізований машинний код"],
      ["The browser caches its return values", "Браузер кешує її результати"],
      ["The garbage collector gets faster over time", "Збирач сміття з часом пришвидшується"],
      ["The CPU's branch predictor learns the code, and the engine does nothing", "Передбачувач розгалужень процесора вивчає код, а рушій нічого не робить"],
    ],
    "a",
    [
      "Engines start by interpreting bytecode, which is quick to produce but slow to run. They record which types and object shapes each operation sees, and when a function is hot, an optimising JIT compiles it to machine code specialised for those types. That's also why benchmarks need warm-up runs.",
      "Рушії починають з інтерпретації байткоду, який швидко отримати, але повільно виконувати. Вони записують, які типи й форми об'єктів бачить кожна операція, а коли функція гаряча, оптимізувальний JIT компілює її в машинний код, спеціалізований для цих типів. Тому ж бенчмаркам потрібні розігрівальні запуски.",
    ],
  ),
  quiz(
    "eng-deopt",
    ["js-engine-performance"],
    2,
    75,
    ["Deoptimisation", "Деоптимізація"],
    [
      "`add(a, b)` has been called a million times with small integers and is optimised. Then it's called once as `add(\"1\", \"2\")`. What happens?",
      "`add(a, b)` викликали мільйон разів із малими цілими числами, і її оптимізовано. Потім її викликають один раз як `add(\"1\", \"2\")`. Що станеться?",
    ],
    [
      ["The optimised code's type assumption fails, so the engine deoptimises back to bytecode and returns the correct `\"12\"`; it may reoptimise later with more generic code", "Припущення оптимізованого коду про типи не справджується, тож рушій деоптимізує функцію назад до байткоду й повертає правильне `\"12\"`; згодом він може переоптимізувати її з загальнішим кодом"],
      ["It returns `3`, because the optimised code treats arguments as numbers", "Вона повертає `3`, бо оптимізований код вважає аргументи числами"],
      ["It throws a `TypeError`", "Вона кидає `TypeError`"],
      ["Nothing changes: optimised code handles every type equally fast", "Нічого не змінюється: оптимізований код однаково швидко обробляє всі типи"],
    ],
    "a",
    [
      "Optimised code contains cheap checks (guards) for its assumptions. When a guard fails, the engine **deoptimises**: it reconstructs the interpreter state and continues there, so results are always correct, only slower. Functions that keep receiving mixed types can bounce between tiers, which is why consistent types on hot paths help.",
      "Оптимізований код містить дешеві перевірки (guards) своїх припущень. Коли перевірка не проходить, рушій **деоптимізує** функцію: відновлює стан інтерпретатора й продовжує там, тож результати завжди правильні, лише повільніші. Функції, що постійно отримують змішані типи, можуть стрибати між рівнями, тому сталі типи на гарячих шляхах допомагають.",
    ],
  ),
  quiz(
    "eng-hidden-classes",
    ["js-engine-performance", w("js-classes")],
    2,
    75,
    ["Which objects share a shape?", "Які об'єкти мають спільну форму?"],
    ["In V8, which of these objects end up with the same hidden class?", "Які з цих об'єктів у V8 отримають однаковий прихований клас?"],
    [
      ["`p1` and `p3`", "`p1` і `p3`"],
      ["All three", "Усі три"],
      ["`p1` and `p2`", "`p1` і `p2`"],
      ["None of them", "Жоден"],
    ],
    "a",
    [
      "A shape records which properties an object has **and the order they were added**. Starting from the same empty shape, `p1` and `p3` follow the same transitions (`+x`, then `+y`), so they share a shape; the values don't matter. `p2` adds `y` first and ends on a different branch of the transition tree. Code that sees both kinds becomes polymorphic. Creating objects the same way, ideally in one constructor or factory, keeps them uniform. (Object literals get their own starting shapes, so even `{ x: 1, y: 2 }` wouldn't match `p1`.)",
      "Форма записує, які властивості має об'єкт, **і в якому порядку їх додано**. Починаючи з тієї самої порожньої форми, `p1` і `p3` проходять ті самі переходи (`+x`, потім `+y`), тож мають спільну форму; значення не мають значення. `p2` спершу додає `y` і опиняється на іншій гілці дерева переходів. Код, що бачить обидва види, стає поліморфним. Створення об'єктів однаково, найкраще в одному конструкторі чи фабриці, тримає їх однорідними. (Літерали об'єктів отримують власні початкові форми, тож навіть `{ x: 1, y: 2 }` не збігся б із `p1`.)",
    ],
    { code: "const p1 = {};\np1.x = 1;\np1.y = 2;\n\nconst p2 = {};\np2.y = 2;\np2.x = 1;\n\nconst p3 = {};\np3.x = 5;\np3.y = 6;", codeLanguage: "js" },
  ),
  quiz(
    "eng-delete-property",
    ["js-engine-performance"],
    3,
    90,
    ["`delete` in hot code", "`delete` у гарячому коді"],
    [
      "A reviewer suggests replacing `delete session.cache` with `session.cache = undefined` in a function that runs on every request. Why, and what's the trade-off?",
      "Рецензент пропонує замінити `delete session.cache` на `session.cache = undefined` у функції, що виконується на кожен запит. Чому, і який компроміс?",
    ],
    [
      ["Deleting can push the object into a slow dictionary mode and changes its shape; assigning `undefined` keeps the shape, but the key still exists (`\"cache\" in session` is true, and it shows up in `Object.keys`)", "Видалення може перевести об'єкт у повільний режим словника й змінює його форму; присвоєння `undefined` зберігає форму, але ключ лишається (`\"cache\" in session` дає true, і він з'являється в `Object.keys`)"],
      ["`delete` is asynchronous, so the value can still be read for a while", "`delete` асинхронний, тож значення ще деякий час можна прочитати"],
      ["`delete` frees memory immediately, which pauses the program", "`delete` негайно звільняє пам'ять, і це зупиняє програму"],
      ["There's no difference; both are compiled to the same code", "Різниці немає; обидва компілюються в той самий код"],
    ],
    "a",
    [
      "Removing a property (other than the last one added) usually can't be expressed as a shape transition, so V8 switches the object to **dictionary mode**, a hash table that's slower to access and defeats inline caches. Setting the property to `undefined` keeps the fast shape. The behavioural difference matters: `in`, `hasOwn`, `Object.keys` and JSON (which drops `undefined` values) treat the two differently. Outside hot paths, prefer clarity.",
      "Видалення властивості (крім останньої доданої) зазвичай не можна виразити як перехід форми, тож V8 перемикає об'єкт у **режим словника**, хеш-таблицю, доступ до якої повільніший і яка зводить нанівець inline-кеші. Присвоєння властивості `undefined` зберігає швидку форму. Відмінність у поведінці важлива: `in`, `hasOwn`, `Object.keys` і JSON (що відкидає значення `undefined`) обробляють ці два випадки по-різному. Поза гарячими шляхами віддавайте перевагу зрозумілості.",
    ],
  ),
  quiz(
    "eng-megamorphic",
    ["js-engine-performance"],
    3,
    90,
    ["Mono-, poly- and megamorphic access", "Моно-, полі- й мегаморфний доступ"],
    [
      "`getId(item)` returns `item.id`. It's called in a hot loop with objects built by 15 different factories, each adding properties in a different order. How does that affect the `item.id` access?",
      "`getId(item)` повертає `item.id`. Її викликають у гарячому циклі з об'єктами від 15 різних фабрик, кожна з яких додає властивості в іншому порядку. Як це впливає на доступ `item.id`?",
    ],
    [
      ["The inline cache sees too many shapes, becomes megamorphic and falls back to a slower generic lookup; giving the objects one consistent shape fixes it", "Inline-кеш бачить забагато форм, стає мегаморфним і повертається до повільнішого загального пошуку; одна стала форма об'єктів це виправляє"],
      ["Nothing: property access always costs the same", "Нічого: доступ до властивості завжди коштує однаково"],
      ["The engine throws after 4 shapes", "Рушій кидає помилку після 4 форм"],
      ["It gets faster, because the cache holds more shapes", "Він пришвидшується, бо кеш тримає більше форм"],
    ],
    "a",
    [
      "Each property access site has an inline cache. With one shape it's monomorphic and compiles to a direct offset load; with a few (V8 allows 4) it's polymorphic and checks each; beyond that it's megamorphic and uses a generic hash lookup. Normalising data into one shape (a single factory or class) at the boundary keeps hot loops monomorphic.",
      "Кожне місце доступу до властивості має inline-кеш. З однією формою він мономорфний і компілюється в пряме завантаження за зміщенням; з кількома (V8 дозволяє 4) він поліморфний і перевіряє кожну; понад те він мегаморфний і використовує загальний пошук у хеш-таблиці. Нормалізація даних в одну форму (одна фабрика чи клас) на межі системи тримає гарячі цикли мономорфними.",
    ],
  ),
  quiz(
    "eng-holey-arrays",
    ["js-engine-performance", w("arrays-strings")],
    2,
    75,
    ["Holey arrays", "Діряві масиви"],
    ["Which way of building an array of 1,000 numbers keeps the fastest element kind in V8?", "Який спосіб побудувати масив із 1000 чисел зберігає у V8 найшвидший вид елементів?"],
    [
      ["Start with `[]` and `push` each number", "Почати з `[]` і додавати кожне число через `push`"],
      ["`const a = new Array(1000)` and then assign `a[i]` in a loop", "`const a = new Array(1000)`, а потім присвоювати `a[i]` у циклі"],
      ["`const a = []; a[999] = 0;` and then fill the rest", "`const a = []; a[999] = 0;`, а потім заповнити решту"],
      ["They're all the same once the array is full", "Усі однакові, щойно масив заповнено"],
    ],
    "a",
    [
      "V8 tracks an array's **elements kind**: packed or holey, and small integers, doubles or generic objects. `new Array(n)` and writing past the end create **holes**, and the array stays \"holey\" even after it's filled, so reads must check for holes and the prototype chain. Element kinds only move towards more general ones, so pushing into `[]` (or using `Array.from({ length: n }, fn)`) keeps arrays packed and fast. It matters for large hot arrays only.",
      "V8 відстежує **вид елементів** масиву: щільний (packed) чи дірявий (holey), і малі цілі, дробові чи загальні об'єкти. `new Array(n)` і запис за межі кінця створюють **дірки**, і масив лишається «дірявим» навіть після заповнення, тож читання мають перевіряти дірки й ланцюжок прототипів. Види елементів змінюються лише в бік загальніших, тож додавання в `[]` (чи `Array.from({ length: n }, fn)`) тримає масиви щільними й швидкими. Це важливо лише для великих гарячих масивів.",
    ],
  ),
  quiz(
    "eng-generational-gc",
    ["js-engine-performance"],
    2,
    75,
    ["Why short-lived objects are cheap", "Чому короткоживучі об'єкти дешеві"],
    ["Why is creating lots of small, short-lived objects (for example in `map` callbacks) usually cheap in V8?", "Чому створення багатьох малих короткоживучих об'єктів (наприклад, у колбеках `map`) у V8 зазвичай дешеве?"],
    [
      ["Most objects die young, and the young-generation collector only copies surviving objects, so its cost depends on what survives, not on how much garbage there is", "Більшість об'єктів помирає молодими, а збирач молодого покоління копіює лише ті, що вижили, тож його вартість залежить від того, що вижило, а не від обсягу сміття"],
      ["V8 reuses the same object every time, so nothing is allocated", "V8 щоразу повторно використовує той самий об'єкт, тож нічого не виділяється"],
      ["Garbage is never collected while the page is open", "Сміття не прибирається, доки сторінка відкрита"],
      ["Short-lived objects are stored on the CPU stack", "Короткоживучі об'єкти зберігаються в стеку процесора"],
    ],
    "a",
    [
      "The generational hypothesis says most objects die young. V8 allocates them in a small young generation with a fast bump pointer and cleans it with a **scavenger** that copies only live objects, so dead temporary objects cost almost nothing to collect. Objects that survive a couple of scavenges move to the old generation, which is collected less often by mark-sweep-compact. Long-lived caches and retained objects are what make GC expensive.",
      "Гіпотеза поколінь каже, що більшість об'єктів помирає молодими. V8 виділяє їх у невеликому молодому поколінні швидким зсувом вказівника й чистить його **scavenger**-ом, що копіює лише живі об'єкти, тож прибирання мертвих тимчасових об'єктів майже нічого не коштує. Об'єкти, що пережили кілька прибирань, переходять у старе покоління, яке mark-sweep-compact збирає рідше. Дорогим GC роблять довгоживучі кеші й утримувані об'єкти.",
    ],
  ),
  quiz(
    "eng-listener-leak",
    ["js-engine-performance", w("dom-events")],
    2,
    75,
    ["A leaking component", "Компонент із витоком"],
    [
      "A widget calls `window.addEventListener(\"resize\", this.onResize)` and `setInterval(this.poll, 1000)` when it mounts, and nothing when it unmounts. Users open and close it many times. What happens?",
      "Віджет викликає `window.addEventListener(\"resize\", this.onResize)` і `setInterval(this.poll, 1000)` під час монтування й нічого під час демонтування. Користувачі відкривають і закривають його багато разів. Що станеться?",
    ],
    [
      ["Every closed widget stays in memory, kept alive by `window`'s listener list and the timer, and keeps doing work; remove both on unmount (for example with an `AbortController` and `clearInterval`)", "Кожен закритий віджет лишається в пам'яті, утримуваний списком слухачів `window` і таймером, і продовжує працювати; видаляйте обидва під час демонтування (наприклад, через `AbortController` і `clearInterval`)"],
      ["Nothing: the browser removes listeners when the element leaves the DOM", "Нічого: браузер видаляє слухачів, коли елемент залишає DOM"],
      ["The garbage collector collects the widget, and the interval stops automatically", "Збирач сміття прибирає віджет, а інтервал зупиняється автоматично"],
      ["Only the interval leaks; listeners on `window` are weak", "Витікає лише інтервал; слухачі на `window` слабкі"],
    ],
    "a",
    [
      "`window` lives as long as the page, and it holds strong references to its listeners; active timers are also GC roots. Their closures capture the widget (and through it, its DOM and data), so none of it can be collected, and each copy keeps polling and reacting to resizes. Pair every subscription with a cleanup: `{ signal }` from an `AbortController`, `removeEventListener`, `clearInterval`, `unsubscribe`, or React's effect cleanup.",
      "`window` живе стільки, скільки сторінка, і тримає сильні посилання на своїх слухачів; активні таймери теж є коренями GC. Їхні замикання захоплюють віджет (а через нього його DOM і дані), тож нічого з цього не можна прибрати, а кожна копія продовжує опитувати сервер і реагувати на зміну розміру. Поєднуйте кожну підписку з очищенням: `{ signal }` з `AbortController`, `removeEventListener`, `clearInterval`, `unsubscribe` чи функція очищення ефекту в React.",
    ],
  ),
  quiz(
    "eng-shared-closure-context",
    ["js-engine-performance", w("closures-scope")],
    5,
    150,
    ["A closure that retains more than it uses", "Замикання, що утримує більше, ніж використовує"],
    [
      "`makeHandler()` is called once per row and the returned functions are stored. In V8, does each stored handler keep its `big` array alive?",
      "`makeHandler()` викликають для кожного рядка, а повернені функції зберігають. Чи тримає у V8 кожен збережений обробник свій масив `big` живим?",
    ],
    [
      ["Yes: closures created in the same scope share one context object, and `big` is in it because `debug` uses it", "Так: замикання, створені в одній області видимості, мають спільний об'єкт контексту, і `big` у ньому, бо його використовує `debug`"],
      ["No: the returned function doesn't mention `big`, so it can't retain it", "Ні: повернена функція не згадує `big`, тож не може його утримувати"],
      ["No: `debug` is never called, so the engine deletes it and `big`", "Ні: `debug` ніколи не викликається, тож рушій видаляє його й `big`"],
      ["Only in strict mode", "Лише в строгому режимі"],
    ],
    "a",
    [
      "Engines don't give each closure its own copy of the variables it uses. Variables captured by **any** inner function go into a single context object for that scope, and every closure from that scope references it. Because `debug` mentions `big`, `big` lives in the shared context, and the returned handler keeps it alive even though it never uses it. Fix it by not capturing large values in long-lived scopes, extracting only what's needed (`const size = big.length`) or setting `big = null` when done.",
      "Рушії не дають кожному замиканню власну копію змінних, які воно використовує. Змінні, захоплені **будь-якою** внутрішньою функцією, потрапляють в один об'єкт контексту для цієї області видимості, і кожне замикання з неї посилається на нього. Оскільки `debug` згадує `big`, `big` живе в спільному контексті, і повернений обробник тримає його живим, хоча ніколи не використовує. Виправлення: не захоплюйте великі значення в довгоживучих областях видимості, витягуйте лише потрібне (`const size = big.length`) або присвойте `big = null`, коли закінчите.",
    ],
    {
      code: "function makeHandler(row) {\n  const big = new Array(1_000_000).fill(row.id);\n  const debug = () => console.log(big.length);\n  return () => row.id;\n}",
      codeLanguage: "js",
    },
  ),
  quiz(
    "eng-dead-code-benchmark",
    ["js-engine-performance"],
    3,
    90,
    ["A suspiciously fast benchmark", "Підозріло швидкий бенчмарк"],
    [
      "This benchmark reports that 10 million square roots take about 5 ms, roughly what an empty loop takes. What's the most likely explanation?",
      "Цей бенчмарк показує, що 10 мільйонів квадратних коренів займають близько 5 мс, приблизно стільки ж, скільки порожній цикл. Яке найімовірніше пояснення?",
    ],
    [
      ["The result is never used, so the optimiser can remove the `Math.sqrt` work as dead code; use the result (sum it and print or return it)", "Результат ніколи не використовується, тож оптимізатор може видалити роботу `Math.sqrt` як мертвий код; використайте результат (підсумуйте й виведіть чи поверніть)"],
      ["`Math.sqrt` is run on the GPU", "`Math.sqrt` виконується на GPU"],
      ["`performance.now()` stops while loops run", "`performance.now()` зупиняється, поки виконуються цикли"],
      ["Modern CPUs really compute 2 billion square roots per second, so the number is right", "Сучасні процесори справді обчислюють 2 мільярди квадратних коренів за секунду, тож число правильне"],
    ],
    "a",
    [
      "Optimising compilers remove computations whose results have no observable effect, and `Math.sqrt` has none. The benchmark then measures an empty loop. Make the result observable (accumulate it and use it afterwards, or store it in a \"black hole\" variable), and prefer a benchmarking library that does this, warms up and reports a margin of error.",
      "Оптимізувальні компілятори видаляють обчислення, чиї результати не мають помітного ефекту, а `Math.sqrt` такого ефекту не має. Тоді бенчмарк вимірює порожній цикл. Зробіть результат помітним (накопичуйте його й використайте потім або зберігайте в змінній-«чорній дірі») і віддавайте перевагу бібліотеці для бенчмарків, що робить це, розігріває код і показує похибку.",
    ],
    { code: "const start = performance.now();\nfor (let i = 0; i < 10_000_000; i++) {\n  Math.sqrt(i);\n}\nconsole.log(performance.now() - start, \"ms\");", codeLanguage: "js" },
  ),
  quiz(
    "eng-benchmark-order",
    ["js-engine-performance", w("unit-testing", 0.3)],
    3,
    90,
    ["Order effects in benchmarks", "Вплив порядку в бенчмарках"],
    [
      "A script times implementation A once, then implementation B once, in the same process. B is 40% faster. Swapping the order makes A 40% faster. What should you change?",
      "Скрипт один раз вимірює реалізацію A, потім один раз реалізацію B в тому самому процесі. B на 40% швидша. Якщо поміняти порядок, на 40% швидшою стає A. Що варто змінити?",
    ],
    [
      ["Warm both up first, run each many times (interleaved or in separate processes), and compare medians with a margin of error", "Спершу розігріти обидві, виконати кожну багато разів (почергово чи в окремих процесах) і порівнювати медіани з похибкою"],
      ["Always run the slower one first", "Завжди запускати повільнішу першою"],
      ["Use `Date.now()` instead of `performance.now()`", "Використовувати `Date.now()` замість `performance.now()`"],
      ["Nothing: B is faster because it ran second, and that's what users will see", "Нічого: B швидша, бо виконувалася другою, і саме це побачать користувачі"],
    ],
    "a",
    [
      "Whatever runs first pays for JIT warm-up, lazy compilation, cache misses and maybe a GC triggered by earlier allocations, so one-shot sequential timings mostly measure order. Warm up each candidate, collect many samples, alternate or isolate them, and look at medians and confidence intervals. If the difference is within the noise, it doesn't exist for practical purposes.",
      "Те, що виконується першим, платить за розігрів JIT, ліниву компіляцію, промахи кешу й, можливо, GC, спричинений попередніми виділеннями пам'яті, тож одноразові послідовні виміри здебільшого вимірюють порядок. Розігрійте кожного кандидата, зберіть багато вимірів, чергуйте чи ізолюйте їх і дивіться на медіани й довірчі інтервали. Якщо різниця в межах шуму, на практиці її не існує.",
    ],
  ),
  quiz(
    "eng-tail-calls",
    ["js-engine-performance", w("recursion")],
    3,
    90,
    ["Tail calls in practice", "Хвостові виклики на практиці"],
    ["This runs in Node.js (V8). What does it print?", "Код виконується в Node.js (V8). Що він виведе?"],
    [
      ["`RangeError`", "`RangeError`"],
      ["`500000500000`", "`500000500000`"],
      ["`Infinity`", "`Infinity`"],
      ["`TypeError`", "`TypeError`"],
    ],
    "a",
    [
      "The recursive call is in tail position, and ES2015 specifies proper tail calls that would reuse the stack frame, but only Safari's JavaScriptCore implements them. V8 and SpiderMonkey keep a frame per call, so a million levels overflow the stack with `RangeError: Maximum call stack size exceeded`. Write deep recursion as a loop (or use an explicit stack or a trampoline).",
      "Рекурсивний виклик стоїть у хвостовій позиції, і ES2015 визначає правильні хвостові виклики, що повторно використовували б кадр стеку, але реалізує їх лише JavaScriptCore у Safari. V8 і SpiderMonkey тримають по кадру на виклик, тож мільйон рівнів переповнює стек із `RangeError: Maximum call stack size exceeded`. Пишіть глибоку рекурсію як цикл (або використайте явний стек чи трамплін).",
    ],
    { code: "function sum(n, acc = 0) {\n  return n === 0 ? acc : sum(n - 1, acc + n);\n}\ntry {\n  console.log(sum(1_000_000));\n} catch (e) {\n  console.log(e.constructor.name);\n}", codeLanguage: "js" },
  ),
  practice({
    slug: "eng-bench-stats",
    skills: ["js-engine-performance", w("typescript")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["An honest micro-benchmark harness", "Чесний інструмент для мікробенчмарків"],
    prompt: [
      "Build the core of a benchmarking tool in `src/bench.ts`:\n\n- `summarize(samples)` returns `n`, `mean`, `median` (the average of the middle two for an even count), `min`, `max`, `stdDev` (sample, divided by `n − 1`; `0` for one sample), `p95` (nearest rank: the `⌈0.95·n⌉`-th smallest), `moe` (`1.96 × stdDev / √n`) and `rme` (`moe` as a percentage of the mean). It throws a `RangeError` for no samples and doesn't mutate its input.\n- `compare(a, b)` returns `\"faster\"` or `\"slower\"` only when the 95% intervals (`mean ± moe`) of the two time samples don't overlap, and `\"same\"` otherwise.\n- `measure(fn, { warmup, runs, batch, now })` calls `fn` `warmup` times without measuring, then for each run times `batch` calls and records the **per-call** time. Every result goes into `blackhole.value`, so the work can't be optimised away. `now` defaults to `performance.now()` and is injectable for tests.",
      "Побудуйте основу інструмента для бенчмарків у `src/bench.ts`:\n\n- `summarize(samples)` повертає `n`, `mean`, `median` (середнє двох середніх значень для парної кількості), `min`, `max`, `stdDev` (вибіркове, ділене на `n − 1`; `0` для одного виміру), `p95` (найближчий ранг: `⌈0.95·n⌉`-те найменше), `moe` (`1.96 × stdDev / √n`) і `rme` (`moe` у відсотках від середнього). Вона кидає `RangeError`, коли вимірів немає, і не змінює вхідні дані.\n- `compare(a, b)` повертає `\"faster\"` чи `\"slower\"`, лише коли 95% інтервали (`mean ± moe`) двох вибірок часу не перетинаються, а інакше `\"same\"`.\n- `measure(fn, { warmup, runs, batch, now })` викликає `fn` `warmup` разів без вимірювання, а потім для кожного запуску вимірює `batch` викликів і записує час **на один виклик**. Кожен результат потрапляє в `blackhole.value`, тож роботу не можна прибрати оптимізацією. `now` за замовчуванням дорівнює `performance.now()`, і його можна підмінити в тестах.",
    ],
    files: { "/src/bench.ts": BENCH_STARTER, "/index.ts": BENCH_INDEX },
    visibleFiles: ["/src/bench.ts", "/index.ts"],
    activeFile: "/src/bench.ts",
    tests: BENCH_TESTS,
    solution: { "/src/bench.ts": BENCH_SOLUTION },
    explanation: [
      "Each piece addresses a benchmarking pitfall. Warm-up runs let the JIT optimise before measuring; batching many calls per timer read beats coarse timer resolution; writing results to a black hole prevents dead-code elimination; and summarising many samples with a median and a margin of error exposes noise. `compare` only reports a winner when the confidence intervals are separate, which stops you from \"optimising\" based on random variation. Injecting the clock makes the timing logic itself testable.",
      "Кожна частина відповідає на пастку бенчмарків. Розігрівальні запуски дають JIT оптимізувати код до вимірювання; групування багатьох викликів на одне зчитування таймера долає грубу роздільну здатність таймера; запис результатів у «чорну діру» запобігає видаленню мертвого коду; а підсумок багатьох вимірів медіаною й похибкою показує шум. `compare` називає переможця, лише коли довірчі інтервали не перетинаються, і це не дає «оптимізувати» на основі випадкових коливань. Підміна годинника робить саму логіку вимірювання придатною для тестування.",
    ],
  }),
  practice({
    slug: "eng-disposer",
    skills: ["js-engine-performance", w("dom-events"), w("design-patterns")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Leak-proof cleanup with a disposer", "Очищення без витоків через disposer"],
    prompt: [
      "Most front-end leaks come from listeners, timers and subscriptions that outlive their component. Finish `Disposer` in `src/disposer.ts`, which collects cleanups and runs them on `dispose()`:\n\n- `add(cleanup)` registers a cleanup and returns it. `listen(target, type, handler)` and `interval(fn, ms)` set things up **and** register their removal.\n- `dispose()` runs cleanups in **reverse order** (last in, first out), each exactly once; calling it again does nothing, and `disposed` becomes `true`.\n- If a cleanup throws, the rest still run, and afterwards `dispose()` throws an `AggregateError` with all the errors.\n- Adding a cleanup **after** disposal runs it immediately (late async setup must not leak).\n- `child()` returns a nested disposer that's disposed along with its parent; disposing the child early is allowed, and its cleanups never run twice.",
      "Більшість витоків на фронтенді виникає через слухачів, таймери й підписки, що переживають свій компонент. Завершіть `Disposer` у `src/disposer.ts`, що збирає очищення й виконує їх у `dispose()`:\n\n- `add(cleanup)` реєструє очищення й повертає його. `listen(target, type, handler)` і `interval(fn, ms)` налаштовують ресурс **і** реєструють його видалення.\n- `dispose()` виконує очищення у **зворотному порядку** (останнім прийшов, першим вийшов), кожне рівно один раз; повторний виклик нічого не робить, а `disposed` стає `true`.\n- Якщо очищення кидає помилку, решта все одно виконується, а потім `dispose()` кидає `AggregateError` з усіма помилками.\n- Додавання очищення **після** звільнення виконує його одразу (пізнє асинхронне налаштування не повинно спричиняти витік).\n- `child()` повертає вкладений disposer, що звільняється разом із батьком; звільнити дочірній раніше можна, і його очищення ніколи не виконуються двічі.",
    ],
    files: { "/src/disposer.ts": DISPOSER_STARTER, "/index.ts": DISPOSER_INDEX },
    visibleFiles: ["/src/disposer.ts", "/index.ts"],
    activeFile: "/src/disposer.ts",
    tests: DISPOSER_TESTS,
    solution: { "/src/disposer.ts": DISPOSER_SOLUTION },
    explanation: [
      "Pairing every setup with its teardown at the moment of setup makes leaks hard to write: the cleanup can't be forgotten later. Running cleanups LIFO undoes things in the reverse order they were built, like a stack unwinding. Catching each cleanup's error and rethrowing them together as an `AggregateError` guarantees that one failure doesn't leave other resources alive. Running late additions immediately covers async setup that finishes after the component is gone. This is the same idea as React effect cleanups, RxJS subscriptions and the `DisposableStack` / `using` proposal.",
      "Поєднання кожного налаштування з його демонтажем у момент налаштування ускладнює написання витоків: очищення неможливо забути пізніше. Виконання очищень за принципом LIFO скасовує дії у зворотному до побудови порядку, як розмотування стеку. Перехоплення помилки кожного очищення й повторне кидання їх разом як `AggregateError` гарантує, що одна невдача не залишить інші ресурси живими. Негайне виконання пізніх додавань покриває асинхронне налаштування, що завершується після зникнення компонента. Це та сама ідея, що й функції очищення ефектів у React, підписки RxJS і пропозиція `DisposableStack` / `using`.",
    ],
  }),
]);
