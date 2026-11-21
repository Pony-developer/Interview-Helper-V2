import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const STRATEGIES_STARTER = code`export type Req = { url: string };
export type Res = { url: string; body: string; ok: boolean; source?: "cache" | "network" };
export type Fetcher = (req: Req) => Promise<Res>;

/** The part of the Cache API a strategy needs (a Map-backed fake works just as well in tests). */
export interface CacheLike {
  match(req: Req): Promise<Res | undefined>;
  put(req: Req, res: Res): Promise<void>;
}

/** Serves from the cache when it can; goes to the network only on a miss. */
export async function cacheFirst(req: Req, cache: CacheLike, fetcher: Fetcher): Promise<Res> {
  // TODO: check the cache first, and store successful network responses
  return fetcher(req);
}

/** Tries the network first; falls back to the cache when the network fails or returns an error status. */
export async function networkFirst(req: Req, cache: CacheLike, fetcher: Fetcher): Promise<Res> {
  // TODO
  return fetcher(req);
}

/** Answers from the cache at once when it can, and refreshes the cache in the background. */
export async function staleWhileRevalidate(req: Req, cache: CacheLike, fetcher: Fetcher): Promise<Res> {
  // TODO: the first visit must wait for the network; a failed refresh must not break a cached answer
  return fetcher(req);
}
`;

const STRATEGIES_SOLUTION = code`export type Req = { url: string };
export type Res = { url: string; body: string; ok: boolean; source?: "cache" | "network" };
export type Fetcher = (req: Req) => Promise<Res>;

export interface CacheLike {
  match(req: Req): Promise<Res | undefined>;
  put(req: Req, res: Res): Promise<void>;
}

/** Only successful responses are cached: caching an error would serve it again later. */
export async function cacheFirst(req: Req, cache: CacheLike, fetcher: Fetcher): Promise<Res> {
  const hit = await cache.match(req);
  if (hit) return { ...hit, source: "cache" };
  const res = await fetcher(req);
  if (res.ok) await cache.put(req, res);
  return { ...res, source: "network" };
}

export async function networkFirst(req: Req, cache: CacheLike, fetcher: Fetcher): Promise<Res> {
  let res: Res;
  try {
    res = await fetcher(req);
  } catch (error) {
    const hit = await cache.match(req);
    if (hit) return { ...hit, source: "cache" };
    throw error; // offline and nothing stored: the caller has to handle it
  }
  if (!res.ok) {
    const hit = await cache.match(req);
    if (hit) return { ...hit, source: "cache" };
    return { ...res, source: "network" };
  }
  await cache.put(req, res);
  return { ...res, source: "network" };
}

export async function staleWhileRevalidate(req: Req, cache: CacheLike, fetcher: Fetcher): Promise<Res> {
  const hit = await cache.match(req);
  // Start the refresh either way; it updates the cache when it succeeds.
  const refresh = fetcher(req).then(async (res) => {
    if (res.ok) await cache.put(req, res);
    return res;
  });
  if (hit) {
    refresh.catch(() => {}); // the user already has an answer; a failed refresh is not their problem
    return { ...hit, source: "cache" };
  }
  const res = await refresh; // nothing cached yet: wait for the network
  return { ...res, source: "network" };
}
`;

const STRATEGIES_INDEX = code`import "./styles.css";
import { networkFirst } from "./src/strategies";

document.getElementById("app")!.innerHTML = '<h1>Offline news</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent =
  "networkFirst is a function: " + typeof networkFirst + "\nUse the strategies in src/strategies.ts and check them with the tests.";
`;

const STRATEGIES_TESTS = code`import { describe, it, expect } from "./test-kit";
import { cacheFirst, networkFirst, staleWhileRevalidate } from "../src/strategies";

const req = { url: "/news" };
const ok = (body) => ({ url: "/news", body, ok: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function memoryCache(initial) {
  const store = new Map();
  if (initial) store.set("/news", initial);
  return {
    store,
    match: async (r) => store.get(r.url),
    put: async (r, res) => {
      store.set(r.url, res);
    },
  };
}

// Replies in order (the last reply repeats). An Error reply makes the request fail.
function server(...replies) {
  const calls = [];
  let i = 0;
  const fetcher = async (r) => {
    calls.push(r.url);
    const reply = replies[Math.min(i++, replies.length - 1)];
    if (reply instanceof Error) throw reply;
    return reply;
  };
  return { fetcher, calls };
}

describe("cacheFirst", () => {
  it("goes to the network once, then serves from the cache", async () => {
    const cache = memoryCache();
    const s = server(ok("v1"), ok("v2"));
    expect(await cacheFirst(req, cache, s.fetcher)).toEqual({ url: "/news", body: "v1", ok: true, source: "network" });
    const second = await cacheFirst(req, cache, s.fetcher);
    expect(second.body).toBe("v1");
    expect(second.source).toBe("cache");
    expect(s.calls.length).toBe(1);
  });
  it("doesn't store error responses", async () => {
    const cache = memoryCache();
    const bad = { url: "/news", body: "oops", ok: false };
    const s = server(bad, ok("fresh"));
    await cacheFirst(req, cache, s.fetcher);
    expect(cache.store.size).toBe(0);
    const again = await cacheFirst(req, cache, s.fetcher);
    expect(again.body).toBe("fresh");
    expect(s.calls.length).toBe(2);
  });
});

describe("networkFirst", () => {
  it("prefers the network and refreshes the cache", async () => {
    const cache = memoryCache(ok("v0"));
    const res = await networkFirst(req, cache, server(ok("v1")).fetcher);
    expect(res.body).toBe("v1");
    expect(res.source).toBe("network");
    expect(cache.store.get("/news").body).toBe("v1");
  });
  it("falls back to the cache when offline", async () => {
    const res = await networkFirst(req, memoryCache(ok("v0")), server(new TypeError("offline")).fetcher);
    expect(res.body).toBe("v0");
    expect(res.source).toBe("cache");
  });
  it("falls back to the cache for error statuses too", async () => {
    const res = await networkFirst(req, memoryCache(ok("v0")), server({ url: "/news", body: "500", ok: false }).fetcher);
    expect(res.body).toBe("v0");
    expect(res.source).toBe("cache");
  });
  it("rethrows when offline and nothing is cached", async () => {
    await expect(networkFirst(req, memoryCache(), server(new TypeError("offline")).fetcher)).rejects.toThrow("offline");
  });
});

describe("staleWhileRevalidate", () => {
  it("answers from the cache immediately and updates it in the background", async () => {
    const cache = memoryCache(ok("v0"));
    const slowFetch = () => sleep(50).then(() => ok("v1"));
    const started = Date.now();
    const res = await staleWhileRevalidate(req, cache, slowFetch);
    expect(res.body).toBe("v0");
    expect(res.source).toBe("cache");
    expect(Date.now() - started).toBeLessThan(40);
    await sleep(120);
    expect(cache.store.get("/news").body).toBe("v1");
  });
  it("waits for the network on the first visit", async () => {
    const cache = memoryCache();
    const res = await staleWhileRevalidate(req, cache, server(ok("v1")).fetcher);
    expect(res.body).toBe("v1");
    expect(res.source).toBe("network");
    expect(cache.store.get("/news").body).toBe("v1");
  });
  it("a failed refresh doesn't break the cached answer", async () => {
    const cache = memoryCache(ok("v0"));
    const res = await staleWhileRevalidate(req, cache, () => Promise.reject(new TypeError("offline")));
    expect(res.body).toBe("v0");
    await sleep(10);
    expect(cache.store.get("/news").body).toBe("v0");
  });
});
`;

const VITE_STARTER = code`export type Env = Record<string, string | undefined>;

export const PREFIX = "VITE_";

/**
 * The variables client code may see: names with the prefix, that have a value, and that don't look
 * like secrets. A name that looks like a secret throws, so a broken build fails instead of leaking.
 */
export function publicEnv(env: Env, prefix = PREFIX): Record<string, string> {
  // TODO
  return {};
}

/** Build-time replacements for the client bundle, JSON-encoded (quotes and backslashes are escaped). */
export function defineEnv(env: Env, prefix = PREFIX): Record<string, string> {
  // TODO: keys look like "import.meta.env.VITE_API_URL"
  return {};
}
`;

const VITE_SOLUTION = code`export type Env = Record<string, string | undefined>;

export const PREFIX = "VITE_";

const SECRET_LIKE = /SECRET|PRIVATE|PASSWORD/i;

export function publicEnv(env: Env, prefix = PREFIX): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of Object.keys(env)) {
    const value = env[name];
    if (!name.startsWith(prefix) || value === undefined) continue;
    if (SECRET_LIKE.test(name)) {
      throw new Error("Refusing to expose " + name + " to the browser: its name looks like a secret");
    }
    out[name] = value;
  }
  return out;
}

export function defineEnv(env: Env, prefix = PREFIX): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(publicEnv(env, prefix))) {
    out["import.meta.env." + name] = JSON.stringify(value);
  }
  return out;
}
`;

const VITE_INDEX = code`import "./styles.css";
import { publicEnv } from "./src/env";

const env = publicEnv({ VITE_API_URL: "https://api.example.com", DATABASE_URL: "postgres://local" });
document.getElementById("app")!.innerHTML = '<h1>Public env</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = JSON.stringify(env, null, 2);
`;

const VITE_TESTS = code`import { describe, it, expect } from "./test-kit";
import { defineEnv, publicEnv } from "../src/env";

describe("publicEnv", () => {
  it("keeps only prefixed variables that have a value", () => {
    const env = { VITE_API_URL: "https://api.example.com", VITE_FLAG: "", VITE_MISSING: undefined, DATABASE_URL: "postgres://x" };
    expect(publicEnv(env)).toEqual({ VITE_API_URL: "https://api.example.com", VITE_FLAG: "" });
  });
  it("accepts a custom prefix", () => {
    expect(publicEnv({ APP_NAME: "Assay", VITE_X: "1" }, "APP_")).toEqual({ APP_NAME: "Assay" });
  });
  it("throws, naming the variable, for secret-looking names", () => {
    expect(() => publicEnv({ VITE_DB_PASSWORD: "hunter2" })).toThrow("VITE_DB_PASSWORD");
    expect(() => publicEnv({ VITE_PRIVATE_KEY: "x" })).toThrow(Error);
  });
  it("doesn't change the input", () => {
    const env = { VITE_A: "1" };
    publicEnv(env);
    expect(env).toEqual({ VITE_A: "1" });
  });
});

describe("defineEnv", () => {
  it("builds import.meta.env replacements", () => {
    expect(defineEnv({ VITE_API_URL: "https://api.example.com" })).toEqual({
      "import.meta.env.VITE_API_URL": JSON.stringify("https://api.example.com"),
    });
  });
  it("encodes values so they're safe inside code", () => {
    const value = 'say "hi" \\ bye';
    expect(defineEnv({ VITE_LABEL: value })["import.meta.env.VITE_LABEL"]).toBe(JSON.stringify(value));
  });
  it("replacements never include unprefixed variables", () => {
    expect(Object.keys(defineEnv({ DATABASE_URL: "postgres://x" }))).toEqual([]);
  });
});
`;

const RXJS_STARTER = code`import { Observable } from "rxjs";

export type BackoffOptions = { retries: number; delayMs: number; factor?: number };

/**
 * Subscribes to source() and, on error, subscribes again up to retries times. The first retry waits
 * delayMs, and each following wait is multiplied by factor (default 2).
 */
export function retryWithBackoff<T>(source: () => Observable<T>, { retries, delayMs, factor = 2 }: BackoffOptions): Observable<T> {
  // TODO: no limit and no delay yet
  return source();
}
`;

const RXJS_SOLUTION = code`import { defer, Observable, retry, timer } from "rxjs";

export type BackoffOptions = { retries: number; delayMs: number; factor?: number };

export function retryWithBackoff<T>(source: () => Observable<T>, { retries, delayMs, factor = 2 }: BackoffOptions): Observable<T> {
  return defer(source).pipe(
    retry({
      count: retries,
      // retryCount is 1 for the first retry, so the first wait is delayMs and the next is delayMs * factor.
      delay: (_error, retryCount) => timer(delayMs * factor ** (retryCount - 1)),
    }),
  );
}
`;

const RXJS_INDEX = code`import "./styles.css";
import { retryWithBackoff } from "./src/retry";
import { defer, of, throwError } from "rxjs";

let calls = 0;
const source = () =>
  defer(() => {
    calls++;
    return calls < 3 ? throwError(() => new Error("attempt " + calls + " failed")) : of("ok after " + calls);
  });
document.getElementById("app")!.innerHTML = '<h1>Backoff</h1><pre id="out"></pre>';
retryWithBackoff(source, { retries: 3, delayMs: 5 }).subscribe({
  next: (v) => (document.getElementById("out")!.textContent = String(v)),
  error: (e) => (document.getElementById("out")!.textContent = "gave up: " + e.message),
});
`;

const RXJS_TESTS = code`import { describe, it, expect } from "./test-kit";
import { defer, lastValueFrom, of, throwError } from "rxjs";
import { retryWithBackoff } from "../src/retry";

// Fails the first "failures" subscriptions, then succeeds. Records when each attempt started.
function flaky(failures) {
  const attempts = [];
  const source = () =>
    defer(() => {
      attempts.push(Date.now());
      return attempts.length <= failures
        ? throwError(() => new Error("fail " + attempts.length))
        : of("ok " + attempts.length);
    });
  return { source, attempts };
}

describe("retryWithBackoff", () => {
  it("retries until the source succeeds", async () => {
    const f = flaky(2);
    expect(await lastValueFrom(retryWithBackoff(f.source, { retries: 3, delayMs: 2 }))).toBe("ok 3");
    expect(f.attempts.length).toBe(3);
  });
  it("gives up after the allowed retries, with the last error", async () => {
    const f = flaky(10);
    await expect(lastValueFrom(retryWithBackoff(f.source, { retries: 2, delayMs: 2 }))).rejects.toThrow("fail 3");
    expect(f.attempts.length).toBe(3);
  });
  it("waits longer before each retry", async () => {
    const f = flaky(2);
    await lastValueFrom(retryWithBackoff(f.source, { retries: 2, delayMs: 10 }));
    const [a, b, c] = f.attempts;
    expect(b - a).toBeGreaterThanOrEqual(9);
    expect(c - b).toBeGreaterThanOrEqual(18);
  });
  it("doesn't retry when the first attempt succeeds", async () => {
    const f = flaky(0);
    expect(await lastValueFrom(retryWithBackoff(f.source, { retries: 5, delayMs: 1 }))).toBe("ok 1");
    expect(f.attempts.length).toBe(1);
  });
  it("with zero retries, fails on the first error", async () => {
    const f = flaky(1);
    await expect(lastValueFrom(retryWithBackoff(f.source, { retries: 0, delayMs: 1 }))).rejects.toThrow("fail 1");
    expect(f.attempts.length).toBe(1);
  });
});
`;

export default defineTasks([
  quiz(
    "pwa-cache-strategy-choice",
    ["pwa", w("browser-apis", 0.3)],
    2,
    90,
    ["Choosing a caching strategy", "Вибір стратегії кешування"],
    [
      "A news page must show the latest headlines whenever the user is online, but still open with the last copy when offline. Which service worker strategy fits best?",
      "Сторінка новин має показувати найсвіжіші заголовки, коли користувач онлайн, але відкриватися з останньою копією, коли офлайн. Яка стратегія service worker найкраща?",
    ],
    [
      ["Cache first: the cache is always used when it has an entry", "Спершу кеш: кеш завжди використовується, коли в ньому є запис"],
      ["Network first, falling back to the cache", "Спершу мережа, із запасом на кеш"],
      ["Network only: never store anything", "Лише мережа: нічого не зберігати"],
      ["Cache only, filled once at install", "Лише кеш, заповнений один раз під час встановлення"],
    ],
    "b",
    [
      "Network first always tries for fresh content and keeps the last successful copy for offline use. Cache first would keep serving old headlines until the entry is replaced, and network-only breaks offline entirely.",
      "Спершу мережа завжди намагається отримати свіжий вміст і зберігає останню успішну копію для роботи офлайн. Спершу кеш віддавав би старі заголовки, доки запис не замінять, а лише мережа повністю ламає роботу офлайн.",
    ],
  ),
  quiz(
    "pwa-cache-only-successful",
    ["pwa"],
    2,
    75,
    ["Why check `response.ok` before caching", "Навіщо перевіряти `response.ok` перед кешуванням"],
    ["Why should a cache strategy store only successful responses?", "Чому стратегія кешування має зберігати лише успішні відповіді?"],
    [
      ["Because an error response stored in the cache would be served again later, even after the server recovers", "Бо відповідь з помилкою, збережена в кеші, віддаватиметься знову пізніше, навіть після відновлення сервера"],
      ["Because the Cache API refuses to store any response with a body", "Бо Cache API взагалі не зберігає відповіді з тілом"],
      ["Because error responses are always smaller and slow the cache down", "Бо відповіді з помилкою завжди менші й уповільнюють кеш"],
      ["Because browsers forbid caching POST requests only", "Бо браузери забороняють кешувати лише POST-запити"],
    ],
    "a",
    [
      "A cache hit short-circuits the network, so one cached 500 page would replace the real content on every later visit until the entry is removed. Checking the status before `put` keeps errors out of the cache.",
      "Попадання в кеш оминає мережу, тож одна збережена сторінка з помилкою 500 замінювала б справжній вміст при кожному наступному відвідуванні, доки запис не видалять. Перевірка статусу перед `put` не пускає помилки в кеш.",
    ],
  ),
  quiz(
    "vite-env-exposure",
    ["vite", w("es-modules", 0.3)],
    2,
    75,
    ["Which variables reach the browser", "Які змінні потрапляють у браузер"],
    ["By default, which environment variables can client code read through `import.meta.env` in a Vite project?", "Які змінні середовища код клієнта може прочитати через `import.meta.env` у проєкті Vite за замовчуванням?"],
    [
      ["Every variable in the shell environment", "Кожна змінна з оболонки"],
      ["Only those whose names start with VITE_", "Лише ті, чиї назви починаються з VITE_"],
      ["Only the ones listed in package.json", "Лише ті, що перелічені в package.json"],
      ["None: client code can never read environment variables", "Жодна: код клієнта ніколи не читає змінні середовища"],
    ],
    "b",
    [
      "Vite exposes only variables with the VITE_ prefix (configurable with envPrefix). Everything else stays in the build process, so server-side secrets without the prefix are not shipped.",
      "Vite відкриває лише змінні з префіксом VITE_ (це можна змінити через envPrefix). Усе інше лишається в процесі збирання, тож серверні секрети без префікса в бандл не потрапляють.",
    ],
  ),
  quiz(
    "vite-secrets-client",
    ["vite", w("auth", 0.3)],
    3,
    90,
    ["Why a VITE_ variable must not hold a secret", "Чому змінна VITE_ не повинна містити секрет"],
    ["A developer puts an API secret key into VITE_STRIPE_SECRET. Why is that a serious mistake?", "Розробник кладе API-секрет у VITE_STRIPE_SECRET. Чому це серйозна помилка?"],
    [
      ["The value is inlined into the built JavaScript, so anyone who loads the page can read it", "Значення вбудовується в зібраний JavaScript, тож будь-хто, хто завантажить сторінку, може його прочитати"],
      ["Vite refuses to start when a secret has the VITE_ prefix", "Vite не запускається, коли секрет має префікс VITE_"],
      ["Vite encrypts the value, but the key is in git", "Vite шифрує значення, але ключ лежить у git"],
      ["Only the development server is affected", "Постраждалий лише сервер розробки"],
    ],
    "a",
    [
      "Values with the prefix are replaced into the client bundle at build time, so they become public the moment the site is deployed. Secrets belong on a server or edge function, which calls the third-party API for the browser.",
      "Значення з префіксом підставляються в клієнтський бандл під час збирання, тож стають публічними щойно сайт розгорнуто. Секрети належать серверу чи edge-функції, яка звертається до сторонього API від імені браузера.",
    ],
  ),
  quiz(
    "rxjs-retry-cold",
    ["rxjs", w("async-javascript", 0.3)],
    3,
    90,
    ["What retry resubscribes to", "Що саме повторно підписує retry"],
    ["A cold observable wraps an HTTP request and is piped through `retry(2)`. What happens after an error?", "Холодний observable обгортає HTTP-запит і пропущений через `retry(2)`. Що станеться після помилки?"],
    [
      ["The source is subscribed again, so the request is sent again", "Джерело підписується знову, тож запит відправляється знову"],
      ["The last successful value is replayed to the subscriber", "Підписнику повторно відтворюється останнє успішне значення"],
      ["The error is swallowed and the subscription completes silently", "Помилка ковтається, а підписка мовчки завершується"],
      ["Only the error handler is called again", "Знову викликається лише обробник помилок"],
    ],
    "a",
    [
      "`retry` unsubscribes from the failed source and subscribes to it again, so the side effects (the HTTP request) run again. This is why retries need idempotent operations, and why a delay between attempts (`retry({ count, delay })`) is usually added.",
      "`retry` відписується від невдалого джерела і підписується знову, тож побічні ефекти (HTTP-запит) виконуються знову. Тому повтори потрібні для ідемпотентних операцій, і зазвичай між спробами додають затримку (`retry({ count, delay })`).",
    ],
  ),
  practice({
    slug: "pwa-cache-strategies",
    skills: ["pwa", w("browser-apis"), w("typescript")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Three service worker caching strategies", "Три стратегії кешування service worker"],
    prompt: [
      "Implement three caching strategies in `src/strategies.ts`, against a small cache interface (`match` and `put`) and a `fetcher`:\n\n- `cacheFirst`: return a cached response when there is one, marked `source: \"cache\"`. Otherwise fetch, store **successful** responses only, and return them with `source: \"network\"`.\n- `networkFirst`: try the network and store successful responses. If the request fails or returns an error status, return the cached copy when there is one; if there isn't one, rethrow a network failure.\n- `staleWhileRevalidate`: if there's a cached copy, return it immediately (`source: \"cache\"`) and refresh the cache in the background. With no cached copy, wait for the network. A failed background refresh must not break the cached answer.",
      "Реалізуйте три стратегії кешування в `src/strategies.ts` для невеликого інтерфейсу кешу (`match` і `put`) та `fetcher`:\n\n- `cacheFirst`: якщо є кешована відповідь, повертайте її з `source: \"cache\"`. Інакше отримайте з мережі, зберігайте лише **успішні** відповіді й повертайте їх з `source: \"network\"`.\n- `networkFirst`: спершу мережа, успішні відповіді зберігаються. Якщо запит не вдався або повернув статус помилки, повертайте кешовану копію, якщо вона є; якщо її немає, перекидайте помилку мережі.\n- `staleWhileRevalidate`: якщо є кешована копія, одразу повертайте її (`source: \"cache\"`) і оновлюйте кеш у фоні. Без кешованої копії чекайте мережі. Невдале фонове оновлення не повинно ламати відповідь з кешу.",
    ],
    files: {
      "/src/strategies.ts": STRATEGIES_STARTER,
      "/index.ts": STRATEGIES_INDEX,
    },
    visibleFiles: ["/src/strategies.ts"],
    activeFile: "/src/strategies.ts",
    tests: STRATEGIES_TESTS,
    solution: { "/src/strategies.ts": STRATEGIES_SOLUTION },
    explanation: [
      "Each strategy is a trade-off between freshness and speed. `cacheFirst` is fastest and works offline, but can serve stale content for as long as the entry lives, so it suits fingerprinted assets. `networkFirst` is freshest, and the cache is only a fallback, so it suits content that changes often. `staleWhileRevalidate` gives instant answers and eventual freshness, at the cost of showing one visit's old data. All three store only successful responses, because a cached error would be served again later. Notice how `staleWhileRevalidate` keeps the background refresh from becoming an unhandled rejection: once an answer exists, a failed refresh is not the user's problem.",
      "Кожна стратегія є компромісом між свіжістю і швидкістю. `cacheFirst` найшвидша й працює офлайн, але може віддавати застарілий вміст, доки живе запис, тож підходить для ресурсів з хешем у назві. `networkFirst` найсвіжіша, а кеш лише запасний варіант, тож підходить для вмісту, що часто змінюється. `staleWhileRevalidate` дає миттєві відповіді і зрештою свіжі дані, ціною показу старих даних при одному відвідуванні. Усі три зберігають лише успішні відповіді, бо кешована помилка віддавалася б знову пізніше. Зверніть увагу, як `staleWhileRevalidate` не дає фоновому оновленню стати необробленим відхиленням: коли відповідь уже є, невдале оновлення не проблема користувача.",
    ],
  }),
  practice({
    slug: "vite-public-env",
    skills: ["vite", w("typescript"), w("web-security", 0.3)],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Expose only safe environment variables", "Відкривайте лише безпечні змінні середовища"],
    prompt: [
      "Write the build-time helpers that decide what Vite may put into the client bundle, in `src/env.ts`:\n\n- `publicEnv(env, prefix = \"VITE_\")` returns only variables whose names start with the prefix and whose value is defined.\n- A variable whose name looks like a secret (contains `SECRET`, `PRIVATE` or `PASSWORD`, in any case) must **throw** an error that names the variable, so the build fails instead of leaking it.\n- `defineEnv(env, prefix)` returns Vite-style replacements: keys like `import.meta.env.VITE_API_URL`, with values encoded by `JSON.stringify`, so quotes and backslashes are safe inside code.\n- Never change the input object.",
      "Напишіть помічники збирання, які вирішують, що Vite може вставити в клієнтський бандл, у `src/env.ts`:\n\n- `publicEnv(env, prefix = \"VITE_\")` повертає лише змінні, чиї назви починаються з префікса і чиє значення визначене.\n- Змінна, назва якої схожа на секрет (містить `SECRET`, `PRIVATE` або `PASSWORD` у будь-якому регістрі), повинна **кидати** помилку з назвою змінної, щоб збирання падало, а не витікало значення.\n- `defineEnv(env, prefix)` повертає заміни у стилі Vite: ключі на кшталт `import.meta.env.VITE_API_URL`, а значення закодовані через `JSON.stringify`, тож лапки й зворотні скісні риски безпечні всередині коду.\n- Ніколи не змінюйте вхідний об'єкт.",
    ],
    files: {
      "/src/env.ts": VITE_STARTER,
      "/index.ts": VITE_INDEX,
    },
    visibleFiles: ["/src/env.ts"],
    activeFile: "/src/env.ts",
    tests: VITE_TESTS,
    solution: { "/src/env.ts": VITE_SOLUTION },
    explanation: [
      "Vite replaces `import.meta.env.VITE_*` references with literal values when it builds, which is why anything with the prefix is public: it ends up in a file anyone can download. The safe pattern is an explicit allowlist (the prefix) plus a guard for secret-looking names that **fails the build**, rather than quietly filtering. `JSON.stringify` makes the replacement a valid JavaScript string literal, so a value containing quotes or a closing script tag can't break out of the code. Secrets themselves belong in server-side environment variables, read by code that never reaches the browser.",
      "Vite під час збирання замінює посилання `import.meta.env.VITE_*` на буквальні значення, тому все з цим префіксом публічне: воно опиняється у файлі, який може завантажити будь-хто. Безпечний шаблон: явний список дозволених (префікс) плюс захист від назв, схожих на секрети, який **зупиняє збирання**, а не тихо фільтрує. `JSON.stringify` робить заміну коректним рядковим літералом JavaScript, тож значення з лапками чи закриваючим тегом script не може вирватися з коду. Самі секрети мають бути в серверних змінних середовища, які читає код, що ніколи не потрапляє в браузер.",
    ],
  }),
  practice({
    slug: "rxjs-retry-backoff",
    skills: ["rxjs", w("async-javascript"), w("error-handling")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Retry with exponential backoff", "Повтори з експоненційною затримкою"],
    prompt: [
      "Implement `retryWithBackoff(source, { retries, delayMs, factor = 2 })` in `src/retry.ts` with RxJS:\n\n- `source` is a function that returns an observable (call it again for every attempt, so each subscription really runs the request again).\n- After a failure, retry up to `retries` times. The first wait is `delayMs`, and each later wait is multiplied by `factor` (so with `delayMs` 10: 10 ms, then 20 ms).\n- When the retries run out, the error from the last attempt reaches the subscriber.\n- A successful source is not retried, and `retries: 0` means no retries at all.",
      "Реалізуйте `retryWithBackoff(source, { retries, delayMs, factor = 2 })` у `src/retry.ts` з RxJS:\n\n- `source` є функцією, що повертає observable (викликається знову для кожної спроби, щоб кожна підписка справді повторювала запит).\n- Після збою повторюйте до `retries` разів. Перша пауза дорівнює `delayMs`, а кожна наступна множиться на `factor` (тож при `delayMs` 10: 10 мс, потім 20 мс).\n- Коли повторів не лишається, помилка останньої спроби доходить до підписника.\n- Успішне джерело не повторюється, а `retries: 0` означає без повторів.",
    ],
    files: {
      "/src/retry.ts": RXJS_STARTER,
      "/index.ts": RXJS_INDEX,
    },
    visibleFiles: ["/src/retry.ts"],
    activeFile: "/src/retry.ts",
    tests: RXJS_TESTS,
    solution: { "/src/retry.ts": RXJS_SOLUTION },
    explanation: [
      "`defer(source)` creates a fresh observable on each subscription, so the request function runs again on every attempt. `retry({ count, delay })` does the rest: `delay` receives the error and the retry number (starting at 1), so `timer(delayMs * factor ** (retryCount - 1))` produces the exponential waits, and the count limits the attempts. Retrying a failure without a delay hammers a struggling server; backoff spreads the load. Real systems add random jitter to the delay so many clients don't retry in lockstep.",
      "`defer(source)` створює новий observable при кожній підписці, тож функція запиту виконується знову на кожній спробі. `retry({ count, delay })` робить решту: `delay` отримує помилку й номер повтору (починаючи з 1), тож `timer(delayMs * factor ** (retryCount - 1))` дає експоненційні паузи, а count обмежує спроби. Повтор без затримки б'є по сервері, що вже не справляється; backoff розподіляє навантаження. У реальних системах до затримки додають випадковий розкид, щоб багато клієнтів не повторювали запити синхронно.",
    ],
  }),
]);
