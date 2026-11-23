import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–6 of the list: general questions. */
export const generalQuiz: SlideDef = {
  kind: "quiz",
  slug: "general-quiz",
  title: { en: "General questions", uk: "Загальні питання" },
  questions: [
    question(
      "news-sources",
      ["Which of these are reliable sources for following changes in the web platform?", "Які з цих джерел надійні, щоб стежити за змінами у веб-платформі?"],
      [
        ["MDN Web Docs and browser release notes (Chrome, Firefox, Safari)", "MDN Web Docs і примітки до релізів браузерів (Chrome, Firefox, Safari)"],
        ["web.dev, caniuse.com and the State of CSS / State of JS surveys", "web.dev, caniuse.com та опитування State of CSS / State of JS"],
        ["Only social media posts with no links to specs or docs", "Лише дописи в соцмережах без посилань на специфікації чи документацію"],
        ["TC39 proposals and the WHATWG / W3C specifications", "Пропозиції TC39 і специфікації WHATWG / W3C"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "good-code",
      ["Which description fits good code best?", "Який опис найкраще пасує хорошому коду?"],
      [
        ["It uses as many clever tricks as possible", "У ньому якомога більше хитрих трюків"],
        ["It is readable, predictable, and easy to change and test", "Він читабельний, передбачуваний, його легко змінювати й тестувати"],
        ["It is as short as possible, even at the cost of clarity", "Він якомога коротший, навіть ціною зрозумілості"],
        ["It never needs comments or tests", "Йому ніколи не потрібні коментарі чи тести"],
      ],
      "b",
    ),
    question(
      "http-methods-statuses",
      ["Which statements about HTTP methods and status codes are true?", "Які твердження про HTTP-методи та статуси правильні?"],
      [
        ["GET, PUT and DELETE are idempotent; POST is not", "GET, PUT і DELETE ідемпотентні, а POST ні"],
        ["2xx means success, 4xx a client error, 5xx a server error", "2xx означає успіх, 4xx помилку клієнта, 5xx помилку сервера"],
        ["404 means the server crashed", "404 означає, що сервер впав"],
        ["201 Created is a typical response to a POST that created a resource", "201 Created — типова відповідь на POST, який створив ресурс"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "user-code-danger",
      [
        "Why is it dangerous to execute code that comes from a user, for example `eval(input)` or `element.innerHTML = input`?",
        "Чим небезпечно виконувати код, що надходить від користувача, наприклад `eval(input)` чи `element.innerHTML = input`?",
      ],
      [
        ["It is only slower than regular code", "Він лише повільніший за звичайний код"],
        [
          "An attacker can run their own script in other users' browsers (XSS): steal sessions and data or act on their behalf",
          "Зловмисник може виконати свій скрипт у браузерах інших користувачів (XSS): викрасти сесії й дані або діяти від їхнього імені",
        ],
        ["The browser refuses to run such code anyway", "Браузер усе одно відмовиться виконувати такий код"],
        ["At worst it breaks the layout", "У найгіршому разі він зламає верстку"],
      ],
      "b",
    ),
    question(
      "oop",
      ["Which of these are core principles of OOP?", "Які з цих принципів є основними в ООП?"],
      [
        ["Encapsulation", "Інкапсуляція"],
        ["Inheritance", "Успадкування"],
        ["Hoisting", "Підняття (hoisting)"],
        ["Polymorphism", "Поліморфізм"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "abstract-class",
      ["What is the difference between a regular class and an abstract class?", "Яка різниця між звичайним класом і абстрактним класом?"],
      [
        ["An abstract class has no fields", "Абстрактний клас не має полів"],
        ["A regular class cannot be inherited from", "Від звичайного класу не можна успадковуватися"],
        [
          "An abstract class cannot be instantiated directly and may declare methods that subclasses must implement",
          "Абстрактний клас не можна створити напряму, і він може оголошувати методи, які мають реалізувати нащадки",
        ],
        ["There is no difference", "Різниці немає"],
      ],
      "c",
    ),
  ],
};
