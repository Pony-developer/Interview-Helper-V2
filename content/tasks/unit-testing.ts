import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "test-missing-await",
    ["unit-testing", w("async-javascript")],
    2,
    90,
    ["A test that always passes", "Тест, що завжди проходить"],
    ["This test passes even when `loadUser` rejects. Why?", "Цей тест проходить, навіть коли `loadUser` відхиляється. Чому?"],
    [
      ["The promise isn't awaited or returned, so the test finishes before the assertion runs", "Проміс не очікується й не повертається, тож тест завершується раніше за перевірку"],
      ["`expect` doesn't work inside `.then`", "`expect` не працює всередині `.then`"],
      ["Rejected promises are ignored by test runners", "Тестові раннери ігнорують відхилені проміси"],
      ["`toEqual` always passes for objects", "`toEqual` завжди проходить для об'єктів"],
    ],
    "a",
    [
      "The test function returns synchronously, the runner marks it as passed, and the assertion (or rejection) happens later. Use `async` + `await`, return the promise, or `await expect(p).resolves/rejects`.",
      "Тестова функція повертається синхронно, раннер позначає її пройденою, а перевірка (чи відхилення) відбувається пізніше. Використайте `async` + `await`, поверніть проміс або `await expect(p).resolves/rejects`.",
    ],
    { code: "it(\"loads the user\", () => {\n  loadUser(1).then((user) => {\n    expect(user).toEqual({ id: 1, name: \"Ada\" });\n  });\n});", codeLanguage: "ts" },
  ),
  quiz(
    "test-doubles",
    ["unit-testing"],
    2,
    90,
    ["Mocks, stubs and fakes", "Моки, стаби й фейки"],
    ["You replace the database with an in-memory `Map`-based repository that really stores and returns data. What kind of test double is that?", "Ви замінюєте базу даних репозиторієм у пам'яті на основі `Map`, що справді зберігає й повертає дані. Що це за тестовий дублер?"],
    [
      ["A stub", "Stub (заглушка)"],
      ["A spy", "Spy (шпигун)"],
      ["A fake", "Fake (фейк)"],
      ["A fixture", "Fixture (фікстура)"],
    ],
    "c",
    [
      "A fake has a working (simplified) implementation. A stub only returns canned answers, a spy/mock records calls for assertions, and fixtures are prepared test data.",
      "Фейк має робочу (спрощену) реалізацію. Стаб лише повертає заготовлені відповіді, spy/mock записує виклики для перевірок, а фікстури є підготовленими тестовими даними.",
    ],
  ),
  quiz(
    "test-query-priority",
    ["unit-testing", w("web-accessibility")],
    2,
    90,
    ["Choosing queries", "Вибір запитів"],
    ["In Testing Library, which query best reflects how a user finds the submit button?", "Який запит у Testing Library найкраще відображає, як користувач знаходить кнопку надсилання?"],
    [
      ["`getByRole(\"button\", { name: \"Submit\" })`", "`getByRole(\"button\", { name: \"Submit\" })`"],
      ["`container.querySelector(\".btn-primary\")`", "`container.querySelector(\".btn-primary\")`"],
      ["`getByTestId(\"submit\")`", "`getByTestId(\"submit\")`"],
      ["`getAllByTagName(\"button\")[2]`", "`getAllByTagName(\"button\")[2]`"],
    ],
    "a",
    [
      "Role + accessible name is how users and assistive technology perceive the UI, and it survives refactors of classes and structure. Test IDs are a fallback, and class or position selectors couple tests to implementation details.",
      "Роль + доступне ім'я відповідають тому, як інтерфейс сприймають користувачі й допоміжні технології, і це переживає рефакторинг класів і структури. Test ID є запасним варіантом, а селектори за класами чи позицією прив'язують тести до деталей реалізації.",
    ],
  ),
  quiz(
    "test-fake-timers",
    ["unit-testing"],
    3,
    120,
    ["Testing time-based code", "Тестування коду, що залежить від часу"],
    ["How should you test a function that retries after 30 seconds?", "Як тестувати функцію, що повторює спробу через 30 секунд?"],
    [
      ["Use fake timers and advance time programmatically", "Використати фейкові таймери й просувати час програмно"],
      ["Wait 30 real seconds in the test", "Чекати 30 справжніх секунд у тесті"],
      ["Skip the test in CI", "Пропускати тест у CI"],
      ["Set the test timeout to 60 seconds", "Встановити тайм-аут тесту на 60 секунд"],
    ],
    "a",
    [
      "Fake timers (`vi.useFakeTimers()` + `vi.advanceTimersByTime(30_000)`) make time-dependent tests instant and deterministic. Alternatively, inject the delay or a scheduler into the function.",
      "Фейкові таймери (`vi.useFakeTimers()` + `vi.advanceTimersByTime(30_000)`) роблять тести, що залежать від часу, миттєвими й детермінованими. Як варіант, впровадьте затримку чи планувальник у функцію.",
    ],
  ),
  quiz(
    "test-coverage-meaning",
    ["unit-testing"],
    4,
    120,
    ["What coverage tells you", "Що показує покриття"],
    ["A module has 100% line coverage. What can you conclude?", "Модуль має 100% покриття рядків. Який висновок можна зробити?"],
    [
      ["Every line ran during tests, but not that the behaviour was asserted correctly", "Кожен рядок виконувався під час тестів, але це не означає, що поведінку перевірено правильно"],
      ["The module has no bugs", "У модулі немає помилок"],
      ["Every branch and edge case is tested", "Кожну гілку й граничний випадок протестовано"],
      ["The tests are fast", "Тести швидкі"],
    ],
    "a",
    [
      "Coverage measures execution, not verification: a test without assertions still covers lines. Branch coverage, mutation testing and thoughtful edge cases say more about test quality.",
      "Покриття вимірює виконання, а не перевірку: тест без перевірок усе одно покриває рядки. Покриття гілок, мутаційне тестування й продумані граничні випадки більше говорять про якість тестів.",
    ],
  ),
  practice({
    slug: "test-injectable-reminders",
    skills: ["unit-testing", w("typescript")],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Design for testability", "Проєктування для тестованості"],
    prompt: [
      "Implement `sendReminders(users, deps)` so it can be tested without real time or email:\n\n- `deps` provides `now(): number` (ms) and `send(email, message): Promise<void>`.\n- Send `\"We miss you!\"` to every user whose `lastActiveAt` is **more than 30 days** before `now()` and who hasn't opted out (`optOut: true`).\n- Send them **sequentially**, in input order.\n- If one `send` fails, continue with the rest.\n- Resolve with `{ sent: string[], failed: string[] }` (emails).\n\nThe tests use mocks for `send` and a fixed clock.",
      "Реалізуйте `sendReminders(users, deps)` так, щоб її можна було тестувати без справжнього часу й пошти:\n\n- `deps` надає `now(): number` (мс) і `send(email, message): Promise<void>`.\n- Надішліть `\"We miss you!\"` кожному користувачу, чий `lastActiveAt` **більш ніж на 30 днів** раніший за `now()` і хто не відмовився від розсилки (`optOut: true`).\n- Надсилайте **послідовно**, в порядку вхідних даних.\n- Якщо один `send` падає, продовжуйте з рештою.\n- Поверніть `{ sent: string[], failed: string[] }` (адреси).\n\nТести використовують моки для `send` і фіксований годинник.",
    ],
    files: {
      "/src/reminders.ts": "export type User = { email: string; lastActiveAt: number; optOut?: boolean };\nexport type Deps = { now: () => number; send: (email: string, message: string) => Promise<void> };\n\nexport const DAY = 24 * 60 * 60 * 1000;\n\nexport async function sendReminders(users: User[], deps: Deps): Promise<{ sent: string[]; failed: string[] }> {\n  // TODO\n  return { sent: [], failed: [] };\n}\n",
      "/index.ts": 'import "./styles.css";\nimport { DAY, sendReminders } from "./src/reminders";\n\nconst now = Date.now();\nconst users = [\n  { email: "ada@example.com", lastActiveAt: now - 45 * DAY },\n  { email: "linus@example.com", lastActiveAt: now - 2 * DAY },\n  { email: "grace@example.com", lastActiveAt: now - 90 * DAY, optOut: true },\n];\nconst outbox: string[] = [];\nsendReminders(users, { now: () => now, send: async (email) => { outbox.push(email); } }).then((r) => {\n  document.getElementById("app")!.innerHTML = `<h1>Reminders</h1><p>Sent: <output id="sent">${r.sent.join(", ") || "none"}</output></p>`;\n});\n',
    },
    visibleFiles: ["/src/reminders.ts", "/index.ts"],
    activeFile: "/src/reminders.ts",
    tests: 'import { describe, it, expect, fn, screen } from "./test-kit";\nimport { DAY, sendReminders } from "../src/reminders";\n\nconst NOW = 1_000 * DAY;\nconst users = [\n  { email: "old@x.com", lastActiveAt: NOW - 31 * DAY },\n  { email: "recent@x.com", lastActiveAt: NOW - 29 * DAY },\n  { email: "edge@x.com", lastActiveAt: NOW - 30 * DAY },\n  { email: "optout@x.com", lastActiveAt: NOW - 100 * DAY, optOut: true },\n  { email: "older@x.com", lastActiveAt: NOW - 400 * DAY },\n];\n\ndescribe("sendReminders", () => {\n  it("sends only to users inactive for more than 30 days who did not opt out", async () => {\n    const send = fn(async () => {});\n    const result = await sendReminders(users, { now: () => NOW, send });\n    expect(result).toEqual({ sent: ["old@x.com", "older@x.com"], failed: [] });\n    expect(send).toHaveBeenCalledWith("old@x.com", "We miss you!");\n    expect(send).toHaveBeenCalledTimes(2);\n  });\n  it("uses the injected clock", async () => {\n    const send = fn(async () => {});\n    await sendReminders(users, { now: () => NOW - 10 * DAY, send });\n    expect(send.mock.calls.map((c) => c[0])).toEqual(["older@x.com"]);\n  });\n  it("sends sequentially, in order", async () => {\n    let active = 0;\n    let peak = 0;\n    const order: string[] = [];\n    const send = fn(async (email: string) => {\n      active++;\n      peak = Math.max(peak, active);\n      await new Promise((r) => setTimeout(r, 5));\n      order.push(email);\n      active--;\n    });\n    await sendReminders(users, { now: () => NOW, send });\n    expect(peak).toBe(1);\n    expect(order).toEqual(["old@x.com", "older@x.com"]);\n  });\n  it("continues after a failure and reports it", async () => {\n    const send = fn(async (email: string) => {\n      if (email === "old@x.com") throw new Error("SMTP down");\n    });\n    const result = await sendReminders(users, { now: () => NOW, send });\n    expect(result).toEqual({ sent: ["older@x.com"], failed: ["old@x.com"] });\n  });\n  it("renders the demo", async () => {\n    expect(await screen.findByText("ada@example.com")).toBeInTheDocument();\n  });\n});\n',
    solution: {
      "/src/reminders.ts": "export type User = { email: string; lastActiveAt: number; optOut?: boolean };\nexport type Deps = { now: () => number; send: (email: string, message: string) => Promise<void> };\n\nexport const DAY = 24 * 60 * 60 * 1000;\n\nexport async function sendReminders(users: User[], deps: Deps): Promise<{ sent: string[]; failed: string[] }> {\n  const cutoff = deps.now() - 30 * DAY;\n  const sent: string[] = [];\n  const failed: string[] = [];\n\n  for (const user of users) {\n    if (user.optOut || user.lastActiveAt >= cutoff) continue;\n    try {\n      await deps.send(user.email, \"We miss you!\");\n      sent.push(user.email);\n    } catch {\n      failed.push(user.email);\n    }\n  }\n  return { sent, failed };\n}\n",
    },
    explanation: [
      "Injecting `now` and `send` makes the function deterministic and observable in tests: a fixed clock pins the 30-day boundary (exactly 30 days is not \"more than\"), and a mock `send` records calls and can simulate failures. A `for…of` loop with `await` sends sequentially, and `try/catch` per user isolates failures.",
      "Впровадження `now` і `send` робить функцію детермінованою й спостережуваною в тестах: фіксований годинник закріплює межу 30 днів (рівно 30 днів не є «більше ніж»), а мок `send` записує виклики й може імітувати збої. Цикл `for…of` з `await` надсилає послідовно, а `try/catch` для кожного користувача ізолює збої.",
    ],
  }),
]);
