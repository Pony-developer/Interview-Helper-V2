import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "ts-unknown-vs-any",
    ["typescript"],
    1,
    60,
    ["unknown vs any", "unknown проти any"],
    ["What is the key difference between `unknown` and `any`?", "У чому головна різниця між `unknown` і `any`?"],
    [
      [
        "`unknown` must be narrowed before you can use it; `any` disables type checking",
        "`unknown` треба звузити перед використанням; `any` вимикає перевірку типів",
      ],
      ["`unknown` only accepts `null` and `undefined`", "`unknown` приймає лише `null` і `undefined`"],
      ["`any` is a runtime type, `unknown` is compile-time only", "`any` є типом часу виконання, а `unknown` існує лише під час компіляції"],
      ["There is no difference, they are aliases", "Різниці немає, це синоніми"],
    ],
    "a",
    [
      "Both accept any value, but `unknown` is type-safe: you can't call methods or access properties until you narrow it with `typeof`, `instanceof` or a type guard. `any` silently turns off checking and spreads.",
      "Обидва приймають будь-яке значення, але `unknown` безпечний: не можна викликати методи чи читати властивості, доки ви не звузите тип через `typeof`, `instanceof` або type guard. `any` непомітно вимикає перевірку й поширюється.",
    ],
  ),
  quiz(
    "ts-structural-typing",
    ["typescript"],
    2,
    90,
    ["Structural typing", "Структурна типізація"],
    ["Which line is a **compile error**?", "Який рядок дає **помилку компіляції**?"],
    [
      ["Line 3", "Рядок 3"],
      ["Line 4", "Рядок 4"],
      ["Both", "Обидва"],
      ["Neither", "Жоден"],
    ],
    "b",
    [
      "Line 3 assigns a variable that has extra properties, which is allowed because shapes are compatible. Line 4 assigns an object literal directly, so TypeScript runs an excess property check and rejects `z`.",
      "Рядок 3 присвоює змінну із зайвими властивостями, і це дозволено, бо форми сумісні. Рядок 4 присвоює об'єктний літерал напряму, тож TypeScript перевіряє зайві властивості й відхиляє `z`.",
    ],
    { code: "type Point = { x: number; y: number };\nconst p = { x: 1, y: 2, z: 3 };\nconst a: Point = p;                    // line 3\nconst b: Point = { x: 1, y: 2, z: 3 }; // line 4" },
  ),
  quiz(
    "ts-generic-constraint",
    ["typescript"],
    3,
    120,
    ["Generic constraint", "Обмеження дженерика"],
    ["What does `K extends keyof T` guarantee in this signature?", "Що гарантує `K extends keyof T` у цій сигнатурі?"],
    [
      ["`K` is one of the property names of `T`", "`K` є однією з назв властивостей `T`"],
      ["`T` inherits from `K`", "`T` наслідує `K`"],
      ["`K` is a string", "`K` є рядком"],
      ["`obj[key]` exists at runtime", "`obj[key]` існує під час виконання"],
    ],
    "a",
    [
      "`keyof T` is the union of T's property names, and the constraint limits `K` to that union. That's why `T[K]` is a valid, precise return type. It says nothing about runtime: an object typed as T could still miss the key.",
      "`keyof T` є об'єднанням назв властивостей T, і обмеження зводить `K` до цього об'єднання. Тому `T[K]` є коректним і точним типом результату. Про час виконання це нічого не каже: об'єкт типу T все одно може не мати ключа.",
    ],
    { code: "function get<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}" },
  ),
  quiz(
    "ts-utility-types",
    ["typescript"],
    3,
    120,
    ["Utility types", "Утилітні типи"],
    [
      "You need the type of an update payload: every field of `User` except `id`, and all of them optional. Which type expresses this?",
      "Потрібен тип для оновлення: усі поля `User`, крім `id`, і всі необов'язкові. Який тип це виражає?",
    ],
    [
      ["`Partial<Omit<User, \"id\">>`", "`Partial<Omit<User, \"id\">>`"],
      ["`Omit<Partial<User>, \"id\" | undefined>`", "`Omit<Partial<User>, \"id\" | undefined>`"],
      ["`Pick<User, \"id\">`", "`Pick<User, \"id\">`"],
      ["`Required<Omit<User, \"id\">>`", "`Required<Omit<User, \"id\">>`"],
    ],
    "a",
    [
      "`Omit<User, \"id\">` drops the key, and `Partial<…>` makes the rest optional. (`Omit<Partial<User>, \"id\">` would also work; the `| undefined` key in option B makes no sense.)",
      "`Omit<User, \"id\">` прибирає ключ, а `Partial<…>` робить решту необов'язковими. (`Omit<Partial<User>, \"id\">` теж спрацював би; ключ `| undefined` у варіанті B не має сенсу.)",
    ],
  ),
  quiz(
    "ts-exhaustive-never",
    ["typescript"],
    4,
    150,
    ["Exhaustiveness with never", "Повнота перевірки через never"],
    [
      "A new variant `{ kind: \"triangle\"; a: number }` is added to `Shape`. What happens to this function?",
      "До `Shape` додали новий варіант `{ kind: \"triangle\"; a: number }`. Що станеться з цією функцією?",
    ],
    [
      ["It returns `undefined` for triangles at runtime, silently", "Вона непомітно повертає `undefined` для трикутників під час виконання"],
      ["Compilation fails on the `never` assignment until a `triangle` case is added", "Компіляція падає на присвоєнні `never`, доки не додати випадок `triangle`"],
      ["TypeScript adds the missing case automatically", "TypeScript автоматично додасть відсутній випадок"],
      ["It throws `TypeError` when called", "Під час виклику кидається `TypeError`"],
    ],
    "b",
    [
      "In the `default` branch the type of `s` is narrowed to whatever variants remain. With all cases handled that is `never`. After adding `triangle` it is the triangle type, which is not assignable to `never`, so the compiler points you to the missing case.",
      "У гілці `default` тип `s` звужується до варіантів, що залишилися. Коли всі випадки оброблено, це `never`. Після додавання `triangle` це тип трикутника, який не можна присвоїти `never`, тож компілятор вкаже на пропущений випадок.",
    ],
    {
      code: 'type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };\n\nfunction area(s: Shape) {\n  switch (s.kind) {\n    case "circle": return Math.PI * s.r ** 2;\n    case "square": return s.s ** 2;\n    default: {\n      const unreachable: never = s;\n      return unreachable;\n    }\n  }\n}',
    },
  ),
  practice({
    slug: "ts-typed-event-emitter",
    skills: ["typescript", { slug: "javascript", weight: 0.5 }],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Typed event emitter", "Типізований емітер подій"],
    prompt: [
      "Implement `createEmitter<Events>()`, which returns `{ on, off, emit }`:\n\n- `on(event, handler)` subscribes and **returns an unsubscribe function**.\n- `off(event, handler)` removes that handler.\n- `emit(event, payload)` calls the event's handlers in subscription order. A handler that unsubscribes during `emit` must not break the loop.\n\nThe types already restrict event names and payloads. Focus on the behaviour.",
      "Реалізуйте `createEmitter<Events>()`, що повертає `{ on, off, emit }`:\n\n- `on(event, handler)` підписує й **повертає функцію відписки**.\n- `off(event, handler)` прибирає цей обробник.\n- `emit(event, payload)` викликає обробники події в порядку підписки. Обробник, який відписується під час `emit`, не повинен ламати цикл.\n\nТипи вже обмежують назви подій і дані. Зосередьтеся на поведінці.",
    ],
    files: {
      "/src/emitter.ts": "type Handler<P> = (payload: P) => void;\n\nexport function createEmitter<Events extends Record<string, unknown>>() {\n  // TODO: store handlers per event\n\n  function on<E extends keyof Events>(event: E, handler: Handler<Events[E]>): () => void {\n    return () => {};\n  }\n\n  function off<E extends keyof Events>(event: E, handler: Handler<Events[E]>): void {}\n\n  function emit<E extends keyof Events>(event: E, payload: Events[E]): void {}\n\n  return { on, off, emit };\n}\n",
      "/index.ts": 'import "./styles.css";\nimport { createEmitter } from "./src/emitter";\n\ntype Events = { message: string; count: number };\nconst bus = createEmitter<Events>();\nconst log: string[] = [];\nbus.on("message", (text) => log.push(`message: ${text}`));\nbus.on("count", (n) => log.push(`count: ${n}`));\nbus.emit("message", "hello");\nbus.emit("count", 3);\n\ndocument.getElementById("app")!.innerHTML = `<h1>Event log</h1><ul>${log.map((l) => `<li>${l}</li>`).join("")}</ul>`;\n',
    },
    visibleFiles: ["/src/emitter.ts", "/index.ts"],
    activeFile: "/src/emitter.ts",
    tests: 'import { describe, it, expect, fn, screen } from "./test-kit";\nimport { createEmitter } from "../src/emitter";\n\ntype E = { ping: number; text: string };\n\ndescribe("createEmitter", () => {\n  it("calls handlers with the payload, in order", () => {\n    const bus = createEmitter<E>();\n    const calls: string[] = [];\n    bus.on("ping", (n) => calls.push("a" + n));\n    bus.on("ping", (n) => calls.push("b" + n));\n    bus.emit("ping", 1);\n    expect(calls).toEqual(["a1", "b1"]);\n  });\n  it("only calls handlers of the emitted event", () => {\n    const bus = createEmitter<E>();\n    const h = fn();\n    bus.on("text", h);\n    bus.emit("ping", 1);\n    expect(h).toHaveBeenCalledTimes(0);\n  });\n  it("returns an unsubscribe function", () => {\n    const bus = createEmitter<E>();\n    const h = fn();\n    const stop = bus.on("ping", h);\n    stop();\n    bus.emit("ping", 1);\n    expect(h).toHaveBeenCalledTimes(0);\n  });\n  it("supports off()", () => {\n    const bus = createEmitter<E>();\n    const h = fn();\n    bus.on("ping", h);\n    bus.off("ping", h);\n    bus.emit("ping", 2);\n    expect(h).toHaveBeenCalledTimes(0);\n  });\n  it("survives a handler that unsubscribes during emit", () => {\n    const bus = createEmitter<E>();\n    const second = fn();\n    const stop = bus.on("ping", () => stop());\n    bus.on("ping", second);\n    bus.emit("ping", 1);\n    expect(second).toHaveBeenCalledTimes(1);\n  });\n  it("renders the demo log", async () => {\n    await screen.findByText("message: hello");\n    expect(screen.getAllByRole("listitem")).toHaveLength(2);\n  });\n});\n',
    solution: {
      "/src/emitter.ts": "type Handler<P> = (payload: P) => void;\n\nexport function createEmitter<Events extends Record<string, unknown>>() {\n  const handlers = new Map<keyof Events, Set<Handler<any>>>();\n\n  function on<E extends keyof Events>(event: E, handler: Handler<Events[E]>): () => void {\n    if (!handlers.has(event)) handlers.set(event, new Set());\n    handlers.get(event)!.add(handler);\n    return () => off(event, handler);\n  }\n\n  function off<E extends keyof Events>(event: E, handler: Handler<Events[E]>): void {\n    handlers.get(event)?.delete(handler);\n  }\n\n  function emit<E extends keyof Events>(event: E, payload: Events[E]): void {\n    // Copy first, so (un)subscribing during emit doesn't affect this round.\n    for (const handler of [...(handlers.get(event) ?? [])]) handler(payload);\n  }\n\n  return { on, off, emit };\n}\n",
    },
    explanation: [
      "Keep a `Map<event, Set<handler>>`. A Set preserves insertion order and makes `off` O(1). `on` returns a closure that calls `off`. In `emit`, iterate over a copy, so handlers that subscribe or unsubscribe during the loop don't skip or repeat calls.",
      "Зберігайте `Map<подія, Set<обробник>>`. Set зберігає порядок вставки й робить `off` за O(1). `on` повертає замикання, що викликає `off`. У `emit` проходьте по копії, щоб обробники, які підписуються чи відписуються під час циклу, не пропускали й не повторювали викликів.",
    ],
  }),
]);
