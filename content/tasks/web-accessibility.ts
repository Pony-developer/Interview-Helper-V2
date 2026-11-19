import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "a11y-first-rule",
    ["web-accessibility"],
    1,
    60,
    ["The first rule of ARIA", "Перше правило ARIA"],
    ["What does adding `role=\"button\"` to a `<div>` give you?", "Що дає додавання `role=\"button\"` до `<div>`?"],
    [
      ["Screen readers announce it as a button, but it still isn't focusable or keyboard-operable", "Зчитувачі оголошують його як кнопку, але він досі не отримує фокус і не працює з клавіатури"],
      ["Full button behaviour, including Enter and Space", "Повну поведінку кнопки, включно з Enter і Space"],
      ["Native form submission", "Нативне надсилання форми"],
      ["Nothing; roles are ignored on divs", "Нічого; ролі на div ігноруються"],
    ],
    "a",
    [
      "ARIA changes semantics, not behaviour. You'd still need `tabindex=\"0\"`, key handlers and focus styles. That's why the first rule of ARIA is to use the native element (`<button>`) whenever possible.",
      "ARIA змінює семантику, а не поведінку. Вам усе одно знадобляться `tabindex=\"0\"`, обробники клавіш і стилі фокусу. Тому перше правило ARIA: використовувати нативний елемент (`<button>`), коли це можливо.",
    ],
  ),
  quiz(
    "a11y-icon-button",
    ["web-accessibility", w("html")],
    1,
    60,
    ["Icon-only buttons", "Кнопки лише з іконкою"],
    ["How do you give an icon-only \"close\" button an accessible name?", "Як дати доступне ім'я кнопці «закрити», що містить лише іконку?"],
    [
      ["`<button aria-label=\"Close\"><svg aria-hidden=\"true\">…</svg></button>`", "`<button aria-label=\"Close\"><svg aria-hidden=\"true\">…</svg></button>`"],
      ["`<button title=\"\"><svg>…</svg></button>`", "`<button title=\"\"><svg>…</svg></button>`"],
      ["`<div class=\"close-icon\"></div>`", "`<div class=\"close-icon\"></div>`"],
      ["Rely on the icon's shape", "Покластися на форму іконки"],
    ],
    "a",
    [
      "`aria-label` (or visually hidden text) names the button, and `aria-hidden` on the decorative SVG prevents noise. A div isn't a button, and an empty title gives no name.",
      "`aria-label` (або візуально прихований текст) дає кнопці ім'я, а `aria-hidden` на декоративному SVG прибирає зайвий шум. Div не є кнопкою, а порожній title не дає імені.",
    ],
  ),
  quiz(
    "a11y-contrast",
    ["web-accessibility"],
    2,
    90,
    ["Contrast requirements", "Вимоги до контрасту"],
    ["Under WCAG 2.x level AA, what is the minimum contrast ratio for normal-size body text?", "Який мінімальний коефіцієнт контрасту для основного тексту звичайного розміру вимагає WCAG 2.x на рівні AA?"],
    [
      ["3:1", "3:1"],
      ["4.5:1", "4,5:1"],
      ["7:1", "7:1"],
      ["2:1", "2:1"],
    ],
    "b",
    [
      "AA requires 4.5:1 for normal text and 3:1 for large text (≈24px regular or 18.66px bold) and for UI component boundaries and focus indicators. 7:1 is the stricter AAA level.",
      "AA вимагає 4,5:1 для звичайного тексту і 3:1 для великого (≈24px звичайного чи 18,66px жирного), а також для меж елементів інтерфейсу й індикаторів фокусу. 7:1 є суворішим рівнем AAA.",
    ],
  ),
  quiz(
    "a11y-modal-focus",
    ["web-accessibility"],
    3,
    120,
    ["Modal focus management", "Керування фокусом у модальному вікні"],
    ["Which behaviours does an accessible modal dialog need? Select all that apply.", "Яка поведінка потрібна доступному модальному діалогу? Оберіть усі правильні."],
    [
      ["Move focus into the dialog when it opens", "Перенести фокус у діалог під час відкриття"],
      ["Keep Tab focus inside the dialog while it's open", "Утримувати фокус Tab усередині діалогу, поки він відкритий"],
      ["Close on Escape and return focus to the element that opened it", "Закриватися на Escape й повертати фокус на елемент, що його відкрив"],
      ["Remove the focus outline so the design stays clean", "Прибрати обведення фокусу, щоб дизайн був чистим"],
    ],
    "abc",
    [
      "Keyboard and screen-reader users must land in the dialog, not tab into the page behind it, and get back where they were afterwards. The native `<dialog>` with `showModal()` provides inertness and Escape handling. Removing focus outlines breaks WCAG 2.4.7.",
      "Користувачі клавіатури й зчитувачів екрана мають потрапити в діалог, а не переходити Tab на сторінку під ним, і після закриття повернутися туди, де були. Нативний `<dialog>` із `showModal()` забезпечує інертність фону й обробку Escape. Прибрання обведення фокусу порушує WCAG 2.4.7.",
    ],
  ),
  quiz(
    "a11y-live-region",
    ["web-accessibility"],
    4,
    150,
    ["Announcing updates", "Оголошення оновлень"],
    ["After \"Add to cart\", a small badge updates silently. How do you let screen-reader users know without moving focus?", "Після «Додати в кошик» маленький бейдж оновлюється мовчки. Як повідомити користувачам зчитувачів екрана, не переносячи фокус?"],
    [
      ["Render a status message in an element with `role=\"status\"` (aria-live=\"polite\") that exists before the update", "Виводити повідомлення в елемент із `role=\"status\"` (aria-live=\"polite\"), що існує ще до оновлення"],
      ["Use `alert()`", "Використати `alert()`"],
      ["Add `aria-hidden=\"false\"` to the badge", "Додати бейджу `aria-hidden=\"false\"`"],
      ["Change the badge colour to red", "Змінити колір бейджа на червоний"],
    ],
    "a",
    [
      "Live regions are announced when their content changes, but the region must already be in the DOM, otherwise some screen readers miss the first update. Use `polite` for non-urgent status and `role=\"alert\"` (assertive) for errors.",
      "Живі регіони оголошуються, коли змінюється їхній вміст, але сам регіон має вже бути в DOM, інакше деякі зчитувачі пропустять перше оновлення. Використовуйте `polite` для нетермінових статусів і `role=\"alert\"` (assertive) для помилок.",
    ],
  ),
  practice({
    slug: "a11y-accessible-switch",
    skills: ["web-accessibility", w("dom-events")],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-js",
    title: ["Make a custom switch accessible", "Зробіть власний перемикач доступним"],
    prompt: [
      "The design uses `<div class=\"switch\" data-label=\"…\">` toggles. Implement `enhanceSwitch(el, onChange)` so each one behaves like a real switch:\n\n- Role `switch`, named by `data-label` (`aria-label`), reachable with **Tab**.\n- `aria-checked` reflects the state, starting as `\"false\"`.\n- Toggles on **click**, **Space** and **Enter**. Space must not scroll the page (`preventDefault`).\n- Calls `onChange(checked)` after each toggle.",
      "Дизайн використовує перемикачі `<div class=\"switch\" data-label=\"…\">`. Реалізуйте `enhanceSwitch(el, onChange)`, щоб кожен поводився як справжній перемикач:\n\n- Роль `switch`, ім'я з `data-label` (`aria-label`), доступний через **Tab**.\n- `aria-checked` відображає стан і спершу дорівнює `\"false\"`.\n- Перемикається **кліком**, **Space** і **Enter**. Space не повинен прокручувати сторінку (`preventDefault`).\n- Викликає `onChange(checked)` після кожного перемикання.",
    ],
    files: {
      "/src/switch.js": "/**\n * @param {HTMLElement} el\n * @param {(checked: boolean) => void} onChange\n */\nexport function enhanceSwitch(el, onChange) {\n  // TODO: role, name, focusability, state, click + keyboard\n  el.addEventListener(\"click\", () => {\n    el.classList.toggle(\"on\");\n    onChange(el.classList.contains(\"on\"));\n  });\n}\n",
      "/index.js": 'import "./styles.css";\nimport { enhanceSwitch } from "./src/switch";\n\nconst app = document.getElementById("app");\napp.innerHTML = `\n  <h1>Settings</h1>\n  <div class="switch" data-label="Dark mode"></div>\n  <div class="switch" data-label="Email notifications"></div>\n  <p id="status" role="status"></p>`;\nconst status = document.getElementById("status");\nfor (const el of document.querySelectorAll(".switch")) {\n  enhanceSwitch(el, (on) => (status.textContent = `${el.dataset.label}: ${on ? "on" : "off"}`));\n}\n',
      "/styles.css": ".switch {\n  display: inline-block;\n  width: 44px;\n  height: 24px;\n  margin: 8px 0;\n  border-radius: 999px;\n  background: #9aa;\n  cursor: pointer;\n  position: relative;\n}\n.switch::after {\n  content: \"\";\n  position: absolute;\n  top: 3px;\n  left: 3px;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: white;\n  transition: transform 0.2s;\n}\n.switch.on,\n.switch[aria-checked=\"true\"] {\n  background: #0b5a43;\n}\n.switch.on::after,\n.switch[aria-checked=\"true\"]::after {\n  transform: translateX(20px);\n}\n.switch:focus-visible {\n  outline: 3px solid #c9a227;\n  outline-offset: 2px;\n}\n",
    },
    visibleFiles: ["/src/switch.js", "/index.js"],
    activeFile: "/src/switch.js",
    tests: 'import { describe, it, expect, fn, screen, user } from "./test-kit";\nimport { enhanceSwitch } from "../src/switch";\n\nfunction make(label = "Wi-Fi") {\n  const el = document.createElement("div");\n  el.className = "switch";\n  el.dataset.label = label;\n  document.body.append(el);\n  return el;\n}\nfunction key(el, k) {\n  const e = new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true });\n  el.dispatchEvent(e);\n  return e;\n}\n\ndescribe("enhanceSwitch", () => {\n  it("exposes role, name and initial state, and is focusable", () => {\n    const el = make();\n    enhanceSwitch(el, () => {});\n    expect(el).toHaveAttribute("role", "switch");\n    expect(el).toHaveAttribute("aria-label", "Wi-Fi");\n    expect(el).toHaveAttribute("aria-checked", "false");\n    expect(el.tabIndex).toBe(0);\n    el.remove();\n  });\n  it("toggles on click and reports the state", () => {\n    const el = make();\n    const onChange = fn();\n    enhanceSwitch(el, onChange);\n    el.click();\n    expect(el).toHaveAttribute("aria-checked", "true");\n    el.click();\n    expect(el).toHaveAttribute("aria-checked", "false");\n    expect(onChange.mock.calls).toEqual([[true], [false]]);\n    el.remove();\n  });\n  it("toggles with Space and Enter, and Space doesn\'t scroll", () => {\n    const el = make();\n    const onChange = fn();\n    enhanceSwitch(el, onChange);\n    const space = key(el, " ");\n    expect(el).toHaveAttribute("aria-checked", "true");\n    expect(space.defaultPrevented).toBe(true);\n    key(el, "Enter");\n    expect(el).toHaveAttribute("aria-checked", "false");\n    key(el, "a");\n    expect(onChange).toHaveBeenCalledTimes(2);\n    el.remove();\n  });\n  it("works in the settings demo", async () => {\n    const dark = screen.getByRole("switch", { name: "Dark mode" });\n    await user.click(dark);\n    expect(screen.getByRole("status")).toHaveTextContent("Dark mode: on");\n  });\n});\n',
    solution: {
      "/src/switch.js": "export function enhanceSwitch(el, onChange) {\n  el.setAttribute(\"role\", \"switch\");\n  el.setAttribute(\"aria-label\", el.dataset.label ?? \"\");\n  el.setAttribute(\"aria-checked\", \"false\");\n  el.tabIndex = 0;\n\n  function toggle() {\n    const checked = el.getAttribute(\"aria-checked\") !== \"true\";\n    el.setAttribute(\"aria-checked\", String(checked));\n    onChange(checked);\n  }\n\n  el.addEventListener(\"click\", toggle);\n  el.addEventListener(\"keydown\", (event) => {\n    if (event.key === \" \" || event.key === \"Enter\") {\n      event.preventDefault(); // Space would otherwise scroll the page\n      toggle();\n    }\n  });\n}\n",
    },
    explanation: [
      "`role=\"switch\"` with `aria-checked` tells assistive technology what the control is and its state, `aria-label` names it, and `tabIndex = 0` puts it in the tab order. Because ARIA adds no behaviour, you wire up Space and Enter yourself and prevent Space's default scroll. Keeping state in `aria-checked` lets CSS style `[aria-checked=\"true\"]` from a single source of truth. A native `<button aria-pressed>` or `<input type=\"checkbox\" role=\"switch\">` would need less code.",
      "`role=\"switch\"` разом з `aria-checked` повідомляє допоміжним технологіям, що це за елемент і в якому він стані, `aria-label` дає ім'я, а `tabIndex = 0` додає його в порядок табуляції. Оскільки ARIA не додає поведінки, Space і Enter треба під'єднати самостійно та скасувати прокрутку від Space. Стан в `aria-checked` дозволяє CSS стилізувати `[aria-checked=\"true\"]` з одного джерела правди. Нативні `<button aria-pressed>` або `<input type=\"checkbox\" role=\"switch\">` потребували б менше коду.",
    ],
  }),
]);
