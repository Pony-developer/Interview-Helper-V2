import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "dom-capture-order",
    ["dom-events"],
    3,
    75,
    ["Capture and bubble order", "Порядок перехоплення й спливання"],
    ["In what order are the messages logged?", "У якому порядку буде виведено повідомлення?"],
    [
      ["child, parent bubble, parent capture", "child, parent bubble, parent capture"],
      ["parent capture, child, parent bubble", "parent capture, child, parent bubble"],
      ["parent bubble, parent capture, child", "parent bubble, parent capture, child"],
      ["child, parent capture, parent bubble", "child, parent capture, parent bubble"],
    ],
    "b",
    [
      "An event travels down from the window to the target (capture phase), runs the target's listeners, then travels back up (bubble phase). Listeners registered with `true` or `{ capture: true }` run on the way down, so the parent's capture listener fires first even though it was added second.",
      "Подія спускається від window до цілі (фаза перехоплення), виконує обробники цілі, а потім піднімається назад (фаза спливання). Обробники, зареєстровані з `true` або `{ capture: true }`, спрацьовують на шляху вниз, тож обробник перехоплення батька виконується першим, хоч доданий другим.",
    ],
    {
      code: 'parent.addEventListener("click", () => console.log("parent bubble"));\nparent.addEventListener("click", () => console.log("parent capture"), true);\nchild.addEventListener("click", () => console.log("child"));\n\nchild.click();',
      codeLanguage: "js",
    },
  ),
  quiz(
    "dom-focus-delegation",
    ["dom-events"],
    4,
    75,
    ["Delegating focus events", "Делегування подій фокусу"],
    ["A delegated `focus` listener on a `<form>` never fires when its inputs get focus. Which fixes work? Select all that apply.", "Делегований обробник `focus` на `<form>` не спрацьовує, коли поля отримують фокус. Які виправлення працюють? Оберіть усі правильні."],
    [
      ["Listen for `focusin` instead, because it bubbles", "Слухати `focusin`, бо ця подія спливає"],
      ["Register the `focus` listener in the capture phase", "Зареєструвати обробник `focus` у фазі перехоплення"],
      ["Add `tabindex=\"0\"` to the form", "Додати `tabindex=\"0\"` до форми"],
      ["Call `event.stopPropagation()` inside the inputs", "Викликати `event.stopPropagation()` у полях"],
    ],
    "ab",
    [
      "`focus` and `blur` don't bubble, so a listener on an ancestor never sees them in the bubble phase. `focusin`/`focusout` are the bubbling equivalents, and a capture-phase listener sees every event on its way down to the target. Making the form focusable only lets the form itself take focus.",
      "`focus` і `blur` не спливають, тож обробник на предку не бачить їх у фазі спливання. `focusin`/`focusout` — їхні аналоги, що спливають, а обробник у фазі перехоплення бачить кожну подію на шляху до цілі. Якщо зробити форму фокусованою, фокус зможе отримати лише сама форма.",
    ],
  ),
  quiz(
    "dom-composed-events",
    ["dom-events"],
    5,
    120,
    ["Events and shadow DOM", "Події та shadow DOM"],
    ["A custom element dispatches this event from an element inside its shadow root. A listener on `document` never receives it. Why?", "Кастомний елемент надсилає цю подію з елемента всередині свого shadow root. Обробник на `document` її не отримує. Чому?"],
    [
      ["Custom events never bubble", "Кастомні події ніколи не спливають"],
      ["Without `composed: true`, the event stops at the shadow root", "Без `composed: true` подія зупиняється на shadow root"],
      ["`document` listeners only receive native events", "Обробники на `document` отримують лише нативні події"],
      ["`detail` must be a string", "`detail` має бути рядком"],
    ],
    "b",
    [
      "`bubbles` lets an event travel up the tree, but `composed` decides whether it crosses the shadow boundary into the light DOM. Without it, propagation ends at the shadow root. Composed events are retargeted, so outside listeners see the host element as `event.target`, keeping the internals encapsulated.",
      "`bubbles` дозволяє події підніматися деревом, а `composed` визначає, чи перетне вона межу тіньового дерева у світлий DOM. Без нього поширення закінчується на shadow root. Composed-події перенацілюються, тож зовнішні обробники бачать хост-елемент як `event.target`, а внутрішня будова лишається інкапсульованою.",
    ],
    {
      code: 'this.shadowRoot.querySelector("button").dispatchEvent(\n  new CustomEvent("rating-change", { bubbles: true, detail: { value: 4 } }),\n);',
      codeLanguage: "js",
    },
  ),
  practice({
    slug: "dom-click-outside",
    skills: ["dom-events"],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Close on outside click", "Закриття кліком поза елементом"],
    prompt: [
      "Implement `onClickOutside(element, handler)` for dropdowns and popovers.\n\n- Call `handler(event)` for `pointerdown` events whose target is **outside** `element`. Clicks on the element or any of its descendants are ignored.\n- Also call it when the user presses **Escape** anywhere.\n- Return a cleanup function that removes every listener it added.\n\nThe demo wires it to the menu on the page.",
      "Реалізуйте `onClickOutside(element, handler)` для випадних меню й поповерів.\n\n- Викликайте `handler(event)` для подій `pointerdown`, ціль яких **поза** `element`. Кліки по самому елементу чи його нащадках ігноруються.\n- Також викликайте його, коли користувач натискає **Escape** будь-де.\n- Поверніть функцію очищення, що знімає всі додані обробники.\n\nДемо підключає її до меню на сторінці.",
    ],
    files: {
      "/src/click-outside.ts":
        "export function onClickOutside(element: HTMLElement, handler: (event: Event) => void): () => void {\n  // TODO: listen on the document, ignore clicks inside `element`, handle Escape\n  return () => {};\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { onClickOutside } from "./src/click-outside";\n\nconst app = document.getElementById("app")!;\napp.innerHTML = \'<h1>Menu</h1><div id="menu" role="menu"><button role="menuitem">Rename</button></div><p id="status">open</p>\';\nconst menu = document.getElementById("menu")!;\nconst status = document.getElementById("status")!;\nonClickOutside(menu, () => {\n  status.textContent = "closed";\n});\n',
    },
    visibleFiles: ["/src/click-outside.ts", "/index.ts"],
    activeFile: "/src/click-outside.ts",
    tests:
      'import { describe, it, expect, fn } from "./test-kit";\nimport { onClickOutside } from "../src/click-outside";\n\nfunction setup() {\n  const box = document.createElement("div");\n  const inner = document.createElement("button");\n  const outside = document.createElement("p");\n  box.append(inner);\n  document.body.append(box, outside);\n  const handler = fn();\n  const stop = onClickOutside(box, handler);\n  const press = (target: Element) => target.dispatchEvent(new Event("pointerdown", { bubbles: true }));\n  const cleanup = () => {\n    stop();\n    box.remove();\n    outside.remove();\n  };\n  return { box, inner, outside, handler, stop, press, cleanup };\n}\n\ndescribe("onClickOutside", () => {\n  it("calls the handler for clicks outside", () => {\n    const t = setup();\n    t.press(t.outside);\n    expect(t.handler).toHaveBeenCalledTimes(1);\n    t.cleanup();\n  });\n  it("ignores clicks on the element and its children", () => {\n    const t = setup();\n    t.press(t.box);\n    t.press(t.inner);\n    expect(t.handler).toHaveBeenCalledTimes(0);\n    t.cleanup();\n  });\n  it("passes the event to the handler", () => {\n    const t = setup();\n    t.press(t.outside);\n    expect(t.handler.mock.calls[0][0].type).toBe("pointerdown");\n    t.cleanup();\n  });\n  it("closes on Escape but not on other keys", () => {\n    const t = setup();\n    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));\n    expect(t.handler).toHaveBeenCalledTimes(0);\n    t.inner.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));\n    expect(t.handler).toHaveBeenCalledTimes(1);\n    t.cleanup();\n  });\n  it("removes its listeners on cleanup", () => {\n    const t = setup();\n    t.stop();\n    t.press(t.outside);\n    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));\n    expect(t.handler).toHaveBeenCalledTimes(0);\n    t.cleanup();\n  });\n});\n',
    solution: {
      "/src/click-outside.ts":
        "export function onClickOutside(element: HTMLElement, handler: (event: Event) => void): () => void {\n  const onPointerDown = (event: Event) => {\n    if (!element.contains(event.target as Node)) handler(event);\n  };\n  const onKeyDown = (event: KeyboardEvent) => {\n    if (event.key === \"Escape\") handler(event);\n  };\n\n  document.addEventListener(\"pointerdown\", onPointerDown, true);\n  document.addEventListener(\"keydown\", onKeyDown);\n\n  return () => {\n    document.removeEventListener(\"pointerdown\", onPointerDown, true);\n    document.removeEventListener(\"keydown\", onKeyDown);\n  };\n}\n",
    },
    explanation: [
      "Listen on the document and use `element.contains(target)`, which is true for the element itself and every descendant. Registering `pointerdown` in the capture phase means a `stopPropagation()` elsewhere on the page can't hide the click. The cleanup must pass the same function references (and the same `capture` flag) to `removeEventListener`.",
      "Слухайте на document і використовуйте `element.contains(target)` — це true для самого елемента й усіх нащадків. Реєстрація `pointerdown` у фазі перехоплення означає, що `stopPropagation()` деінде на сторінці не приховає клік. Очищення має передати в `removeEventListener` ті самі посилання на функції (і той самий прапорець `capture`).",
    ],
  }),
]);
