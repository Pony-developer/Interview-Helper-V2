import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "state-derive-not-store",
    ["state-management"],
    1,
    60,
    ["Derived data", "Похідні дані"],
    ["A cart stores `items` and also `total` in state. What's the main risk?", "Кошик зберігає в стані `items` і окремо `total`. Який головний ризик?"],
    [
      ["`total` can get out of sync with `items`; derive it from `items` instead", "`total` може розійтися з `items`; краще обчислювати його з `items`"],
      ["Numbers can't be stored in state", "Числа не можна зберігати в стані"],
      ["It makes the bundle larger", "Це збільшує розмір бандла"],
      ["There's no risk; it's the recommended pattern", "Ризику немає; це рекомендований патерн"],
    ],
    "a",
    [
      "Duplicated state needs every update path to keep both values consistent, and sooner or later one forgets. Store the source of truth (`items`) and derive `total` in render or a memoised selector.",
      "Продубльований стан вимагає, щоб кожен шлях оновлення тримав обидва значення узгодженими, і рано чи пізно якийсь шлях про це забуде. Зберігайте джерело правди (`items`) і обчислюйте `total` під час рендеру чи в мемоізованому селекторі.",
    ],
  ),
  quiz(
    "state-mutation-bug",
    ["state-management", w("react")],
    2,
    90,
    ["Mutation in a reducer", "Мутація в редʼюсері"],
    ["The UI doesn't update after `toggle`. Why?", "Після `toggle` інтерфейс не оновлюється. Чому?"],
    [
      ["The reducer mutates the todo and returns the same `state`, so the reference doesn't change", "Редʼюсер змінює todo й повертає той самий `state`, тож посилання не змінюється"],
      ["`find` doesn't work on arrays of objects", "`find` не працює з масивами об'єктів"],
      ["Reducers must be async", "Редʼюсери мають бути асинхронними"],
      ["`done` must be a string", "`done` має бути рядком"],
    ],
    "a",
    [
      "React's `useReducer`, Redux and OnPush compare references. Returning the same object tells them nothing changed. Return new objects along the changed path: `{ ...state, todos: state.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }`.",
      "`useReducer` у React, Redux і OnPush порівнюють посилання. Повернення того самого об'єкта повідомляє, що нічого не змінилося. Повертайте нові об'єкти вздовж зміненого шляху: `{ ...state, todos: state.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }`.",
    ],
    { code: "function reducer(state, action) {\n  if (action.type === \"toggle\") {\n    const todo = state.todos.find((t) => t.id === action.id);\n    todo.done = !todo.done;\n    return state;\n  }\n  return state;\n}", codeLanguage: "js" },
  ),
  quiz(
    "state-server-cache",
    ["state-management", w("tanstack-query")],
    3,
    120,
    ["Server state", "Серверний стан"],
    ["Where should a list of products fetched from the API usually live in a modern React app?", "Де в сучасному React-застосунку зазвичай має жити список товарів, отриманий з API?"],
    [
      ["In a server-state cache (TanStack Query / RTK Query) with loading, error and stale handling", "У кеші серверного стану (TanStack Query / RTK Query) з обробкою завантаження, помилок і застарілості"],
      ["Copied into a global Redux slice by a `useEffect` in every page", "Скопійованим у глобальний Redux-слайс через `useEffect` на кожній сторінці"],
      ["In localStorage", "У localStorage"],
      ["In a module-level variable", "У змінній на рівні модуля"],
    ],
    "a",
    [
      "Server data is a cache of someone else's state: it needs deduplication, background refetching, invalidation and retries. Query libraries provide this, and hand-rolled copies in a client store tend to go stale.",
      "Серверні дані є кешем чужого стану: їм потрібні дедуплікація, фонове оновлення, інвалідація й повторні спроби. Бібліотеки запитів дають це з коробки, а саморобні копії в клієнтському сторі зазвичай застарівають.",
    ],
  ),
  quiz(
    "state-url-state",
    ["state-management"],
    2,
    90,
    ["URL state", "Стан в URL"],
    ["Users want to share a link to a filtered, sorted product list. Where should the filters live?", "Користувачі хочуть ділитися посиланням на відфільтрований і відсортований список товарів. Де мають жити фільтри?"],
    [
      ["In the URL query string", "У рядку запиту URL"],
      ["In component state", "У стані компонента"],
      ["In sessionStorage", "У sessionStorage"],
      ["In a global store only", "Лише в глобальному сторі"],
    ],
    "a",
    [
      "The URL is shareable, bookmarkable and survives reloads and back/forward navigation. Read filters from it (e.g. `useSearchParams`) as the single source of truth, rather than syncing a separate copy.",
      "URL можна поширювати, додавати в закладки, і він переживає перезавантаження та навігацію назад/вперед. Читайте фільтри з нього (наприклад, `useSearchParams`) як із єдиного джерела правди, а не синхронізуйте окрему копію.",
    ],
  ),
  quiz(
    "state-memoized-selector",
    ["state-management", w("web-performance")],
    4,
    150,
    ["Selector re-renders", "Ререндери через селектор"],
    ["`useSelector(state => state.items.filter(i => i.visible))` makes the component re-render on every store update, even unrelated ones. Why, and what's the fix?", "`useSelector(state => state.items.filter(i => i.visible))` змушує компонент ререндеритися при кожному оновленні стору, навіть непов'язаному. Чому й як це виправити?"],
    [
      ["`filter` returns a new array each time, so the reference check fails; use a memoised selector (`createSelector`)", "`filter` щоразу повертає новий масив, тож перевірка посилань не проходить; використайте мемоізований селектор (`createSelector`)"],
      ["`useSelector` always re-renders", "`useSelector` завжди спричиняє ререндер"],
      ["The store must be split into several stores", "Стор треба розділити на кілька"],
      ["Arrays can't be selected", "Масиви не можна вибирати"],
    ],
    "a",
    [
      "`useSelector` compares the result with `===`. A fresh array is never equal to the previous one, so every dispatch triggers a render. A memoised selector returns the same array until `state.items` actually changes. Alternatively, select raw data and derive it in `useMemo`.",
      "`useSelector` порівнює результат через `===`. Новий масив ніколи не дорівнює попередньому, тож кожне надсилання дії спричиняє рендер. Мемоізований селектор повертає той самий масив, доки `state.items` справді не зміниться. Як варіант, вибирайте сирі дані й обчислюйте похідні в `useMemo`.",
    ],
  ),
  practice({
    slug: "state-cart-reducer",
    skills: ["state-management", w("typescript")],
    complexity: 3,
    estSeconds: 1020,
    framework: "vanilla-ts",
    title: ["Immutable cart reducer", "Незмінний редʼюсер кошика"],
    prompt: [
      "Implement `cartReducer(state, action)` as a **pure, immutable** function:\n\n- `add` `{ item }`: add with `qty: 1`, or increment `qty` if the id exists.\n- `remove` `{ id }`: remove the line.\n- `setQty` `{ id, qty }`: set the quantity; `qty <= 0` removes the line.\n- `clear`: empty the cart.\n- Never mutate `state` or its items. Return the **same** state object for unknown actions or no-op changes (e.g. removing a missing id).\n\nAlso implement `selectTotal(state)`, the sum of `price × qty`.",
      "Реалізуйте `cartReducer(state, action)` як **чисту, незмінну** функцію:\n\n- `add` `{ item }`: додати з `qty: 1` або збільшити `qty`, якщо такий id уже є.\n- `remove` `{ id }`: прибрати рядок.\n- `setQty` `{ id, qty }`: встановити кількість; `qty <= 0` прибирає рядок.\n- `clear`: очистити кошик.\n- Ніколи не змінюйте `state` чи його елементи. Повертайте **той самий** об'єкт стану для невідомих дій і змін, що нічого не роблять (наприклад, видалення відсутнього id).\n\nТакож реалізуйте `selectTotal(state)`: суму `price × qty`.",
    ],
    files: {
      "/src/cart.ts": 'export type Item = { id: string; name: string; price: number };\nexport type Line = Item & { qty: number };\nexport type Cart = { items: Line[] };\nexport type Action =\n  | { type: "add"; item: Item }\n  | { type: "remove"; id: string }\n  | { type: "setQty"; id: string; qty: number }\n  | { type: "clear" };\n\nexport const initialCart: Cart = { items: [] };\n\nexport function cartReducer(state: Cart, action: Action): Cart {\n  // TODO: pure and immutable\n  if (action.type === "add") {\n    state.items.push({ ...action.item, qty: 1 });\n  }\n  return state;\n}\n\nexport function selectTotal(state: Cart): number {\n  return 0;\n}\n',
      "/index.ts": 'import "./styles.css";\nimport { cartReducer, initialCart, selectTotal, type Action } from "./src/cart";\n\nconst actions: Action[] = [\n  { type: "add", item: { id: "tea", name: "Tea", price: 4 } },\n  { type: "add", item: { id: "cake", name: "Cake", price: 6 } },\n  { type: "add", item: { id: "tea", name: "Tea", price: 4 } },\n  { type: "setQty", id: "cake", qty: 3 },\n];\nconst cart = actions.reduce(cartReducer, initialCart);\ndocument.getElementById("app")!.innerHTML = `<h1>Cart</h1><ul>${cart.items\n  .map((l) => `<li>${l.name} × ${l.qty}</li>`)\n  .join("")}</ul><p>Total: <output id="total">${selectTotal(cart)}</output></p>`;\n',
    },
    visibleFiles: ["/src/cart.ts", "/index.ts"],
    activeFile: "/src/cart.ts",
    tests: 'import { describe, it, expect, screen } from "./test-kit";\nimport { cartReducer, initialCart, selectTotal } from "../src/cart";\n\nconst tea = { id: "tea", name: "Tea", price: 4 };\nconst cake = { id: "cake", name: "Cake", price: 6 };\nconst freeze = (o) => { Object.freeze(o); Object.values(o).forEach((v) => v && typeof v === "object" && freeze(v)); return o; };\n\ndescribe("cartReducer", () => {\n  it("adds items and increments quantity", () => {\n    let s = cartReducer(initialCart, { type: "add", item: tea });\n    s = cartReducer(s, { type: "add", item: tea });\n    s = cartReducer(s, { type: "add", item: cake });\n    expect(s.items).toEqual([{ ...tea, qty: 2 }, { ...cake, qty: 1 }]);\n  });\n  it("never mutates the previous state", () => {\n    const before = freeze({ items: [{ ...tea, qty: 1 }] });\n    const after = cartReducer(before, { type: "add", item: tea });\n    expect(after.items[0].qty).toBe(2);\n    expect(before.items[0].qty).toBe(1);\n    expect(after === before).toBe(false);\n  });\n  it("keeps unchanged lines by reference", () => {\n    const s = freeze({ items: [{ ...tea, qty: 1 }, { ...cake, qty: 1 }] });\n    const next = cartReducer(s, { type: "setQty", id: "cake", qty: 5 });\n    expect(next.items[0] === s.items[0]).toBe(true);\n    expect(next.items[1].qty).toBe(5);\n  });\n  it("removes lines, including via setQty <= 0", () => {\n    const s = freeze({ items: [{ ...tea, qty: 1 }, { ...cake, qty: 2 }] });\n    expect(cartReducer(s, { type: "remove", id: "tea" }).items).toEqual([{ ...cake, qty: 2 }]);\n    expect(cartReducer(s, { type: "setQty", id: "cake", qty: 0 }).items).toEqual([{ ...tea, qty: 1 }]);\n  });\n  it("clears the cart", () => {\n    const s = freeze({ items: [{ ...tea, qty: 1 }] });\n    expect(cartReducer(s, { type: "clear" })).toEqual({ items: [] });\n  });\n  it("returns the same state for unknown actions and no-ops", () => {\n    const s = freeze({ items: [{ ...tea, qty: 1 }] });\n    expect(cartReducer(s, { type: "unknown" } as never) === s).toBe(true);\n    expect(cartReducer(s, { type: "remove", id: "missing" }) === s).toBe(true);\n  });\n  it("computes the total", () => {\n    expect(selectTotal({ items: [{ ...tea, qty: 2 }, { ...cake, qty: 3 }] })).toBe(26);\n    expect(selectTotal(initialCart)).toBe(0);\n  });\n  it("renders the demo", async () => {\n    expect((await screen.findByText("26")).id).toBe("total");\n  });\n});\n',
    solution: {
      "/src/cart.ts": 'export type Item = { id: string; name: string; price: number };\nexport type Line = Item & { qty: number };\nexport type Cart = { items: Line[] };\nexport type Action =\n  | { type: "add"; item: Item }\n  | { type: "remove"; id: string }\n  | { type: "setQty"; id: string; qty: number }\n  | { type: "clear" };\n\nexport const initialCart: Cart = { items: [] };\n\nexport function cartReducer(state: Cart, action: Action): Cart {\n  switch (action.type) {\n    case "add": {\n      const exists = state.items.some((l) => l.id === action.item.id);\n      return {\n        ...state,\n        items: exists\n          ? state.items.map((l) => (l.id === action.item.id ? { ...l, qty: l.qty + 1 } : l))\n          : [...state.items, { ...action.item, qty: 1 }],\n      };\n    }\n    case "remove": {\n      if (!state.items.some((l) => l.id === action.id)) return state;\n      return { ...state, items: state.items.filter((l) => l.id !== action.id) };\n    }\n    case "setQty": {\n      if (action.qty <= 0) return cartReducer(state, { type: "remove", id: action.id });\n      if (!state.items.some((l) => l.id === action.id)) return state;\n      return { ...state, items: state.items.map((l) => (l.id === action.id ? { ...l, qty: action.qty } : l)) };\n    }\n    case "clear":\n      return state.items.length ? { ...state, items: [] } : state;\n    default:\n      return state;\n  }\n}\n\nexport function selectTotal(state: Cart): number {\n  return state.items.reduce((sum, l) => sum + l.price * l.qty, 0);\n}\n',
    },
    explanation: [
      "Every branch returns new objects only along the changed path: `map` copies the one updated line and keeps the others by reference, `filter` and spread create new arrays, and nothing touches the old state. No-op actions return the original object so `===` checks skip work. The total is derived by a selector instead of being stored.",
      "Кожна гілка повертає нові об'єкти лише вздовж зміненого шляху: `map` копіює один оновлений рядок і зберігає інші за посиланням, `filter` і spread створюють нові масиви, а старий стан ніхто не чіпає. Дії, що нічого не змінюють, повертають початковий об'єкт, щоб перевірки `===` пропускали роботу. Сума обчислюється селектором, а не зберігається.",
    ],
  }),
]);
