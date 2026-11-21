import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const lines = (...l: string[]) => l.join("\n");

// ── Practice 1: parse a query string (vanilla-ts) ──────────────────────────

const QUERY_STARTER = String.raw`// TODO: turn a query string into an object. Repeated keys become arrays, in order of appearance.
export function parseQuery(search: string): Record<string, string | string[]> {
  return {};
}
`;

const QUERY_SOLUTION = String.raw`const decode = (s: string) => decodeURIComponent(s.replace(/\+/g, " "));

export function parseQuery(search: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  const body = search.startsWith("?") ? search.slice(1) : search;
  if (body === "") return out;

  for (const part of body.split("&")) {
    if (part === "") continue;
    const eq = part.indexOf("=");
    const key = decode(eq === -1 ? part : part.slice(0, eq));
    const value = decode(eq === -1 ? "" : part.slice(eq + 1));

    const existing = out[key];
    if (existing === undefined) out[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else out[key] = [existing, value];
  }
  return out;
}
`;

const QUERY_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { parseQuery } from "../src/query";

describe("parseQuery", () => {
  it("returns an empty object for an empty query", () => {
    expect(parseQuery("")).toEqual({});
    expect(parseQuery("?")).toEqual({});
  });
  it("accepts the leading question mark or no mark", () => {
    expect(parseQuery("?a=1")).toEqual({ a: "1" });
    expect(parseQuery("a=1")).toEqual({ a: "1" });
  });
  it("turns repeated keys into an array in order", () => {
    expect(parseQuery("?a=1&b=2&a=3")).toEqual({ a: ["1", "3"], b: "2" });
  });
  it("gives an empty string for a key without a value", () => {
    expect(parseQuery("?flag")).toEqual({ flag: "" });
  });
  it("decodes plus signs as spaces and percent escapes", () => {
    expect(parseQuery("q=hello+world%21")).toEqual({ q: "hello world!" });
  });
});
`;

// ── Practice 2: LRU cache (vanilla-ts) ─────────────────────────────────────

const LRU_STARTER = String.raw`export interface LruCache<K, V> {
  readonly size: number;
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
}

// TODO: a cache that holds at most "capacity" entries and evicts the least recently used one.
// get and set make an entry the most recent; has does not.
export function createLru<K, V>(capacity: number): LruCache<K, V> {
  return {
    size: 0,
    get() {
      return undefined;
    },
    set() {},
    has() {
      return false;
    },
  };
}
`;

const LRU_SOLUTION = String.raw`export interface LruCache<K, V> {
  readonly size: number;
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
}

export function createLru<K, V>(capacity: number): LruCache<K, V> {
  if (!(capacity >= 1)) throw new RangeError("capacity must be at least 1");

  // A Map keeps insertion order, so the first key is always the least recently used.
  const map = new Map<K, V>();

  return {
    get size() {
      return map.size;
    },
    has(key) {
      return map.has(key);
    },
    get(key) {
      if (!map.has(key)) return undefined;
      const value = map.get(key) as V;
      map.delete(key);
      map.set(key, value);
      return value;
    },
    set(key, value) {
      if (map.has(key)) map.delete(key);
      map.set(key, value);
      if (map.size > capacity) {
        const oldest = map.keys().next().value as K;
        map.delete(oldest);
      }
    },
  };
}
`;

const LRU_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { createLru } from "../src/lru";

describe("createLru", () => {
  it("evicts the least recently used entry when full", () => {
    const c = createLru(2);
    c.set("a", 1);
    c.set("b", 2);
    expect(c.get("a")).toBe(1);
    c.set("c", 3);
    expect(c.has("b")).toBe(false);
    expect(c.has("a")).toBe(true);
    expect(c.has("c")).toBe(true);
    expect(c.size).toBe(2);
  });
  it("updates an existing key without growing", () => {
    const c = createLru(2);
    c.set("a", 1);
    c.set("a", 2);
    expect(c.size).toBe(1);
    expect(c.get("a")).toBe(2);
  });
  it("does not refresh recency on has", () => {
    const c = createLru(2);
    c.set("a", 1);
    c.set("b", 2);
    c.has("a");
    c.set("c", 3);
    expect(c.has("a")).toBe(false);
  });
  it("returns undefined for a missing key", () => {
    expect(createLru(1).get("nope")).toBe(undefined);
  });
  it("rejects a capacity below 1", () => {
    expect(() => createLru(0)).toThrow();
  });
});
`;

// ── Practice 3: concurrency limiter (vanilla-ts, async) ────────────────────

const LIMIT_STARTER = String.raw`// TODO: run worker(item, index) for every item, with at most "limit" running at the same time.
// Return the results in input order. If a worker rejects, the returned promise rejects.
export async function mapLimit<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  return [];
}
`;

const LIMIT_SOLUTION = String.raw`export async function mapLimit<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  if (!(limit >= 1)) throw new RangeError("limit must be at least 1");

  const results: R[] = new Array(items.length);
  let next = 0;

  // Each lane takes the next unclaimed index until none are left.
  const runLane = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  };

  const lanes = Array.from({ length: Math.min(limit, items.length) }, () => runLane());
  await Promise.all(lanes);
  return results;
}
`;

const LIMIT_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { mapLimit } from "../src/limit";

describe("mapLimit", () => {
  it("returns results in input order", async () => {
    const out = await mapLimit([1, 2, 3], 2, async (x) => x * 10);
    expect(out).toEqual([10, 20, 30]);
  });
  it("never runs more workers than the limit at once", async () => {
    let active = 0;
    let peak = 0;
    await mapLimit([1, 2, 3, 4, 5], 2, async (x) => {
      active++;
      peak = Math.max(peak, active);
      await Promise.resolve();
      await Promise.resolve();
      active--;
      return x;
    });
    expect(peak).toBe(2);
  });
  it("rejects when a worker fails", async () => {
    let failed = false;
    try {
      await mapLimit([1, 2, 3], 2, async (x) => {
        if (x === 2) throw new Error("boom");
        return x;
      });
    } catch (e) {
      failed = true;
    }
    expect(failed).toBe(true);
  });
  it("returns an empty array for no items", async () => {
    expect(await mapLimit([], 3, async (x) => x)).toEqual([]);
  });
});
`;

export default defineTasks([
  practice({
    slug: "parse-query-string",
    skills: ["javascript", w("http-rest", 0.3), w("regex", 0.2)],
    complexity: 2,
    estSeconds: 780,
    framework: "vanilla-ts",
    title: ["Parse a query string", "Розібрати рядок запиту"],
    prompt: [
      lines(
        "Write `parseQuery(search)` in `src/query.ts`. It turns a query string such as `?a=1&b=2&a=3` into an object:",
        "",
        "- A leading `?` is optional. An empty query gives `{}`.",
        "- A key without `=` gets the empty string as its value.",
        "- A repeated key becomes an array of its values, in order.",
        "- A `+` means a space, and percent escapes are decoded.",
      ),
      lines(
        "Напишіть `parseQuery(search)` у `src/query.ts`. Вона перетворює рядок запиту на кшталт `?a=1&b=2&a=3` на об'єкт:",
        "",
        "- Початковий `?` необов'язковий. Порожній запит дає `{}`.",
        "- Ключ без `=` отримує порожній рядок як значення.",
        "- Повторюваний ключ стає масивом своїх значень у порядку появи.",
        "- Знак `+` означає пробіл, а відсоткові escape-послідовності декодуються.",
      ),
    ],
    files: { "/src/query.ts": QUERY_STARTER },
    activeFile: "/src/query.ts",
    tests: QUERY_TESTS,
    solution: { "/src/query.ts": QUERY_SOLUTION },
    explanation: [
      "Parse in three passes: strip the optional `?`, split on `&`, then split each part on the first `=` only, since values may contain `=`. Decode the `+` to a space before `decodeURIComponent`, otherwise a literal plus would be lost. Keys that repeat turn into arrays, which is how multi-select filters are usually sent.",
      "Розбирайте у три проходи: зніміть необов'язковий `?`, розділіть за `&`, потім кожну частину ділите лише за першим `=`, бо значення можуть містити `=`. Перетворіть `+` на пробіл до `decodeURIComponent`, інакше знак плюс зникне. Ключі, що повторюються, стають масивами, так зазвичай передають мульти-вибір у фільтрах.",
    ],
  }),

  practice({
    slug: "lru-cache",
    skills: ["data-structures", w("javascript", 0.4), w("web-performance", 0.2)],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["LRU cache with a capacity", "LRU-кеш з обмеженням розміру"],
    prompt: [
      lines(
        "Implement `createLru<K, V>(capacity)` in `src/lru.ts`. It holds at most `capacity` entries:",
        "",
        "- `get(key)` returns the value or `undefined`, and makes the entry the most recently used.",
        "- `set(key, value)` updates an existing key or adds a new one, and makes it the most recently used. When a new key pushes the size over `capacity`, evict the least recently used entry.",
        "- `has(key)` reports presence and does not change recency. `size` is the number of entries.",
        "- A capacity below 1 throws a `RangeError`.",
      ),
      lines(
        "Реалізуйте `createLru<K, V>(capacity)` у `src/lru.ts`. Вона тримає не більше `capacity` записів:",
        "",
        "- `get(key)` повертає значення або `undefined` і робить запис найсвіжішим.",
        "- `set(key, value)` оновлює наявний ключ або додає новий і робить його найсвіжішим. Коли новий ключ перевищує `capacity`, видаліть найдавніше використаний запис.",
        "- `has(key)` перевіряє наявність і не змінює порядок. `size` це кількість записів.",
        "- Ємність менше 1 викидає `RangeError`.",
      ),
    ],
    files: { "/src/lru.ts": LRU_STARTER },
    activeFile: "/src/lru.ts",
    tests: LRU_TESTS,
    solution: { "/src/lru.ts": LRU_SOLUTION },
    explanation: [
      "A `Map` remembers insertion order, so moving an entry to the end on each use keeps the least recently used key at the front. Eviction is then one line: take the first key. `has` must not reorder, or a simple presence check would quietly change which entry gets evicted next.",
      "`Map` пам'ятає порядок вставки, тож переміщення запису в кінець при кожному використанні тримає найдавніше використаний ключ на початку. Витіснення тоді це один рядок: взяти перший ключ. `has` не повинен змінювати порядок, інакше звичайна перевірка наявності тихо змінила б, який запис видалиться далі.",
    ],
  }),

  practice({
    slug: "map-limit-concurrency",
    skills: ["async-javascript", w("promise-internals", 0.4), w("web-performance", 0.3)],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Run async work with a concurrency limit", "Асинхронна робота з обмеженням паралелізму"],
    prompt: [
      lines(
        "Implement `mapLimit(items, limit, worker)` in `src/limit.ts`:",
        "",
        "- Call `worker(item, index)` for every item, with at most `limit` calls running at the same time.",
        "- Return the results in input order, not in completion order.",
        "- If a worker rejects, the returned promise rejects. A `limit` below 1 also rejects.",
      ),
      lines(
        "Реалізуйте `mapLimit(items, limit, worker)` у `src/limit.ts`:",
        "",
        "- Викликайте `worker(item, index)` для кожного елемента, щоб одночасно працювало не більше `limit` викликів.",
        "- Поверніть результати у порядку вхідних даних, а не в порядку завершення.",
        "- Якщо worker відхиляється, повернений проміс також відхиляється. `limit` менше 1 теж дає відхилення.",
      ),
    ],
    files: { "/src/limit.ts": LIMIT_STARTER },
    activeFile: "/src/limit.ts",
    tests: LIMIT_TESTS,
    solution: { "/src/limit.ts": LIMIT_SOLUTION },
    explanation: [
      "Instead of starting everything at once, start a fixed number of lanes that each pull the next index from a shared counter. Writing results by index keeps the output ordered no matter which worker finishes first. `Promise.all` rejects on the first failure, but it does not cancel the other lanes, so real code would also stop claiming new work after an error.",
      "Замість запуску всього одразу, запускайте фіксовану кількість «доріжок», які кожна бере наступний індекс зі спільного лічильника. Запис результатів за індексом зберігає порядок, незалежно від того, який worker завершиться першим. `Promise.all` відхиляється при першій помилці, але не скасовує інші доріжки, тож у реальному коді після помилки також варто перестати брати нову роботу.",
    ],
  }),

  quiz(
    "http-no-store-vs-no-cache",
    ["http-rest", w("web-performance", 0.3)],
    2,
    90,
    ["Which Cache-Control value stores nothing", "Яке значення Cache-Control нічого не зберігає"],
    ["Which `Cache-Control` directive forbids the browser from storing a response at all, for example for sensitive account data?", "Який директив `Cache-Control` забороняє браузеру взагалі зберігати відповідь, наприклад для чутливих даних облікового запису?"],
    [
      ["`no-cache`", "`no-cache`"],
      ["`no-store`", "`no-store`"],
      ["`max-age=0`", "`max-age=0`"],
      ["`must-revalidate`", "`must-revalidate`"],
    ],
    "b",
    [
      "`no-cache` lets the browser store the response but requires revalidation before every reuse. `max-age=0` makes it stale immediately, which still leaves a stored copy. `no-store` is the only one that tells caches not to keep the response, which matters for private data.",
      "`no-cache` дозволяє браузеру зберігати відповідь, але вимагає перевірки перед кожним повторним використанням. `max-age=0` одразу робить її застарілою, але копія все одно лишається. `no-store` єдине, що вказує кешам не зберігати відповідь, це важливо для приватних даних.",
    ],
  ),

  quiz(
    "http-etag-not-modified",
    ["http-rest"],
    2,
    90,
    ["Revalidating a cached resource", "Перевірка закешованого ресурсу"],
    ["A client sends `If-None-Match` with the ETag it cached, and the resource has not changed. What should the server return?", "Клієнт надсилає `If-None-Match` з ETag, який він закешував, і ресурс не змінився. Що має повернути сервер?"],
    [
      ["200 with the full body again", "200 з повним тілом знову"],
      ["304 Not Modified with no body", "304 Not Modified без тіла"],
      ["404 Not Found", "404 Not Found"],
      ["412 Precondition Failed", "412 Precondition Failed"],
    ],
    "b",
    [
      "The ETag identifies a version. When it matches, the server answers 304 with no body, and the client reuses its cached copy. This saves bandwidth without changing the response the page sees.",
      "ETag визначає версію. Коли вона збігається, сервер відповідає 304 без тіла, а клієнт використовує свою копію з кешу. Це економить трафік і не змінює відповідь, яку бачить сторінка.",
    ],
  ),

  quiz(
    "react-controlled-input-pattern",
    ["react"],
    1,
    60,
    ["Making an input controlled", "Зробити поле керованим"],
    ["Which pattern makes a text input controlled by React?", "Який патерн робить текстове поле керованим React?"],
    [
      ["Read its value through a ref only when the form is submitted", "Читати його значення через ref лише при відправці форми"],
      ["Set `defaultValue` once and never update it", "Задати `defaultValue` один раз і ніколи не оновлювати"],
      ["Bind `value` to state and update that state in `onChange`", "Прив'язати `value` до стану й оновлювати цей стан в `onChange`"],
      ["Change the input's `key` on every keystroke", "Змінювати `key` поля при кожному натисканні клавіші"],
    ],
    "c",
    [
      "A controlled input's value comes from React state, and every change flows through `onChange` back into that state. The first and second options are uncontrolled: React does not own the value. Changing `key` remounts the input and is a separate, rarely right, tool.",
      "Значення керованого поля береться зі стану React, і кожна зміна проходить через `onChange` назад у цей стан. Перші два варіанти некеровані: React не контролює значення. Зміна `key` перемонтовує поле і є окремим, рідко правильним інструментом.",
    ],
  ),

  quiz(
    "react-lazy-suspense-fallback",
    ["react"],
    2,
    90,
    ["What shows while a lazy component loads", "Що показується, поки завантажується lazy-компонент"],
    ["A component is loaded with `React.lazy`. What must wrap it so a placeholder shows while its code loads?", "Компонент завантажується через `React.lazy`. Що має його обгорнути, щоб поки завантажується код, показувався заповнювач?"],
    [
      ["An error boundary only", "Лише error boundary"],
      ["A `Suspense` boundary with a `fallback`", "Межа `Suspense` з `fallback`"],
      ["`StrictMode`", "`StrictMode`"],
      ["A portal", "Портал"],
    ],
    "b",
    [
      "`React.lazy` suspends rendering until the module arrives, and the nearest `Suspense` boundary shows its fallback meanwhile. An error boundary catches failures such as a failed chunk download, but it does not show loading UI.",
      "`React.lazy` призупиняє рендер, доки не прийде модуль, а найближча межа `Suspense` тим часом показує свій fallback. Error boundary ловить помилки, наприклад невдале завантаження частини коду, але не показує інтерфейс завантаження.",
    ],
  ),

  quiz(
    "ts-as-const-literal-tuple",
    ["typescript"],
    2,
    90,
    ["What as const changes", "Що змінює as const"],
    ["What does `const roles = [\"admin\", \"user\"] as const` change at compile time?", "Що змінює `const roles = [\"admin\", \"user\"] as const` на етапі компіляції?"],
    [
      ["It freezes the array at runtime so it cannot be pushed to", "Він заморожує масив у часі виконання, тож до нього не можна додати елемент"],
      ["It infers a readonly tuple of literal types, so `(typeof roles)[number]` is `\"admin\" | \"user\"`", "Він виводить readonly-кортеж з літеральних типів, тож `(typeof roles)[number]` це `\"admin\" | \"user\"`"],
      ["It converts the array into a `Set`", "Він перетворює масив на `Set`"],
      ["It makes the values `string` instead of literals", "Він робить значення типу `string` замість літералів"],
    ],
    "b",
    [
      "`as const` is a compile-time instruction: the types become literal and readonly, and the value is not frozen at runtime. A common pattern is deriving a union type from the array. The other options describe runtime changes or the opposite of what happens.",
      "`as const` це інструкція часу компіляції: типи стають літеральними й readonly, а значення не заморожується в час виконання. Типовий приклад це вивести з масиву union-тип. Інші варіанти описують зміни часу виконання або протилежне до того, що відбувається.",
    ],
  ),

  quiz(
    "ts-indexed-access-union",
    ["typescript"],
    2,
    90,
    ["Indexed access with a union of keys", "Індексований доступ з union ключів"],
    ["Given `type User = { id: number; name: string }`, what is `User[\"id\" | \"name\"]`?", "Дано `type User = { id: number; name: string }`. Чим є `User[\"id\" | \"name\"]`?"],
    [
      ["`never`", "`never`"],
      ["`number | string`", "`number | string`"],
      ["`\"id\" | \"name\"`", "`\"id\" | \"name\"`"],
      ["`unknown`", "`unknown`"],
    ],
    "b",
    [
      "An indexed access type with a union of keys returns the union of the property types. Here that is `number` from `id` and `string` from `name`. The key union is what you get from `keyof`, not the result of indexing.",
      "Індексований тип доступу з union ключів повертає union типів властивостей. Тут це `number` з `id` і `string` з `name`. Union ключів отримують через `keyof`, а не через індексування.",
    ],
  ),

  quiz(
    "css-custom-property-override",
    ["css"],
    2,
    90,
    ["Overriding a custom property on a child", "Перевизначення custom property на дочірньому елементі"],
    ["`--brand` is set on `:root` and overridden on `.card`. A rule on `.card` uses `color: var(--brand)`. Which value applies to the card?", "`--brand` задано в `:root` і перевизначено в `.card`. Правило для `.card` використовує `color: var(--brand)`. Яке значення застосовується до картки?"],
    [
      ["Always the value on `:root`", "Завжди значення з `:root`"],
      ["The value overridden on `.card`, because custom properties inherit and resolve where `var()` is used", "Значення, перевизначене на `.card`, бо custom properties наслідуються і обчислюються там, де використано `var()`"],
      ["Always the initial value", "Завжди початкове значення"],
      ["Nothing; the declaration is invalid", "Нічого; декларація недійсна"],
    ],
    "b",
    [
      "Custom properties are inherited like other values, and `var()` is resolved on the element where it appears. A child can override the variable for its subtree, which is how theming works without rewriting every rule.",
      "Custom properties наслідуються, як і інші значення, а `var()` обчислюється на елементі, де вона з'являється. Дочірній елемент може перевизначити змінну для свого піддерева, так працює теми без переписування кожного правила.",
    ],
  ),

  quiz(
    "css-sticky-not-sticking",
    ["css"],
    2,
    90,
    ["Why a sticky header does not stick", "Чому липкий заголовок не прилипає"],
    ["A `position: sticky` header does not stick while scrolling. Which is a common cause?", "Заголовок з `position: sticky` не прилипає під час прокрутки. Яка поширена причина?"],
    [
      ["Sticky elements only work on images", "Липкі елементи працюють лише із зображеннями"],
      ["No inset such as `top` is set, or an ancestor with `overflow` stops the element from sticking to the scrolling area", "Не задано inset на кшталт `top`, або предок з `overflow` не дає елементу прилипати до області прокрутки"],
      ["Sticky ignores `z-index` and is always behind content", "Sticky ігнорує `z-index` і завжди лежить під вмістом"],
      ["Sticky needs JavaScript to be enabled", "Sticky потребує увімкненого JavaScript"],
    ],
    "b",
    [
      "A sticky element needs a threshold such as `top: 0` to know when to stick. It also sticks only within its parent, so a parent that is not tall enough gives it no room. An ancestor with `overflow` other than `visible` becomes the scrolling box, which can prevent sticking to the page.",
      "Липкий елемент потребує порогу, наприклад `top: 0`, щоб знати, коли прилипати. Він прилипає лише в межах батька, тож занадто низький батько не дає місця. Предок із `overflow`, відмінним від `visible`, стає скролюваною рамкою, і це може завадити прилипанню до сторінки.",
    ],
  ),

  quiz(
    "a11y-live-region-toast",
    ["web-accessibility"],
    2,
    90,
    ["Announcing a toast without moving focus", "Оголошення сповіщення без переміщення фокуса"],
    ["After saving, a toast says \"Saved\". Screen reader users should hear it without moving focus. What helps?", "Після збереження спливає повідомлення «Saved». Користувачі екранних читачів мають почути його без переміщення фокуса. Що допоможе?"],
    [
      ["Changing only the background color of the toast", "Зміна лише кольору фону сповіщення"],
      ["Placing the message in a live region, such as `role=\"status\"` or `aria-live=\"polite\"`", "Розміщення повідомлення в live-регіоні, наприклад `role=\"status\"` або `aria-live=\"polite\"`"],
      ["A tooltip that appears on hover", "Підказка, що з'являється при наведенні"],
      ["Removing the toast from the DOM after 1 ms", "Видалення сповіщення з DOM за 1 мс"],
    ],
    "b",
    [
      "A live region tells assistive technology to announce changes to its content. `polite` waits for a pause, `assertive` interrupts. A visual-only change like color or a hover tooltip is invisible to screen readers.",
      "Live-регіон повідомляє допоміжним технологіям, щоб вони оголошували зміни його вмісту. `polite` чекає паузи, `assertive` перериває. Лише візуальна зміна, як колір або підказка при наведенні, невидима для екранних читачів.",
    ],
  ),

  quiz(
    "git-reset-soft-keep-staged",
    ["git"],
    2,
    90,
    ["Undo a commit but keep its changes staged", "Скасувати коміт, але зберегти зміни в індексі"],
    ["You want to undo the last commit but keep its changes staged. Which command does that?", "Ви хочете скасувати останній коміт, але зберегти його зміни в індексі. Яка команда це робить?"],
    [
      ["`git reset --hard HEAD~1`", "`git reset --hard HEAD~1`"],
      ["`git reset --soft HEAD~1`", "`git reset --soft HEAD~1`"],
      ["`git checkout -- .`", "`git checkout -- .`"],
      ["`git revert HEAD` with no other changes", "`git revert HEAD` без інших змін"],
    ],
    "b",
    [
      "`--soft` moves the branch back one commit and leaves the index and working tree alone, so the changes remain staged. `--hard` discards them. `git checkout -- .` throws away unstaged edits. `git revert` creates a new commit that undoes the old one, which keeps history but does not un-commit.",
      "`--soft` переміщує гілку на один коміт назад і не чіпає індекс та робоче дерево, тож зміни лишаються в індексі. `--hard` їх відкидає. `git checkout -- .` викидає незастейджені правки. `git revert` створює новий коміт, що скасовує старий: історія зберігається, але коміт не знімається.",
    ],
  ),

  quiz(
    "js-weakmap-garbage-collection",
    ["js-collections"],
    2,
    90,
    ["Storing data per DOM element", "Зберігання даних для кожного DOM-елемента"],
    ["Why use a `WeakMap` keyed by DOM elements to store extra data about them?", "Навіщо використовувати `WeakMap` з ключами-DOM-елементами для зберігання додаткових даних про них?"],
    [
      ["It is faster for string keys", "Він швидший для рядкових ключів"],
      ["Its keys are held weakly, so once an element is removed and unreferenced, its entry can be garbage collected", "Його ключі утримуються слабко, тож коли елемент видалено і на нього ніхто не посилається, його запис можна прибрати збирачем сміття"],
      ["It persists the data across page reloads", "Він зберігає дані між перезавантаженнями сторінки"],
      ["It keeps keys sorted", "Він тримає ключі відсортованими"],
    ],
    "b",
    [
      "A normal `Map` holds its keys strongly, so a removed element would stay in memory as long as the map exists. A `WeakMap` does not prevent collection of its keys, which makes it a good fit for metadata attached to objects you do not own the lifetime of. It is not iterable, and it does not persist anything.",
      "Звичайний `Map` тримає ключі сильно, тож видалений елемент лишався б у пам'яті, поки існує мапа. `WeakMap` не заважає збирати свої ключі, тому він підходить для метаданих, прикріплених до об'єктів, життя яких ви не контролюєте. Його не можна ітерувати, і він нічого не зберігає між сесіями.",
    ],
  ),
]);
