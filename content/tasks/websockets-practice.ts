import { defineTasks } from "@/lib/content/schema";
import { practice, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const HEARTBEAT_STARTER = code`export type HeartbeatOptions = {
  intervalMs: number;
  maxMissed: number;
  send: () => void;
  onDead: () => void;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (id: unknown) => void;
};

/**
 * Keeps a connection honest: sends a ping at start and then every intervalMs. A ping that gets no
 * pong before the next tick counts as missed. After maxMissed misses the connection is declared dead.
 */
export function createHeartbeat(options: HeartbeatOptions) {
  return {
    start() {
      // TODO: send the first ping now, then on every tick
    },
    /** Call when a pong arrives: the connection is alive. */
    pong() {
      // TODO
    },
    stop() {
      // TODO: no further pings and no onDead after stop
    },
    get missed(): number {
      return 0; // TODO
    },
  };
}
`;

const HEARTBEAT_SOLUTION = code`export type HeartbeatOptions = {
  intervalMs: number;
  maxMissed: number;
  send: () => void;
  onDead: () => void;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (id: unknown) => void;
};

export function createHeartbeat({
  intervalMs,
  maxMissed,
  send,
  onDead,
  setTimer = (fn, ms) => setInterval(fn, ms),
  clearTimer = (id) => clearInterval(id as ReturnType<typeof setInterval>),
}: HeartbeatOptions) {
  let timer: unknown = null;
  let waiting = false; // a ping has been sent and no pong has come back yet
  let missed = 0;

  const stop = () => {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
  };

  const beat = () => {
    if (waiting) missed++;
    if (missed >= maxMissed) {
      stop();
      onDead();
      return;
    }
    waiting = true;
    send();
  };

  return {
    start() {
      stop();
      missed = 0;
      waiting = false;
      beat();
      timer = setTimer(beat, intervalMs);
    },
    pong() {
      waiting = false;
      missed = 0;
    },
    stop,
    get missed(): number {
      return missed;
    },
  };
}
`;

const HEARTBEAT_INDEX = code`import "./styles.css";
import { createHeartbeat } from "./src/heartbeat";

const log: string[] = [];
const heartbeat = createHeartbeat({
  intervalMs: 1000,
  maxMissed: 2,
  send: () => log.push("ping"),
  onDead: () => log.push("connection dead, reconnecting"),
});
heartbeat.start();
document.getElementById("app")!.innerHTML = '<h1>Heartbeat</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = "started: " + log.join(", ") + "\n(pongs are reported by the socket's onmessage handler)";
`;

const HEARTBEAT_TESTS = code`import { describe, it, expect } from "./test-kit";
import { createHeartbeat } from "../src/heartbeat";

// A fake timer: the test decides when the next tick happens.
function fakeTimers() {
  let fn = null;
  let active = false;
  return {
    setTimer(f) {
      fn = f;
      active = true;
      return "timer";
    },
    clearTimer() {
      active = false;
    },
    tick() {
      if (active && fn) fn();
    },
    get active() {
      return active;
    },
  };
}

function setup(maxMissed = 2) {
  const t = fakeTimers();
  const state = { pings: 0, dead: 0 };
  const hb = createHeartbeat({
    intervalMs: 1000,
    maxMissed,
    send: () => state.pings++,
    onDead: () => state.dead++,
    setTimer: t.setTimer,
    clearTimer: t.clearTimer,
  });
  return { hb, t, state };
}

describe("createHeartbeat", () => {
  it("pings at start and on every tick while pongs arrive", () => {
    const { hb, t, state } = setup();
    hb.start();
    expect(state.pings).toBe(1);
    t.tick();
    hb.pong();
    t.tick();
    hb.pong();
    expect(state.pings).toBe(3);
    expect(state.dead).toBe(0);
    expect(hb.missed).toBe(0);
  });
  it("declares the connection dead after maxMissed unanswered pings, exactly once", () => {
    const { hb, t, state } = setup(2);
    hb.start();
    t.tick();
    expect(hb.missed).toBe(1);
    expect(state.dead).toBe(0);
    t.tick();
    expect(state.dead).toBe(1);
    expect(state.pings).toBe(2);
    expect(t.active).toBe(false);
    t.tick();
    expect(state.dead).toBe(1);
  });
  it("a pong resets the count", () => {
    const { hb, t, state } = setup(3);
    hb.start();
    t.tick();
    expect(hb.missed).toBe(1);
    hb.pong();
    expect(hb.missed).toBe(0);
    t.tick();
    t.tick();
    expect(hb.missed).toBe(1);
    expect(state.dead).toBe(0);
  });
  it("stop prevents further pings and any onDead call", () => {
    const { hb, t, state } = setup(1);
    hb.start();
    hb.stop();
    for (let i = 0; i < 5; i++) t.tick();
    expect(state.pings).toBe(1);
    expect(state.dead).toBe(0);
  });
  it("starting again begins a fresh count", () => {
    const { hb, t, state } = setup(2);
    hb.start();
    t.tick();
    hb.start();
    expect(hb.missed).toBe(0);
    expect(state.pings).toBe(3);
    expect(state.dead).toBe(0);
  });
});
`;

export default defineTasks([
  practice({
    slug: "ws-heartbeat-monitor",
    skills: ["websockets", w("typescript"), w("async-javascript", 0.3)],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["A heartbeat that detects dead connections", "Серцебиття, що виявляє мертві з'єднання"],
    prompt: [
      "A WebSocket can look open while the network has silently died (a phone leaves Wi-Fi, a NAT drops the mapping), and no `close` event arrives. Implement `createHeartbeat({ intervalMs, maxMissed, send, onDead, setTimer, clearTimer })` in `src/heartbeat.ts`:\n\n- `start()` sends a ping right away, then one on every tick of `intervalMs`. Calling `start()` again restarts the count.\n- At each tick, a ping still waiting for a pong counts as **missed**. After `maxMissed` misses, call `onDead()` once and stop: no more pings, and the timer is cleared.\n- `pong()` says the connection answered: it resets the missed count and clears the wait.\n- `stop()` cancels everything, including `onDead`. `missed` reports the current count.\n- The timer functions are injected (`setTimer` and `clearTimer`, defaulting to `setInterval` and `clearInterval`), so the tests can drive time.",
      "WebSocket може виглядати відкритим, поки мережа тихо зникла (телефон вийшов з Wi-Fi, NAT скинув відповідність), і подія `close` не приходить. Реалізуйте `createHeartbeat({ intervalMs, maxMissed, send, onDead, setTimer, clearTimer })` у `src/heartbeat.ts`:\n\n- `start()` одразу надсилає ping, а потім по одному на кожен тік `intervalMs`. Повторний виклик `start()` починає підрахунок заново.\n- На кожному тіку ping, на який ще не прийшов pong, рахується як **пропущений**. Після `maxMissed` пропусків викличте `onDead()` один раз і зупиніться: більше жодних ping, а таймер очищено.\n- `pong()` каже, що з'єднання відповіло: скидає лічильник пропусків і знімає очікування.\n- `stop()` скасовує все, включно з `onDead`. `missed` повідомляє поточний лічильник.\n- Функції таймера передаються ззовні (`setTimer` і `clearTimer`, за замовчуванням `setInterval` і `clearInterval`), тож тести можуть керувати часом.",
    ],
    files: {
      "/src/heartbeat.ts": HEARTBEAT_STARTER,
      "/index.ts": HEARTBEAT_INDEX,
    },
    visibleFiles: ["/src/heartbeat.ts"],
    activeFile: "/src/heartbeat.ts",
    tests: HEARTBEAT_TESTS,
    solution: { "/src/heartbeat.ts": HEARTBEAT_SOLUTION },
    explanation: [
      "TCP can take minutes to notice a connection that has died, so the application needs its own liveness check: the heartbeat. Each ping is a question with an expected answer, and counting unanswered questions (rather than reacting to the first one) tolerates a single lost packet. The timer and the clear function are passed in, which is what makes the logic testable without real waiting: the test ticks the clock by hand and checks exactly when `onDead` fires. Clearing the timer before calling `onDead` prevents a late tick from counting again after the connection was already declared dead. In production the reaction to `onDead` is the reconnection logic (with backoff, as in the reconnecting client task).",
      "TCP може довго не помічати мертве з'єднання, тому застосунку потрібна власна перевірка живості: серцебиття. Кожен ping — це запитання з очікуваною відповіддю, і підрахунок без відповіді (а не реакція на перший пропуск) переносить втрату одного пакета. Таймер і функцію очищення передано ззовні, і саме це робить логіку придатною до тестування без реального очікування: тест вручну рухає годинник і перевіряє, коли саме спрацьовує `onDead`. Очищення таймера перед викликом `onDead` не дає запізнілому тіку зарахувати пропуск після того, як з'єднання вже визнано мертвим. У продакшені реакцією на `onDead` є логіка перепідключення (з backoff, як у задачі про reconnecting client).",
    ],
  }),
]);
