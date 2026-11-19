import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "api-fetch-404",
    ["browser-apis", w("async-javascript")],
    1,
    60,
    ["fetch and HTTP errors", "fetch та HTTP-помилки"],
    ["The server answers `404`. What does `await fetch(url)` do?", "Сервер відповідає `404`. Що робить `await fetch(url)`?"],
    [
      ["Rejects with a TypeError", "Відхиляється з TypeError"],
      ["Resolves with a Response whose `ok` is `false` and `status` is 404", "Вирішується з Response, у якого `ok` дорівнює `false`, а `status` 404"],
      ["Resolves with `null`", "Вирішується з `null`"],
      ["Throws synchronously", "Кидає помилку синхронно"],
    ],
    "b",
    [
      "fetch only rejects on network failure, CORS blocks or abort. Any HTTP response, including 404 and 500, resolves. Check `response.ok` (status 200–299) and throw yourself if needed.",
      "fetch відхиляється лише при збої мережі, блокуванні CORS або скасуванні. Будь-яка HTTP-відповідь, включно з 404 і 500, вирішується. Перевіряйте `response.ok` (статус 200–299) і за потреби кидайте помилку самі.",
    ],
  ),
  quiz(
    "api-localstorage-types",
    ["browser-apis"],
    1,
    60,
    ["localStorage values", "Значення в localStorage"],
    ["What does this code log?", "Що виведе цей код?"],
    [
      ["`3`", "`3`"],
      ["`\"12\"`", "`\"12\"`"],
      ["`NaN`", "`NaN`"],
      ["`undefined`", "`undefined`"],
    ],
    "b",
    [
      "localStorage stores strings, so `1` becomes `\"1\"`. `getItem` returns `\"1\"`, and `\"1\" + 2` concatenates to `\"12\"`. Store JSON and parse it back (or use `Number(...)`).",
      "localStorage зберігає рядки, тож `1` стає `\"1\"`. `getItem` повертає `\"1\"`, а `\"1\" + 2` конкатенується в `\"12\"`. Зберігайте JSON і розбирайте його назад (або використайте `Number(...)`).",
    ],
    { code: "localStorage.setItem(\"count\", 1);\nconsole.log(localStorage.getItem(\"count\") + 2);", codeLanguage: "js" },
  ),
  quiz(
    "api-abort-stale",
    ["browser-apis", w("async-javascript")],
    3,
    120,
    ["Stale search results", "Застарілі результати пошуку"],
    ["A search box fires a request on every keystroke. Sometimes old results overwrite newer ones. What's the best fix?", "Поле пошуку надсилає запит на кожне натискання. Іноді старі результати перезаписують новіші. Яке виправлення найкраще?"],
    [
      ["Abort the previous request with an `AbortController` before starting a new one (and debounce input)", "Скасовувати попередній запит через `AbortController` перед новим (і додати debounce до введення)"],
      ["Use `sync: true` in fetch options", "Використати `sync: true` в опціях fetch"],
      ["Sort the responses by length", "Сортувати відповіді за довжиною"],
      ["Store results in localStorage", "Зберігати результати в localStorage"],
    ],
    "a",
    [
      "Responses can arrive out of order. Aborting the previous request (or ignoring responses whose query is no longer current) guarantees only the latest result is applied, and debouncing reduces the number of requests.",
      "Відповіді можуть приходити в довільному порядку. Скасування попереднього запиту (або ігнорування відповідей, чий запит уже неактуальний) гарантує, що застосовується лише останній результат, а debounce зменшує кількість запитів.",
    ],
  ),
  quiz(
    "api-intersection-observer",
    ["browser-apis", w("web-performance")],
    2,
    90,
    ["Lazy loading", "Ліниве завантаження"],
    ["Which API is designed to tell you efficiently when an element enters the viewport?", "Який API призначений для ефективного визначення, коли елемент з'являється в області перегляду?"],
    [
      ["`IntersectionObserver`", "`IntersectionObserver`"],
      ["`MutationObserver`", "`MutationObserver`"],
      ["A `scroll` listener calling `getBoundingClientRect()`", "Обробник `scroll`, що викликає `getBoundingClientRect()`"],
      ["`ResizeObserver`", "`ResizeObserver`"],
    ],
    "a",
    [
      "IntersectionObserver computes visibility off the main thread's hot path and calls back only when thresholds are crossed. Scroll handlers with layout reads run on every scroll event and can cause jank. For images, native `loading=\"lazy\"` also works.",
      "IntersectionObserver обчислює видимість поза гарячим шляхом головного потоку й викликає колбек лише при перетині порогів. Обробники scroll з читанням геометрії виконуються на кожну подію прокрутки й можуть спричиняти ривки. Для зображень також працює нативний `loading=\"lazy\"`.",
    ],
  ),
  quiz(
    "api-token-storage",
    ["browser-apis", w("web-security"), w("auth")],
    4,
    150,
    ["Where to keep a session", "Де зберігати сесію"],
    ["Where is a session credential least exposed to XSS?", "Де облікові дані сесії найменше вразливі до XSS?"],
    [
      ["`localStorage`", "`localStorage`"],
      ["A JavaScript variable in a global object", "Змінна JavaScript у глобальному об'єкті"],
      ["An `HttpOnly; Secure; SameSite` cookie", "Cookie з `HttpOnly; Secure; SameSite`"],
      ["`sessionStorage`", "`sessionStorage`"],
    ],
    "c",
    [
      "Injected scripts can read anything JavaScript can read: localStorage, sessionStorage and variables. An `HttpOnly` cookie is sent by the browser but is invisible to scripts, `Secure` limits it to HTTPS, and `SameSite` mitigates CSRF. XSS can still make requests, so prevent XSS too.",
      "Впроваджені скрипти можуть прочитати все, до чого має доступ JavaScript: localStorage, sessionStorage і змінні. Cookie з `HttpOnly` браузер надсилає, але скрипти його не бачать, `Secure` обмежує його HTTPS, а `SameSite` пом'якшує CSRF. XSS усе одно може робити запити, тож запобігайте й самій XSS.",
    ],
  ),
  practice({
    slug: "api-storage-with-ttl",
    skills: ["browser-apis", w("typescript")],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Storage wrapper with expiry", "Обгортка сховища з терміном дії"],
    prompt: [
      "Implement `createStore({ prefix, storage, now })` returning `{ set, get, remove }`:\n\n- Keys are namespaced: `set(\"user\", v)` writes `prefix + \"user\"`.\n- Values of any JSON type round-trip, including `0`, `false` and `\"\"`.\n- `set(key, value, ttlMs?)`: with a TTL, `get` returns `undefined` once `now()` passes the expiry, and removes the entry.\n- `get` never throws: corrupt JSON returns `undefined`.\n- `set` returns `false` instead of throwing when the storage is full.\n\n`storage` defaults to `localStorage` and `now` to `Date.now`; the tests inject fakes.",
      "Реалізуйте `createStore({ prefix, storage, now })`, що повертає `{ set, get, remove }`:\n\n- Ключі мають простір імен: `set(\"user\", v)` записує `prefix + \"user\"`.\n- Значення будь-якого JSON-типу зберігаються й читаються без втрат, включно з `0`, `false` і `\"\"`.\n- `set(key, value, ttlMs?)`: з TTL метод `get` повертає `undefined`, щойно `now()` перевищить термін дії, і видаляє запис.\n- `get` ніколи не кидає помилку: зіпсований JSON повертає `undefined`.\n- `set` повертає `false` замість помилки, коли сховище переповнене.\n\n`storage` за замовчуванням дорівнює `localStorage`, а `now` дорівнює `Date.now`; тести підставляють фейки.",
    ],
    files: {
      "/src/store.ts": "type Options = { prefix: string; storage?: Storage; now?: () => number };\n\nexport function createStore({ prefix, storage = localStorage, now = Date.now }: Options) {\n  return {\n    set(key: string, value: unknown, ttlMs?: number): boolean {\n      // TODO\n      storage.setItem(key, String(value));\n      return true;\n    },\n    get<T>(key: string): T | undefined {\n      // TODO\n      return (storage.getItem(key) ?? undefined) as T | undefined;\n    },\n    remove(key: string): void {\n      // TODO\n    },\n  };\n}\n",
      "/index.ts": 'import "./styles.css";\nimport { createStore } from "./src/store";\n\nconst store = createStore({ prefix: "demo:" });\nstore.set("visits", (store.get<number>("visits") ?? 0) + 1);\nstore.set("flash", "Saved!", 2000);\n\ndocument.getElementById("app")!.innerHTML = `<h1>Storage</h1>\n<p>Visits in this browser: <output id="visits">${store.get<number>("visits")}</output></p>\n<p>Flash message: <output id="flash">${store.get<string>("flash") ?? "(expired)"}</output></p>`;\n',
    },
    visibleFiles: ["/src/store.ts", "/index.ts"],
    activeFile: "/src/store.ts",
    tests: 'import { describe, it, expect } from "./test-kit";\nimport { createStore } from "../src/store";\n\nclass MemoryStorage {\n  data = new Map<string, string>();\n  full = false;\n  get length() { return this.data.size; }\n  key(i: number) { return [...this.data.keys()][i] ?? null; }\n  getItem(k: string) { return this.data.has(k) ? this.data.get(k)! : null; }\n  setItem(k: string, v: string) {\n    if (this.full) throw new DOMException("full", "QuotaExceededError");\n    this.data.set(k, String(v));\n  }\n  removeItem(k: string) { this.data.delete(k); }\n  clear() { this.data.clear(); }\n}\n\nfunction setup() {\n  const storage = new MemoryStorage();\n  let time = 1000;\n  const store = createStore({ prefix: "app:", storage: storage as unknown as Storage, now: () => time });\n  return { storage, store, tick: (ms: number) => (time += ms) };\n}\n\ndescribe("createStore", () => {\n  it("round-trips JSON values under a prefix", () => {\n    const { store, storage } = setup();\n    store.set("user", { name: "Ada", tags: ["x"] });\n    expect(store.get("user")).toEqual({ name: "Ada", tags: ["x"] });\n    expect([...storage.data.keys()]).toEqual(["app:user"]);\n  });\n  it("keeps falsy values", () => {\n    const { store } = setup();\n    store.set("zero", 0);\n    store.set("no", false);\n    store.set("empty", "");\n    expect(store.get("zero")).toBe(0);\n    expect(store.get("no")).toBe(false);\n    expect(store.get("empty")).toBe("");\n  });\n  it("returns undefined for missing keys", () => {\n    expect(setup().store.get("missing")).toBeUndefined();\n  });\n  it("expires entries after their TTL and removes them", () => {\n    const { store, storage, tick } = setup();\n    store.set("flash", "hi", 500);\n    tick(499);\n    expect(store.get("flash")).toBe("hi");\n    tick(2);\n    expect(store.get("flash")).toBeUndefined();\n    expect(storage.data.size).toBe(0);\n  });\n  it("does not throw on corrupt data", () => {\n    const { store, storage } = setup();\n    storage.data.set("app:bad", "{not json");\n    expect(store.get("bad")).toBeUndefined();\n  });\n  it("returns false when the storage is full", () => {\n    const { store, storage } = setup();\n    storage.full = true;\n    expect(store.set("k", 1)).toBe(false);\n  });\n  it("removes keys", () => {\n    const { store } = setup();\n    store.set("k", 1);\n    store.remove("k");\n    expect(store.get("k")).toBeUndefined();\n  });\n});\n',
    solution: {
      "/src/store.ts": "type Options = { prefix: string; storage?: Storage; now?: () => number };\ntype Entry = { v: unknown; e: number | null };\n\nexport function createStore({ prefix, storage = localStorage, now = Date.now }: Options) {\n  const k = (key: string) => prefix + key;\n\n  return {\n    set(key: string, value: unknown, ttlMs?: number): boolean {\n      const entry: Entry = { v: value, e: ttlMs == null ? null : now() + ttlMs };\n      try {\n        storage.setItem(k(key), JSON.stringify(entry));\n        return true;\n      } catch {\n        return false; // quota exceeded or storage unavailable\n      }\n    },\n    get<T>(key: string): T | undefined {\n      const raw = storage.getItem(k(key));\n      if (raw == null) return undefined;\n      try {\n        const entry = JSON.parse(raw) as Entry;\n        if (entry.e != null && now() > entry.e) {\n          storage.removeItem(k(key));\n          return undefined;\n        }\n        return entry.v as T;\n      } catch {\n        return undefined;\n      }\n    },\n    remove(key: string): void {\n      storage.removeItem(k(key));\n    },\n  };\n}\n",
    },
    explanation: [
      "Wrap every value in an envelope `{ v, e }` with an optional expiry timestamp and store it as JSON, which preserves types and falsy values. `get` checks the expiry against the injected clock and deletes stale entries. `try/catch` guards both parsing and quota errors. Injecting `storage` and `now` makes the module easy to test.",
      "Загортайте кожне значення в конверт `{ v, e }` з необов'язковою позначкою часу завершення й зберігайте як JSON, що зберігає типи й хибні значення. `get` порівнює термін дії з підставленим годинником і видаляє застарілі записи. `try/catch` захищає і розбір, і помилки переповнення. Підстановка `storage` і `now` робить модуль легким для тестування.",
    ],
  }),
]);
