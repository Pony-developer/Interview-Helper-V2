import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "a11y-aria-hidden-focusable",
    ["web-accessibility"],
    3,
    75,
    ["Hidden but focusable", "Приховане, але фокусоване"],
    ["When a drawer closes, it gets `aria-hidden=\"true\"` but stays in the DOM, off-screen. What is the problem?", "Коли бічна панель закривається, вона отримує `aria-hidden=\"true\"`, але лишається в DOM поза екраном. У чому проблема?"],
    [
      ["None; `aria-hidden` removes it for everyone", "Жодної; `aria-hidden` прибирає її для всіх"],
      ["Its links are still in the Tab order, so keyboard users land on invisible, unannounced controls", "Її посилання досі в порядку Tab, тож користувачі клавіатури потрапляють на невидимі елементи без озвучення"],
      ["Screen readers announce it twice", "Зчитувачі екрана озвучують її двічі"],
      ["`aria-hidden` only works on `<div>` elements", "`aria-hidden` працює лише для `<div>`"],
    ],
    "b",
    [
      "`aria-hidden` removes content from the accessibility tree but doesn't stop keyboard focus, which leaves focusable elements that screen readers can't describe. Use the `inert` attribute (it removes the content from both focus and the accessibility tree), or hide it with `display: none` / `hidden` when closed.",
      "`aria-hidden` прибирає вміст із дерева доступності, але не блокує фокус клавіатури, тож лишаються фокусовані елементи, які зчитувачі екрана не можуть описати. Використовуйте атрибут `inert` (він прибирає вміст і з фокусу, і з дерева доступності) або ховайте панель через `display: none` / `hidden`, коли вона закрита.",
    ],
  ),
  quiz(
    "a11y-name-precedence",
    ["web-accessibility"],
    4,
    75,
    ["Accessible name precedence", "Пріоритет доступної назви"],
    ["What accessible name does a screen reader announce for this button?", "Яку доступну назву оголосить зчитувач екрана для цієї кнопки?"],
    [
      ["\"Close\"", "\"Close\""],
      ["\"Remove item\"", "\"Remove item\""],
      ["\"Delete draft\"", "\"Delete draft\""],
      ["\"×\"", "\"×\""],
    ],
    "c",
    [
      "The accessible name algorithm checks `aria-labelledby` first, then `aria-label`, then native labelling (content, `<label>`, `alt`), and `title` last. `aria-labelledby` wins here, so the name is the text of `#draft-title`. Keep the visible label inside the accessible name so speech-control users can say what they see (WCAG 2.5.3).",
      "Алгоритм доступної назви спершу перевіряє `aria-labelledby`, далі `aria-label`, далі нативні мітки (вміст, `<label>`, `alt`), а `title` — останнім. Тут перемагає `aria-labelledby`, тож назва — це текст `#draft-title`. Тримайте видиму мітку в доступній назві, щоб користувачі голосового керування могли назвати те, що бачать (WCAG 2.5.3).",
    ],
    {
      code: '<h2 id="draft-title">Delete draft</h2>\n<button aria-labelledby="draft-title" aria-label="Remove item" title="Close">×</button>',
      codeLanguage: "html",
    },
  ),
  quiz(
    "a11y-focus-not-obscured",
    ["web-accessibility", { slug: "css", weight: 0.5 }],
    5,
    120,
    ["Focus hidden by a sticky header", "Фокус, схований липким заголовком"],
    ["Tabbing backwards through a long form, the focused field scrolls in underneath a 72px sticky header, so it can't be seen. Which WCAG 2.2 criterion fails, and what is the simplest CSS fix?", "Під час переходу Shift+Tab довгою формою поле з фокусом прокручується під липкий заголовок висотою 72px і стає невидимим. Який критерій WCAG 2.2 порушено і яке найпростіше CSS-виправлення?"],
    [
      ["Focus Visible; add `outline: 3px solid`", "Focus Visible; додати `outline: 3px solid`"],
      ["Focus Not Obscured (Minimum); add `html { scroll-padding-top: 80px; }`", "Focus Not Obscured (Minimum); додати `html { scroll-padding-top: 80px; }`"],
      ["Target Size; make the inputs taller", "Target Size; зробити поля вищими"],
      ["Reflow; remove the sticky header on mobile", "Reflow; прибрати липкий заголовок на мобільних"],
    ],
    "b",
    [
      "2.4.11 Focus Not Obscured (Minimum, AA) requires that a focused component is not entirely hidden by author-created content such as sticky headers or cookie banners. `scroll-padding-top` on the scroll container makes the browser leave room at the top when it scrolls focused elements into view. The outline is visible here; it's just covered.",
      "2.4.11 Focus Not Obscured (Minimum, AA) вимагає, щоб компонент із фокусом не був повністю схований вмістом автора, як-от липкими заголовками чи банерами cookie. `scroll-padding-top` на контейнері прокрутки змушує браузер лишати місце зверху, коли він прокручує елементи з фокусом у видиму область. Рамка тут видима — її просто перекрито.",
    ],
  ),
  practice({
    slug: "a11y-roving-tabindex",
    skills: ["web-accessibility", { slug: "dom-events", weight: 0.5 }],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Keyboard toolbar (roving tabindex)", "Панель інструментів із клавіатурою (roving tabindex)"],
    prompt: [
      "Make the formatting toolbar follow the ARIA toolbar pattern. Implement `initToolbar(toolbar)`:\n\n- Exactly one button has `tabindex=\"0\"` (initially the first); every other button has `tabindex=\"-1\"`. The toolbar is then a single Tab stop.\n- **ArrowRight** / **ArrowLeft** move focus to the next / previous button, wrapping around at the ends.\n- **Home** / **End** move to the first / last button.\n- Whenever focus moves, update the tabindexes so the focused button is the Tab stop, and call `preventDefault()` for handled keys.\n- Clicking a button also makes it the Tab stop.",
      "Зробіть панель форматування відповідною шаблону ARIA toolbar. Реалізуйте `initToolbar(toolbar)`:\n\n- Рівно одна кнопка має `tabindex=\"0\"` (спершу перша); решта мають `tabindex=\"-1\"`. Тоді панель — одна зупинка Tab.\n- **ArrowRight** / **ArrowLeft** переносять фокус на наступну / попередню кнопку з переходом по колу на краях.\n- **Home** / **End** переходять на першу / останню кнопку.\n- Щоразу, коли фокус переходить, оновлюйте tabindex так, щоб кнопка з фокусом була зупинкою Tab, і викликайте `preventDefault()` для оброблених клавіш.\n- Клік по кнопці теж робить її зупинкою Tab.",
    ],
    files: {
      "/src/toolbar.ts": "export function initToolbar(toolbar: HTMLElement): void {\n  // TODO: roving tabindex + arrow, Home and End keys\n}\n",
      "/index.html":
        '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Toolbar</title>\n  </head>\n  <body>\n    <div id="app">\n      <div role="toolbar" aria-label="Text formatting" id="toolbar">\n        <button type="button">Bold</button>\n        <button type="button">Italic</button>\n        <button type="button">Underline</button>\n        <button type="button">Link</button>\n      </div>\n      <p contenteditable="true">Select some text and use the toolbar.</p>\n    </div>\n    <script src="index.ts"></script>\n  </body>\n</html>\n',
      "/index.ts": 'import "./styles.css";\nimport { initToolbar } from "./src/toolbar";\n\ninitToolbar(document.getElementById("toolbar")!);\n',
    },
    visibleFiles: ["/src/toolbar.ts", "/index.html", "/index.ts"],
    activeFile: "/src/toolbar.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\n\nconst toolbar = document.getElementById("toolbar")!;\nconst buttons = Array.from(toolbar.querySelectorAll("button"));\nconst tabStops = () => buttons.map((b) => b.getAttribute("tabindex"));\nfunction press(key: string) {\n  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });\n  (document.activeElement ?? toolbar).dispatchEvent(event);\n  return event;\n}\n\ndescribe("toolbar", () => {\n  it("starts with a single Tab stop on the first button", () => {\n    expect(tabStops()).toEqual(["0", "-1", "-1", "-1"]);\n  });\n  it("moves focus with the arrow keys", () => {\n    buttons[0].focus();\n    press("ArrowRight");\n    expect(document.activeElement === buttons[1]).toBe(true);\n    expect(tabStops()).toEqual(["-1", "0", "-1", "-1"]);\n    press("ArrowLeft");\n    expect(document.activeElement === buttons[0]).toBe(true);\n  });\n  it("wraps around at both ends", () => {\n    buttons[0].focus();\n    press("ArrowLeft");\n    expect(document.activeElement === buttons[3]).toBe(true);\n    press("ArrowRight");\n    expect(document.activeElement === buttons[0]).toBe(true);\n  });\n  it("supports Home and End", () => {\n    buttons[1].focus();\n    press("End");\n    expect(document.activeElement === buttons[3]).toBe(true);\n    press("Home");\n    expect(document.activeElement === buttons[0]).toBe(true);\n    expect(tabStops()).toEqual(["0", "-1", "-1", "-1"]);\n  });\n  it("prevents default only for handled keys", () => {\n    buttons[0].focus();\n    expect(press("ArrowRight").defaultPrevented).toBe(true);\n    expect(press("a").defaultPrevented).toBe(false);\n  });\n  it("makes a clicked button the Tab stop", () => {\n    buttons[2].click();\n    expect(tabStops()).toEqual(["-1", "-1", "0", "-1"]);\n  });\n});\n',
    solution: {
      "/src/toolbar.ts":
        "export function initToolbar(toolbar: HTMLElement): void {\n  const buttons = Array.from(toolbar.querySelectorAll<HTMLButtonElement>(\"button\"));\n  if (buttons.length === 0) return;\n\n  const makeTabStop = (target: HTMLButtonElement) => {\n    for (const button of buttons) button.tabIndex = button === target ? 0 : -1;\n  };\n  const focusAt = (index: number) => {\n    const target = buttons[(index + buttons.length) % buttons.length];\n    makeTabStop(target);\n    target.focus();\n  };\n\n  makeTabStop(buttons[0]);\n\n  toolbar.addEventListener(\"keydown\", (event) => {\n    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);\n    if (current === -1) return;\n    const moves: Record<string, number> = {\n      ArrowRight: current + 1,\n      ArrowLeft: current - 1,\n      Home: 0,\n      End: buttons.length - 1,\n    };\n    if (!(event.key in moves)) return;\n    event.preventDefault();\n    focusAt(moves[event.key]);\n  });\n\n  toolbar.addEventListener(\"click\", (event) => {\n    const button = (event.target as HTMLElement).closest(\"button\");\n    if (button && buttons.includes(button as HTMLButtonElement)) makeTabStop(button as HTMLButtonElement);\n  });\n}\n",
    },
    explanation: [
      "A roving tabindex keeps composite widgets to a single Tab stop: the active item gets `tabindex=\"0\"` and all the others get `-1`, so Tab moves past the toolbar while the arrow keys move within it. One delegated `keydown` listener maps keys to target indexes, and modulo arithmetic handles the wrapping. Handled keys call `preventDefault()` so arrows don't also scroll the page.",
      "Roving tabindex зводить складені віджети до однієї зупинки Tab: активний елемент отримує `tabindex=\"0\"`, а всі інші — `-1`, тож Tab проходить повз панель, а стрілки рухаються всередині неї. Один делегований обробник `keydown` зіставляє клавіші з цільовими індексами, а арифметика за модулем забезпечує перехід по колу. Оброблені клавіші викликають `preventDefault()`, щоб стрілки ще й не прокручували сторінку.",
    ],
  }),
]);
