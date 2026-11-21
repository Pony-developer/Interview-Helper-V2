import { defineTasks } from "@/lib/content/schema";
import { practice, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const BUCKET_STARTER = code`export type BucketOptions = { capacity: number; refillPerSecond: number; now?: () => number };

/**
 * A token bucket: holds up to capacity tokens, refilled continuously at refillPerSecond.
 * A request takes tokens or is rejected. Everything is all-or-nothing.
 */
export function createTokenBucket({ capacity, refillPerSecond, now = () => Date.now() }: BucketOptions) {
  return {
    /** Whole tokens available right now. */
    available(): number {
      return 0; // TODO: refill first, then count
    },
    /** Takes n tokens if there are enough; otherwise takes nothing and returns false. */
    tryTake(n = 1): boolean {
      return true; // TODO
    },
    /** Milliseconds until n tokens are available (0 if they already are, Infinity if n exceeds capacity). */
    retryAfterMs(n = 1): number {
      return 0; // TODO
    },
  };
}
`;

const BUCKET_SOLUTION = code`export type BucketOptions = { capacity: number; refillPerSecond: number; now?: () => number };

export function createTokenBucket({ capacity, refillPerSecond, now = () => Date.now() }: BucketOptions) {
  // Tokens are fractional so slow refill rates still add up; callers only ever see whole tokens.
  let tokens = capacity;
  let last = now();

  const refill = () => {
    const t = now();
    const elapsedSeconds = (t - last) / 1000;
    if (elapsedSeconds > 0) {
      tokens = Math.min(capacity, tokens + elapsedSeconds * refillPerSecond);
      last = t;
    }
  };

  return {
    available(): number {
      refill();
      return Math.floor(tokens);
    },
    tryTake(n = 1): boolean {
      refill();
      if (n > tokens) return false; // all-or-nothing: a rejected request takes no tokens
      tokens -= n;
      return true;
    },
    retryAfterMs(n = 1): number {
      refill();
      if (n <= tokens) return 0;
      if (n > capacity) return Infinity; // the bucket can never hold that many
      return Math.ceil(((n - tokens) / refillPerSecond) * 1000);
    },
  };
}
`;

const BUCKET_INDEX = code`import "./styles.css";
import { createTokenBucket } from "./src/bucket";

const bucket = createTokenBucket({ capacity: 3, refillPerSecond: 1 });
const results = [bucket.tryTake(), bucket.tryTake(), bucket.tryTake(), bucket.tryTake()];
document.getElementById("app")!.innerHTML = '<h1>Rate limiter</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = "requests: " + JSON.stringify(results) + "\nretry after: " + bucket.retryAfterMs() + " ms";
`;

const BUCKET_TESTS = code`import { describe, it, expect } from "./test-kit";
import { createTokenBucket } from "../src/bucket";

function clocked(start = 0) {
  const clock = { t: start };
  return { clock, now: () => clock.t };
}

describe("token bucket", () => {
  it("starts full", () => {
    const { now } = clocked();
    expect(createTokenBucket({ capacity: 5, refillPerSecond: 1, now }).available()).toBe(5);
  });
  it("allows bursts up to capacity, then rejects", () => {
    const { now } = clocked();
    const bucket = createTokenBucket({ capacity: 3, refillPerSecond: 1, now });
    expect([bucket.tryTake(), bucket.tryTake(), bucket.tryTake(), bucket.tryTake()]).toEqual([true, true, true, false]);
  });
  it("refills continuously over time", () => {
    const { clock, now } = clocked();
    const bucket = createTokenBucket({ capacity: 2, refillPerSecond: 1, now });
    bucket.tryTake(2);
    expect(bucket.available()).toBe(0);
    clock.t = 1000;
    expect(bucket.available()).toBe(1);
    clock.t = 2000;
    expect(bucket.available()).toBe(2);
  });
  it("never holds more than capacity", () => {
    const { clock, now } = clocked();
    const bucket = createTokenBucket({ capacity: 4, refillPerSecond: 10, now });
    bucket.tryTake(4);
    clock.t = 60_000;
    expect(bucket.available()).toBe(4);
  });
  it("takes several tokens all-or-nothing", () => {
    const { now } = clocked();
    const bucket = createTokenBucket({ capacity: 5, refillPerSecond: 1, now });
    expect(bucket.tryTake(3)).toBe(true);
    expect(bucket.tryTake(3)).toBe(false);
    expect(bucket.available()).toBe(2);
  });
  it("refills fractionally, so slow rates still add up", () => {
    const { clock, now } = clocked();
    const bucket = createTokenBucket({ capacity: 3, refillPerSecond: 2, now });
    bucket.tryTake(3);
    clock.t = 250;
    expect(bucket.available()).toBe(0);
    clock.t = 500;
    expect(bucket.available()).toBe(1);
  });
  it("tells the caller how long to wait", () => {
    const { clock, now } = clocked();
    const bucket = createTokenBucket({ capacity: 2, refillPerSecond: 1, now });
    bucket.tryTake(2);
    expect(bucket.retryAfterMs(1)).toBe(1000);
    clock.t = 500;
    expect(bucket.retryAfterMs(1)).toBe(500);
    expect(bucket.retryAfterMs(0)).toBe(0);
    expect(bucket.retryAfterMs(3)).toBe(Infinity);
  });
});
`;

export default defineTasks([
  practice({
    slug: "sd-token-bucket",
    skills: ["system-design", w("nodejs"), w("typescript")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["A token bucket rate limiter", "Обмежувач частоти з токен-кошиком"],
    prompt: [
      "Implement a token bucket in `src/bucket.ts`, the algorithm most APIs use for rate limiting. The bucket starts full (`capacity` tokens) and refills continuously at `refillPerSecond`. Tokens never exceed `capacity`.\n\n- `tryTake(n = 1)` takes n tokens if there are enough and returns `true`; otherwise it returns `false` and takes **nothing** (all-or-nothing).\n- `available()` returns the whole tokens available right now. Refill is fractional, so with 2 tokens per second, 250 ms gives no whole token yet.\n- `retryAfterMs(n = 1)` returns how many milliseconds until n tokens are available: `0` if they already are, and `Infinity` if n is larger than the capacity.\n- The clock is injected as `now()` (milliseconds), so the tests can control time.",
      "Реалізуйте токен-кошик у `src/bucket.ts`, алгоритм, який найчастіше використовують API для обмеження частоти. Кошик починається повним (`capacity` токенів) і безперервно поповнюється зі швидкістю `refillPerSecond`. Токенів ніколи не більше за `capacity`.\n\n- `tryTake(n = 1)` бере n токенів, якщо їх вистачає, і повертає `true`; інакше повертає `false` і **не бере нічого** (усе або нічого).\n- `available()` повертає цілі токени, доступні зараз. Поповнення дробове, тож при 2 токенах на секунду за 250 мс ще немає цілого токена.\n- `retryAfterMs(n = 1)` повертає, скільки мілісекунд чекати до n токенів: `0`, якщо вони вже є, і `Infinity`, якщо n більше за ємність.\n- Годинник передається як `now()` (мілісекунди), щоб тести могли керувати часом.",
    ],
    files: {
      "/src/bucket.ts": BUCKET_STARTER,
      "/index.ts": BUCKET_INDEX,
    },
    visibleFiles: ["/src/bucket.ts"],
    activeFile: "/src/bucket.ts",
    tests: BUCKET_TESTS,
    solution: { "/src/bucket.ts": BUCKET_SOLUTION },
    explanation: [
      "The bucket refills by elapsed time instead of running a timer: on every call it adds `elapsed * refillPerSecond` tokens, capped at capacity, and records the new time. That's O(1) per request and needs no background work, which is why it's the usual choice. Keeping tokens fractional means slow rates still accumulate, and flooring only in `available()` keeps the public numbers whole. Taking tokens all-or-nothing matters for batch requests: a rejected request should not burn tokens. `retryAfterMs` gives clients a `Retry-After` value, so they back off instead of hammering the endpoint. In production the bucket usually lives in a shared store such as Redis, updated atomically, so every server enforces the same limit.",
      "Кошик поповнюється за минулим часом, без таймера: при кожному виклику він додає `elapsed * refillPerSecond` токенів, обмежених ємністю, і запам'ятовує новий час. Це O(1) на запит і не потребує фонової роботи, тому його зазвичай обирають. Дробові токени дають повільним швидкостям накопичуватися, а округлення лише в `available()` тримає публічні числа цілими. Усе-або-нічого важливо для пакетних запитів: відхилений запит не має витрачати токени. `retryAfterMs` дає клієнтам значення для `Retry-After`, тож вони відступають, а не б'ють по ендпоінту. У продакшені кошик зазвичай живе в спільному сховищі, як Redis, з атомарними оновленнями, щоб кожен сервер застосовував однаковий ліміт.",
    ],
  }),
]);
