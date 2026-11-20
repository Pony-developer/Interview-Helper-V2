import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const RPC_TYPES = String.raw`/** The part of Worker / MessagePort this module needs. */
export interface PortLike {
  postMessage(message: unknown): void;
  onmessage: ((event: { data: any }) => void) | null;
}

export type Handlers = Record<string, (...args: any[]) => unknown>;
`;

const RPC_STARTER =
  RPC_TYPES +
  String.raw`
/** Main-thread side: call(method, ...args) returns a promise of the worker's result. */
export function createRpcClient(port: PortLike, options: { timeoutMs?: number } = {}) {
  // TODO: match responses to requests by id, and time out
  const waiting: { resolve: (v: unknown) => void; reject: (e: Error) => void }[] = [];
  port.onmessage = (event) => {
    const next = waiting.shift();
    if (!next) return;
    if (event.data && "error" in event.data) next.reject(new Error(event.data.error));
    else next.resolve(event.data?.result);
  };
  return {
    call<T = unknown>(method: string, ...args: unknown[]): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        waiting.push({ resolve: resolve as (v: unknown) => void, reject });
        port.postMessage({ method, args });
      });
    },
  };
}

/** Worker side: answers calls with the matching handler. */
export function exposeRpc(port: PortLike, handlers: Handlers) {
  port.onmessage = async (event) => {
    try {
      const result = await handlers[event.data.method](...event.data.args);
      port.postMessage({ result });
    } catch (error) {
      port.postMessage({ error: String(error) });
    }
  };
}
`;

const RPC_SOLUTION =
  RPC_TYPES +
  String.raw`
type Pending = { resolve: (value: unknown) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> };

export function createRpcClient(port: PortLike, options: { timeoutMs?: number } = {}) {
  const { timeoutMs = 5000 } = options;
  let nextId = 1;
  const pending = new Map<number, Pending>();

  port.onmessage = (event) => {
    const msg = event.data;
    if (!msg || typeof msg.id !== "number") return; // not one of ours
    const entry = pending.get(msg.id);
    if (!entry) return; // already timed out
    pending.delete(msg.id);
    clearTimeout(entry.timer);
    if (msg.error !== undefined) entry.reject(new Error(msg.error));
    else entry.resolve(msg.result);
  };

  return {
    call<T = unknown>(method: string, ...args: unknown[]): Promise<T> {
      const id = nextId++;
      return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error("Timed out: " + method));
        }, timeoutMs);
        pending.set(id, { resolve: resolve as (value: unknown) => void, reject, timer });
        port.postMessage({ id, method, args });
      });
    },
  };
}

export function exposeRpc(port: PortLike, handlers: Handlers) {
  port.onmessage = async (event) => {
    const msg = event.data;
    if (!msg || typeof msg.id !== "number") return;
    try {
      // Own properties only, so "toString" or "__proto__" can't reach Object.prototype.
      if (!Object.prototype.hasOwnProperty.call(handlers, msg.method)) throw new Error("Unknown method: " + msg.method);
      const result = await handlers[msg.method](...(msg.args ?? []));
      port.postMessage({ id: msg.id, result });
    } catch (error) {
      port.postMessage({ id: msg.id, error: error instanceof Error ? error.message : String(error) });
    }
  };
}
`;

const RPC_INDEX = String.raw`import "./styles.css";
import { createRpcClient, exposeRpc, type PortLike } from "./src/rpc";

// A real app would use new Worker(...); here an in-memory channel stands in for it.
function channel(): [PortLike, PortLike] {
  const a: PortLike = { onmessage: null, postMessage: (m) => setTimeout(() => b.onmessage?.({ data: structuredClone(m) }), 0) };
  const b: PortLike = { onmessage: null, postMessage: (m) => setTimeout(() => a.onmessage?.({ data: structuredClone(m) }), 0) };
  return [a, b];
}

const [main, worker] = channel();
exposeRpc(worker, {
  primesBelow: (n: number) => {
    const sieve = new Uint8Array(n);
    let count = 0;
    for (let i = 2; i < n; i++) if (!sieve[i]) { count++; for (let j = i * i; j < n; j += i) sieve[j] = 1; }
    return count;
  },
});
const api = createRpcClient(main);
api.call<number>("primesBelow", 1_000_000).then((count) => {
  document.getElementById("app")!.innerHTML = '<h1>Worker RPC</h1><p>Primes below 1,000,000: <output id="primes">' + count + "</output></p>";
});
`;

const RPC_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { createRpcClient, exposeRpc } from "../src/rpc";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Two connected in-memory ports; messages are copied and delivered asynchronously, like postMessage. */
function channel() {
  const a = { onmessage: null, postMessage: (m) => setTimeout(() => b.onmessage && b.onmessage({ data: JSON.parse(JSON.stringify(m)) }), 0) };
  const b = { onmessage: null, postMessage: (m) => setTimeout(() => a.onmessage && a.onmessage({ data: JSON.parse(JSON.stringify(m)) }), 0) };
  return [a, b];
}

function setup(handlers, options) {
  const [main, worker] = channel();
  exposeRpc(worker, handlers);
  return { client: createRpcClient(main, options), main };
}

describe("worker RPC", () => {
  it("returns a handler's result", async () => {
    const { client } = setup({ add: (a, b) => a + b });
    expect(await client.call("add", 2, 3)).toBe(5);
  });
  it("supports async handlers", async () => {
    const { client } = setup({ later: async (x) => { await sleep(5); return x * 2; } });
    expect(await client.call("later", 21)).toBe(42);
  });
  it("matches responses to requests even when they finish out of order", async () => {
    const { client } = setup({ wait: async (ms, label) => { await sleep(ms); return label; } });
    const results = await Promise.all([client.call("wait", 40, "slow"), client.call("wait", 5, "fast"), client.call("wait", 20, "mid")]);
    expect(results).toEqual(["slow", "fast", "mid"]);
  });
  it("rejects with the handler's error message", async () => {
    const { client } = setup({ fail: () => { throw new Error("bad input"); } });
    await expect(client.call("fail")).rejects.toThrow("bad input");
  });
  it("rejects unknown methods, including inherited ones", async () => {
    const { client } = setup({ add: (a, b) => a + b });
    await expect(client.call("nope")).rejects.toThrow("Unknown method");
    await expect(client.call("toString")).rejects.toThrow("Unknown method");
  });
  it("times out and ignores the late response", async () => {
    const { client } = setup({ slow: async () => { await sleep(60); return "late"; }, ping: () => "pong" }, { timeoutMs: 20 });
    const outcome = await Promise.race([
      client.call("slow").then((v) => "resolved: " + v, (e) => e.message),
      sleep(200).then(() => "still pending"),
    ]);
    expect(outcome).toBe("Timed out: slow");
    await sleep(80);
    expect(await client.call("ping")).toBe("pong");
  });
  it("ignores unrelated messages", async () => {
    const { client, main } = setup({ ping: () => "pong" });
    main.onmessage({ data: { hello: "world" } });
    main.onmessage({ data: null });
    expect(await client.call("ping")).toBe("pong");
  });
});
`;

export default defineTasks([
  quiz(
    "ww-why",
    ["web-workers", w("web-performance")],
    1,
    45,
    ["Why use a worker", "Навіщо worker"],
    ["Parsing a 20 MB CSV in the page takes 800 ms and the UI freezes. What does moving it to a Web Worker achieve?", "Розбір CSV на 20 МБ на сторінці займає 800 мс, і інтерфейс зависає. Що дасть перенесення у Web Worker?"],
    [
      ["The parsing runs on another thread, so the main thread stays free for input, animation and rendering", "Розбір виконується в іншому потоці, тож головний потік лишається вільним для введення, анімації й рендерингу"],
      ["The parsing itself becomes several times faster", "Сам розбір стає в кілька разів швидшим"],
      ["The CSV is downloaded faster", "CSV завантажується швидше"],
      ["The result can be written directly into the DOM from the worker", "Результат можна записати прямо в DOM з worker"],
    ],
    "a",
    [
      "A worker doesn't make the work faster (it may even add copying overhead), but it takes it off the thread that handles clicks and paints frames, so the page stays responsive. The worker can't touch the DOM: it posts the parsed result back, and the main thread renders it.",
      "Worker не пришвидшує саму роботу (може навіть додати витрат на копіювання), але забирає її з потоку, що обробляє кліки й малює кадри, тож сторінка лишається чуйною. Worker не має доступу до DOM: він надсилає результат розбору назад, а головний потік його рендерить.",
    ],
  ),
  quiz(
    "ww-no-dom",
    ["web-workers", w("dom-events")],
    2,
    60,
    ["What's missing in a worker", "Чого немає у worker"],
    ["Which of these is **not** available inside a dedicated Web Worker?", "Що з цього **недоступне** всередині dedicated Web Worker?"],
    [
      ["`document` and `localStorage`", "`document` і `localStorage`"],
      ["`fetch`", "`fetch`"],
      ["`IndexedDB`", "`IndexedDB`"],
      ["`setTimeout`", "`setTimeout`"],
    ],
    "a",
    [
      "Workers have no DOM, no `window`, and none of the synchronous, DOM-bound storage APIs (`localStorage`, `sessionStorage`, `document.cookie`). They do have `fetch`, WebSockets, IndexedDB, timers, `crypto`, WebAssembly and `OffscreenCanvas`. To change the page, post a message and let the main thread update the DOM.",
      "Worker не має DOM, `window` і жодного з синхронних API сховища, прив'язаних до DOM (`localStorage`, `sessionStorage`, `document.cookie`). Натомість у нього є `fetch`, WebSocket, IndexedDB, таймери, `crypto`, WebAssembly й `OffscreenCanvas`. Щоб змінити сторінку, надішліть повідомлення, і головний потік оновить DOM.",
    ],
  ),
  quiz(
    "ww-clone-function",
    ["web-workers"],
    2,
    90,
    ["Posting a function", "Надсилання функції"],
    ["`postMessage` and `structuredClone` use the same algorithm. What does this print?", "`postMessage` і `structuredClone` використовують той самий алгоритм. Що виведе цей код?"],
    [
      ["`DataCloneError`", "`DataCloneError`"],
      ["`{ onClick: [Function] }`", "`{ onClick: [Function] }`"],
      ["`{}`: functions are silently dropped", "`{}`: функції мовчки відкидаються"],
      ["`TypeError`", "`TypeError`"],
    ],
    "a",
    [
      "The structured clone algorithm copies data, not behaviour: functions (and DOM nodes) can't be cloned, so the whole call throws a `DataCloneError` (unlike `JSON.stringify`, which silently drops functions). Send plain data and a message type, and keep the logic on each side.",
      "Алгоритм структурованого клонування копіює дані, а не поведінку: функції (і DOM-вузли) клонувати не можна, тож увесь виклик кидає `DataCloneError` (на відміну від `JSON.stringify`, що мовчки відкидає функції). Надсилайте звичайні дані й тип повідомлення, а логіку тримайте на кожному боці.",
    ],
    { code: "try {\n  structuredClone({ onClick: () => alert(\"hi\") });\n} catch (e) {\n  console.log(e.name);\n}", codeLanguage: "js" },
  ),
  quiz(
    "ww-transfer",
    ["web-workers", w("web-performance")],
    3,
    90,
    ["Transferring a buffer", "Передача буфера"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`0`", "`0`"],
      ["`8`", "`8`"],
      ["`undefined`", "`undefined`"],
      ["It throws, because the buffer is still in use", "Кидає помилку, бо буфер ще використовується"],
    ],
    "a",
    [
      "Listing the buffer in the transfer list moves ownership instead of copying: the receiver gets the memory, and the sender's `ArrayBuffer` is detached, with `byteLength` 0. That makes sending large binary data (images, audio, WASM memory) nearly free. Without the transfer list, the data would be copied.",
      "Перелік буфера у списку передачі переміщує володіння замість копіювання: отримувач отримує пам'ять, а `ArrayBuffer` відправника від'єднується, і `byteLength` стає 0. Так надсилання великих двійкових даних (зображень, аудіо, пам'яті WASM) стає майже безкоштовним. Без списку передачі дані скопіювалися б.",
    ],
    { code: "const { port1, port2 } = new MessageChannel();\nconst buffer = new ArrayBuffer(8);\nport1.postMessage(buffer, [buffer]);\nconsole.log(buffer.byteLength);\nport1.close();\nport2.close();", codeLanguage: "js" },
  ),
  quiz(
    "ww-class-instance",
    ["web-workers", w("oop")],
    3,
    90,
    ["Class instances across threads", "Екземпляри класів між потоками"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`false 1 undefined`", "`false 1 undefined`"],
      ["`true 1 function`", "`true 1 function`"],
      ["`false undefined undefined`", "`false undefined undefined`"],
      ["It throws a `DataCloneError`", "Кидає `DataCloneError`"],
    ],
    "a",
    [
      "Structured clone copies an object's own data properties into a plain object; the prototype (and therefore the class and its methods) is not transferred. On the receiving side, rebuild instances explicitly (`Point.from(data)`) or design messages as plain data.",
      "Структуроване клонування копіює власні властивості з даними в звичайний об'єкт; прототип (а отже клас і його методи) не передається. На боці отримувача відтворюйте екземпляри явно (`Point.from(data)`) або проєктуйте повідомлення як звичайні дані.",
    ],
    { code: "class Point {\n  constructor(x, y) { this.x = x; this.y = y; }\n  norm() { return Math.hypot(this.x, this.y); }\n}\nconst copy = structuredClone(new Point(1, 2));\nconsole.log(copy instanceof Point, copy.x, typeof copy.norm);", codeLanguage: "js" },
  ),
  quiz(
    "ww-kinds",
    ["web-workers", w("pwa")],
    3,
    90,
    ["Which kind of worker?", "Який вид worker?"],
    ["Several open tabs of the same app should share **one** WebSocket connection instead of opening one each. Which worker type fits?", "Кілька відкритих вкладок того самого застосунку мають ділити **одне** з'єднання WebSocket, а не відкривати по одному. Який вид worker підходить?"],
    [
      ["A SharedWorker, which all same-origin tabs can connect to", "SharedWorker, до якого можуть під'єднатися всі вкладки того самого джерела"],
      ["A dedicated Worker per tab", "Окремий dedicated Worker на кожну вкладку"],
      ["A service worker, which keeps sockets open while no tab is open", "Service worker, що тримає сокети відкритими, коли жодна вкладка не відкрита"],
      ["A worklet", "Worklet"],
    ],
    "a",
    [
      "A dedicated worker belongs to one page. A SharedWorker is shared by every same-origin page that connects to it (via `port`), so it can own a single connection or cache. Service workers are event-driven network proxies that the browser stops when idle, so they can't hold long-lived sockets. (Safari added SharedWorker support back in 16; check your targets.)",
      "Dedicated worker належить одній сторінці. SharedWorker спільний для всіх сторінок того самого джерела, що під'єднуються до нього (через `port`), тож може володіти одним з'єднанням чи кешем. Service worker є мережевим проксі, що працює за подіями й зупиняється браузером у простої, тож не може тримати довготривалі сокети. (Safari повернув підтримку SharedWorker у версії 16; перевірте цільові браузери.)",
    ],
  ),
  quiz(
    "ww-shared-array-buffer",
    ["web-workers", w("web-security")],
    4,
    120,
    ["`SharedArrayBuffer` is undefined", "`SharedArrayBuffer` не визначено"],
    ["In production, `typeof SharedArrayBuffer` is `\"undefined\"`, so the WebAssembly threads build fails. What's needed?", "У продакшені `typeof SharedArrayBuffer` дорівнює `\"undefined\"`, тож збірка WebAssembly з потоками не працює. Що потрібно?"],
    [
      ["Make the page cross-origin isolated with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (or `credentialless`)", "Зробити сторінку ізольованою між джерелами через `Cross-Origin-Opener-Policy: same-origin` і `Cross-Origin-Embedder-Policy: require-corp` (або `credentialless`)"],
      ["Load the script with `type=\"module\"`", "Завантажувати скрипт з `type=\"module\"`"],
      ["Enable CORS on the API", "Увімкнути CORS на API"],
      ["Use HTTP/2", "Використати HTTP/2"],
    ],
    "a",
    [
      "After the Spectre attacks, browsers expose shared memory (and high-resolution timers) only to cross-origin isolated pages, where no untrusted cross-origin content can be loaded without opting in. Set COOP and COEP headers, make sure embedded third-party resources send CORP/CORS headers, and check `self.crossOriginIsolated`.",
      "Після атак Spectre браузери відкривають спільну пам'ять (і таймери високої точності) лише сторінкам, ізольованим між джерелами, де не можна завантажити недовірений міжджерельний вміст без згоди. Встановіть заголовки COOP і COEP, переконайтеся, що вбудовані сторонні ресурси надсилають заголовки CORP/CORS, і перевіряйте `self.crossOriginIsolated`.",
    ],
  ),
  quiz(
    "ww-request-ids",
    ["web-workers", w("async-javascript")],
    4,
    120,
    ["Answers to the wrong question", "Відповіді не на те питання"],
    ["A helper sends `worker.postMessage(query)` and resolves a promise with the **next** message the worker sends. Two searches run at once and sometimes get each other's results. What's the fix?", "Помічник надсилає `worker.postMessage(query)` і виконує проміс **наступним** повідомленням від worker. Два пошуки йдуть одночасно й іноді отримують результати одне одного. Як виправити?"],
    [
      ["Tag each request with a unique id, keep pending promises in a map, and resolve the one whose id the response carries", "Позначати кожен запит унікальним id, тримати проміси, що очікують, у мапі й виконувати той, чий id несе відповідь"],
      ["Create a new worker for every search", "Створювати новий worker для кожного пошуку"],
      ["Await each search before starting the next", "Чекати на кожен пошук перед початком наступного"],
      ["Use `structuredClone` before posting", "Використовувати `structuredClone` перед надсиланням"],
    ],
    "a",
    [
      "Messages are a single stream; when work inside the worker finishes in a different order than it started, \"the next message\" belongs to a different request. Correlation ids are the standard fix (it's what Comlink and JSON-RPC do), and they also enable timeouts and error responses per request. Serialising or spawning workers avoids the bug only by giving up concurrency.",
      "Повідомлення є одним потоком; коли робота всередині worker завершується в іншому порядку, ніж почалася, «наступне повідомлення» належить іншому запиту. Ідентифікатори кореляції є стандартним виправленням (так роблять Comlink і JSON-RPC), а ще вони дають тайм-аути й відповіді з помилками для кожного запиту. Послідовне виконання чи створення нових worker уникають бага лише ціною відмови від паралельності.",
    ],
  ),
  quiz(
    "ww-overhead",
    ["web-workers", w("web-performance")],
    5,
    150,
    ["When a worker makes things worse", "Коли worker робить гірше"],
    ["On every keystroke, the page posts a 40 MB array of records to a worker that filters them in 5 ms. Input feels **slower** than filtering on the main thread. Why, and what helps?", "На кожне натискання клавіші сторінка надсилає масив записів на 40 МБ у worker, який фільтрує їх за 5 мс. Введення стало **повільнішим**, ніж фільтрація в головному потоці. Чому і що допоможе?"],
    [
      ["Structured-cloning 40 MB on the main thread each time costs far more than the 5 ms of work; send the data to the worker once and post only the query (or transfer/share the memory)", "Структуроване клонування 40 МБ у головному потоці щоразу коштує набагато більше за 5 мс роботи; надішліть дані в worker один раз, а далі надсилайте лише запит (або передавайте чи діліть пам'ять)"],
      ["Workers are always slower than the main thread", "Worker завжди повільніші за головний потік"],
      ["The worker needs more threads", "Worker потребує більше потоків"],
      ["`postMessage` is synchronous and waits for the worker to finish", "`postMessage` синхронний і чекає, доки worker завершить"],
    ],
    "a",
    [
      "Offloading only pays off when the work saved is bigger than the cost of moving data. Cloning happens on the sending thread, so a large payload per message blocks the very thread you wanted to free. Keep large state inside the worker and send small commands; for binary data, transfer buffers or use `SharedArrayBuffer`. Always measure before and after.",
      "Перенесення окуповується лише тоді, коли заощаджена робота більша за вартість переміщення даних. Клонування відбувається в потоці-відправнику, тож великий обсяг даних на кожне повідомлення блокує саме той потік, який ви хотіли звільнити. Тримайте великий стан усередині worker і надсилайте невеликі команди; для двійкових даних передавайте буфери чи використовуйте `SharedArrayBuffer`. Завжди вимірюйте до й після.",
    ],
  ),
  practice({
    slug: "ww-rpc",
    skills: ["web-workers", w("async-javascript"), w("typescript")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Promise-based RPC over postMessage", "RPC на промісах поверх postMessage"],
    prompt: [
      "Build the core of a library like Comlink in `src/rpc.ts`: request/response on top of one-way messages.\n\n**`createRpcClient(port, { timeoutMs = 5000 })`** returns `{ call(method, ...args) }`:\n- Each call posts `{ id, method, args }` with a unique numeric `id` and returns a promise.\n- Responses `{ id, result }` or `{ id, error }` resolve or reject **the call with the same id**, whatever order they arrive in. Ignore messages without a known id.\n- If no response arrives within `timeoutMs`, reject with `Error(\"Timed out: <method>\")`; a late response for it is ignored.\n\n**`exposeRpc(port, handlers)`** answers requests on the worker side:\n- Call the handler (sync or async) and post `{ id, result }`; if it throws, post `{ id, error: message }`.\n- Only **own** properties of `handlers` count: unknown methods, including inherited ones like `toString`, get `error: \"Unknown method: <name>\"`.",
      "Створіть ядро бібліотеки на кшталт Comlink у `src/rpc.ts`: запит/відповідь поверх однобічних повідомлень.\n\n**`createRpcClient(port, { timeoutMs = 5000 })`** повертає `{ call(method, ...args) }`:\n- Кожен виклик надсилає `{ id, method, args }` з унікальним числовим `id` і повертає проміс.\n- Відповіді `{ id, result }` або `{ id, error }` виконують чи відхиляють **виклик із тим самим id**, у якому б порядку вони не прийшли. Ігноруйте повідомлення без відомого id.\n- Якщо відповідь не прийшла за `timeoutMs`, відхиліть з `Error(\"Timed out: <method>\")`; пізню відповідь на нього ігноруйте.\n\n**`exposeRpc(port, handlers)`** відповідає на запити на боці worker:\n- Викликайте обробник (синхронний чи асинхронний) і надсилайте `{ id, result }`; якщо він кидає помилку, надсилайте `{ id, error: message }`.\n- Враховуються лише **власні** властивості `handlers`: невідомі методи, зокрема успадковані на кшталт `toString`, отримують `error: \"Unknown method: <name>\"`.",
    ],
    files: { "/src/rpc.ts": RPC_STARTER, "/index.ts": RPC_INDEX },
    visibleFiles: ["/src/rpc.ts", "/index.ts"],
    activeFile: "/src/rpc.ts",
    tests: RPC_TESTS,
    solution: { "/src/rpc.ts": RPC_SOLUTION },
    explanation: [
      "A map from request id to `{ resolve, reject, timer }` turns a single message stream into independent promises: each response finds its own caller, regardless of order. Deleting the entry on timeout means a late response finds nothing and is dropped. On the worker side, `try/catch` around an awaited handler turns both sync throws and rejections into error responses, and the own-property check stops callers from invoking `Object.prototype` methods.",
      "Мапа з id запиту на `{ resolve, reject, timer }` перетворює один потік повідомлень на незалежні проміси: кожна відповідь знаходить свого викликача незалежно від порядку. Видалення запису після тайм-ауту означає, що пізня відповідь нічого не знайде й буде відкинута. На боці worker `try/catch` навколо обробника з `await` перетворює і синхронні винятки, і відхилення на відповіді з помилкою, а перевірка власних властивостей не дає викликати методи `Object.prototype`.",
    ],
  }),
]);
