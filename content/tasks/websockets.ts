import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const SOCKET_TYPES = String.raw`/** The subset of the WebSocket API this client needs (readyState: 0 connecting, 1 open, 3 closed). */
export interface SocketLike {
  readyState: number;
  send(data: string): void;
  close(): void;
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onclose: ((event: { code: number }) => void) | null;
}

export type ReconnectOptions = {
  createSocket: (url: string) => SocketLike;
  /** First retry delay in ms (default 500); doubles on each failed attempt. */
  baseDelay?: number;
  /** Upper bound for the delay in ms (default 10000). */
  maxDelay?: number;
  /** Jitter source in [0, 1) (default Math.random). */
  random?: () => number;
  /** Timer function (default setTimeout). */
  schedule?: (fn: () => void, ms: number) => void;
};

export type Status = "connecting" | "open" | "closed";
`;

const SOCKET_STARTER =
  SOCKET_TYPES +
  String.raw`
export function createReconnectingSocket(url: string, options: ReconnectOptions) {
  // TODO: queue messages while not open, reconnect with backoff, stop on close()
  const socket = options.createSocket(url);
  const listeners = new Set<(data: string) => void>();
  socket.onmessage = (e) => listeners.forEach((l) => l(e.data));
  return {
    get status(): Status {
      return socket.readyState === 1 ? "open" : socket.readyState === 0 ? "connecting" : "closed";
    },
    send(data: string) {
      socket.send(data);
    },
    onMessage(listener: (data: string) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    close() {
      socket.close();
    },
  };
}
`;

const SOCKET_SOLUTION =
  SOCKET_TYPES +
  String.raw`
export function createReconnectingSocket(url: string, options: ReconnectOptions) {
  const {
    createSocket,
    baseDelay = 500,
    maxDelay = 10000,
    random = Math.random,
    schedule = (fn: () => void, ms: number) => {
      setTimeout(fn, ms);
    },
  } = options;
  const listeners = new Set<(data: string) => void>();
  const queue: string[] = [];
  let socket: SocketLike;
  let status: Status = "connecting";
  let attempt = 0;
  let closedByUser = false;

  function connect() {
    status = "connecting";
    socket = createSocket(url);
    socket.onopen = () => {
      status = "open";
      attempt = 0; // a successful connection resets the backoff
      while (queue.length) socket.send(queue.shift()!);
    };
    socket.onmessage = (event) => {
      for (const listener of [...listeners]) listener(event.data);
    };
    socket.onclose = () => {
      if (closedByUser) {
        status = "closed";
        return;
      }
      status = "connecting";
      // Exponential backoff, capped, with jitter so clients don't reconnect in lockstep.
      const delay = Math.min(maxDelay, baseDelay * 2 ** attempt) * (0.5 + random() / 2);
      attempt++;
      schedule(() => {
        if (!closedByUser) connect();
      }, delay);
    };
  }

  connect();

  return {
    get status(): Status {
      return status;
    },
    send(data: string) {
      if (status === "open") socket.send(data);
      else if (!closedByUser) queue.push(data);
    },
    onMessage(listener: (data: string) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    close() {
      closedByUser = true;
      status = "closed";
      queue.length = 0;
      socket.close();
    },
  };
}
`;

const SOCKET_INDEX = String.raw`import "./styles.css";
import { createReconnectingSocket, type SocketLike } from "./src/socket";

// An in-memory echo "server" that drops the first connection, so you can watch the client recover.
let connections = 0;
const createSocket = (): SocketLike => {
  const id = ++connections;
  const s: SocketLike = {
    readyState: 0,
    onopen: null,
    onmessage: null,
    onclose: null,
    send(data) {
      setTimeout(() => s.onmessage?.({ data: "echo: " + data }), 20);
    },
    close() {
      s.readyState = 3;
      s.onclose?.({ code: 1000 });
    },
  };
  setTimeout(() => {
    s.readyState = 1;
    s.onopen?.();
    if (id === 1) setTimeout(() => { s.readyState = 3; s.onclose?.({ code: 1006 }); }, 50);
  }, 30);
  return s;
};

const log: string[] = [];
const app = document.getElementById("app")!;
const render = () => (app.innerHTML = "<h1>Reconnecting socket</h1><pre>" + log.join("\n") + "</pre>");
const client = createReconnectingSocket("wss://demo.invalid", { createSocket, baseDelay: 200 });
client.onMessage((m) => { log.push(m); render(); });
try {
  client.send("hello");
  setTimeout(() => client.send("still there?"), 400);
} catch (e) {
  log.push("send failed: " + (e as Error).message);
}
render();
`;

const SOCKET_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { createReconnectingSocket } from "../src/socket";

function setup(extra = {}) {
  const sockets = [];
  const timers = [];
  const createSocket = (url) => {
    const s = {
      url, readyState: 0, sent: [], onopen: null, onmessage: null, onclose: null,
      send(d) { if (this.readyState !== 1) throw new Error("InvalidStateError: not open"); this.sent.push(d); },
      close() { this.readyState = 3; if (this.onclose) this.onclose({ code: 1000 }); },
      open() { this.readyState = 1; if (this.onopen) this.onopen(); },
      receive(d) { if (this.onmessage) this.onmessage({ data: d }); },
      drop() { this.readyState = 3; if (this.onclose) this.onclose({ code: 1006 }); },
    };
    sockets.push(s);
    return s;
  };
  const schedule = (fn, ms) => timers.push({ fn, ms });
  const client = createReconnectingSocket("wss://chat.test", { createSocket, schedule, random: () => 1, baseDelay: 100, maxDelay: 1000, ...extra });
  const runTimers = () => timers.splice(0).map((t) => { t.fn(); return t.ms; });
  return { client, sockets, timers, runTimers };
}

describe("createReconnectingSocket", () => {
  it("connects immediately and reports its status", () => {
    const { client, sockets } = setup();
    expect(sockets.length).toBe(1);
    expect(sockets[0].url).toBe("wss://chat.test");
    expect(client.status).toBe("connecting");
    sockets[0].open();
    expect(client.status).toBe("open");
  });
  it("queues messages until the socket opens, then sends them in order", () => {
    const { client, sockets } = setup();
    client.send("a");
    client.send("b");
    sockets[0].open();
    client.send("c");
    expect(sockets[0].sent).toEqual(["a", "b", "c"]);
  });
  it("delivers incoming messages to listeners until they unsubscribe", () => {
    const { client, sockets } = setup();
    const got = [];
    const off = client.onMessage((m) => got.push(m));
    sockets[0].open();
    sockets[0].receive("hi");
    off();
    sockets[0].receive("ignored");
    expect(got).toEqual(["hi"]);
  });
  it("reconnects with exponential backoff, capped at maxDelay", () => {
    const { sockets, runTimers } = setup();
    sockets[0].open();
    const delays = [];
    for (let i = 0; i < 6; i++) {
      sockets[sockets.length - 1].drop();
      delays.push(...runTimers());
    }
    expect(delays).toEqual([100, 200, 400, 800, 1000, 1000]);
    expect(sockets.length).toBe(7);
  });
  it("resets the backoff after a successful connection", () => {
    const { sockets, runTimers } = setup();
    sockets[0].drop();
    expect(runTimers()).toEqual([100]);
    sockets[1].drop();
    expect(runTimers()).toEqual([200]);
    sockets[2].open();
    sockets[2].drop();
    expect(runTimers()).toEqual([100]);
  });
  it("adds jitter between 50% and 100% of the delay", () => {
    const { sockets, runTimers } = setup({ random: () => 0 });
    sockets[0].drop();
    expect(runTimers()).toEqual([50]);
  });
  it("keeps queueing while reconnecting and flushes on the new socket", () => {
    const { client, sockets, runTimers } = setup();
    sockets[0].open();
    sockets[0].drop();
    client.send("while offline");
    runTimers();
    sockets[1].open();
    expect(sockets[1].sent).toEqual(["while offline"]);
  });
  it("stops for good after close(), even with a reconnect pending", () => {
    const { client, sockets, timers, runTimers } = setup();
    sockets[0].drop();
    expect(timers.length).toBe(1);
    client.close();
    runTimers();
    expect(sockets.length).toBe(1);
    expect(client.status).toBe("closed");
    client.send("nope");
    expect(sockets[0].sent).toEqual([]);
  });
});
`;

export default defineTasks([
  quiz(
    "ws-choose-sse",
    ["websockets", w("http-rest")],
    1,
    60,
    ["Picking a real-time transport", "Вибір транспорту реального часу"],
    ["A dashboard only needs the server to push notifications to the browser; the browser never sends messages back. What's the simplest fit?", "Панель потребує лише того, щоб сервер надсилав сповіщення в браузер; браузер нічого не надсилає у відповідь. Що підходить найпростіше?"],
    [
      ["Server-Sent Events (`EventSource`)", "Server-Sent Events (`EventSource`)"],
      ["A WebSocket with a custom protocol", "WebSocket із власним протоколом"],
      ["Polling every 100 ms", "Опитування кожні 100 мс"],
      ["WebRTC data channels", "Канали даних WebRTC"],
    ],
    "a",
    [
      "SSE is built for one-way server → client streams: plain HTTP (so cookies, proxies and HTTP/2 just work), automatic reconnection and resuming with `Last-Event-ID`. WebSockets add value when the client also sends frequent messages. Very fast polling wastes requests, and WebRTC is for peer-to-peer media and data.",
      "SSE створено для однобічних потоків сервер → клієнт: звичайний HTTP (тож cookie, проксі й HTTP/2 просто працюють), автоматичне перепідключення й продовження з `Last-Event-ID`. WebSocket має сенс, коли клієнт теж часто надсилає повідомлення. Дуже часте опитування марнує запити, а WebRTC призначений для медіа й даних між учасниками напряму.",
    ],
  ),
  quiz(
    "ws-handshake",
    ["websockets"],
    2,
    60,
    ["The WebSocket handshake", "Рукостискання WebSocket"],
    ["How does a WebSocket connection start?", "Як починається з'єднання WebSocket?"],
    [
      ["As an HTTP request with `Upgrade: websocket`; the server answers `101 Switching Protocols` and the connection then carries WebSocket frames", "Як HTTP-запит з `Upgrade: websocket`; сервер відповідає `101 Switching Protocols`, і далі з'єднання передає кадри WebSocket"],
      ["Over UDP, without any HTTP", "Через UDP, без жодного HTTP"],
      ["With a `POST /websocket` request that returns `200` and a stream", "Запитом `POST /websocket`, що повертає `200` і потік"],
      ["Through a service worker that proxies messages", "Через service worker, що проксіює повідомлення"],
    ],
    "a",
    [
      "WebSockets reuse HTTP for the opening handshake, so they work on ports 80/443 through most infrastructure. After `101 Switching Protocols`, the same TCP connection carries framed messages in both directions. Use `wss://` (over TLS) in production.",
      "WebSocket використовує HTTP для початкового рукостискання, тож працює на портах 80/443 крізь більшість інфраструктури. Після `101 Switching Protocols` те саме TCP-з'єднання передає повідомлення кадрами в обох напрямках. У продакшені використовуйте `wss://` (поверх TLS).",
    ],
  ),
  quiz(
    "ws-thundering-herd",
    ["websockets", w("system-design")],
    3,
    90,
    ["Reconnecting after an outage", "Перепідключення після збою"],
    ["After a 30-second server outage, 50,000 clients that all retry every 1 second overload the server as it comes back. What helps most?", "Після 30-секундного збою сервера 50 000 клієнтів, що повторюють спробу щосекунди, перевантажують сервер, щойно він піднімається. Що допоможе найбільше?"],
    [
      ["Exponential backoff with random jitter, capped at a maximum delay", "Експоненційне наростання затримки з випадковим розкидом і верхньою межею"],
      ["Retry every 100 ms so clients reconnect sooner", "Повторювати кожні 100 мс, щоб клієнти підключалися швидше"],
      ["Never reconnect automatically", "Ніколи не перепідключатися автоматично"],
      ["Open two sockets per client", "Відкривати по два сокети на клієнта"],
    ],
    "a",
    [
      "Fixed intervals synchronise clients, so they all hit the server at the same instants (a thundering herd). Doubling the delay after each failure reduces the load, and jitter spreads clients out in time. A cap keeps the delay reasonable. Reset the backoff after a successful connection.",
      "Фіксовані інтервали синхронізують клієнтів, тож вони всі звертаються до сервера в ті самі миті (thundering herd). Подвоєння затримки після кожної невдачі зменшує навантаження, а випадковий розкид розносить клієнтів у часі. Верхня межа тримає затримку розумною. Скидайте наростання після успішного з'єднання.",
    ],
  ),
  quiz(
    "ws-origin-check",
    ["websockets", w("web-security")],
    3,
    120,
    ["Cross-site WebSocket hijacking", "Міжсайтове перехоплення WebSocket"],
    ["The chat server authenticates WebSocket connections with the session cookie and nothing else. A malicious page opens `new WebSocket(\"wss://chat.example.com\")`. What happens, and what's the fix?", "Сервер чату автентифікує з'єднання WebSocket лише за сесійним cookie. Шкідлива сторінка відкриває `new WebSocket(\"wss://chat.example.com\")`. Що станеться і як виправити?"],
    [
      ["The browser sends the cookie and the attacker's page can read and send messages as the user; check the `Origin` header during the handshake", "Браузер надсилає cookie, і сторінка зловмисника може читати й надсилати повідомлення від імені користувача; перевіряйте заголовок `Origin` під час рукостискання"],
      ["CORS blocks the connection automatically", "CORS автоматично блокує з'єднання"],
      ["The connection fails because cookies are never sent with WebSockets", "З'єднання не вдається, бо cookie ніколи не надсилаються з WebSocket"],
      ["Nothing, because `wss://` is encrypted", "Нічого, бо `wss://` зашифрований"],
    ],
    "a",
    [
      "The same-origin policy and CORS don't apply to WebSockets, and cookies for the target site are attached to the handshake (subject to `SameSite`). Without an `Origin` allow-list, any site can open an authenticated socket. Check `Origin`, use `SameSite` cookies or a short-lived token, and authorise every action. TLS protects the transport, not against this.",
      "Політика одного джерела й CORS не застосовуються до WebSocket, а cookie цільового сайту додаються до рукостискання (з урахуванням `SameSite`). Без білого списку `Origin` будь-який сайт може відкрити автентифікований сокет. Перевіряйте `Origin`, використовуйте cookie з `SameSite` чи короткоживучий токен і авторизуйте кожну дію. TLS захищає канал, але не від цього.",
    ],
  ),
  quiz(
    "ws-duplicates-after-reconnect",
    ["websockets", w("system-design")],
    4,
    120,
    ["Missing and duplicate messages", "Пропущені й повторені повідомлення"],
    ["After reconnecting, the chat sometimes shows a message twice and sometimes misses one sent during the outage. What's the robust design?", "Після перепідключення чат іноді показує повідомлення двічі, а іноді пропускає надіслане під час збою. Який дизайн надійний?"],
    [
      ["Give messages unique IDs or sequence numbers; on reconnect, request everything after the last seen sequence and drop duplicates by ID", "Давати повідомленням унікальні ID чи порядкові номери; після перепідключення запитувати все після останнього побаченого номера й відкидати дублікати за ID"],
      ["Increase the TCP buffer size", "Збільшити розмір TCP-буфера"],
      ["Reload the page after every reconnect", "Перезавантажувати сторінку після кожного перепідключення"],
      ["Send every message twice", "Надсилати кожне повідомлення двічі"],
    ],
    "a",
    [
      "A single connection is ordered, but a reconnect is a new connection: messages can be lost in between, and a client that retries a send can deliver it twice. Sequence numbers let the client ask \"what did I miss since #1042?\", and IDs make applying a message idempotent. Optimistic sends should carry a client-generated ID so the server echo can be matched.",
      "Одне з'єднання впорядковане, але перепідключення є новим з'єднанням: повідомлення можуть загубитися між ними, а клієнт, що повторює надсилання, може доставити його двічі. Порядкові номери дають клієнту спитати «що я пропустив після №1042?», а ID роблять застосування повідомлення ідемпотентним. Оптимістичні надсилання мають нести ID, згенерований клієнтом, щоб зіставити відповідь сервера.",
    ],
  ),
  quiz(
    "ws-scaling-pubsub",
    ["websockets", w("system-design")],
    4,
    120,
    ["Scaling to several servers", "Масштабування на кілька серверів"],
    ["The chat runs behind a load balancer on 4 servers. Users connected to server A don't see messages posted by users on server B. What's missing?", "Чат працює за балансувальником на 4 серверах. Користувачі, підключені до сервера A, не бачать повідомлень користувачів із сервера B. Чого бракує?"],
    [
      ["A shared pub/sub layer (e.g. Redis, NATS, Kafka) so each server publishes messages and every server forwards them to its own clients", "Спільного шару pub/sub (наприклад, Redis, NATS, Kafka), щоб кожен сервер публікував повідомлення, а всі сервери пересилали їх своїм клієнтам"],
      ["Sticky sessions alone", "Лише «липких» сесій"],
      ["A larger server instead of four", "Одного більшого сервера замість чотирьох"],
      ["HTTP/2", "HTTP/2"],
    ],
    "a",
    [
      "Each WebSocket lives on one server process, which only knows its own connections. A message bus fans messages out across servers. Sticky sessions keep a client on the same server but don't share messages between servers; a single bigger server only postpones the problem.",
      "Кожен WebSocket живе в одному серверному процесі, який знає лише власні з'єднання. Шина повідомлень розсилає повідомлення між серверами. «Липкі» сесії тримають клієнта на тому самому сервері, але не діляться повідомленнями між серверами; один більший сервер лише відкладає проблему.",
    ],
  ),
  practice({
    slug: "ws-reconnecting-client",
    skills: ["websockets", w("async-javascript"), w("typescript")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["A reconnecting WebSocket client", "Клієнт WebSocket із перепідключенням"],
    prompt: [
      "Wrap a WebSocket-like object in `src/socket.ts` so the app survives dropped connections. `createReconnectingSocket(url, options)` must:\n\n- Connect immediately with `options.createSocket(url)`. `status` is `\"connecting\"`, `\"open\"` or `\"closed\"`.\n- `send(data)`: send right away when open; otherwise **queue** it and flush the queue, in order, as soon as a socket opens.\n- `onMessage(listener)` delivers incoming `data` and returns an unsubscribe function (listeners survive reconnects).\n- When the connection closes unexpectedly, reconnect after `min(maxDelay, baseDelay × 2^attempt) × (0.5 + random() / 2)` ms (exponential backoff with jitter), scheduled with `options.schedule`. A successful open resets the attempt count.\n- `close()` closes the socket, clears the queue, and stops all reconnecting, even if a reconnect is already scheduled.\n\nTests use fake sockets and timers, so nothing touches the network.",
      "Обгорніть об'єкт, схожий на WebSocket, у `src/socket.ts`, щоб застосунок переживав обриви з'єднання. `createReconnectingSocket(url, options)` має:\n\n- Одразу підключатися через `options.createSocket(url)`. `status` дорівнює `\"connecting\"`, `\"open\"` або `\"closed\"`.\n- `send(data)`: надсилати одразу, коли з'єднання відкрите; інакше **ставити в чергу** й надсилати чергу по порядку, щойно сокет відкриється.\n- `onMessage(listener)` передає вхідні `data` й повертає функцію відписки (слухачі переживають перепідключення).\n- Коли з'єднання несподівано закривається, перепідключатися через `min(maxDelay, baseDelay × 2^attempt) × (0.5 + random() / 2)` мс (експоненційне наростання з розкидом), плануючи це через `options.schedule`. Успішне відкриття скидає лічильник спроб.\n- `close()` закриває сокет, очищає чергу й зупиняє всі перепідключення, навіть якщо одне вже заплановано.\n\nТести використовують фейкові сокети й таймери, тож мережа не задіяна.",
    ],
    files: { "/src/socket.ts": SOCKET_STARTER, "/index.ts": SOCKET_INDEX },
    visibleFiles: ["/src/socket.ts", "/index.ts"],
    activeFile: "/src/socket.ts",
    tests: SOCKET_TESTS,
    solution: { "/src/socket.ts": SOCKET_SOLUTION },
    explanation: [
      "The wrapper owns the lifecycle: `connect()` creates a socket and wires its handlers, `onclose` decides whether to reconnect, and `onopen` resets the backoff and drains the queue. A `closedByUser` flag distinguishes intentional closes from drops and is checked again when a scheduled reconnect fires. Injecting `createSocket`, `schedule` and `random` makes timing deterministic and testable.",
      "Обгортка керує життєвим циклом: `connect()` створює сокет і під'єднує обробники, `onclose` вирішує, чи перепідключатися, а `onopen` скидає наростання затримки й спорожнює чергу. Прапорець `closedByUser` відрізняє навмисне закриття від обриву й перевіряється ще раз, коли спрацьовує заплановане перепідключення. Впровадження `createSocket`, `schedule` і `random` робить таймінг детермінованим і тестованим.",
    ],
  }),
]);
