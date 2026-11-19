import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "dom-target-vs-current",
    ["dom-events"],
    1,
    60,
    ["target vs currentTarget", "target проти currentTarget"],
    ["The user clicks the `<span>` inside the button. Inside the listener on `<ul>`, what is `event.currentTarget`?", "Користувач клікає `<span>` усередині кнопки. Чим є `event.currentTarget` в обробнику на `<ul>`?"],
    [
      ["The `<span>`", "`<span>`"],
      ["The `<button>`", "`<button>`"],
      ["The `<ul>`", "`<ul>`"],
      ["`window`", "`window`"],
    ],
    "c",
    [
      "`currentTarget` is the element whose listener is currently running (the `<ul>`). `target` is where the event originated, the `<span>`. Delegation uses `target.closest(...)` to find the item.",
      "`currentTarget` є елементом, чий обробник зараз виконується (`<ul>`). `target` є місцем, звідки подія почалася, тобто `<span>`. Делегування використовує `target.closest(...)`, щоб знайти елемент.",
    ],
    { code: "<ul id=\"list\">\n  <li><button><span>Delete</span></button></li>\n</ul>", codeLanguage: "html" },
  ),
  quiz(
    "dom-prevent-vs-stop",
    ["dom-events"],
    2,
    90,
    ["preventDefault vs stopPropagation", "preventDefault проти stopPropagation"],
    ["A form's submit handler calls `event.stopPropagation()` but the page still reloads. Why?", "Обробник submit форми викликає `event.stopPropagation()`, але сторінка все одно перезавантажується. Чому?"],
    [
      ["`stopPropagation` stops bubbling; it doesn't cancel the default submit. Call `preventDefault()`", "`stopPropagation` зупиняє спливання, але не скасовує типове надсилання. Викличте `preventDefault()`"],
      ["Submit events can't be stopped", "Події submit неможливо зупинити"],
      ["`stopPropagation` only works in the capture phase", "`stopPropagation` працює лише у фазі занурення"],
      ["The form needs `novalidate`", "Формі потрібен `novalidate`"],
    ],
    "a",
    [
      "The two are independent: `preventDefault` cancels the browser's default action (navigation for a submit), and `stopPropagation` prevents other listeners up the tree from receiving the event.",
      "Це незалежні речі: `preventDefault` скасовує дію браузера за замовчуванням (для submit це навігація), а `stopPropagation` не дає іншим обробникам вище за деревом отримати подію.",
    ],
  ),
  quiz(
    "dom-delegation-benefits",
    ["dom-events", w("web-performance")],
    2,
    90,
    ["Why delegate?", "Навіщо делегувати?"],
    ["What are the benefits of one delegated listener on a list instead of one listener per item? Select all that apply.", "Які переваги одного делегованого обробника на списку замість обробника на кожен елемент? Оберіть усі правильні."],
    [
      ["Items added later are handled automatically", "Елементи, додані пізніше, обробляються автоматично"],
      ["Fewer listeners and less memory for long lists", "Менше обробників і менше пам'яті для довгих списків"],
      ["It works for events that don't bubble, like `focus`", "Працює для подій, що не спливають, як-от `focus`"],
      ["It prevents XSS", "Запобігає XSS"],
    ],
    "ab",
    [
      "One listener on the container covers current and future children, which saves memory and setup work. It relies on bubbling, so non-bubbling events need their bubbling variants (`focusin`) or capture. XSS is unrelated.",
      "Один обробник на контейнері охоплює поточних і майбутніх нащадків, що заощаджує пам'ять і роботу з налаштування. Він покладається на спливання, тож для подій, що не спливають, потрібні їхні спливні варіанти (`focusin`) або фаза занурення. До XSS це стосунку не має.",
    ],
  ),
  quiz(
    "dom-textcontent-xss",
    ["dom-events", w("web-security")],
    3,
    120,
    ["Rendering user input", "Відображення введення користувача"],
    ["A comment is rendered with `el.innerHTML = comment`. A user posts `<img src=x onerror=\"stealCookies()\">`. What happens, and what's the fix?", "Коментар рендериться через `el.innerHTML = comment`. Користувач публікує `<img src=x onerror=\"stealCookies()\">`. Що станеться і як це виправити?"],
    [
      ["The script runs for everyone viewing it (XSS); use `textContent` or sanitise HTML", "Скрипт виконається в усіх, хто це переглядає (XSS); використайте `textContent` або санітизуйте HTML"],
      ["Nothing, browsers block inline handlers in `innerHTML`", "Нічого, браузери блокують вбудовані обробники в `innerHTML`"],
      ["The image just fails to load", "Зображення просто не завантажиться"],
      ["It throws a SyntaxError", "Кидається SyntaxError"],
    ],
    "a",
    [
      "`innerHTML` doesn't execute `<script>` tags, but event-handler attributes like `onerror` do run. Insert untrusted text with `textContent`, or sanitise rich HTML (e.g. DOMPurify) and add a Content-Security-Policy.",
      "`innerHTML` не виконує теги `<script>`, але атрибути-обробники на кшталт `onerror` спрацьовують. Вставляйте неперевірений текст через `textContent` або санітизуйте форматований HTML (наприклад, DOMPurify) і додайте Content-Security-Policy.",
    ],
  ),
  quiz(
    "dom-layout-thrashing",
    ["dom-events", w("web-performance")],
    4,
    150,
    ["Layout thrashing", "Layout thrashing"],
    ["Why is this loop slow for 1,000 items, and how do you fix it?", "Чому цей цикл повільний для 1000 елементів і як це виправити?"],
    [
      ["Each read of `offsetWidth` after a write forces a synchronous reflow; read all widths first, then write", "Кожне читання `offsetWidth` після запису змушує синхронно перераховувати розкладку; спершу прочитайте всі ширини, потім записуйте"],
      ["`style.width` is a slow setter; use `setAttribute` instead", "`style.width` є повільним сеттером; використайте `setAttribute`"],
      ["`querySelectorAll` returns a live list that re-queries each time", "`querySelectorAll` повертає живий список, що щоразу шукає заново"],
      ["Template literals are slow; use string concatenation", "Шаблонні рядки повільні; використайте конкатенацію"],
    ],
    "a",
    [
      "Interleaving writes (`style.width = …`) and layout reads (`offsetWidth`) forces the browser to recalculate layout on every iteration. Batch the reads, then the writes (or use `requestAnimationFrame`) so the layout is computed once.",
      "Чергування записів (`style.width = …`) і читань геометрії (`offsetWidth`) змушує браузер перераховувати розкладку на кожній ітерації. Згрупуйте спершу читання, потім записи (або використайте `requestAnimationFrame`), щоб розкладка обчислювалася один раз.",
    ],
    { code: "for (const el of document.querySelectorAll(\".bar\")) {\n  el.style.width = `${el.parentElement.offsetWidth / 2}px`;\n}", codeLanguage: "js" },
  ),
  practice({
    slug: "dom-event-delegation",
    skills: ["dom-events", w("javascript")],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-js",
    title: ["Event delegation helper", "Допоміжна функція делегування"],
    prompt: [
      "Implement `delegate(root, selector, type, handler)`:\n\n- Adds **one** listener of `type` to `root`.\n- When the event starts inside an element matching `selector` that is **inside `root`**, call `handler(event, matchedElement)`. Clicks on children of the match (icons, spans) count.\n- Ignore events outside a match.\n- Return a function that removes the listener.\n\nThe demo to-do list uses it for its delete buttons, including items added later.",
      "Реалізуйте `delegate(root, selector, type, handler)`:\n\n- Додає **один** обробник типу `type` на `root`.\n- Коли подія починається всередині елемента, що відповідає `selector` і знаходиться **всередині `root`**, викликайте `handler(event, matchedElement)`. Кліки по дочірніх елементах збігу (іконках, span) теж рахуються.\n- Ігноруйте події поза збігом.\n- Поверніть функцію, що знімає обробник.\n\nДемо-список справ використовує її для кнопок видалення, включно з елементами, доданими пізніше.",
    ],
    files: {
      "/src/delegate.js": "/**\n * @param {Element} root\n * @param {string} selector\n * @param {string} type\n * @param {(event: Event, match: Element) => void} handler\n * @returns {() => void} unsubscribe\n */\nexport function delegate(root, selector, type, handler) {\n  // TODO\n  return () => {};\n}\n",
      "/index.js": 'import "./styles.css";\nimport { delegate } from "./src/delegate";\n\nconst app = document.getElementById("app");\napp.innerHTML = `\n  <h1>To-do</h1>\n  <ul id="todos"></ul>\n  <button id="add" type="button">Add task</button>`;\nconst list = document.getElementById("todos");\nlet n = 0;\nfunction add() {\n  n++;\n  const li = document.createElement("li");\n  li.innerHTML = `<span>Task ${n}</span> <button class="delete" type="button" aria-label="Delete task ${n}"><b>×</b></button>`;\n  list.append(li);\n}\nadd();\nadd();\ndocument.getElementById("add").addEventListener("click", add);\ndelegate(list, "button.delete", "click", (_event, button) => button.closest("li").remove());\n',
    },
    visibleFiles: ["/src/delegate.js", "/index.js"],
    activeFile: "/src/delegate.js",
    tests: 'import { describe, it, expect, fn, screen, user } from "./test-kit";\nimport { delegate } from "../src/delegate";\n\nfunction fixture() {\n  const root = document.createElement("div");\n  root.innerHTML = `<button class="act"><span class="icon">i</span> Act</button><p class="other">x</p>`;\n  document.body.append(root);\n  return root;\n}\n\ndescribe("delegate", () => {\n  it("calls the handler with the matched element", () => {\n    const root = fixture();\n    const handler = fn();\n    delegate(root, ".act", "click", handler);\n    root.querySelector(".act").click();\n    expect(handler).toHaveBeenCalledTimes(1);\n    expect(handler.mock.calls[0][1]).toBe(root.querySelector(".act"));\n    root.remove();\n  });\n  it("matches clicks on children of the matched element", () => {\n    const root = fixture();\n    const handler = fn();\n    delegate(root, ".act", "click", handler);\n    root.querySelector(".icon").click();\n    expect(handler).toHaveBeenCalledTimes(1);\n    expect(handler.mock.calls[0][1]).toBe(root.querySelector(".act"));\n    root.remove();\n  });\n  it("ignores events outside a match", () => {\n    const root = fixture();\n    const handler = fn();\n    delegate(root, ".act", "click", handler);\n    root.querySelector(".other").click();\n    expect(handler).toHaveBeenCalledTimes(0);\n    root.remove();\n  });\n  it("ignores matches outside the root", () => {\n    const outer = document.createElement("div");\n    outer.className = "act";\n    const root = document.createElement("div");\n    root.innerHTML = "<span>inside</span>";\n    outer.append(root);\n    document.body.append(outer);\n    const handler = fn();\n    delegate(root, ".act", "click", handler);\n    root.querySelector("span").click();\n    expect(handler).toHaveBeenCalledTimes(0);\n    outer.remove();\n  });\n  it("returns an unsubscribe function", () => {\n    const root = fixture();\n    const handler = fn();\n    const off = delegate(root, ".act", "click", handler);\n    off();\n    root.querySelector(".act").click();\n    expect(handler).toHaveBeenCalledTimes(0);\n    root.remove();\n  });\n  it("works for items added later in the demo", async () => {\n    await user.click(screen.getByRole("button", { name: "Add task" }));\n    expect(screen.getAllByRole("listitem")).toHaveLength(3);\n    await user.click(screen.getByRole("button", { name: "Delete task 3" }).querySelector("b"));\n    expect(screen.getAllByRole("listitem")).toHaveLength(2);\n  });\n});\n',
    solution: {
      "/src/delegate.js": "export function delegate(root, selector, type, handler) {\n  function listener(event) {\n    const start = event.target instanceof Element ? event.target : event.target.parentElement;\n    const match = start && start.closest(selector);\n    if (match && root.contains(match)) handler(event, match);\n  }\n  root.addEventListener(type, listener);\n  return () => root.removeEventListener(type, listener);\n}\n",
    },
    explanation: [
      "Listen once on the root and let events bubble up to it. `event.target.closest(selector)` finds the nearest matching ancestor, so clicks on inner icons count. `root.contains(match)` rejects matches that live above the root. Keep a reference to the listener so the returned function can remove it.",
      "Слухайте один раз на корені й дозвольте подіям спливати до нього. `event.target.closest(selector)` знаходить найближчого предка, що відповідає селектору, тож кліки по внутрішніх іконках теж рахуються. `root.contains(match)` відкидає збіги, що лежать вище за корінь. Збережіть посилання на обробник, щоб повернена функція могла його зняти.",
    ],
  }),
]);
