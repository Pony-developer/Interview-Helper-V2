import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "react-state-snapshot",
    ["react"],
    2,
    90,
    ["Batched updates", "Групування оновлень"],
    ["`count` is `0`. What is it after one click?", "`count` дорівнює `0`. Яким він стане після одного кліку?"],
    [
      ["1", "1"],
      ["2", "2"],
      ["3", "3"],
      ["0", "0"],
    ],
    "b",
    [
      "Both `setCount(count + 1)` calls read the same snapshot (`0`) and queue `1`. The updater function then receives the latest queued value (`1`) and returns `2`. Use updater functions when the next state depends on the previous one.",
      "Обидва виклики `setCount(count + 1)` читають той самий знімок (`0`) і ставлять у чергу `1`. Функція-оновлювач отримує останнє значення в черзі (`1`) і повертає `2`. Використовуйте оновлювачі, коли новий стан залежить від попереднього.",
    ],
    { code: "function onClick() {\n  setCount(count + 1);\n  setCount(count + 1);\n  setCount((c) => c + 1);\n}", codeLanguage: "tsx" },
  ),
  quiz(
    "react-keys-index",
    ["react"],
    2,
    90,
    ["Keys in lists", "Ключі у списках"],
    ["Why is the array index a poor `key` for a list where items can be inserted at the top?", "Чому індекс масиву — поганий `key` для списку, куди елементи додаються згори?"],
    [
      ["React throws a warning and refuses to render", "React показує попередження й відмовляється рендерити"],
      [
        "Keys shift, so React reuses the wrong components and their state/DOM sticks to other items",
        "Ключі зсуваються, тож React перевикористовує не ті компоненти, і їхній стан/DOM «прилипає» до інших елементів",
      ],
      ["Indexes are numbers and keys must be strings", "Індекси є числами, а ключі мають бути рядками"],
      ["It makes the list render twice", "Через це список рендериться двічі"],
    ],
    "b",
    [
      "Keys identify items across renders. After an insertion at the top, every index points at a different item, so React keeps the old component instances (with their state and uncontrolled input values) under the wrong data. Use a stable unique ID.",
      "Ключі ідентифікують елементи між рендерами. Після вставки згори кожен індекс вказує на інший елемент, тож React зберігає старі екземпляри компонентів (з їхнім станом і значеннями некерованих полів) під хибними даними. Використовуйте стабільний унікальний ID.",
    ],
  ),
  quiz(
    "react-effect-cleanup",
    ["react"],
    3,
    120,
    ["Effect cleanup", "Очищення ефекту"],
    ["When does React run the cleanup function returned from this effect? Select all that apply.", "Коли React викликає функцію очищення, яку повертає цей ефект? Оберіть усі правильні."],
    [
      ["Before the effect re-runs because `roomId` changed", "Перед повторним запуском ефекту через зміну `roomId`"],
      ["When the component unmounts", "Коли компонент демонтується"],
      ["After every render, even if `roomId` didn't change", "Після кожного рендеру, навіть якщо `roomId` не змінився"],
      ["Only when the page is reloaded", "Лише при перезавантаженні сторінки"],
    ],
    "ab",
    [
      "Cleanup runs before the next execution of the effect (when a dependency changed) and once on unmount. In development, Strict Mode also runs an extra mount→cleanup→mount cycle to surface missing cleanups.",
      "Очищення виконується перед наступним запуском ефекту (коли змінилася залежність) і один раз при демонтуванні. У розробці Strict Mode також робить додатковий цикл mount→cleanup→mount, щоб виявити відсутні очищення.",
    ],
    { code: "useEffect(() => {\n  const conn = connect(roomId);\n  return () => conn.disconnect();\n}, [roomId]);", codeLanguage: "tsx" },
  ),
  quiz(
    "react-derived-state",
    ["react", { slug: "state-management", weight: 0.5 }],
    3,
    120,
    ["You might not need an effect", "Ефект може бути зайвим"],
    ["What is the best way to show `visible` todos in this component?", "Як найкраще показати `visible` у цьому компоненті?"],
    [
      [
        "Compute `const visible = todos.filter(...)` during render (with `useMemo` only if it's measurably slow)",
        "Обчислити `const visible = todos.filter(...)` під час рендеру (з `useMemo` лише якщо це помітно повільно)",
      ],
      ["Keep the current effect: it's the idiomatic way", "Залишити поточний ефект, це ідіоматичний спосіб"],
      ["Move `setVisible` into `useLayoutEffect` to avoid flicker", "Перенести `setVisible` у `useLayoutEffect`, щоб уникнути мерехтіння"],
      ["Store `visible` in a ref and update it in the effect", "Зберігати `visible` у ref і оновлювати в ефекті"],
    ],
    "a",
    [
      "`visible` is derived from props/state, so storing it in state creates a second source of truth and an extra render (render → effect → setState → render). Compute it during render instead.",
      "`visible` є похідним від пропсів/стану, тож зберігання його в стані створює друге джерело правди й зайвий рендер (render → effect → setState → render). Обчислюйте його під час рендеру.",
    ],
    {
      code: "const [visible, setVisible] = useState<Todo[]>([]);\nuseEffect(() => {\n  setVisible(todos.filter((t) => t.text.includes(query)));\n}, [todos, query]);",
      codeLanguage: "tsx",
    },
  ),
  quiz(
    "react-memo-callback",
    ["react", { slug: "web-performance", weight: 0.5 }],
    4,
    150,
    ["memo and inline callbacks", "memo та вбудовані колбеки"],
    [
      "`Row` is wrapped in `memo`. Why does it still re-render whenever `List` renders, and what fixes it?",
      "`Row` обгорнуто в `memo`. Чому він усе одно ререндериться разом зі `List`, і як це виправити?",
    ],
    [
      [
        "`onSelect` is a new function each render; wrap it in `useCallback` (with correct deps)",
        "`onSelect` щоразу є новою функцією; обгорніть її в `useCallback` (з правильними залежностями)",
      ],
      ["`memo` only works for class components", "`memo` працює лише для класових компонентів"],
      ["`key` must be a string to enable memoisation", "Для мемоізації `key` має бути рядком"],
      ["Rows always re-render when their parent does; nothing helps", "Рядки завжди ререндеряться разом із батьком, нічого не допоможе"],
    ],
    "a",
    [
      "`memo` compares props shallowly. An inline arrow function creates a new identity every render, so the comparison fails. `useCallback` keeps the same function between renders while its dependencies are unchanged.",
      "`memo` порівнює пропси поверхнево. Вбудована стрілкова функція щоразу створює нову ідентичність, тож порівняння не проходить. `useCallback` зберігає ту саму функцію між рендерами, поки залежності не змінилися.",
    ],
    {
      code: "const Row = memo(function Row({ item, onSelect }: Props) { /* ... */ });\n\nfunction List({ items }: { items: Item[] }) {\n  const [selected, setSelected] = useState<string | null>(null);\n  return items.map((item) => (\n    <Row key={item.id} item={item} onSelect={(id) => setSelected(id)} />\n  ));\n}",
      codeLanguage: "tsx",
    },
  ),
  practice({
    slug: "react-searchable-list",
    skills: ["react"],
    complexity: 3,
    estSeconds: 900,
    framework: "react-ts",
    title: ["Searchable list", "Список із пошуком"],
    prompt: [
      "Finish the `App` component:\n\n1. Add a **labelled** text input (label text: `Search`) that filters `FRUITS` case-insensitively as you type.\n2. Show matching fruits in a `<ul>`.\n3. When nothing matches, show `No results` instead of the list.\n4. Show the count in an element with `data-testid=\"count\"`, e.g. `3 of 6`.\n\nDerive the filtered list during render; you don't need `useEffect`.",
      "Завершіть компонент `App`:\n\n1. Додайте текстове поле **з міткою** (текст мітки: `Search`), що фільтрує `FRUITS` без урахування регістру під час введення.\n2. Показуйте відповідні фрукти в `<ul>`.\n3. Коли збігів немає, показуйте `No results` замість списку.\n4. Показуйте кількість в елементі з `data-testid=\"count\"`, наприклад `3 of 6`.\n\nОбчислюйте відфільтрований список під час рендеру; `useEffect` не потрібен.",
    ],
    files: {
      "/App.tsx": 'import { useState } from "react";\n\nexport const FRUITS = ["Apple", "Apricot", "Banana", "Cherry", "Grape", "Mango"];\n\nexport default function App() {\n  // TODO: query state, labelled input, filtered list, count, empty state\n  return (\n    <main>\n      <h1>Fruits</h1>\n      <ul>\n        {FRUITS.map((f) => (\n          <li key={f}>{f}</li>\n        ))}\n      </ul>\n    </main>\n  );\n}\n',
    },
    activeFile: "/App.tsx",
    tests: 'import { describe, it, expect, screen, user } from "./test-kit";\n\ndescribe("searchable list", () => {\n  it("shows all fruits initially with a count", async () => {\n    expect(await screen.findAllByRole("listitem")).toHaveLength(6);\n    expect(screen.getByTestId("count")).toHaveTextContent("6 of 6");\n  });\n  it("filters case-insensitively", async () => {\n    await user.type(await screen.findByLabelText("Search"), "ap");\n    const items = screen.getAllByRole("listitem").map((li) => li.textContent);\n    expect(items).toEqual(["Apple", "Apricot", "Grape"]);\n    expect(screen.getByTestId("count")).toHaveTextContent("3 of 6");\n  });\n  it("shows an empty state", async () => {\n    const input = await screen.findByLabelText("Search");\n    await user.clear(input);\n    await user.type(input, "zzz");\n    expect(screen.getByText("No results")).toBeInTheDocument();\n    expect(screen.queryAllByRole("listitem")).toHaveLength(0);\n  });\n});\n',
    solution: {
      "/App.tsx": 'import { useState } from "react";\n\nexport const FRUITS = ["Apple", "Apricot", "Banana", "Cherry", "Grape", "Mango"];\n\nexport default function App() {\n  const [query, setQuery] = useState("");\n  const q = query.trim().toLowerCase();\n  const visible = FRUITS.filter((f) => f.toLowerCase().includes(q));\n\n  return (\n    <main>\n      <h1>Fruits</h1>\n      <label htmlFor="search">Search</label>\n      <input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />\n      <p data-testid="count">\n        {visible.length} of {FRUITS.length}\n      </p>\n      {visible.length ? (\n        <ul>\n          {visible.map((f) => (\n            <li key={f}>{f}</li>\n          ))}\n        </ul>\n      ) : (\n        <p>No results</p>\n      )}\n    </main>\n  );\n}\n',
    },
    explanation: [
      "Keep only `query` in state and derive `visible` during render. A `<label htmlFor>` connected to the input's `id` gives it an accessible name, which is also how the tests find it. Render the empty state conditionally.",
      "Зберігайте у стані лише `query`, а `visible` обчислюйте під час рендеру. `<label htmlFor>`, пов'язаний з `id` поля, дає йому доступне ім'я, за яким його знаходять і тести. Порожній стан рендерте умовно.",
    ],
  }),
]);
