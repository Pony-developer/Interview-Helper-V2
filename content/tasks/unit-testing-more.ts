import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "test-aaa",
    ["unit-testing"],
    1,
    45,
    ["Good unit tests", "Хороші модульні тести"],
    ["Which set of properties describes a good unit test?", "Який набір властивостей описує хороший модульний тест?"],
    [
      ["Fast, isolated, deterministic, and checks one behaviour", "Швидкий, ізольований, детермінований і перевіряє одну поведінку"],
      ["Covers as many functions as possible in one test", "Покриває якомога більше функцій в одному тесті"],
      ["Talks to the real database so it is realistic", "Звертається до справжньої бази даних, щоб бути реалістичним"],
      ["Depends on the previous test's results to save time", "Залежить від результатів попереднього тесту, щоб зекономити час"],
    ],
    "a",
    [
      "Unit tests should run in milliseconds, not depend on each other or on external services, give the same result every run, and fail for exactly one reason. The Arrange–Act–Assert structure helps: set up the inputs, call the code once, then check the outcome. Real databases belong in integration tests.",
      "Модульні тести мають виконуватися за мілісекунди, не залежати один від одного чи від зовнішніх сервісів, давати той самий результат щоразу й падати рівно з однієї причини. Допомагає структура Arrange–Act–Assert: підготуйте вхідні дані, викличте код один раз, потім перевірте результат. Справжні бази даних — для інтеграційних тестів.",
    ],
  ),
  quiz(
    "test-order-dependence",
    ["unit-testing"],
    4,
    90,
    ["Passes alone, fails in the suite", "Окремо проходить, у наборі падає"],
    ["A test passes when run on its own but fails when the whole file runs. What is the most likely cause?", "Тест проходить, коли запускається окремо, але падає, коли запускається весь файл. Яка найімовірніша причина?"],
    [
      ["The test runner is out of memory", "Тест-раннеру бракує пам'яті"],
      ["Shared mutable state (a module-level variable, a mock, a fake timer or the DOM) leaks between tests", "Спільний змінний стан (змінна модуля, мок, фейковий таймер чи DOM) перетікає між тестами"],
      ["The assertion library is non-deterministic", "Бібліотека перевірок недетермінована"],
      ["Tests must be written in alphabetical order", "Тести мають бути впорядковані за алфавітом"],
    ],
    "b",
    [
      "Order-dependent failures nearly always mean an earlier test changed shared state and didn't restore it: a cached singleton, a spy that wasn't restored, fake timers left on, or leftover DOM. Create fresh state in `beforeEach`, restore mocks in `afterEach` (or enable `restoreMocks` in the config), and run tests in random order to surface hidden coupling.",
      "Падіння, залежні від порядку, майже завжди означають, що попередній тест змінив спільний стан і не відновив його: закешований синглтон, невідновлений шпигун, увімкнені фейкові таймери чи залишки DOM. Створюйте свіжий стан у `beforeEach`, відновлюйте моки в `afterEach` (або увімкніть `restoreMocks` у конфігурації) і запускайте тести у випадковому порядку, щоб виявити приховані зв'язки.",
    ],
  ),
  quiz(
    "test-mutation",
    ["unit-testing"],
    5,
    120,
    ["Mutation testing", "Мутаційне тестування"],
    ["Coverage is 100%, but mutation testing reports a surviving mutant: changing `>=` to `>` in `isAdult` didn't fail any test. What does that tell you?", "Покриття — 100%, але мутаційне тестування повідомляє про мутанта, що вижив: заміна `>=` на `>` в `isAdult` не зламала жодного тесту. Про що це свідчить?"],
    [
      ["The mutation tool has a bug, since coverage is 100%", "У мутаційному інструменті баг, бо покриття — 100%"],
      ["The line runs during tests, but no test checks the boundary (age exactly 18)", "Рядок виконується під час тестів, але жоден тест не перевіряє межу (вік рівно 18)"],
      ["`>=` and `>` are equivalent for integers", "`>=` і `>` еквівалентні для цілих чисел"],
      ["The function should be removed", "Функцію треба видалити"],
    ],
    "b",
    [
      "Coverage only proves code was executed. Mutation testing proves the tests notice when the code changes. A surviving boundary mutant means there's no assertion at the edge, so add a test for exactly 18 (and 17). Some mutants are equivalent (no behaviour change) and can be ignored, but this one isn't.",
      "Покриття доводить лише те, що код виконувався. Мутаційне тестування доводить, що тести помічають зміну коду. Мутант межі, що вижив, означає відсутність перевірки на краю, тож додайте тест рівно для 18 (і 17). Деякі мутанти еквівалентні (поведінка не змінюється), їх можна ігнорувати, але цей — ні.",
    ],
    { code: "export function isAdult(age: number) {\n  return age >= 18;\n}\n\nit(\"recognises adults\", () => {\n  expect(isAdult(30)).toBe(true);\n  expect(isAdult(5)).toBe(false);\n});" },
  ),
  practice({
    slug: "test-fake-clock",
    skills: ["unit-testing", { slug: "async-javascript", weight: 0.5 }],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Build a fake clock", "Створіть фейковий годинник"],
    prompt: [
      "Fake timers make time-based code testable without waiting. Implement `createFakeClock()`:\n\n- `now()` returns the current fake time, starting at 0.\n- `setTimeout(fn, ms)` returns an id; `clearTimeout(id)` cancels it.\n- `tick(ms)` advances time by `ms` and runs every timer that becomes due, **in order of due time** (ties in scheduling order). While a callback runs, `now()` returns that timer's due time.\n- Timers scheduled by a callback during `tick` also run if they fall within the same tick.",
      "Фейкові таймери роблять код, що залежить від часу, тестованим без очікування. Реалізуйте `createFakeClock()`:\n\n- `now()` повертає поточний фейковий час, починаючи з 0.\n- `setTimeout(fn, ms)` повертає id; `clearTimeout(id)` скасовує таймер.\n- `tick(ms)` просуває час на `ms` і запускає всі таймери, яким настав час, **у порядку часу спрацювання** (за рівності — у порядку планування). Поки виконується колбек, `now()` повертає час спрацювання цього таймера.\n- Таймери, заплановані колбеком під час `tick`, теж виконуються, якщо потрапляють у той самий tick.",
    ],
    files: {
      "/src/fake-clock.ts":
        "export type FakeClock = {\n  now(): number;\n  setTimeout(fn: () => void, ms: number): number;\n  clearTimeout(id: number): void;\n  tick(ms: number): void;\n};\n\nexport function createFakeClock(): FakeClock {\n  let time = 0;\n  // TODO: store timers and run them in tick()\n  return {\n    now: () => time,\n    setTimeout: () => 0,\n    clearTimeout: () => {},\n    tick: (ms) => {\n      time += ms;\n    },\n  };\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { createFakeClock } from "./src/fake-clock";\n\nconst clock = createFakeClock();\nconst log: string[] = [];\nclock.setTimeout(() => log.push("toast hidden at " + clock.now() + "ms"), 3000);\nclock.setTimeout(() => log.push("autosave at " + clock.now() + "ms"), 1000);\nclock.tick(5000);\ndocument.getElementById("app")!.innerHTML = "<h1>Fake clock</h1><ul>" + log.map((l) => "<li>" + l + "</li>").join("") + "</ul>";\n',
    },
    visibleFiles: ["/src/fake-clock.ts", "/index.ts"],
    activeFile: "/src/fake-clock.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { createFakeClock } from "../src/fake-clock";\n\ndescribe("createFakeClock", () => {\n  it("runs timers only when their time comes", () => {\n    const clock = createFakeClock();\n    const log: string[] = [];\n    clock.setTimeout(() => log.push("a"), 100);\n    clock.tick(99);\n    expect(log).toEqual([]);\n    clock.tick(1);\n    expect(log).toEqual(["a"]);\n    expect(clock.now()).toBe(100);\n  });\n  it("runs due timers in time order, ties in scheduling order", () => {\n    const clock = createFakeClock();\n    const log: string[] = [];\n    clock.setTimeout(() => log.push("late"), 300);\n    clock.setTimeout(() => log.push("early"), 100);\n    clock.setTimeout(() => log.push("tie-1"), 200);\n    clock.setTimeout(() => log.push("tie-2"), 200);\n    clock.tick(1000);\n    expect(log).toEqual(["early", "tie-1", "tie-2", "late"]);\n  });\n  it("reports each timer\'s due time while it runs", () => {\n    const clock = createFakeClock();\n    const seen: number[] = [];\n    clock.setTimeout(() => seen.push(clock.now()), 50);\n    clock.setTimeout(() => seen.push(clock.now()), 120);\n    clock.tick(500);\n    expect(seen).toEqual([50, 120]);\n    expect(clock.now()).toBe(500);\n  });\n  it("cancels timers", () => {\n    const clock = createFakeClock();\n    const log: string[] = [];\n    const id = clock.setTimeout(() => log.push("x"), 10);\n    clock.setTimeout(() => log.push("y"), 10);\n    clock.clearTimeout(id);\n    clock.tick(20);\n    expect(log).toEqual(["y"]);\n  });\n  it("runs timers scheduled during a tick if they fall inside it", () => {\n    const clock = createFakeClock();\n    const log: number[] = [];\n    const loop = () => {\n      log.push(clock.now());\n      clock.setTimeout(loop, 100);\n    };\n    clock.setTimeout(loop, 100);\n    clock.tick(350);\n    expect(log).toEqual([100, 200, 300]);\n    clock.tick(50);\n    expect(log).toEqual([100, 200, 300, 400]);\n  });\n  it("uses ids that never repeat", () => {\n    const clock = createFakeClock();\n    const a = clock.setTimeout(() => {}, 1);\n    const b = clock.setTimeout(() => {}, 1);\n    expect(a === b).toBe(false);\n  });\n});\n',
    solution: {
      "/src/fake-clock.ts":
        "export type FakeClock = {\n  now(): number;\n  setTimeout(fn: () => void, ms: number): number;\n  clearTimeout(id: number): void;\n  tick(ms: number): void;\n};\n\ntype Timer = { id: number; due: number; fn: () => void };\n\nexport function createFakeClock(): FakeClock {\n  let time = 0;\n  let nextId = 1;\n  let timers: Timer[] = [];\n\n  return {\n    now: () => time,\n    setTimeout(fn, ms) {\n      const id = nextId++;\n      timers.push({ id, due: time + Math.max(0, ms), fn });\n      return id;\n    },\n    clearTimeout(id) {\n      timers = timers.filter((timer) => timer.id !== id);\n    },\n    tick(ms) {\n      const end = time + ms;\n      for (;;) {\n        // Earliest due time first; ids increase, so they break ties in scheduling order.\n        let next: Timer | undefined;\n        for (const timer of timers) {\n          if (timer.due <= end && (!next || timer.due < next.due || (timer.due === next.due && timer.id < next.id))) next = timer;\n        }\n        if (!next) break;\n        const run = next;\n        timers = timers.filter((timer) => timer !== run);\n        time = run.due;\n        run.fn();\n      }\n      time = end;\n    },\n  };\n}\n",
    },
    explanation: [
      "Store each timer with an absolute due time and a monotonically increasing id. `tick` repeatedly picks the earliest due timer within the target time (the id breaks ties), sets the clock to its due time and runs it. Because the timer list is re-read on every step, timers that callbacks schedule are picked up within the same tick. This is what `vi.useFakeTimers()` and `jest.useFakeTimers()` do under the hood, using a heap for efficiency.",
      "Зберігайте кожен таймер з абсолютним часом спрацювання й монотонно зростаючим id. `tick` раз за разом обирає найраніший таймер у межах цільового часу (id розв'язує рівність), встановлює годинник на його час і запускає. Оскільки список таймерів перечитується на кожному кроці, таймери, заплановані колбеками, підхоплюються в тому самому tick. Саме це під капотом роблять `vi.useFakeTimers()` і `jest.useFakeTimers()`, використовуючи купу для ефективності.",
    ],
  }),
]);
