import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const LOOP_STARTER = code`export type FixedLoopOptions = {
  stepMs: number;
  update: (stepMs: number) => void;
  /** Longest frame that is counted, so a tab that was in the background doesn't run hundreds of steps at once. */
  maxFrameMs?: number;
};

/** Runs update() in fixed steps no matter how long each frame took. */
export function createFixedLoop({ stepMs, update, maxFrameMs = 250 }: FixedLoopOptions) {
  return {
    /** Adds the real time that passed and runs update() for every whole step that fits. Returns how many ran. */
    advance(frameMs: number): number {
      return 0; // TODO
    },
    /** How far into the next step we are, from 0 up to (not including) 1. Useful for smooth rendering. */
    alpha(): number {
      return 0; // TODO
    },
  };
}
`;

const LOOP_SOLUTION = code`export type FixedLoopOptions = {
  stepMs: number;
  update: (stepMs: number) => void;
  maxFrameMs?: number;
};

export function createFixedLoop({ stepMs, update, maxFrameMs = 250 }: FixedLoopOptions) {
  let accumulator = 0;
  return {
    advance(frameMs: number): number {
      accumulator += Math.min(Math.max(frameMs, 0), maxFrameMs);
      let steps = 0;
      while (accumulator >= stepMs) {
        update(stepMs);
        accumulator -= stepMs;
        steps++;
      }
      return steps;
    },
    alpha(): number {
      return accumulator / stepMs;
    },
  };
}
`;

const LOOP_INDEX = code`import "./styles.css";
import { createFixedLoop } from "./src/loop";

let x = 0;
const loop = createFixedLoop({ stepMs: 10, update: () => (x += 1) });
loop.advance(25);
document.getElementById("app")!.innerHTML = '<h1>Fixed step</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = "steps: " + x + ", alpha: " + loop.alpha().toFixed(2);
`;

const LOOP_TESTS = code`import { describe, it, expect } from "./test-kit";
import { createFixedLoop } from "../src/loop";

function setup(extra = {}) {
  const steps = [];
  const loop = createFixedLoop({ stepMs: 10, update: (dt) => steps.push(dt), ...extra });
  return { loop, steps };
}

describe("createFixedLoop", () => {
  it("runs one update per whole step and reports how many ran", () => {
    const { loop, steps } = setup();
    expect(loop.advance(25)).toBe(2);
    expect(steps).toEqual([10, 10]);
  });
  it("keeps the leftover time for the next frame", () => {
    const { loop, steps } = setup();
    loop.advance(4);
    loop.advance(4);
    expect(steps.length).toBe(0);
    expect(loop.advance(4)).toBe(1);
    expect(loop.alpha()).toBeCloseTo(0.2);
  });
  it("reports alpha between 0 and 1 for interpolation", () => {
    const { loop } = setup();
    loop.advance(16);
    expect(loop.alpha()).toBeCloseTo(0.6);
    expect(loop.alpha()).toBeGreaterThanOrEqual(0);
    expect(loop.alpha()).toBeLessThan(1);
  });
  it("caps very long frames", () => {
    const { loop, steps } = setup();
    expect(loop.advance(10000)).toBe(25);
    expect(steps.length).toBe(25);
  });
  it("ignores zero and negative frame times", () => {
    const { loop } = setup();
    expect(loop.advance(0)).toBe(0);
    expect(loop.advance(-50)).toBe(0);
  });
  it("gives the same number of steps for the same total time, however it is split", () => {
    const fine = setup();
    const coarse = setup();
    for (let i = 0; i < 100; i++) fine.loop.advance(1);
    coarse.loop.advance(100);
    expect(fine.steps.length).toBe(coarse.steps.length);
  });
});
`;

const ANIM_QUIZ_PROMPT: [string, string] = [
  "Why do games and physics engines run their updates in fixed time steps instead of using the raw frame time?",
  "Чому ігри й фізичні рушії виконують оновлення з фіксованим кроком часу, а не з сирим часом кадру?",
];

export default defineTasks([
  quiz(
    "anim-fixed-step-reason",
    ["animations", w("web-performance", 0.3)],
    2,
    75,
    ["Why fixed time steps", "Навіщо фіксовані кроки часу"],
    ANIM_QUIZ_PROMPT,
    [
      ["Frame times vary, and results that depend on them change with the frame rate and become unstable; a fixed step gives the same result on any device", "Часи кадрів різні, а результати, що від них залежать, змінюються разом із частотою кадрів і стають нестабільними; фіксований крок дає той самий результат на будь-якому пристрої"],
      ["Fixed steps make the GPU draw faster", "Фіксовані кроки змушують GPU малювати швидше"],
      ["Browsers forbid reading the frame time", "Браузери забороняють читати час кадру"],
      ["Raw frame times can't be stored as numbers", "Сирі часи кадрів не можна зберегти як числа"],
    ],
    "a",
    [
      "If position changes by `speed * frameTime`, a slow device moves things in bigger jumps and can tunnel through walls, and two machines disagree about what happened. Advancing in fixed steps and rendering the in-between state (the `alpha` factor) keeps simulation identical everywhere while still looking smooth.",
      "Якщо позиція змінюється на `швидкість * час_кадру`, на повільному пристрої об'єкти стрибають більшими кроками і можуть пройти крізь стіну, а дві машини по-різному описують одну й ту саму подію. Просування фіксованими кроками і малювання проміжного стану (коефіцієнт `alpha`) тримають симуляцію однаковою всюди і при цьому плавною.",
    ],
  ),
  practice({
    slug: "anim-fixed-timestep",
    skills: ["animations", w("web-performance"), w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["A fixed-timestep animation loop", "Цикл анімації з фіксованим кроком"],
    prompt: [
      "A game or physics animation must behave the same on a 60 Hz laptop and a 144 Hz monitor, so it can't simply multiply by the frame time. Implement `createFixedLoop({ stepMs, update, maxFrameMs = 250 })` in `src/loop.ts`:\n\n- `advance(frameMs)` adds the time that passed and calls `update(stepMs)` once for every whole step that fits, returning how many ran. Leftover time carries over to the next frame.\n- A frame longer than `maxFrameMs` counts only up to that cap, so a tab returning from the background doesn't run hundreds of steps at once. Zero or negative time adds nothing.\n- `alpha()` is the fraction of the next step already elapsed, from 0 up to (not including) 1, which renders can use to interpolate.",
      "Гра або фізична анімація мають поводитися однаково на ноутбуці з 60 Гц і на моніторі зі 144 Гц, тож не можна просто множити на час кадру. Реалізуйте `createFixedLoop({ stepMs, update, maxFrameMs = 250 })` у `src/loop.ts`:\n\n- `advance(frameMs)` додає час, що минув, і викликає `update(stepMs)` по одному разу для кожного повного кроку, що вміщується, повертаючи їхню кількість. Залишок часу переходить до наступного кадру.\n- Кадр довший за `maxFrameMs` враховується лише до цього обмеження, тож вкладка, що повертається з фону, не виконує сотні кроків одразу. Нульовий або від'ємний час нічого не додає.\n- `alpha()` — частка наступного кроку, що вже минула, від 0 до (не включно) 1; рендер може використати її для інтерполяції.",
    ],
    files: {
      "/src/loop.ts": LOOP_STARTER,
      "/index.ts": LOOP_INDEX,
    },
    visibleFiles: ["/src/loop.ts"],
    activeFile: "/src/loop.ts",
    tests: LOOP_TESTS,
    solution: { "/src/loop.ts": LOOP_SOLUTION },
    explanation: [
      "The accumulator is the whole trick: real time goes in, whole steps come out, and the remainder waits for the next frame. Because the simulation only ever advances in `stepMs` increments, the result depends on how much time has passed, not on how it was split into frames. The cap guards against the \"spiral of death\", where a slow frame causes many steps, which makes the next frame even slower. Rendering with `alpha` interpolates between the last two simulation states, which hides the difference between step size and display refresh.",
      "Акумулятор — це весь трюк: реальний час заходить, повні кроки виходять, а залишок чекає наступного кадру. Оскільки симуляція просувається лише кроками по `stepMs`, результат залежить від того, скільки часу минуло, а не від того, як він розбитий на кадри. Обмеження захищає від «спіралі смерті», коли повільний кадр породжує багато кроків, і це робить наступний кадр ще повільнішим. Рендер з `alpha` інтерполює між двома останніми станами симуляції, що приховує різницю між розміром кроку і частотою оновлення екрана.",
    ],
  }),
]);
