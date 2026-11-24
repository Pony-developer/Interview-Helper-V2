import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 99–107 of the JavaScript list: topics from "You Don't Know JS: Up & Going", chapter 3. */
export const jsYdkjsQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-quiz",
  title: { en: "You Don't Know JS: topics", uk: "You Don't Know JS: теми" },
  questions: [
    question(
      "module-pattern",
      [
        "What does this code create?\n\n```js\nfunction createCounter() {\n  let count = 0;\n  return {\n    increment() { count++; },\n    get value() { return count; },\n  };\n}\nconst a = createCounter();\nconst b = createCounter();\n```",
        "Що створює цей код?\n\n```js\nfunction createCounter() {\n  let count = 0;\n  return {\n    increment() { count++; },\n    get value() { return count; },\n  };\n}\nconst a = createCounter();\nconst b = createCounter();\n```",
      ],
      [
        ["One shared counter, because `count` is global", "Один спільний лічильник, бо `count` глобальний"],
        ["Nothing: `count` is gone once `createCounter` returns", "Нічого: `count` зникає, щойно `createCounter` повертає значення"],
        [
          "Two independent modules: each call gets its own private `count` that only the returned methods can reach through closure; an ES module, by contrast, is a file evaluated once and shared by everyone who imports it",
          "Два незалежні модулі: кожен виклик отримує власний приватний `count`, до якого через замикання мають доступ лише повернуті методи; ES-модуль натомість — це файл, що виконується один раз і спільний для всіх, хто його імпортує",
        ],
        ["Two counters that always have the same value", "Два лічильники, що завжди мають однакове значення"],
      ],
      "c",
    ),
    question(
      "this-rules",
      ["Which statement about the rules for `this` is true?", "Яке твердження про правила визначення `this` правильне?"],
      [
        ["`this` always refers to the function it is written in", "`this` завжди вказує на функцію, у якій його написано"],
        [
          "It depends on the call site, with four rules from strongest to weakest: `new` binding, explicit binding (`call`, `apply`, `bind`), implicit binding (`obj.method()`), and the default (`undefined` in strict mode, the global object otherwise); arrow functions skip these rules and use the enclosing `this`",
          "Він залежить від місця виклику, і є чотири правила від найсильнішого до найслабшого: прив'язка `new`, явна прив'язка (`call`, `apply`, `bind`), неявна прив'язка (`obj.method()`) і правило за замовчуванням (`undefined` у строгому режимі, інакше глобальний об'єкт); стрілкові функції не підкоряються цим правилам і беруть зовнішній `this`",
        ],
        ["`this` is fixed when the function is defined", "`this` фіксується в момент оголошення функції"],
        ["Implicit binding always beats `bind`", "Неявна прив'язка завжди сильніша за `bind`"],
      ],
      "b",
    ),
    question(
      "behavior-delegation",
      ["What is behavior delegation (OLOO, \"objects linked to other objects\")?", "Що таке делегування поведінки (OLOO, «objects linked to other objects»)?"],
      [
        [
          "Objects are linked with `Object.create(proto)`, and a missing property is looked up on the linked object through the `[[Prototype]]` chain instead of being copied; JavaScript `class` syntax is a layer over this same linkage, not class-based copying as in Java",
          "Об'єкти пов'язують через `Object.create(proto)`, і властивість, якої немає, шукають у пов'язаному об'єкті ланцюжком `[[Prototype]]`, а не копіюють; синтаксис `class` у JavaScript — надбудова над тим самим зв'язком, а не копіювання, як у класах Java",
        ],
        ["Copying every method from a parent class into each instance", "Копіювання кожного методу батьківського класу в кожен екземпляр"],
        ["Sending work to a Web Worker", "Передавання роботи у Web Worker"],
        ["A design pattern that requires TypeScript", "Патерн проєктування, що потребує TypeScript"],
      ],
      "a",
    ),
    question(
      "async-concurrent-parallel",
      ["Which pairing of terms is correct?", "Яке поєднання термінів правильне?"],
      [
        ["They are three names for the same thing", "Це три назви однієї речі"],
        ["Parallel means one task waits for another", "Паралельність означає, що одна задача чекає на іншу"],
        ["JavaScript's event loop runs callbacks in parallel on many threads", "Event loop у JavaScript виконує колбеки паралельно в багатьох потоках"],
        [
          "Asynchronous means part of the work finishes later; concurrent means several tasks make progress in overlapping time, as the event loop interleaves them on one thread; parallel means they literally run at the same moment, on separate threads such as Web Workers",
          "Асинхронність означає, що частина роботи завершується пізніше; конкурентність — кілька задач просуваються в часі, що перекривається, як-от коли event loop чергує їх в одному потоці; паралельність — вони справді виконуються в той самий момент в окремих потоках, як-от у Web Workers",
        ],
      ],
      "d",
    ),
    question(
      "callbacks-ioc",
      ["Which statements about callbacks and promises are true?", "Які твердження про колбеки та проміси правильні?"],
      [
        [
          "Passing a callback to third-party code is inversion of control: that code may call it too early, too late, more than once, never, or swallow its errors",
          "Передати колбек сторонньому коду — це інверсія керування: той код може викликати його зарано, запізно, кілька разів, жодного разу або проковтнути помилки",
        ],
        ["Nested callbacks make the flow hard to read and to handle errors in", "Вкладені колбеки ускладнюють читання потоку й обробку помилок"],
        ["A promise settles only once and always runs its handlers asynchronously, and you keep control by subscribing to it", "Проміс завершується лише раз і завжди викликає обробники асинхронно, а контроль лишається у вас, бо ви самі на нього підписуєтеся"],
        ["Promises can resolve several times with different values", "Проміси можуть виконуватися кілька разів із різними значеннями"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "web-workers",
      ["Which statements about Web Workers are true?", "Які твердження про Web Workers правильні?"],
      [
        ["They run JavaScript on a separate thread, so heavy computation doesn't freeze the UI", "Вони виконують JavaScript в окремому потоці, тож важкі обчислення не заморожують UI"],
        ["They have no access to the DOM", "Вони не мають доступу до DOM"],
        ["They talk to the page with `postMessage`, which copies data (large buffers can be transferred instead)", "Вони спілкуються зі сторінкою через `postMessage`, що копіює дані (великі буфери можна передати замість копіювання)"],
        ["They share all variables with the main page automatically", "Вони автоматично ділять усі змінні з головною сторінкою"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "benchmarking",
      ["Why is timing a tiny snippet once with `Date.now()` a poor benchmark?", "Чому один раз заміряти крихітний фрагмент через `Date.now()` — поганий бенчмарк?"],
      [
        ["`Date.now()` doesn't exist in browsers", "`Date.now()` не існує в браузерах"],
        ["Benchmarks always give exact results", "Бенчмарки завжди дають точні результати"],
        [
          "The JIT warms up and optimizes over time and may even remove code whose result isn't used, and one run is mostly noise; run many iterations with `performance.now()` or a benchmarking library, look at the statistics, and prefer profiling real code under realistic conditions",
          "JIT поступово «прогрівається» й оптимізує код і навіть може прибрати код, результат якого не використовується, а один запуск — це здебільшого шум; запускайте багато ітерацій через `performance.now()` чи бібліотеку для бенчмарків, дивіться на статистику й надавайте перевагу профілюванню справжнього коду в реальних умовах",
        ],
        ["It is fine as long as the snippet is short", "Це нормально, якщо фрагмент короткий"],
      ],
      "c",
    ),
    question(
      "asmjs-simd",
      ["Older books recommend asm.js and SIMD.js for performance. What is true today?", "Старі книжки радять asm.js і SIMD.js для продуктивності. Що правильно сьогодні?"],
      [
        [
          "Both were superseded by WebAssembly: SIMD.js was dropped from JavaScript, and WebAssembly (with its own SIMD support) is now how languages like C++ or Rust run near-native code in the browser",
          "Обидва витіснила WebAssembly: SIMD.js прибрали з JavaScript, а WebAssembly (з власною підтримкою SIMD) — це тепер спосіб, у який мови на кшталт C++ чи Rust виконують майже нативний код у браузері",
        ],
        ["They are the recommended way to speed up React apps", "Це рекомендований спосіб пришвидшити React-застосунки"],
        ["asm.js replaced WebAssembly", "asm.js замінив WebAssembly"],
        ["SIMD.js is part of ES2025", "SIMD.js входить до ES2025"],
      ],
      "a",
    ),
    question(
      "proxy",
      ["What is a `Proxy`?", "Що таке `Proxy`?"],
      [
        ["A network proxy server for `fetch`", "Мережевий проксі-сервер для `fetch`"],
        ["A copy of an object that can't change", "Копія об'єкта, яку не можна змінити"],
        ["Another name for a getter", "Інша назва гетера"],
        [
          "`new Proxy(target, handler)` wraps an object so that \"traps\" in the handler (`get`, `set`, `has`, `deleteProperty`) intercept operations on it, often forwarding to `Reflect`; it powers Vue 3 reactivity and is used for validation and logging",
          "`new Proxy(target, handler)` обгортає об'єкт так, що «пастки» в обробнику (`get`, `set`, `has`, `deleteProperty`) перехоплюють операції з ним, часто передаючи їх далі в `Reflect`; на ньому побудована реактивність Vue 3, а ще його використовують для валідації й логування",
        ],
      ],
      "d",
    ),
  ],
};

/** Questions 108–111 of the JavaScript list: "You Don't Know JS: Scope & Closures", chapter 2 (Lexical Scope). */
export const jsYdkjsScopeQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-scope-quiz",
  title: { en: "You Don't Know JS: lexical scope", uk: "You Don't Know JS: лексична область видимості" },
  questions: [
    question(
      "scope-lookup",
      ["Which statements about scope lookup and shadowing are true?", "Які твердження про пошук в областях видимості та затінення правильні?"],
      [
        [
          "The engine starts in the innermost scope and walks outward, stopping at the first match, so an inner variable shadows an outer one with the same name",
          "Рушій починає з найвнутрішньої області видимості й іде назовні, зупиняючись на першому збігу, тож внутрішня змінна затіняє зовнішню з тією самою назвою",
        ],
        [
          "A shadowed global declared with `var` (or a function declaration) can still be reached as `window.a` (`globalThis.a`), but a global `let`/`const` isn't a property of the global object, and a shadowed variable of an outer function can't be reached at all",
          "До затіненої глобальної змінної, оголошеної через `var` (чи оголошення функції), ще можна дістатися як `window.a` (`globalThis.a`), але глобальні `let`/`const` не є властивостями глобального об'єкта, а до затіненої змінної зовнішньої функції дістатися взагалі неможливо",
        ],
        ["In `foo.bar.baz`, scope lookup finds only `foo`; `bar` and `baz` are resolved as ordinary property access", "У `foo.bar.baz` пошук в області видимості знаходить лише `foo`; `bar` і `baz` розв'язуються як звичайний доступ до властивостей"],
        ["Lookup continues after a match to find the outermost variable", "Пошук продовжується після збігу, щоб знайти найзовнішню змінну"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "eval-scope",
      [
        "In sloppy mode, what does this print?\n\n```js\nfunction foo(str, a) {\n  eval(str);\n  console.log(a, b);\n}\nvar b = 2;\nfoo('var b = 3;', 1);\n```",
        "Що виведе цей код у нестрогому режимі?\n\n```js\nfunction foo(str, a) {\n  eval(str);\n  console.log(a, b);\n}\nvar b = 2;\nfoo('var b = 3;', 1);\n```",
      ],
      [
        ["`1 2`", "`1 2`"],
        ["A ReferenceError", "ReferenceError"],
        ["`1 undefined`", "`1 undefined`"],
        [
          "`1 3`: the `var b` inside the evaluated string is declared in `foo`'s scope and shadows the global `b`; in strict mode `eval` gets its own scope, so declarations don't leak out (and `let`/`const` inside `eval` never leak)",
          "`1 3`: `var b` у виконаному рядку оголошується в області видимості `foo` і затіняє глобальний `b`; у строгому режимі `eval` отримує власну область видимості, тож оголошення не виходять назовні (а `let`/`const` усередині `eval` не виходять ніколи)",
        ],
      ],
      "d",
    ),
    question(
      "with-statement",
      [
        "In sloppy mode, what do the three logs print?\n\n```js\nfunction foo(obj) {\n  with (obj) { a = 2; }\n}\nconst o1 = { a: 3 };\nconst o2 = { b: 3 };\nfoo(o1); console.log(o1.a);\nfoo(o2); console.log(o2.a);\nconsole.log(a);\n```",
        "Що виведуть три логи в нестрогому режимі?\n\n```js\nfunction foo(obj) {\n  with (obj) { a = 2; }\n}\nconst o1 = { a: 3 };\nconst o2 = { b: 3 };\nfoo(o1); console.log(o1.a);\nfoo(o2); console.log(o2.a);\nconsole.log(a);\n```",
      ],
      [
        ["`2`, `2`, ReferenceError", "`2`, `2`, ReferenceError"],
        [
          "`2`, `undefined`, `2`: `with` turns the object into a temporary scope; `o2` has no `a`, so the assignment falls through to normal lookup and creates a global `a`; `with` is a SyntaxError in strict mode",
          "`2`, `undefined`, `2`: `with` перетворює об'єкт на тимчасову область видимості; в `o2` немає `a`, тож присвоєння йде звичайним пошуком і створює глобальну `a`; у строгому режимі `with` — це SyntaxError",
        ],
        ["`3`, `undefined`, `undefined`", "`3`, `undefined`, `undefined`"],
        ["`2`, `2`, `2`", "`2`, `2`, `2`"],
      ],
      "b",
    ),
    question(
      "eval-performance",
      ["Which statements about `eval`, `with` and running code from strings are true?", "Які твердження про `eval`, `with` і виконання коду з рядків правильні?"],
      [
        [
          "Engines optimize by resolving identifiers ahead of time; seeing `eval` or `with` in a function makes them assume the scope may change and skip those optimizations, even if the code never runs",
          "Рушії оптимізують код, заздалегідь розв'язуючи ідентифікатори; побачивши `eval` чи `with` у функції, вони припускають, що область видимості може змінитися, і пропускають ці оптимізації, навіть якщо цей код ніколи не виконається",
        ],
        ["`setTimeout('doThing()', 100)` with a string and `new Function('a', 'return a * 2')` also turn strings into code", "`setTimeout('doThing()', 100)` з рядком і `new Function('a', 'return a * 2')` теж перетворюють рядки на код"],
        ["A Content Security Policy without `'unsafe-eval'` blocks `eval`, `new Function` and string timers, which also protects against injected code", "Content Security Policy без `'unsafe-eval'` блокує `eval`, `new Function` і таймери з рядками, що також захищає від впровадженого коду"],
        ["`eval` makes code faster because it skips parsing", "`eval` пришвидшує код, бо пропускає розбір"],
      ],
      ["a", "b", "c"],
    ),
  ],
};

/** Questions 112–116 of the JavaScript list: "You Don't Know JS: Scope & Closures", chapter 4 (Hoisting). */
export const jsYdkjsHoistingQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-hoisting-quiz",
  title: { en: "You Don't Know JS: hoisting", uk: "You Don't Know JS: hoisting" },
  questions: [
    question(
      "declaration-after-assignment",
      ["What does `a = 2; var a; console.log(a);` print?", "Що виведе `a = 2; var a; console.log(a);`?"],
      [
        ["`undefined`, because `var a` resets the value", "`undefined`, бо `var a` скидає значення"],
        ["A ReferenceError", "ReferenceError"],
        [
          "`2`: `var a = 2` is really a declaration handled before execution plus an assignment left in place, so the declaration doesn't reset anything; hoisting is per scope, so a `var` inside a function moves to the top of that function, not of the file",
          "`2`: `var a = 2` насправді складається з оголошення, яке обробляється до виконання, і присвоєння, що лишається на місці, тож оголошення нічого не скидає; hoisting діє в межах області видимості, тож `var` усередині функції піднімається на початок цієї функції, а не файлу",
        ],
        ["A SyntaxError", "SyntaxError"],
      ],
      "c",
    ),
    question(
      "named-function-expression",
      [
        "What do the two calls throw?\n\n```js\nfoo();\nbar();\nvar foo = function bar() {};\n```",
        "Що кинуть два виклики?\n\n```js\nfoo();\nbar();\nvar foo = function bar() {};\n```",
      ],
      [
        ["Both run without errors", "Обидва виконуються без помилок"],
        [
          "`foo()` throws a TypeError, because `foo` is hoisted as `undefined`; `bar()` would throw a ReferenceError, because the name of a named function expression exists only inside that function",
          "`foo()` кидає TypeError, бо `foo` піднімається як `undefined`; `bar()` кинув би ReferenceError, бо назва іменованого функціонального виразу існує лише всередині цієї функції",
        ],
        ["Both throw a ReferenceError", "Обидва кидають ReferenceError"],
        ["`foo()` throws a ReferenceError, `bar()` runs", "`foo()` кидає ReferenceError, а `bar()` виконується"],
      ],
      "b",
    ),
    question(
      "functions-first",
      [
        "What does this print?\n\n```js\nfoo();\nvar foo;\nfunction foo() { console.log(1); }\nfoo = function () { console.log(2); };\n```",
        "Що виведе цей код?\n\n```js\nfoo();\nvar foo;\nfunction foo() { console.log(1); }\nfoo = function () { console.log(2); };\n```",
      ],
      [
        [
          "`1`: function declarations are hoisted first, the duplicate `var foo` is ignored, and the assignment of the second function only happens after the call",
          "`1`: оголошення функцій піднімаються першими, повторний `var foo` ігнорується, а присвоєння другої функції відбувається лише після виклику",
        ],
        ["`2`", "`2`"],
        ["A TypeError, because `var foo` makes it `undefined`", "TypeError, бо `var foo` робить його `undefined`"],
        ["Nothing", "Нічого"],
      ],
      "a",
    ),
    question(
      "duplicate-functions",
      [
        "What does this print?\n\n```js\nfoo();\nfunction foo() { console.log(1); }\nvar foo = function () { console.log(2); };\nfunction foo() { console.log(3); }\n```",
        "Що виведе цей код?\n\n```js\nfoo();\nfunction foo() { console.log(1); }\nvar foo = function () { console.log(2); };\nfunction foo() { console.log(3); }\n```",
      ],
      [
        ["`1`", "`1`"],
        ["`2`", "`2`"],
        ["A SyntaxError, because `foo` is declared twice", "SyntaxError, бо `foo` оголошено двічі"],
        [
          "`3`: the later function declaration overrides the earlier one during hoisting, and the `var` assignment runs only after the call; duplicate declarations in one scope are a source of bugs to avoid",
          "`3`: пізніше оголошення функції під час hoisting перезаписує раніше, а присвоєння через `var` виконується лише після виклику; повторні оголошення в одній області видимості — джерело багів, якого варто уникати",
        ],
      ],
      "d",
    ),
    question(
      "block-functions",
      [
        "In sloppy-mode modern JavaScript, what happens here? (The 2014 book says it prints `\"b\"`.)\n\n```js\nfoo();\nvar a = true;\nif (a) { function foo() { console.log('a'); } }\nelse { function foo() { console.log('b'); } }\n```",
        "Що станеться тут у нестрогому режимі сучасного JavaScript? (Книжка 2014 року каже, що буде виведено `\"b\"`.)\n\n```js\nfoo();\nvar a = true;\nif (a) { function foo() { console.log('a'); } }\nelse { function foo() { console.log('b'); } }\n```",
      ],
      [
        ["It prints `\"b\"`", "Виводиться `\"b\"`"],
        ["It prints `\"a\"`", "Виводиться `\"a\"`"],
        [
          "It throws \"TypeError: foo is not a function\": since ES2015 only the name `foo` is hoisted, as `undefined`, and it gets a function when its block runs (calling `foo()` after the `if` would print `\"a\"`); in strict mode the function is block-scoped, so the early call is a ReferenceError; either way, avoid declaring functions in blocks",
          "Кидається «TypeError: foo is not a function»: починаючи з ES2015 піднімається лише назва `foo` зі значенням `undefined`, а функцію вона отримує, коли виконується її блок (виклик `foo()` після `if` вивів би `\"a\"`); у строгому режимі функція має блокову область видимості, тож ранній виклик дає ReferenceError; так чи інакше, функцій у блоках краще не оголошувати",
        ],
        ["It prints both `\"a\"` and `\"b\"`", "Виводяться і `\"a\"`, і `\"b\"`"],
      ],
      "c",
    ),
  ],
};
