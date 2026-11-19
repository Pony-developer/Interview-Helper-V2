import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sign up</title>
</head>
<body>
  <div class="page">
    <div class="title">Create your account</div>
    <div class="form">
      <input placeholder="Email" />
      <input placeholder="Password" />
      <div><input /> I accept the terms</div>
      <div class="btn" onclick="alert('sent')">Create account</div>
    </div>
  </div>

  <script src="index.js"></script>
</body>
</html>
`;

const SOLUTION_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sign up</title>
</head>
<body>
  <main>
    <h1>Create your account</h1>
    <form>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="email" required />

      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="new-password" minlength="8" required />

      <label>
        <input type="checkbox" name="terms" required />
        I accept the terms
      </label>

      <button type="submit">Create account</button>
    </form>
  </main>

  <script src="index.js"></script>
</body>
</html>
`;

export default defineTasks([
  quiz(
    "html-button-vs-div",
    ["html", w("web-accessibility")],
    1,
    60,
    ["Clickable div", "Клікабельний div"],
    ["Why is `<button>` better than `<div onclick>` for an action?", "Чому `<button>` кращий за `<div onclick>` для дії?"],
    [
      ["It's focusable, has a button role and activates with Enter and Space out of the box", "Він отримує фокус, має роль кнопки й активується Enter і Space без додаткового коду"],
      ["Divs can't have click handlers in modern browsers", "У сучасних браузерах div не може мати обробників кліку"],
      ["Buttons render faster", "Кнопки рендеряться швидше"],
      ["There is no practical difference", "Практичної різниці немає"],
    ],
    "a",
    [
      "A native button gets keyboard focus, the `button` role for assistive technology, Enter/Space activation and form submission semantics for free. A div needs `role`, `tabindex` and key handlers to approximate that.",
      "Нативна кнопка безкоштовно отримує фокус клавіатури, роль `button` для допоміжних технологій, активацію Enter/Space і семантику надсилання форми. Div потребує `role`, `tabindex` і обробників клавіш, щоб лише наблизитися до цього.",
    ],
  ),
  quiz(
    "html-defer-async",
    ["html", w("web-performance")],
    2,
    90,
    ["defer vs async", "defer проти async"],
    ["You have two scripts where `app.js` depends on `vendor.js`. Which attributes guarantee they don't block parsing **and** run in order?", "Є два скрипти, і `app.js` залежить від `vendor.js`. Які атрибути гарантують, що вони не блокують розбір **і** виконуються по порядку?"],
    [
      ["`async` on both", "`async` на обох"],
      ["`defer` on both", "`defer` на обох"],
      ["No attributes, placed in `<head>`", "Без атрибутів, у `<head>`"],
      ["`async` on vendor.js, `defer` on app.js", "`async` на vendor.js, `defer` на app.js"],
    ],
    "b",
    [
      "Deferred scripts download in parallel and execute after parsing, in document order. Async scripts run as soon as each one arrives, so their order isn't guaranteed. Plain scripts block the parser.",
      "Відкладені (defer) скрипти завантажуються паралельно й виконуються після розбору в порядку документа. Async-скрипти виконуються, щойно кожен надійде, тож порядок не гарантовано. Звичайні скрипти блокують розбір.",
    ],
  ),
  quiz(
    "html-button-default-type",
    ["html"],
    2,
    90,
    ["Unexpected submit", "Неочікуване надсилання"],
    ["Clicking \"Show password\" reloads the page. Why?", "Клік на «Show password» перезавантажує сторінку. Чому?"],
    [
      ["A `<button>` inside a `<form>` defaults to `type=\"submit\"`", "`<button>` усередині `<form>` за замовчуванням має `type=\"submit\"`"],
      ["`onclick` handlers always reload the page", "Обробники `onclick` завжди перезавантажують сторінку"],
      ["Password inputs submit forms when focused", "Поля паролів надсилають форму під час фокусу"],
      ["The form is missing an `action` attribute", "У формі немає атрибута `action`"],
    ],
    "a",
    [
      "Buttons in forms submit by default. Add `type=\"button\"` to buttons that aren't meant to submit, or call `preventDefault()` in the submit handler.",
      "Кнопки у формах за замовчуванням надсилають форму. Додайте `type=\"button\"` кнопкам, які не повинні надсилати, або викликайте `preventDefault()` в обробнику submit.",
    ],
    { code: "<form>\n  <input type=\"password\" id=\"pw\" />\n  <button onclick=\"toggle()\">Show password</button>\n  <button>Log in</button>\n</form>", codeLanguage: "html" },
  ),
  quiz(
    "html-label-association",
    ["html", w("web-accessibility")],
    2,
    90,
    ["Labelling inputs", "Мітки для полів"],
    ["Which of these give the input an accessible name? Select all that apply.", "Які з цих варіантів дають полю доступне ім'я? Оберіть усі правильні."],
    [
      ["`<label for=\"q\">Search</label><input id=\"q\">`", "`<label for=\"q\">Search</label><input id=\"q\">`"],
      ["`<label>Search <input></label>`", "`<label>Search <input></label>`"],
      ["`<input placeholder=\"Search\">` only", "лише `<input placeholder=\"Search\">`"],
      ["`<input aria-label=\"Search\">`", "`<input aria-label=\"Search\">`"],
    ],
    "abd",
    [
      "An explicit `for`/`id` pair, a wrapping label and `aria-label` all name the field. A placeholder is only a fallback hint: it vanishes while typing, often has poor contrast, and shouldn't replace a label.",
      "Явна пара `for`/`id`, обгортальна мітка й `aria-label` дають полю ім'я. Placeholder є лише запасною підказкою: зникає під час введення, часто має слабкий контраст і не повинен замінювати мітку.",
    ],
  ),
  quiz(
    "html-heading-order",
    ["html", w("web-accessibility"), w("seo")],
    3,
    120,
    ["Heading structure", "Структура заголовків"],
    ["A designer wants a small-looking heading right after the page `<h1>`. What should you use?", "Дизайнер хоче дрібний на вигляд заголовок одразу після `<h1>` сторінки. Що використати?"],
    [
      ["`<h4>`, because it's smaller by default", "`<h4>`, бо він за замовчуванням менший"],
      ["`<h2>` styled with CSS to look small", "`<h2>`, стилізований CSS під дрібний вигляд"],
      ["A `<div class=\"h4\">`", "`<div class=\"h4\">`"],
      ["`<strong>` inside a paragraph", "`<strong>` усередині абзацу"],
    ],
    "b",
    [
      "Heading levels describe the outline, not the visual size. Skipping from h1 to h4 confuses screen-reader navigation and the document outline. Use the correct level and adjust its look with CSS.",
      "Рівні заголовків описують структуру, а не візуальний розмір. Перехід від h1 одразу до h4 плутає навігацію зчитувачів екрана й структуру документа. Використайте правильний рівень і змініть вигляд через CSS.",
    ],
  ),
  practice({
    slug: "html-semantic-signup-form",
    skills: ["html", w("web-accessibility")],
    complexity: 2,
    estSeconds: 900,
    framework: "vanilla-js",
    title: ["Semantic sign-up form", "Семантична форма реєстрації"],
    prompt: [
      "Rewrite `index.html` so the sign-up page is semantic and accessible. Keep the `<script>` tag.\n\n- A `<main>` landmark with an `<h1>` \"Create your account\".\n- A real `<form>` with:\n  - an **Email** field: labelled, `type=\"email\"`, `autocomplete=\"email\"`, required;\n  - a **Password** field: labelled, `type=\"password\"`, `minlength=\"8\"`, required;\n  - a required checkbox labelled **I accept the terms**;\n  - a submit `<button>` \"Create account\".\n- No placeholder-only labels, no clickable divs.",
      "Перепишіть `index.html`, щоб сторінка реєстрації була семантичною й доступною. Залиште тег `<script>`.\n\n- Орієнтир `<main>` із `<h1>` «Create your account».\n- Справжня `<form>` з:\n  - полем **Email**: з міткою, `type=\"email\"`, `autocomplete=\"email\"`, обов'язкове;\n  - полем **Password**: з міткою, `type=\"password\"`, `minlength=\"8\"`, обов'язкове;\n  - обов'язковим чекбоксом з міткою **I accept the terms**;\n  - кнопкою надсилання `<button>` «Create account».\n- Жодних міток лише через placeholder і жодних клікабельних div.",
    ],
    files: {
      "/index.html": STARTER_HTML,
      "/index.js": 'import "./styles.css";\n\n// Prevent real navigation in the preview.\ndocument.addEventListener("submit", (e) => e.preventDefault());\n',
    },
    visibleFiles: ["/index.html"],
    activeFile: "/index.html",
    tests: 'import { describe, it, expect, screen } from "./test-kit";\n\ndescribe("sign-up page", () => {\n  it("has a main landmark and an h1", () => {\n    expect(document.querySelector("main")).toBeTruthy();\n    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Create your account");\n  });\n  it("uses a real form", () => {\n    const email = screen.getByLabelText("Email");\n    expect(email.closest("form")).toBeTruthy();\n  });\n  it("has a labelled, required email field", () => {\n    const email = screen.getByLabelText("Email");\n    expect(email).toHaveAttribute("type", "email");\n    expect(email).toHaveAttribute("autocomplete", "email");\n    expect(email).toHaveAttribute("required");\n  });\n  it("has a labelled password field with a minimum length", () => {\n    const pw = screen.getByLabelText("Password");\n    expect(pw).toHaveAttribute("type", "password");\n    expect(pw).toHaveAttribute("minlength", "8");\n    expect(pw).toHaveAttribute("required");\n  });\n  it("has a required, labelled terms checkbox", () => {\n    const box = screen.getByRole("checkbox", { name: /accept the terms/i });\n    expect(box).toHaveAttribute("required");\n  });\n  it("submits with a real button", () => {\n    const button = screen.getByRole("button", { name: "Create account" });\n    expect(button.tagName).toBe("BUTTON");\n    expect(button.getAttribute("type") ?? "submit").toBe("submit");\n    expect(document.querySelector("[onclick]")).toBeNull();\n  });\n});\n',
    solution: { "/index.html": SOLUTION_HTML },
    explanation: [
      "Semantic elements carry their meaning to browsers and assistive technology: `<main>` and `<h1>` structure the page, each `<label>` names its control, the input types and `autocomplete` give the right keyboard and autofill, `required`/`minlength` add native validation, and a `<button type=\"submit\">` submits the form with the keyboard too.",
      "Семантичні елементи передають своє значення браузерам і допоміжним технологіям: `<main>` і `<h1>` структурують сторінку, кожен `<label>` дає ім'я своєму полю, типи полів і `autocomplete` дають правильну клавіатуру й автозаповнення, `required`/`minlength` додають нативну валідацію, а `<button type=\"submit\">` надсилає форму й з клавіатури.",
    ],
  }),
]);
