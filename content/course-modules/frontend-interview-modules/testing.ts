import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 178–180 of the Junior list: testing. */
export const testingQuiz: SlideDef = {
  kind: "quiz",
  slug: "testing-quiz",
  title: { en: "Testing", uk: "Тестування" },
  questions: [
    question(
      "bug-responsibility",
      ["A bug reached production. Whose responsibility is it?", "Баг потрапив на продакшн. Чия це відповідальність?"],
      [
        ["Only the tester's", "Лише тестувальника"],
        ["Only the developer's", "Лише розробника"],
        [
          "The team's: quality is shared, so the useful question is how the process let it through (tests, review, QA) and how to close that gap",
          "Команди: якість — спільна справа, тож корисне питання в тому, як процес його пропустив (тести, рев'ю, QA) і як закрити цю прогалину",
        ],
        ["The user's, for finding it", "Користувача, бо він його знайшов"],
      ],
      "c",
    ),
    question(
      "how-to-test",
      ["Which of these are levels of testing frontend code?", "Які з цього — рівні тестування фронтенд-коду?"],
      [
        ["Unit tests for functions and components (Vitest, Jest)", "Юніт-тести для функцій і компонентів (Vitest, Jest)"],
        ["No tests at all: users will report the bugs", "Жодних тестів: користувачі самі повідомлять про баги"],
        ["Integration tests, for example components with Testing Library", "Інтеграційні тести, наприклад компонентів із Testing Library"],
        ["End-to-end tests in a real browser (Playwright, Cypress)", "End-to-end тести в справжньому браузері (Playwright, Cypress)"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "aaa",
      ["What does AAA stand for in testing?", "Що означає AAA в тестуванні?"],
      [
        ["Analyze, Automate, Approve", "Analyze, Automate, Approve"],
        [
          "Arrange, Act, Assert: prepare the data, run the code under test, check the result",
          "Arrange, Act, Assert: підготувати дані, виконати код, що тестується, перевірити результат",
        ],
        ["Always Assert Anything", "Always Assert Anything"],
        ["API, Accessibility, Animation", "API, Accessibility, Animation"],
      ],
      "b",
    ),
  ],
};

/** Questions 181–185 of the Junior list: accessibility. */
export const accessibilityQuiz: SlideDef = {
  kind: "quiz",
  slug: "accessibility-quiz",
  title: { en: "Accessibility", uk: "Accessibility" },
  questions: [
    question(
      "web-accessibility",
      ["What is web accessibility?", "Що таке вебдоступність?"],
      [
        [
          "Making sites usable by everyone, including people with visual, motor, hearing or cognitive impairments and people who use a screen reader or only a keyboard",
          "Робити сайти зручними для всіх, зокрема для людей із порушеннями зору, моторики, слуху чи когнітивних функцій і тих, хто користується скринрідером або лише клавіатурою",
        ],
        ["Making the site load quickly", "Робити так, щоб сайт швидко завантажувався"],
        ["Keeping the site online 24/7", "Тримати сайт доступним 24/7"],
        ["Ranking higher in search engines", "Підніматися вище в пошукових системах"],
      ],
      "a",
    ),
    question(
      "a11y-testing",
      ["How can you test accessibility?", "Як можна тестувати доступність?"],
      [
        ["Automated checks: axe DevTools, Lighthouse", "Автоматичні перевірки: axe DevTools, Lighthouse"],
        ["Going through the page using only the keyboard", "Пройти сторінкою, користуючись лише клавіатурою"],
        ["Only checking that it looks fine in Chrome", "Лише перевірити, що в Chrome усе виглядає добре"],
        ["Trying the page with a screen reader (NVDA, VoiceOver)", "Спробувати сторінку зі скринрідером (NVDA, VoiceOver)"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "a11y-techniques",
      ["Which of these is a basic technique for building accessible interfaces?", "Що з цього — базова техніка створення доступних інтерфейсів?"],
      [
        ["Adding `role=\"button\"` to `<div>`s instead of using buttons", "Додавати `role=\"button\"` до `<div>` замість кнопок"],
        ["Conveying information by color alone", "Передавати інформацію лише кольором"],
        ["Turning off zoom with `user-scalable=no`", "Вимикати масштабування через `user-scalable=no`"],
        [
          "Using native elements (`<button>`, `<label>`, `<nav>`) first, and adding ARIA only when no native element fits",
          "Спершу використовувати нативні елементи (`<button>`, `<label>`, `<nav>`), а ARIA додавати лише тоді, коли жоден нативний не підходить",
        ],
      ],
      "d",
    ),
    question(
      "link-vs-button",
      ["When should you use a link, and when a button?", "Коли використовувати посилання, а коли кнопку?"],
      [
        ["Whichever looks better in the design", "Те, що краще виглядає в дизайні"],
        [
          "A link (`<a href>`) navigates to another page or place; a button (`<button>`) performs an action on the page: submits a form, opens a dialog, toggles something",
          "Посилання (`<a href>`) веде на іншу сторінку чи місце; кнопка (`<button>`) виконує дію на сторінці: надсилає форму, відкриває діалог, щось перемикає",
        ],
        ["A button navigates, a link performs actions", "Кнопка веде на сторінки, а посилання виконує дії"],
        ["Always a `<div>` with a click handler", "Завжди `<div>` з обробником кліку"],
      ],
      "b",
    ),
    question(
      "alt-text",
      ["What should the `alt` attribute contain?", "Що має містити атрибут `alt`?"],
      [
        ["The word \"image\" or the file name", "Слово «зображення» або назву файлу"],
        ["Keywords for SEO", "Ключові слова для SEO"],
        [
          "A short description of what the image conveys in its context, and an empty `alt=\"\"` for purely decorative images",
          "Короткий опис того, що зображення передає в цьому контексті, а для суто декоративних — порожній `alt=\"\"`",
        ],
        ["Nothing: it should always be empty", "Нічого: він завжди має бути порожнім"],
      ],
      "c",
    ),
  ],
};
