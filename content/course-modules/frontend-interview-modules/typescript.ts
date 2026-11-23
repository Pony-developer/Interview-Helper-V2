import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 93–103 of the list: TypeScript. */
export const typescriptQuiz: SlideDef = {
  kind: "quiz",
  slug: "typescript-quiz",
  title: { en: "TypeScript", uk: "TypeScript" },
  questions: [
    question(
      "ts-vs-js",
      ["What is the main difference between TypeScript and JavaScript?", "Яка головна відмінність між TypeScript і JavaScript?"],
      [
        ["TypeScript is a separate runtime that browsers run instead of JS", "TypeScript — окреме середовище виконання, яке браузери запускають замість JS"],
        [
          "TypeScript is a superset of JavaScript with static types that are checked at compile time and then erased: the output is plain JS",
          "TypeScript — надмножина JavaScript зі статичними типами, які перевіряються під час компіляції, а потім стираються: на виході звичайний JS",
        ],
        ["TypeScript is a UI framework like React", "TypeScript — UI-фреймворк, як React"],
        ["TypeScript code runs faster in the browser", "Код на TypeScript швидше виконується в браузері"],
      ],
      "b",
    ),
    question(
      "ts-pros-cons",
      ["Which of these are real pros and cons of TypeScript?", "Які з цих тверджень — справжні переваги та недоліки TypeScript?"],
      [
        ["Pro: errors are caught before the code runs, and the editor gives accurate autocompletion", "Перевага: помилки ловляться ще до запуску коду, а редактор дає точне автодоповнення"],
        ["Con: a build step and a learning curve; complex types can be hard to read", "Недолік: крок збирання й час на навчання; складні типи буває важко читати"],
        ["Pro: types are checked at runtime, so invalid API data can never get in", "Перевага: типи перевіряються під час виконання, тож невалідні дані з API ніколи не потраплять у код"],
        ["Pro: types document the code and make refactoring safer", "Перевага: типи документують код і роблять рефакторинг безпечнішим"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "ts-types",
      ["What is the difference between `unknown` and `any`?", "Яка різниця між `unknown` і `any`?"],
      [
        ["There is no difference", "Різниці немає"],
        ["`unknown` can hold only `undefined`", "`unknown` може містити лише `undefined`"],
        [
          "`any` switches type checking off; `unknown` accepts any value but must be narrowed (for example with `typeof`) before it is used",
          "`any` вимикає перевірку типів; `unknown` приймає будь-яке значення, але перед використанням його треба звузити (наприклад, через `typeof`)",
        ],
        ["`any` is stricter than `unknown`", "`any` суворіший за `unknown`"],
      ],
      "c",
    ),
    question(
      "interfaces",
      [
        "Does this code compile?\n\n```ts\ninterface User {\n  id: number;\n  name: string;\n  email?: string;\n}\nconst u: User = { id: 1, name: 'Ann' };\n```",
        "Чи скомпілюється цей код?\n\n```ts\ninterface User {\n  id: number;\n  name: string;\n  email?: string;\n}\nconst u: User = { id: 1, name: 'Ann' };\n```",
      ],
      [
        ["Yes: `email?` is an optional property", "Так: `email?` — необов'язкова властивість"],
        ["No: `email` is missing", "Ні: бракує `email`"],
        ["No: an interface cannot describe an object literal", "Ні: інтерфейс не може описувати об'єктний літерал"],
        ["Only with `as User` at the end", "Лише з `as User` у кінці"],
      ],
      "a",
    ),
    question(
      "generics",
      [
        "What does `function first<T>(items: T[]): T | undefined` give you over `function first(items: any[]): any`?",
        "Що дає `function first<T>(items: T[]): T | undefined` порівняно з `function first(items: any[]): any`?",
      ],
      [
        ["Nothing: the two are equivalent", "Нічого: вони рівнозначні"],
        ["The generic version runs faster", "Узагальнена версія швидше виконується"],
        ["The generic version accepts only arrays of numbers", "Узагальнена версія приймає лише масиви чисел"],
        [
          "The return type follows the argument: `first([1, 2])` is `number | undefined`, `first(['a'])` is `string | undefined`, so no type information is lost",
          "Тип результату залежить від аргументу: `first([1, 2])` має тип `number | undefined`, `first(['a'])` — `string | undefined`, тож інформація про тип не губиться",
        ],
      ],
      "d",
    ),
    question(
      "enums",
      ["Given `enum Status { Active, Blocked }`, what is the value of `Status.Blocked`?", "Маємо `enum Status { Active, Blocked }`. Яке значення `Status.Blocked`?"],
      [
        ["`'Blocked'`", "`'Blocked'`"],
        ["`1`", "`1`"],
        ["`0`", "`0`"],
        ["`undefined`", "`undefined`"],
      ],
      "b",
    ),
    question(
      "type-safety",
      [
        "Which mistake does TypeScript catch at compile time, while plain JavaScript shows it only at runtime, if at all?",
        "Яку помилку TypeScript ловить під час компіляції, тоді як звичайний JavaScript покаже її лише під час виконання, якщо взагалі покаже?",
      ],
      [
        [
          "A typo like `user.nmae` when the type has `name`, or a string passed where a number is expected",
          "Одруківку на кшталт `user.nmae`, коли в типі є `name`, або рядок, переданий туди, де очікують число",
        ],
        ["The server returning a 500 error", "Відповідь сервера з помилкою 500"],
        ["A slow network", "Повільну мережу"],
        ["An infinite loop", "Нескінченний цикл"],
      ],
      "a",
    ),
    question(
      "refactoring",
      ["Which refactoring and maintenance features does TypeScript enable in an editor?", "Які можливості для рефакторингу й підтримки TypeScript дає в редакторі?"],
      [
        ["Safely renaming a symbol across the whole project", "Безпечне перейменування символу в усьому проєкті"],
        ["Find all references and go to definition", "Пошук усіх використань і перехід до визначення"],
        ["After a type changes, the compiler lists every place that breaks", "Після зміни типу компілятор показує всі місця, що зламалися"],
        ["Automatic removal of all bugs", "Автоматичне виправлення всіх багів"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "decorators",
      ["What is a decorator in TypeScript?", "Що таке декоратор у TypeScript?"],
      [
        ["A CSS feature for styling components", "Можливість CSS для стилізації компонентів"],
        ["A type that makes every property readonly", "Тип, що робить усі властивості readonly"],
        [
          "A function applied with `@` to a class, method, property or parameter to add metadata or change behavior, like Angular's `@Component`",
          "Функція, яку застосовують через `@` до класу, методу, властивості чи параметра, щоб додати метадані або змінити поведінку, як `@Component` в Angular",
        ],
        ["A special comment format for documentation", "Особливий формат коментарів для документації"],
      ],
      "c",
    ),
    question(
      "modules-namespaces",
      ["What is the recommended way to organize code in modern TypeScript?", "Як рекомендовано організовувати код у сучасному TypeScript?"],
      [
        ["Only with `namespace` blocks", "Лише через блоки `namespace`"],
        ["Global scripts that share variables through `window`", "Глобальні скрипти, що обмінюються змінними через `window`"],
        ["Only with `require()`", "Лише через `require()`"],
        [
          "ES modules with `import` and `export`; `namespace` is mostly legacy, still seen in global type declarations",
          "ES-модулі з `import` та `export`; `namespace` здебільшого застарілий і трапляється в глобальних оголошеннях типів",
        ],
      ],
      "d",
    ),
    question(
      "migration",
      ["Which are sensible strategies for migrating a JS project to TypeScript?", "Які стратегії міграції JS-проєкту на TypeScript розумні?"],
      [
        ["Enable `allowJs` and convert files gradually, starting with shared utilities", "Увімкнути `allowJs` і поступово переводити файли, починаючи зі спільних утиліт"],
        ["Start with a loose `tsconfig` and turn on `strict` options step by step", "Почати з м'якого `tsconfig` і крок за кроком вмикати опції `strict`"],
        ["Add JSDoc types and `// @ts-check` to JS files first", "Спершу додати JSDoc-типи й `// @ts-check` у JS-файли"],
        [
          "Rename every file to `.ts` at once and fix thousands of errors before shipping anything",
          "Одразу перейменувати всі файли на `.ts` і виправити тисячі помилок, перш ніж щось випускати",
        ],
      ],
      ["a", "b", "c"],
    ),
  ],
};
