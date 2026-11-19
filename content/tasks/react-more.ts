import { defineTasks } from "@/lib/content/schema";
import { quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "react-and-zero",
    ["react"],
    1,
    60,
    ["A stray zero", "Зайвий нуль"],
    ["`unread` is `0`. What does the component render?", "`unread` дорівнює `0`. Що відрендерить компонент?"],
    [
      ["Nothing", "Нічого"],
      ["The text `0`", "Текст `0`"],
      ["A badge showing 0", "Бейдж зі значенням 0"],
      ["It throws an error", "Кидає помилку"],
    ],
    "b",
    [
      "`unread && <Badge />` evaluates to `0` when `unread` is 0. React skips `false`, `null` and `undefined`, but numbers are valid children, so a literal 0 appears on the page. Use a real boolean: `unread > 0 && <Badge />` or a ternary.",
      "`unread && <Badge />` дає `0`, коли `unread` дорівнює 0. React пропускає `false`, `null` і `undefined`, але числа — коректні дочірні елементи, тож на сторінці з'являється 0. Використовуйте справжнє булеве значення: `unread > 0 && <Badge />` або тернарний оператор.",
    ],
    { code: "function Inbox({ unread }: { unread: number }) {\n  return <nav>{unread && <Badge count={unread} />}</nav>;\n}", codeLanguage: "tsx" },
  ),
  quiz(
    "react-nested-component",
    ["react"],
    4,
    90,
    ["State that keeps resetting", "Стан, що постійно скидається"],
    ["Every time `Parent` re-renders, the text typed into the input disappears. Why?", "Щоразу, коли `Parent` перемальовується, введений у поле текст зникає. Чому?"],
    [
      ["`useState` in `Field` needs a `key`", "`useState` у `Field` потребує `key`"],
      ["`Field` is a new component type on every render, so React unmounts the old one and mounts a new one", "`Field` — новий тип компонента при кожному рендері, тож React демонтує старий і монтує новий"],
      ["Inputs must be controlled from the parent", "Поля введення мають керуватися з батьківського компонента"],
      ["StrictMode resets state in development", "StrictMode скидає стан у режимі розробки"],
    ],
    "b",
    [
      "React compares element types by reference. Declaring `Field` inside `Parent` creates a new function on every render, so React sees a different component type, destroys the old subtree with its state and DOM, and mounts a fresh one. Move component definitions to module level and pass data through props.",
      "React порівнює типи елементів за посиланням. Оголошення `Field` усередині `Parent` створює нову функцію при кожному рендері, тож React бачить інший тип компонента, знищує старе піддерево разом зі станом і DOM та монтує нове. Виносьте оголошення компонентів на рівень модуля й передавайте дані через props.",
    ],
    { code: "function Parent() {\n  const [tick, setTick] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => setTick((t) => t + 1), 1000);\n    return () => clearInterval(id);\n  }, []);\n\n  function Field() {\n    const [text, setText] = useState(\"\");\n    return <input value={text} onChange={(e) => setText(e.target.value)} />;\n  }\n\n  return <Field />;\n}", codeLanguage: "tsx" },
  ),
  quiz(
    "react-deferred-value",
    ["react", { slug: "web-performance", weight: 0.5 }],
    5,
    120,
    ["Keeping typing responsive", "Чуйне введення тексту"],
    ["Typing into the search box lags because `<Results>` renders 5,000 rows on every keystroke. Which change keeps the input responsive while still showing up-to-date results?", "Введення в поле пошуку гальмує, бо `<Results>` рендерить 5000 рядків на кожне натискання. Яка зміна зберігає чуйність поля й водночас показує актуальні результати?"],
    [
      ["Pass `useDeferredValue(query)` to a `memo`-wrapped `<Results>`", "Передавати `useDeferredValue(query)` у загорнутий у `memo` `<Results>`"],
      ["Wrap `setQuery` in `useCallback`", "Обгорнути `setQuery` у `useCallback`"],
      ["Move the filtering into `useEffect`", "Перенести фільтрування в `useEffect`"],
      ["Call `flushSync` around `setQuery`", "Викликати `flushSync` навколо `setQuery`"],
    ],
    "a",
    [
      "`useDeferredValue` lets React render the urgent update (the input) first and re-render the expensive list with the new value in an interruptible background render. It only helps if `<Results>` is memoized, so the urgent render can skip it while the deferred value is unchanged. `useCallback` doesn't reduce the work, an effect adds an extra render, and `flushSync` forces the slow render to happen synchronously.",
      "`useDeferredValue` дозволяє React спершу відрендерити термінове оновлення (поле), а дорогий список перемалювати з новим значенням у фоновому рендері, який можна перервати. Це працює лише тоді, коли `<Results>` мемоїзовано, щоб терміновий рендер пропускав його, поки відкладене значення не змінилося. `useCallback` не зменшує роботу, ефект додає зайвий рендер, а `flushSync` змушує повільний рендер виконатися синхронно.",
    ],
    { code: "function Search() {\n  const [query, setQuery] = useState(\"\");\n  return (\n    <>\n      <input value={query} onChange={(e) => setQuery(e.target.value)} />\n      <Results query={query} />\n    </>\n  );\n}", codeLanguage: "tsx" },
  ),
]);
