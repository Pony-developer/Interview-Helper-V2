import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–9 of the Middle list: general questions. */
export const middleGeneralQuiz: SlideDef = {
  kind: "quiz",
  slug: "middle-general-quiz",
  title: { en: "General questions", uk: "Загальні запитання" },
  questions: [
    question(
      "oop-principles",
      ["Which of these are principles of OOP?", "Які з цього — принципи ООП?"],
      [
        ["Abstraction", "Абстракція"],
        ["Encapsulation", "Інкапсуляція"],
        ["Inheritance", "Успадкування"],
        ["Memoization", "Мемоізація"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "solid",
      ["What do the letters of SOLID stand for?", "Що означають літери SOLID?"],
      [
        ["Simple, Open, Linear, Isolated, Dynamic", "Simple, Open, Linear, Isolated, Dynamic"],
        ["Single source, Object, Lazy, Inline, Declarative", "Single source, Object, Lazy, Inline, Declarative"],
        [
          "Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion",
          "Single responsibility (єдина відповідальність), Open/closed (відкритість/закритість), Liskov substitution (підстановка Лісков), Interface segregation (розділення інтерфейсів), Dependency inversion (інверсія залежностей)",
        ],
        ["Secure, Optimized, Light, Immutable, DRY", "Secure, Optimized, Light, Immutable, DRY"],
      ],
      "c",
    ),
    question(
      "why-complexity",
      ["Why pay attention to an algorithm's complexity on the frontend?", "Чому на фронтенді варто зважати на складність алгоритму?"],
      [
        ["It does not matter: browsers are fast enough", "Це неважливо: браузери достатньо швидкі"],
        [
          "An O(n²) loop over 10,000 items is 100 million steps and can block the main thread, so the UI stops responding",
          "Цикл O(n²) по 10 000 елементів — це 100 мільйонів кроків, які можуть заблокувати головний потік, і UI перестане реагувати",
        ],
        ["Complexity only matters on the server", "Складність важлива лише на сервері"],
        ["Complexity only affects the bundle size", "Складність впливає лише на розмір бандла"],
      ],
      "b",
    ),
    question(
      "file-structure",
      ["Which file structure usually scales better in a large frontend project?", "Яка файлова структура зазвичай краще масштабується у великому фронтенд-проєкті?"],
      [
        ["All files in a single folder", "Усі файли в одній теці"],
        ["Folders named after the developers who wrote the code", "Теки, названі на честь розробників, що писали код"],
        ["One giant `components` folder with hundreds of files for the whole app", "Одна величезна тека `components` із сотнями файлів на весь застосунок"],
        [
          "Grouping by feature or domain (`features/cart`, `features/auth`, each with its components, hooks, API calls and tests), plus shared `ui`, `lib` and `config`",
          "Групування за функціональністю чи доменом (`features/cart`, `features/auth`, кожна зі своїми компонентами, хуками, API-викликами й тестами) плюс спільні `ui`, `lib` і `config`",
        ],
      ],
      "d",
    ),
    question(
      "extract-entity",
      [
        "Which signals suggest it is time to extract a separate entity (a component, hook or module)?",
        "Які сигнали підказують, що час відокремити окрему сутність (компонент, хук чи модуль)?",
      ],
      [
        ["The file is longer than 10 lines", "Файл довший за 10 рядків"],
        ["The same logic is copied in several places", "Та сама логіка скопійована в кількох місцях"],
        ["A component or file has grown and does several unrelated things", "Компонент чи файл розрісся й робить кілька не пов'язаних між собою речей"],
        ["A part needs to be tested or reused on its own", "Частину треба тестувати чи використовувати окремо"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "build",
      ["What happens, roughly, during a frontend build?", "Що в загальних рисах відбувається під час збирання фронтенду?"],
      [
        ["The source code is uploaded to the server as it is", "Вихідний код завантажується на сервер як є"],
        [
          "The bundler (Vite, webpack) follows imports from the entry point, transpiles TS and JSX, processes CSS and assets, then removes unused code, minifies, splits the result into chunks and adds content hashes to file names",
          "Бандлер (Vite, webpack) іде імпортами від точки входу, транспілює TS і JSX, обробляє CSS та ресурси, потім прибирає невикористаний код, мініфікує, ділить результат на чанки й додає хеші вмісту до назв файлів",
        ],
        ["Only the images get compressed", "Стискаються лише зображення"],
        ["The tests run in production", "Тести запускаються на продакшні"],
      ],
      "b",
    ),
    question(
      "favorite-tool",
      [
        "The interviewer asks about your favorite tool or technology. What makes an answer strong?",
        "Інтерв'юер питає про вашу улюблену технологію чи інструмент. Що робить відповідь сильною?",
      ],
      [
        ["Naming the trendiest tool without explaining why", "Назвати наймодніший інструмент без пояснень чому"],
        ["Saying you don't have one", "Сказати, що такого немає"],
        [
          "Naming a tool and explaining concretely which problem it solves for you, with its trade-offs",
          "Назвати інструмент і конкретно пояснити, яку проблему він вам розв'язує, разом із його компромісами",
        ],
        ["Criticizing the company's stack", "Розкритикувати стек компанії"],
      ],
      "c",
    ),
    question(
      "maintainability",
      ["Which practices make code easier to maintain?", "Які практики роблять код простішим у підтримці?"],
      [
        ["Consistent formatting and linting (Prettier, ESLint)", "Єдине форматування й лінтинг (Prettier, ESLint)"],
        ["Clever one-liners that only the author understands", "Хитрі однорядкові рішення, які розуміє лише автор"],
        ["Clear names and small, focused functions and components", "Зрозумілі назви та невеликі сфокусовані функції й компоненти"],
        ["Tests for the important behavior", "Тести на важливу поведінку"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "refactoring",
      ["What is refactoring?", "Що таке рефакторинг?"],
      [
        ["Adding new features", "Додавання нових функцій"],
        [
          "Changing the internal structure of code without changing its external behavior, in small steps protected by tests",
          "Зміна внутрішньої структури коду без зміни його зовнішньої поведінки, малими кроками під захистом тестів",
        ],
        ["Rewriting the project from scratch", "Переписування проєкту з нуля"],
        ["Only fixing bugs", "Лише виправлення багів"],
      ],
      "b",
    ),
  ],
};
