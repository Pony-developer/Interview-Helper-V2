import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "state-context-rerenders",
    ["state-management", { slug: "react", weight: 0.5 }],
    3,
    90,
    ["Context and re-renders", "Context і перемальовування"],
    ["An app puts `{ user, theme, cart }` into one React context. Adding an item to the cart re-renders the header avatar, which only reads `user`. Why?", "Застосунок кладе `{ user, theme, cart }` в один React-контекст. Додавання товару в кошик перемальовує аватар у заголовку, який читає лише `user`. Чому?"],
    [
      ["Every consumer of a context re-renders when the context value changes, whichever fields it reads", "Кожен споживач контексту перемальовується, коли змінюється значення контексту, незалежно від полів, які він читає"],
      ["React re-renders the whole tree on every state change", "React перемальовує все дерево при кожній зміні стану"],
      ["The avatar is missing a `key`", "Аватару бракує `key`"],
      ["Contexts can only hold primitive values", "Контексти можуть містити лише примітивні значення"],
    ],
    "a",
    [
      "`useContext` subscribes to the whole value; a new object means every consumer re-renders. Split rarely and frequently changing data into separate contexts, memoize the provider value, or use a store with selector subscriptions (Zustand, Redux, `useSyncExternalStore`) so components re-render only when their slice changes.",
      "`useContext` підписується на все значення; новий об'єкт означає перемальовування кожного споживача. Розділіть дані, що змінюються рідко й часто, на окремі контексти, мемоїзуйте значення провайдера або використайте сховище з підписками через селектори (Zustand, Redux, `useSyncExternalStore`), щоб компоненти перемальовувались лише при зміні їхнього зрізу.",
    ],
  ),
  quiz(
    "state-normalize",
    ["state-management"],
    4,
    90,
    ["Normalising state", "Нормалізація стану"],
    ["The same author object appears inside hundreds of posts in your store. Renaming the author requires updating every copy, and some get missed. What is the standard fix?", "Той самий об'єкт автора з'являється в сотнях дописів у сховищі. Перейменування автора вимагає оновити кожну копію, і деякі пропускаються. Яке стандартне виправлення?"],
    [
      ["Deep-clone the posts after every update", "Глибоко клонувати дописи після кожного оновлення"],
      ["Normalise: keep entities in lookup tables by id (`authors.byId`) and store only `authorId` in each post", "Нормалізувати: тримати сутності в таблицях за id (`authors.byId`), а в кожному дописі зберігати лише `authorId`"],
      ["Move authors to `localStorage`", "Перенести авторів у `localStorage`"],
      ["Store the posts as a JSON string", "Зберігати дописи як JSON-рядок"],
    ],
    "b",
    [
      "Normalised state stores each entity once, keyed by id, and references it by id everywhere else, like database tables. Updates touch one place, lookups are O(1), and memoized selectors join the data for the UI. Redux Toolkit's `createEntityAdapter` and query caches use this pattern.",
      "Нормалізований стан зберігає кожну сутність один раз за ключем id і посилається на неї за id всюди, як таблиці бази даних. Оновлення торкаються одного місця, пошук — O(1), а мемоїзовані селектори поєднують дані для UI. Цей шаблон використовують `createEntityAdapter` у Redux Toolkit і кеші запитів.",
    ],
  ),
  quiz(
    "state-optimistic-race",
    ["state-management", { slug: "async-javascript", weight: 0.5 }],
    5,
    120,
    ["Optimistic updates out of order", "Оптимістичні оновлення не в тому порядку"],
    ["A \"like\" button updates the UI optimistically and sends a request on each click. A user clicks like → unlike quickly; the responses arrive in reverse order, and the UI ends up showing \"liked\". What is the robust fix?", "Кнопка «подобається» оптимістично оновлює UI і надсилає запит на кожен клік. Користувач швидко клікає «подобається» → «не подобається»; відповіді приходять у зворотному порядку, і UI показує «подобається». Яке надійне виправлення?"],
    [
      ["Disable optimistic updates", "Вимкнути оптимістичні оновлення"],
      ["Apply a server response only if it belongs to the latest request for that item (sequence number or abort earlier requests), and roll back on failure", "Застосовувати відповідь сервера, лише якщо вона належить до останнього запиту для цього елемента (порядковий номер або скасування попередніх запитів), і відкочувати при помилці"],
      ["Add a 500 ms debounce", "Додати debounce на 500 мс"],
      ["Always apply responses in the order they arrive", "Завжди застосовувати відповіді в порядку надходження"],
    ],
    "b",
    [
      "Responses can arrive in any order, so tag each mutation (a counter per item) and ignore responses from superseded requests, or cancel them with `AbortController`. On failure, roll back only if the failed request is still the latest. Debouncing makes the race less likely but doesn't eliminate it. Libraries such as TanStack Query provide `onMutate`/rollback helpers for this.",
      "Відповіді можуть надходити в будь-якому порядку, тож позначайте кожну мутацію (лічильник для кожного елемента) і ігноруйте відповіді від замінених запитів або скасовуйте їх через `AbortController`. При помилці відкочуйте лише тоді, коли невдалий запит досі останній. Debounce робить гонку менш імовірною, але не усуває її. Бібліотеки на кшталт TanStack Query мають для цього `onMutate` і засоби відкату.",
    ],
  ),
  practice({
    slug: "state-create-store",
    skills: ["state-management"],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["A tiny store with selectors", "Крихітне сховище із селекторами"],
    prompt: [
      "Implement `createStore(reducer, initialState)`, a minimal Redux-style store:\n\n- `getState()` returns the current state.\n- `dispatch(action)` computes the next state with the reducer. If the reducer returns the **same** state object, nothing is notified.\n- `subscribe(listener)` calls `listener(state)` after each change and returns an unsubscribe function.\n- `select(selector, listener)` calls `listener(value)` only when the selected value changes (`Object.is`), and also returns an unsubscribe function.\n- A listener that unsubscribes during notification must not break the other listeners.",
      "Реалізуйте `createStore(reducer, initialState)` — мінімальне сховище в стилі Redux:\n\n- `getState()` повертає поточний стан.\n- `dispatch(action)` обчислює новий стан через редюсер. Якщо редюсер повертає **той самий** об'єкт стану, ніхто не сповіщається.\n- `subscribe(listener)` викликає `listener(state)` після кожної зміни й повертає функцію відписки.\n- `select(selector, listener)` викликає `listener(value)` лише тоді, коли вибране значення змінюється (`Object.is`), і теж повертає функцію відписки.\n- Слухач, що відписується під час сповіщення, не має ламати інших слухачів.",
    ],
    files: {
      "/src/store.ts":
        "export type Reducer<S, A> = (state: S, action: A) => S;\n\nexport function createStore<S, A>(reducer: Reducer<S, A>, initialState: S) {\n  let state = initialState;\n  // TODO: listeners, select()\n  return {\n    getState: () => state,\n    dispatch(action: A) {\n      state = reducer(state, action);\n    },\n    subscribe(listener: (state: S) => void) {\n      return () => {};\n    },\n    select<T>(selector: (state: S) => T, listener: (value: T) => void) {\n      return () => {};\n    },\n  };\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { createStore } from "./src/store";\n\ntype State = { count: number; theme: string };\ntype Action = { type: "inc" } | { type: "theme"; value: string };\nconst store = createStore<State, Action>((s, a) => (a.type === "inc" ? { ...s, count: s.count + 1 } : { ...s, theme: a.value }), { count: 0, theme: "light" });\n\nconst app = document.getElementById("app")!;\napp.innerHTML = "<h1>Store</h1><button id=\\"inc\\">+1</button> <output id=\\"count\\">0</output>";\nstore.select((s) => s.count, (count) => (document.getElementById("count")!.textContent = String(count)));\ndocument.getElementById("inc")!.addEventListener("click", () => store.dispatch({ type: "inc" }));\n',
    },
    visibleFiles: ["/src/store.ts", "/index.ts"],
    activeFile: "/src/store.ts",
    tests:
      'import { describe, it, expect, fn } from "./test-kit";\nimport { createStore } from "../src/store";\n\ntype State = { count: number; name: string };\ntype Action = { type: "inc" } | { type: "rename"; name: string } | { type: "noop" };\nconst reducer = (s: State, a: Action): State => {\n  if (a.type === "inc") return { ...s, count: s.count + 1 };\n  if (a.type === "rename") return { ...s, name: a.name };\n  return s;\n};\nconst make = () => createStore(reducer, { count: 0, name: "a" });\n\ndescribe("createStore", () => {\n  it("updates state through the reducer", () => {\n    const store = make();\n    store.dispatch({ type: "inc" });\n    expect(store.getState()).toEqual({ count: 1, name: "a" });\n  });\n  it("notifies subscribers with the new state", () => {\n    const store = make();\n    const listener = fn();\n    store.subscribe(listener);\n    store.dispatch({ type: "inc" });\n    expect(listener).toHaveBeenCalledTimes(1);\n    expect(listener.mock.calls[0][0].count).toBe(1);\n  });\n  it("does not notify when the state object is unchanged", () => {\n    const store = make();\n    const listener = fn();\n    store.subscribe(listener);\n    store.dispatch({ type: "noop" });\n    expect(listener).toHaveBeenCalledTimes(0);\n  });\n  it("unsubscribes", () => {\n    const store = make();\n    const listener = fn();\n    const off = store.subscribe(listener);\n    off();\n    store.dispatch({ type: "inc" });\n    expect(listener).toHaveBeenCalledTimes(0);\n  });\n  it("notifies selectors only when their slice changes", () => {\n    const store = make();\n    const onName = fn();\n    store.select((s) => s.name, onName);\n    store.dispatch({ type: "inc" });\n    store.dispatch({ type: "inc" });\n    expect(onName).toHaveBeenCalledTimes(0);\n    store.dispatch({ type: "rename", name: "b" });\n    expect(onName).toHaveBeenCalledTimes(1);\n    expect(onName).toHaveBeenCalledWith("b");\n    store.dispatch({ type: "rename", name: "b" });\n    expect(onName).toHaveBeenCalledTimes(1);\n  });\n  it("survives a listener that unsubscribes while being notified", () => {\n    const store = make();\n    const second = fn();\n    const off: () => void = store.subscribe(() => off());\n    store.subscribe(second);\n    store.dispatch({ type: "inc" });\n    store.dispatch({ type: "inc" });\n    expect(second).toHaveBeenCalledTimes(2);\n  });\n});\n',
    solution: {
      "/src/store.ts":
        "export type Reducer<S, A> = (state: S, action: A) => S;\n\nexport function createStore<S, A>(reducer: Reducer<S, A>, initialState: S) {\n  let state = initialState;\n  const listeners = new Set<(state: S) => void>();\n\n  const subscribe = (listener: (state: S) => void) => {\n    listeners.add(listener);\n    return () => {\n      listeners.delete(listener);\n    };\n  };\n\n  return {\n    getState: () => state,\n    dispatch(action: A) {\n      const next = reducer(state, action);\n      if (Object.is(next, state)) return;\n      state = next;\n      for (const listener of [...listeners]) listener(state);\n    },\n    subscribe,\n    select<T>(selector: (state: S) => T, listener: (value: T) => void) {\n      let current = selector(state);\n      return subscribe((nextState) => {\n        const value = selector(nextState);\n        if (Object.is(value, current)) return;\n        current = value;\n        listener(value);\n      });\n    },\n  };\n}\n",
    },
    explanation: [
      "Keep listeners in a `Set` and notify from a copy (`[...listeners]`), so unsubscribing during notification can't skip anyone. Skipping notification when the reducer returns the same object relies on immutable updates, which is why reducers must never mutate. `select` is just a subscriber that remembers the previous selected value and compares with `Object.is`, the same idea behind `useSelector` and `useSyncExternalStore`.",
      "Тримайте слухачів у `Set` і сповіщайте з копії (`[...listeners]`), щоб відписка під час сповіщення нікого не пропустила. Пропуск сповіщення, коли редюсер повертає той самий об'єкт, спирається на незмінні оновлення — тому редюсери ніколи не мають змінювати стан. `select` — це просто підписник, що пам'ятає попереднє вибране значення й порівнює через `Object.is`; та сама ідея лежить в основі `useSelector` і `useSyncExternalStore`.",
    ],
  }),
]);
