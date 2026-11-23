import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 90–98 of the Middle list: tests. */
export const middleTestingQuiz: SlideDef = {
  kind: "quiz",
  slug: "middle-testing-quiz",
  title: { en: "Tests", uk: "Тести" },
  questions: [
    question(
      "why-testing",
      ["Why do teams introduce testing?", "Для чого команди впроваджують тестування?"],
      [
        ["To catch regressions before users see them", "Щоб ловити регресії раніше, ніж їх побачать користувачі"],
        ["To change and refactor code with confidence", "Щоб упевнено змінювати й рефакторити код"],
        ["To guarantee the code has no bugs at all", "Щоб гарантувати, що в коді взагалі немає багів"],
        ["Tests document how the code is supposed to behave", "Тести документують, як код має поводитися"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "testing-not-worth",
      ["When might automated tests not be worth writing?", "Коли автоматичні тести можуть бути недоцільними?"],
      [
        ["For payment logic", "Для логіки платежів"],
        [
          "For a throwaway prototype or a short experiment whose code will soon be deleted, where the cost is higher than the benefit",
          "Для одноразового прототипу чи короткого експерименту, код якого скоро видалять, коли витрати більші за користь",
        ],
        ["For a shared library used by many teams", "Для спільної бібліотеки, якою користуються багато команд"],
        ["For code that changes often and often breaks", "Для коду, що часто змінюється і часто ламається"],
      ],
      "b",
    ),
    question(
      "test-types",
      ["Which of these are kinds of testing?", "Що з цього — види тестування?"],
      [
        ["Unit, integration and end-to-end tests", "Юніт-, інтеграційні та end-to-end тести"],
        ["Syntax highlighting tests", "Тести підсвічування синтаксису"],
        ["Visual regression and snapshot tests", "Тести візуальної регресії та snapshot-тести"],
        ["Performance and accessibility tests", "Тести продуктивності та доступності"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "e2e-vs-unit",
      ["How do end-to-end tests differ from unit tests?", "Чим end-to-end тести відрізняються від юніт-тестів?"],
      [
        ["It is the other way around: unit tests run in a real browser", "Навпаки: юніт-тести запускаються в справжньому браузері"],
        ["They are the same thing", "Це одне й те саме"],
        [
          "A unit test checks one small piece in isolation and is fast; an e2e test drives the whole app in a real browser like a user, is slower and more brittle, but catches integration problems",
          "Юніт-тест перевіряє одну невелику частину ізольовано й працює швидко; e2e-тест проганяє весь застосунок у справжньому браузері, як користувач, він повільніший і крихкіший, зате ловить проблеми інтеграції",
        ],
        ["E2E tests are only for the backend", "E2E-тести лише для бекенда"],
      ],
      "c",
    ),
    question(
      "test-tools",
      ["Which of these tools is built for end-to-end tests in a real browser?", "Який із цих інструментів створений для end-to-end тестів у справжньому браузері?"],
      [
        ["ESLint", "ESLint"],
        ["Jest", "Jest"],
        ["webpack", "webpack"],
        ["Playwright", "Playwright"],
      ],
      "d",
    ),
    question(
      "test-rest-api",
      ["What should you check when testing a REST API?", "Що варто перевіряти під час тестування REST API?"],
      [
        ["Status codes and response bodies for valid requests", "Статус-коди й тіла відповідей на коректні запити"],
        ["Error handling for invalid input, missing auth and missing resources (400, 401, 404)", "Обробку помилок для некоректних даних, відсутньої автентифікації й неіснуючих ресурсів (400, 401, 404)"],
        ["Only that the server answers at all", "Лише те, що сервер узагалі відповідає"],
        ["The response schema, for example against an OpenAPI specification", "Схему відповіді, наприклад за специфікацією OpenAPI"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "tdd",
      ["What is TDD?", "Що таке TDD?"],
      [
        ["Testing the code after it is deployed", "Тестування коду після деплою"],
        [
          "Red, green, refactor: write a failing test first, then the minimum code that passes it, then clean up",
          "Red, green, refactor: спершу написати тест, що падає, потім мінімальний код, що його проходить, потім прибрати",
        ],
        ["Writing design documents before tests", "Написання дизайн-документів перед тестами"],
        ["Testing only by hand", "Тестування лише вручну"],
      ],
      "b",
    ),
    question(
      "what-to-cover",
      ["Which code is usually most worth covering with tests?", "Який код зазвичай найбільше варто покривати тестами?"],
      [
        [
          "Business-critical and complex logic that breaks easily (calculations, validation, permissions), and places where bugs have already happened",
          "Критичну для бізнесу й складну логіку, яка легко ламається (обчислення, валідація, права доступу), і місця, де баги вже траплялися",
        ],
        ["Every getter, to reach 100% coverage", "Кожен геттер, щоб досягти 100% покриття"],
        ["The internals of third-party libraries", "Внутрішню будову сторонніх бібліотек"],
        ["Static markup with no logic", "Статичну розмітку без логіки"],
      ],
      "a",
    ),
    question(
      "debugging",
      ["Which techniques help find and isolate bugs?", "Які прийоми допомагають знаходити й ізолювати баги?"],
      [
        ["Breakpoints and step-by-step debugging in DevTools, including `debugger;`", "Точки зупину й покрокове налагодження в DevTools, зокрема `debugger;`"],
        ["Reproducing the bug in a minimal case or a failing test", "Відтворення бага на мінімальному прикладі чи в тесті, що падає"],
        ["Changing code at random until it works", "Змінювати код навмання, доки не запрацює"],
        ["`git bisect` to find the commit that introduced the bug", "`git bisect`, щоб знайти коміт, який додав баг"],
      ],
      ["a", "b", "d"],
    ),
  ],
};

/** Questions 99–103 of the Middle list: accessibility. */
export const middleAccessibilityQuiz: SlideDef = {
  kind: "quiz",
  slug: "middle-accessibility-quiz",
  title: { en: "Accessibility", uk: "Accessibility" },
  questions: [
    question(
      "wcag-levels",
      ["What are the WCAG conformance levels?", "Які рівні відповідності WCAG?"],
      [
        ["1, 2, 3 and 4", "1, 2, 3 і 4"],
        ["Bronze, silver and gold", "Бронзовий, срібний і золотий"],
        [
          "A (the minimum), AA (the usual legal and industry target) and AAA (the strictest, not expected for whole sites)",
          "A (мінімальний), AA (звична вимога законів і галузі) і AAA (найсуворіший, якого не очікують для цілих сайтів)",
        ],
        ["Low and high", "Низький і високий"],
      ],
      "c",
    ),
    question(
      "keyboard-nav",
      ["Which of these matter for keyboard navigation?", "Що з цього важливо для навігації з клавіатури?"],
      [
        ["Removing focus outlines so the page looks cleaner", "Прибрати обведення фокуса, щоб сторінка виглядала чистіше"],
        ["A logical focus order that follows the DOM, without positive `tabindex` values", "Логічний порядок фокуса, що відповідає DOM, без додатних значень `tabindex`"],
        ["A visible focus style, for example with `:focus-visible`", "Видимий стиль фокуса, наприклад через `:focus-visible`"],
        [
          "Focus kept inside an open modal and returned to the trigger when it closes",
          "Фокус утримується всередині відкритого модального вікна й повертається на кнопку, що його відкрила, після закриття",
        ],
      ],
      ["b", "c", "d"],
    ),
    question(
      "landmarks",
      [
        "What are HTML5 landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`) used for?",
        "Для чого використовують HTML5 landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`)?",
      ],
      [
        ["Only for styling", "Лише для стилізації"],
        [
          "They let users of assistive technology jump between regions of the page, for example straight to the main content",
          "Вони дають користувачам допоміжних технологій переходити між частинами сторінки, наприклад одразу до основного вмісту",
        ],
        ["Only for SEO", "Лише для SEO"],
        ["For form validation", "Для валідації форм"],
      ],
      "b",
    ),
    question(
      "spa-a11y",
      ["Which accessibility problems are common in SPAs?", "Які проблеми з доступністю часто трапляються в SPA?"],
      [
        ["Route changes are not announced, and focus stays where it was", "Зміна маршруту не озвучується, а фокус лишається там, де був"],
        ["The page `<title>` doesn't change on navigation", "`<title>` сторінки не змінюється під час навігації"],
        ["Clickable `<div>`s instead of links and buttons", "Клікабельні `<div>` замість посилань і кнопок"],
        ["Server-rendered HTML", "HTML, відрендерений на сервері"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "designer-advice",
      ["Which accessibility advice would you give a designer?", "Які поради щодо доступності ви дали б дизайнеру?"],
      [
        ["Enough color contrast: at least 4.5:1 for normal text under WCAG AA", "Достатній контраст кольорів: щонайменше 4,5:1 для звичайного тексту за WCAG AA"],
        ["Don't convey meaning by color alone", "Не передавати зміст лише кольором"],
        ["Use placeholder text instead of visible labels", "Використовувати placeholder замість видимих підписів"],
        ["Design visible focus states and touch targets that are large enough", "Передбачити видимі стани фокуса й достатньо великі області дотику"],
      ],
      ["a", "b", "d"],
    ),
  ],
};
