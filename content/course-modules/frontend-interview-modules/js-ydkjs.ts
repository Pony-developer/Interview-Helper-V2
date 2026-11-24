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

/** Questions 117–118 of the JavaScript list: "You Don't Know JS: Scope & Closures", appendix B (Polyfilling Block Scope). */
export const jsYdkjsBlockScopeQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-block-scope-quiz",
  title: { en: "You Don't Know JS: polyfilling block scope", uk: "You Don't Know JS: поліфіл блокової області видимості" },
  questions: [
    question(
      "iife-vs-block",
      [
        "Why can't you replace `{ let x = …; … }` with `(function () { var x = …; … })();` everywhere?",
        "Чому не можна всюди замінити `{ let x = …; … }` на `(function () { var x = …; … })();`?",
      ],
      [
        ["It always behaves exactly the same, just with more code", "Воно завжди поводиться точно так само, просто коду більше"],
        ["An IIFE can't contain `var` declarations", "IIFE не може містити оголошення `var`"],
        [
          "A function boundary changes the meaning of the code inside: `return` now leaves the IIFE instead of the outer function, `break` and `continue` can't reach an outer loop (a SyntaxError), and `this` and `arguments` refer to the IIFE (an arrow IIFE keeps `this`, but not `return` or `break`)",
          "Межа функції змінює зміст коду всередині: `return` тепер виходить з IIFE, а не із зовнішньої функції, `break` і `continue` не можуть дістатися зовнішнього циклу (SyntaxError), а `this` і `arguments` стосуються IIFE (стрілковий IIFE зберігає `this`, але не `return` чи `break`)",
        ],
        ["IIFEs only work in strict mode", "IIFE працюють лише в строгому режимі"],
      ],
      "c",
    ),
    question(
      "transpile-let",
      ["How do transpilers make `let` work in engines that only understand ES5?", "Як транспілятори змушують `let` працювати в рушіях, що розуміють лише ES5?"],
      [
        [
          "Babel turns `let` into `var`, renaming the variable when it would clash with an outer one, and wraps a loop body in a function when closures capture the loop variable, so each iteration gets its own copy; the book's older trick (used by Traceur) put the variable in a `catch (x)` clause, because `catch` parameters have always been block-scoped",
          "Babel перетворює `let` на `var`, перейменовуючи змінну, якщо вона конфліктувала б із зовнішньою, і обгортає тіло циклу у функцію, коли замикання захоплюють змінну циклу, тож кожна ітерація отримує власну копію; старіший прийом із книжки (його використовував Traceur) клав змінну в `catch (x)`, бо параметри `catch` завжди мали блокову область видимості",
        ],
        ["They can't: `let` code never runs in old engines", "Ніяк: код із `let` ніколи не працює в старих рушіях"],
        ["They load a polyfill script that adds the `let` keyword to the browser", "Вони завантажують поліфіл, що додає ключове слово `let` у браузер"],
        ["They replace `let` with `const`", "Вони замінюють `let` на `const`"],
      ],
      "a",
    ),
  ],
};

/** Questions 119–120 of the JavaScript list: "You Don't Know JS: this & Object Prototypes", chapter 1 (this Or That?). */
export const jsYdkjsThisQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-this-quiz",
  title: { en: "You Don't Know JS: what this is not", uk: "You Don't Know JS: чим не є this" },
  questions: [
    question(
      "this-not-function",
      [
        "In sloppy mode, what does this print?\n\n```js\nfunction foo() {\n  this.count++;\n}\nfoo.count = 0;\nfor (let i = 0; i < 4; i++) foo();\nconsole.log(foo.count);\n```",
        "Що виведе цей код у нестрогому режимі?\n\n```js\nfunction foo() {\n  this.count++;\n}\nfoo.count = 0;\nfor (let i = 0; i < 4; i++) foo();\nconsole.log(foo.count);\n```",
      ],
      [
        ["`4`", "`4`"],
        [
          "`0`: `this` isn't the function itself; in a plain call it is the global object, so `this.count++` turns a global `count` into `NaN`; to count on the function, call `foo.call(foo)` or write `foo.count++` (a named function, or a named function expression, can refer to itself by name; `arguments.callee` is deprecated)",
          "`0`: `this` — це не сама функція; у звичайному виклику це глобальний об'єкт, тож `this.count++` перетворює глобальну змінну `count` на `NaN`; щоб рахувати на функції, викликайте `foo.call(foo)` чи пишіть `foo.count++` (іменована функція чи іменований функціональний вираз може звертатися до себе за назвою; `arguments.callee` застарів)",
        ],
        ["A TypeError", "TypeError"],
        ["`NaN`", "`NaN`"],
      ],
      "b",
    ),
    question(
      "this-not-scope",
      [
        "In sloppy mode, what does calling `foo()` print?\n\n```js\nfunction foo() {\n  var a = 2;\n  bar.call(this);\n}\nfunction bar() {\n  console.log(this.a);\n}\nfoo();\n```",
        "Що виведе виклик `foo()` у нестрогому режимі?\n\n```js\nfunction foo() {\n  var a = 2;\n  bar.call(this);\n}\nfunction bar() {\n  console.log(this.a);\n}\nfoo();\n```",
      ],
      [
        ["`2`, because `bar` runs with `foo`'s scope", "`2`, бо `bar` виконується з областю видимості `foo`"],
        ["A ReferenceError", "ReferenceError"],
        ["`a`", "`a`"],
        [
          "`undefined`: `this` never points to a function's lexical scope, so it can't reach the local `a`; scope isn't an object your code can access, while `this` is a binding set at call time from how the function was called, stored in that call's execution context",
          "`undefined`: `this` ніколи не вказує на лексичну область видимості функції, тож не може дістатися локальної `a`; область видимості — не об'єкт, доступний коду, а `this` — прив'язка, що встановлюється під час виклику залежно від того, як функцію викликали, і зберігається в контексті виконання цього виклику",
        ],
      ],
      "d",
    ),
  ],
};

/** Questions 121–125 of the JavaScript list: "You Don't Know JS: this & Object Prototypes", chapter 3 (Objects). */
export const jsYdkjsObjectsQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-objects-quiz",
  title: { en: "You Don't Know JS: objects", uk: "You Don't Know JS: об'єкти" },
  questions: [
    question(
      "property-descriptors",
      [
        "What happens here?\n\n```js\nconst o = {};\nObject.defineProperty(o, 'a', { value: 2 });\no.a = 3;\nconsole.log(o.a, Object.keys(o));\n```",
        "Що станеться тут?\n\n```js\nconst o = {};\nObject.defineProperty(o, 'a', { value: 2 });\no.a = 3;\nconsole.log(o.a, Object.keys(o));\n```",
      ],
      [
        ["`3 ['a']`", "`3 ['a']`"],
        [
          "`2 []` in sloppy mode: attributes left out of `defineProperty` default to `false`, so `a` is not writable, not enumerable and not configurable; the assignment fails silently (a TypeError in strict mode), while properties created by normal assignment default to `true`",
          "`2 []` у нестрогому режимі: атрибути, не вказані в `defineProperty`, за замовчуванням `false`, тож `a` не записувана, не перелічувана й не налаштовувана; присвоєння мовчки не спрацьовує (у строгому режимі — TypeError), а властивості, створені звичайним присвоєнням, за замовчуванням мають `true`",
        ],
        ["A TypeError on `defineProperty`", "TypeError на `defineProperty`"],
        ["`undefined []`", "`undefined []`"],
      ],
      "b",
    ),
    question(
      "configurable",
      ["Which statements about `configurable: false` are true?", "Які твердження про `configurable: false` правильні?"],
      [
        ["Redefining the property's descriptor afterwards throws a TypeError, even in sloppy mode", "Подальше перевизначення дескриптора властивості кидає TypeError навіть у нестрогому режимі"],
        ["`delete` no longer removes the property (it returns `false` in sloppy mode)", "`delete` більше не прибирає властивість (у нестрогому режимі повертає `false`)"],
        ["It is one-way, with one exception: `writable` can still change from `true` to `false`, but not back", "Це незворотно, з одним винятком: `writable` ще можна змінити з `true` на `false`, але не назад"],
        ["It also stops the value from changing while `writable` is `true`", "Він також забороняє змінювати значення, поки `writable` дорівнює `true`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "accessors",
      [
        "What do the two logs print in sloppy mode?\n\n```js\nconst a = { get x() { return 2; } };\na.x = 3;\nconsole.log(a.x);\n\nconst b = {\n  get x() { return this._x; },\n  set x(v) { this._x = v * 2; },\n};\nb.x = 2;\nconsole.log(b.x);\n```",
        "Що виведуть два логи в нестрогому режимі?\n\n```js\nconst a = { get x() { return 2; } };\na.x = 3;\nconsole.log(a.x);\n\nconst b = {\n  get x() { return this._x; },\n  set x(v) { this._x = v * 2; },\n};\nb.x = 2;\nconsole.log(b.x);\n```",
      ],
      [
        ["`3` and `2`", "`3` і `2`"],
        ["`2` and `2`", "`2` і `2`"],
        ["`3` and `4`", "`3` і `4`"],
        [
          "`2` and `4`: with only a getter, the assignment is ignored (a TypeError in strict mode), and a setter decides what is stored; an accessor descriptor has `get`/`set` instead of `value`/`writable`, so mixing them throws",
          "`2` і `4`: коли є лише гетер, присвоєння ігнорується (у строгому режимі — TypeError), а сетер сам вирішує, що зберегти; дескриптор доступу має `get`/`set` замість `value`/`writable`, тож їх поєднання кидає помилку",
        ],
      ],
      "d",
    ),
    question(
      "existence-enumeration",
      ["Which statements about checking properties are true?", "Які твердження про перевірку властивостей правильні?"],
      [
        [
          "Reading a missing property returns `undefined` (unlike an undeclared variable, which throws), so `obj.a === undefined` can't tell a missing property from one that holds `undefined`",
          "Читання відсутньої властивості повертає `undefined` (на відміну від неоголошеної змінної, що кидає помилку), тож `obj.a === undefined` не відрізнить відсутню властивість від тієї, що містить `undefined`",
        ],
        [
          "`'a' in obj` also checks the prototype chain, while `Object.hasOwn(obj, 'a')` checks only own properties and, unlike `obj.hasOwnProperty`, works on `Object.create(null)` objects",
          "`'a' in obj` перевіряє й ланцюжок прототипів, а `Object.hasOwn(obj, 'a')` — лише власні властивості й, на відміну від `obj.hasOwnProperty`, працює з об'єктами з `Object.create(null)`",
        ],
        ["`Object.keys` returns only own enumerable keys, while `Object.getOwnPropertyNames` also includes non-enumerable ones", "`Object.keys` повертає лише власні перелічувані ключі, а `Object.getOwnPropertyNames` — ще й неперелічувані"],
        ["`4 in [2, 4, 6]` is `true` because the array contains 4", "`4 in [2, 4, 6]` дорівнює `true`, бо масив містить 4"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "array-properties",
      [
        "`const arr = ['foo', 42, 'bar']; arr.baz = 'baz'; arr['3'] = 'x';` What is `arr.length` after each step?",
        "`const arr = ['foo', 42, 'bar']; arr.baz = 'baz'; arr['3'] = 'x';` Чому дорівнює `arr.length` після кожного кроку?",
      ],
      [
        ["`4`, then `5`", "`4`, потім `5`"],
        ["`3`, then `3`", "`3`, потім `3`"],
        [
          "`3`, then `4`: a named property like `baz` doesn't change `length`, but a string that looks like a number, `'3'`, is treated as an index; keep key/value data in objects and numeric lists in arrays",
          "`3`, потім `4`: іменована властивість на кшталт `baz` не змінює `length`, але рядок, схожий на число, `'3'`, вважається індексом; дані ключ/значення тримайте в об'єктах, а нумеровані списки — в масивах",
        ],
        ["A TypeError: arrays can't have named properties", "TypeError: масиви не можуть мати іменованих властивостей"],
      ],
      "c",
    ),
  ],
};

/** Questions 126–130 of the JavaScript list: "You Don't Know JS: this & Object Prototypes", chapter 5 (Prototypes). */
export const jsYdkjsPrototypesQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-prototypes-quiz",
  title: { en: "You Don't Know JS: prototypes", uk: "You Don't Know JS: прототипи" },
  questions: [
    question(
      "shadowing-on-assignment",
      [
        "`o = Object.create(p)`. The prototype `p` has a writable data property `w`, a read-only property `ro` (`writable: false`) and a setter `s`. What do `o.w = 2`, `o.ro = 2` and `o.s = 5` do in sloppy mode?",
        "`o = Object.create(p)`. Прототип `p` має звичайну властивість `w`, яку можна змінювати, властивість лише для читання `ro` (`writable: false`) і сетер `s`. Що роблять `o.w = 2`, `o.ro = 2` і `o.s = 5` у нестрогому режимі?",
      ],
      [
        [
          "All three create own properties on `o` that shadow the ones on `p`",
          "Усі три створюють на `o` власні властивості, які затіняють властивості `p`",
        ],
        [
          "All three change the properties on `p`, so every object linked to `p` sees the new values",
          "Усі три змінюють властивості на `p`, тож нові значення бачать усі об'єкти, пов'язані з `p`",
        ],
        [
          "`w` becomes an own property of `o`; the `ro` assignment is silently ignored (a TypeError in strict mode); the setter on `p` runs and `o` gets no own `s`",
          "`w` стає власною властивістю `o`; присвоєння `ro` мовчки ігнорується (у строгому режимі — TypeError); виконується сетер на `p`, а власної `s` в `o` не з'являється",
        ],
        [
          "`w` and `ro` become own properties of `o`; only the setter is called on `p`",
          "`w` і `ro` стають власними властивостями `o`; лише сетер викликається на `p`",
        ],
      ],
      "c",
    ),
    question(
      "implicit-shadowing",
      [
        "What does this print?\n\n```js\nconst base = { a: 2 };\nconst obj = Object.create(base);\nobj.a++;\nconsole.log(base.a, obj.a, obj.hasOwnProperty('a'));\n```",
        "Що виведе цей код?\n\n```js\nconst base = { a: 2 };\nconst obj = Object.create(base);\nobj.a++;\nconsole.log(base.a, obj.a, obj.hasOwnProperty('a'));\n```",
      ],
      [
        ["`3 3 false`", "`3 3 false`"],
        ["`2 3 true`", "`2 3 true`"],
        ["`3 3 true`", "`3 3 true`"],
        ["`2 NaN true`", "`2 NaN true`"],
      ],
      "b",
    ),
    question(
      "constructor-property",
      [
        "What does this print?\n\n```js\nfunction Foo() {}\nFoo.prototype = {};\nconst a = new Foo();\nconsole.log(a.constructor === Foo, a.constructor === Object, a instanceof Foo);\n```",
        "Що виведе цей код?\n\n```js\nfunction Foo() {}\nFoo.prototype = {};\nconst a = new Foo();\nconsole.log(a.constructor === Foo, a.constructor === Object, a instanceof Foo);\n```",
      ],
      [
        [
          "`true false true`: `new` always sets `a.constructor` to the function that created it",
          "`true false true`: `new` завжди записує в `a.constructor` функцію, яка його створила",
        ],
        [
          "`false true true`: `a` has no own `constructor`; it is looked up on the prototype chain, and the replaced `Foo.prototype` doesn't have one, so the lookup reaches `Object.prototype.constructor`",
          "`false true true`: `a` не має власного `constructor`; його шукають у ланцюжку прототипів, а в заміненому `Foo.prototype` його немає, тож пошук доходить до `Object.prototype.constructor`",
        ],
        [
          "`false true false`: replacing `Foo.prototype` breaks `instanceof` as well",
          "`false true false`: заміна `Foo.prototype` ламає й `instanceof`",
        ],
        [
          "A TypeError, because `Foo.prototype` can't be reassigned",
          "TypeError, бо `Foo.prototype` не можна перепризначити",
        ],
      ],
      "b",
    ),
    question(
      "prototype-wiring",
      [
        "`Bar` should inherit `Foo`'s methods. Which statements about wiring `Bar.prototype` are true?",
        "`Bar` має успадкувати методи `Foo`. Які твердження про налаштування `Bar.prototype` правильні?",
      ],
      [
        [
          "`Bar.prototype = Object.create(Foo.prototype)` links a new object to `Foo.prototype`, but `Bar.prototype.constructor` now resolves to `Foo`",
          "`Bar.prototype = Object.create(Foo.prototype)` пов'язує новий об'єкт із `Foo.prototype`, але `Bar.prototype.constructor` тепер дає `Foo`",
        ],
        [
          "`Bar.prototype = Foo.prototype` is fine: methods added to `Bar.prototype` stay on `Bar` only",
          "`Bar.prototype = Foo.prototype` підходить: методи, додані до `Bar.prototype`, залишаються лише в `Bar`",
        ],
        [
          "`Bar.prototype = new Foo()` links correctly but runs `Foo`'s constructor body (and its side effects) at setup time",
          "`Bar.prototype = new Foo()` пов'язує правильно, але виконує тіло конструктора `Foo` (з його побічними ефектами) під час налаштування",
        ],
        [
          "`Object.setPrototypeOf(Bar.prototype, Foo.prototype)` relinks the existing object and keeps its `constructor`",
          "`Object.setPrototypeOf(Bar.prototype, Foo.prototype)` перепов'язує наявний об'єкт і зберігає його `constructor`",
        ],
      ],
      ["a", "c", "d"],
    ),
    question(
      "object-create-descriptors",
      [
        "What does this print?\n\n```js\nconst o = Object.create({ a: 2 }, {\n  b: { value: 3 },\n  c: { value: 4, enumerable: true },\n});\nconsole.log(Object.keys(o), o.a, o.b);\n```",
        "Що виведе цей код?\n\n```js\nconst o = Object.create({ a: 2 }, {\n  b: { value: 3 },\n  c: { value: 4, enumerable: true },\n});\nconsole.log(Object.keys(o), o.a, o.b);\n```",
      ],
      [
        ["`['a', 'b', 'c'] 2 3`", "`['a', 'b', 'c'] 2 3`"],
        ["`['b', 'c'] undefined 3`", "`['b', 'c'] undefined 3`"],
        [
          "`['c'] 2 3`: the second argument holds property descriptors, so `b` is non-enumerable by default, and `a` is inherited",
          "`['c'] 2 3`: другий аргумент містить дескриптори властивостей, тож `b` за замовчуванням неперелічувана, а `a` успадкована",
        ],
        [
          "`['c'] 2 undefined`: a descriptor without `writable: true` has no value",
          "`['c'] 2 undefined`: дескриптор без `writable: true` не має значення",
        ],
      ],
      "c",
    ),
  ],
};

/** Questions 131–132 of the JavaScript list: "You Don't Know JS: Types & Grammar", chapter 1 (Types). */
export const jsYdkjsTypesQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-types-quiz",
  title: { en: "You Don't Know JS: types", uk: "You Don't Know JS: типи" },
  questions: [
    question(
      "function-length",
      [
        "What does this print?\n\n```js\nconsole.log(\n  (function (a, b) {}).length,\n  ((a, b = 1, c) => {}).length,\n  ((a, ...rest) => {}).length,\n);\n```",
        "Що виведе цей код?\n\n```js\nconsole.log(\n  (function (a, b) {}).length,\n  ((a, b = 1, c) => {}).length,\n  ((a, ...rest) => {}).length,\n);\n```",
      ],
      [
        ["`undefined undefined undefined`: functions have no `length`", "`undefined undefined undefined`: функції не мають `length`"],
        ["`2 3 2`: `length` counts every parameter", "`2 3 2`: `length` рахує всі параметри"],
        [
          "`2 1 1`: `length` counts the declared parameters before the first one with a default value or a rest parameter",
          "`2 1 1`: `length` рахує оголошені параметри до першого параметра зі значенням за замовчуванням або rest-параметра",
        ],
        ["`0 0 0`: `length` counts the arguments of the last call", "`0 0 0`: `length` рахує аргументи останнього виклику"],
      ],
      "c",
    ),
    question(
      "typeof-guard",
      [
        "A script may or may not define a global `DEBUG`. Which statements are true?",
        "Скрипт може визначати, а може й не визначати глобальну змінну `DEBUG`. Які твердження правильні?",
      ],
      [
        [
          "`if (DEBUG) {}` throws a ReferenceError when `DEBUG` was never declared",
          "`if (DEBUG) {}` кидає ReferenceError, якщо `DEBUG` ніколи не оголошували",
        ],
        [
          "`if (typeof DEBUG !== 'undefined') {}` is a safe check, and so is reading `globalThis.DEBUG`",
          "`if (typeof DEBUG !== 'undefined') {}` — безпечна перевірка, як і читання `globalThis.DEBUG`",
        ],
        [
          "`typeof` never throws, even for a `let` variable read before its declaration",
          "`typeof` ніколи не кидає помилку, навіть для змінної `let`, яку читають до її оголошення",
        ],
        [
          "Passing the optional dependency in as a parameter (dependency injection) avoids checking globals at all",
          "Передавання необов'язкової залежності як параметра (впровадження залежностей) взагалі прибирає потребу перевіряти глобальні змінні",
        ],
      ],
      ["a", "b", "d"],
    ),
  ],
};

/** Questions 133–136 of the JavaScript list: "You Don't Know JS: Types & Grammar", chapter 3 (Natives). */
export const jsYdkjsNativesQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-natives-quiz",
  title: { en: "You Don't Know JS: natives", uk: "You Don't Know JS: вбудовані конструктори" },
  questions: [
    question(
      "object-to-string-tag",
      [
        "What does `Object.prototype.toString.call(x)` return for `null`, `[]` and `'a'`?",
        "Що повертає `Object.prototype.toString.call(x)` для `null`, `[]` і `'a'`?",
      ],
      [
        ["`'null'`, `'1,2'`-style output and `'a'`: it calls each value's own `toString`", "`'null'`, вивід на кшталт `'1,2'` і `'a'`: він викликає власний `toString` кожного значення"],
        ["A TypeError for `null`, `'[object Object]'` for the rest", "TypeError для `null`, `'[object Object]'` для решти"],
        [
          "`'[object Null]'`, `'[object Array]'`, `'[object String]'`: it reports the internal type tag, which an object can customize with `Symbol.toStringTag`",
          "`'[object Null]'`, `'[object Array]'`, `'[object String]'`: він повідомляє внутрішній тег типу, який об'єкт може змінити через `Symbol.toStringTag`",
        ],
        ["`'object'` three times, like `typeof`", "Тричі `'object'`, як `typeof`"],
      ],
      "c",
    ),
    question(
      "array-constructor",
      [
        "What does this print?\n\n```js\nconsole.log(\n  Array(3, 4),\n  Array(3).map((_, i) => i),\n  Array.from({ length: 3 }, (_, i) => i),\n);\n```",
        "Що виведе цей код?\n\n```js\nconsole.log(\n  Array(3, 4),\n  Array(3).map((_, i) => i),\n  Array.from({ length: 3 }, (_, i) => i),\n);\n```",
      ],
      [
        ["`[3, 4]`, `[0, 1, 2]`, `[0, 1, 2]`", "`[3, 4]`, `[0, 1, 2]`, `[0, 1, 2]`"],
        [
          "`[3, 4]`, `[ <3 empty items> ]`, `[0, 1, 2]`: a single number makes an array of that length with empty slots, and `map` skips empty slots",
          "`[3, 4]`, `[ <3 empty items> ]`, `[0, 1, 2]`: одне число створює масив такої довжини з порожніми слотами, а `map` пропускає порожні слоти",
        ],
        ["`[ <3 empty items>, 4 ]`, `[undefined, undefined, undefined]`, `[0, 1, 2]`", "`[ <3 empty items>, 4 ]`, `[undefined, undefined, undefined]`, `[0, 1, 2]`"],
        ["A TypeError, because `Array` must be called with `new`", "TypeError, бо `Array` треба викликати з `new`"],
      ],
      "b",
    ),
    question(
      "natives-with-without-new",
      [
        "Which statements about calling built-in constructors with and without `new` are true?",
        "Які твердження про виклик вбудованих конструкторів із `new` і без нього правильні?",
      ],
      [
        [
          "`Date()` returns a string, while `new Date()` returns a `Date` object",
          "`Date()` повертає рядок, а `new Date()` — об'єкт `Date`",
        ],
        [
          "`String(1)` returns a primitive string, while `new String(1)` returns a wrapper object",
          "`String(1)` повертає примітивний рядок, а `new String(1)` — об'єкт-обгортку",
        ],
        [
          "`Error('x')` without `new` still creates an `Error` object",
          "`Error('x')` без `new` усе одно створює об'єкт `Error`",
        ],
        [
          "`new Symbol('id')` creates a symbol object, just like `Symbol('id')`",
          "`new Symbol('id')` створює об'єкт-символ так само, як `Symbol('id')`",
        ],
      ],
      ["a", "b", "c"],
    ),
    question(
      "native-prototypes",
      [
        "Which statements about built-in prototypes are true?",
        "Які твердження про прототипи вбудованих конструкторів правильні?",
      ],
      [
        [
          "`Array.isArray(Array.prototype)` is `true`, and `Function.prototype` is an empty function",
          "`Array.isArray(Array.prototype)` дає `true`, а `Function.prototype` — порожня функція",
        ],
        [
          "Since ES2015, `RegExp.prototype` is a plain object, not a regular expression",
          "Починаючи з ES2015, `RegExp.prototype` — звичайний об'єкт, а не регулярний вираз",
        ],
        [
          "Using `Array.prototype` as a default value is a good idea, because you can safely push into it",
          "Використовувати `Array.prototype` як значення за замовчуванням — добра ідея, бо в нього можна безпечно додавати елементи",
        ],
        [
          "Adding methods to built-in prototypes is risky: they can clash with future standard methods or other libraries",
          "Додавати методи до прототипів вбудованих конструкторів ризиковано: вони можуть конфліктувати з майбутніми стандартними методами чи іншими бібліотеками",
        ],
      ],
      ["a", "b", "d"],
    ),
  ],
};

/** Questions 137–143 of the JavaScript list: "You Don't Know JS: Types & Grammar", chapter 5 (Grammar). */
export const jsYdkjsGrammarQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-grammar-quiz",
  title: { en: "You Don't Know JS: grammar", uk: "You Don't Know JS: граматика" },
  questions: [
    question(
      "chained-assignment",
      [
        "What happens here in sloppy mode?\n\n```js\nfunction init() {\n  var a = b = 42;\n}\ninit();\nconsole.log(typeof b);\n```",
        "Що станеться тут у нестрогому режимі?\n\n```js\nfunction init() {\n  var a = b = 42;\n}\ninit();\nconsole.log(typeof b);\n```",
      ],
      [
        ["`\"undefined\"`: both `a` and `b` are local variables", "`\"undefined\"`: і `a`, і `b` — локальні змінні"],
        [
          "`\"number\"`: an assignment is an expression that returns the assigned value, but only `a` is declared, so `b = 42` creates a global (in strict mode it throws a ReferenceError)",
          "`\"number\"`: присвоєння — це вираз, що повертає присвоєне значення, але оголошено лише `a`, тож `b = 42` створює глобальну змінну (у строгому режимі — ReferenceError)",
        ],
        ["A SyntaxError: assignments can't be chained", "SyntaxError: присвоєння не можна об'єднувати в ланцюжок"],
        ["`\"boolean\"`: `b = 42` returns `true`", "`\"boolean\"`: `b = 42` повертає `true`"],
      ],
      "b",
    ),
    question(
      "braces-context",
      [
        "Why does `[] + {}` give `'[object Object]'`, while `{} + []` written as a statement on its own gives `0`?",
        "Чому `[] + {}` дає `'[object Object]'`, а `{} + []`, записаний як окрема інструкція, дає `0`?",
      ],
      [
        ["`+` isn't commutative for objects, so the order of operands changes the result", "`+` не комутативний для об'єктів, тож порядок операндів змінює результат"],
        [
          "At the start of a statement `{}` is parsed as an empty block, not an object literal, so what's left is the unary `+[]`, which is `0`",
          "На початку інструкції `{}` розбирається як порожній блок, а не літерал об'єкта, тож залишається унарний `+[]`, тобто `0`",
        ],
        ["`{}` is converted to `0` before `[]` is", "`{}` перетворюється на `0` раніше за `[]`"],
        ["It's a bug in older engines; both give `'[object Object]'` today", "Це помилка старих рушіїв; сьогодні обидва дають `'[object Object]'`"],
      ],
      "b",
    ),
    question(
      "labels",
      [
        "What does this print?\n\n```js\nouter: for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (j === 1) continue outer;\n    if (i === 2) break outer;\n    console.log(i, j);\n  }\n}\n```",
        "Що виведе цей код?\n\n```js\nouter: for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (j === 1) continue outer;\n    if (i === 2) break outer;\n    console.log(i, j);\n  }\n}\n```",
      ],
      [
        ["A SyntaxError: `outer:` is an object key", "SyntaxError: `outer:` — це ключ об'єкта"],
        ["`0 0`, `0 2`, `1 0`, `1 2`", "`0 0`, `0 2`, `1 0`, `1 2`"],
        [
          "`0 0` and `1 0`: `continue outer` jumps to the next iteration of the labeled outer loop, and `break outer` leaves both loops",
          "`0 0` і `1 0`: `continue outer` переходить до наступної ітерації позначеного зовнішнього циклу, а `break outer` виходить з обох циклів",
        ],
        ["`0 0`, `1 0`, `2 0`", "`0 0`, `1 0`, `2 0`"],
      ],
      "c",
    ),
    question(
      "precedence",
      [
        "What do `true || false && false`, `(1, 2, 3)` and `false ? 1 : true ? 2 : 3` evaluate to?",
        "Чому дорівнюють `true || false && false`, `(1, 2, 3)` і `false ? 1 : true ? 2 : 3`?",
      ],
      [
        [
          "`true`, `3`, `2`: `&&` binds tighter than `||`, the comma operator returns its last operand, and `? :` groups from the right",
          "`true`, `3`, `2`: `&&` має вищий пріоритет, ніж `||`, оператор кома повертає останній операнд, а `? :` групується справа",
        ],
        ["`false`, `1`, `2`", "`false`, `1`, `2`"],
        ["`true`, `[1, 2, 3]`, `3`", "`true`, `[1, 2, 3]`, `3`"],
        ["`false`, `3`, `1`: operators are evaluated strictly left to right", "`false`, `3`, `1`: оператори обчислюються суворо зліва направо"],
      ],
      "a",
    ),
    question(
      "asi-return",
      [
        "What does `f()` return?\n\n```js\nfunction f() {\n  return\n  { ok: true };\n}\n```",
        "Що повертає `f()`?\n\n```js\nfunction f() {\n  return\n  { ok: true };\n}\n```",
      ],
      [
        ["`{ ok: true }`", "`{ ok: true }`"],
        ["A SyntaxError", "SyntaxError"],
        [
          "`undefined`: automatic semicolon insertion puts a `;` right after `return`, and the object on the next line becomes unreachable code",
          "`undefined`: автоматична вставка крапки з комою ставить `;` одразу після `return`, а об'єкт на наступному рядку стає недосяжним кодом",
        ],
        ["`true`", "`true`"],
      ],
      "c",
    ),
    question(
      "try-finally",
      [
        "What do these calls return?\n\n```js\nfunction a() {\n  try { return 1; } finally { console.log('fin'); }\n}\nfunction b() {\n  try { return 1; } finally { return 2; }\n}\n```",
        "Що повертають ці виклики?\n\n```js\nfunction a() {\n  try { return 1; } finally { console.log('fin'); }\n}\nfunction b() {\n  try { return 1; } finally { return 2; }\n}\n```",
      ],
      [
        ["`a()` returns `1` without logging; `b()` returns `1`", "`a()` повертає `1` без виводу; `b()` повертає `1`"],
        [
          "`a()` logs `'fin'` and then returns `1`; `b()` returns `2`, because a `return` inside `finally` overrides the earlier one",
          "`a()` виводить `'fin'`, а потім повертає `1`; `b()` повертає `2`, бо `return` у `finally` перекриває попередній",
        ],
        ["`a()` returns `undefined`; `b()` returns `2`", "`a()` повертає `undefined`; `b()` повертає `2`"],
        ["A SyntaxError: `finally` can't contain `return`", "SyntaxError: `finally` не може містити `return`"],
      ],
      "b",
    ),
    question(
      "default-params-arguments",
      [
        "Which statements about default parameters are true?",
        "Які твердження про параметри за замовчуванням правильні?",
      ],
      [
        [
          "In `function f(a = b, b) {}`, calling `f()` throws a ReferenceError: `b` is in its temporal dead zone when `a`'s default is evaluated",
          "У `function f(a = b, b) {}` виклик `f()` кидає ReferenceError: `b` перебуває в тимчасовій мертвій зоні, коли обчислюється значення за замовчуванням для `a`",
        ],
        [
          "In a function with default parameters, assigning to a parameter doesn't change `arguments`, and `arguments` holds only the values actually passed",
          "У функції з параметрами за замовчуванням присвоєння параметру не змінює `arguments`, а `arguments` містить лише фактично передані значення",
        ],
        [
          "A default value is used whenever the argument is falsy, for example `0` or `''`",
          "Значення за замовчуванням застосовується щоразу, коли аргумент falsy, наприклад `0` чи `''`",
        ],
        [
          "In a sloppy-mode function with only simple parameters, `a = 2` also changes `arguments[0]`",
          "У функції в нестрогому режимі лише з простими параметрами `a = 2` змінює й `arguments[0]`",
        ],
      ],
      ["a", "b", "d"],
    ),
  ],
};

/** Questions 144–146 of the JavaScript list: "You Don't Know JS: Async & Performance", chapter 2 (Callbacks). */
export const jsYdkjsCallbacksQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-callbacks-quiz",
  title: { en: "You Don't Know JS: callbacks", uk: "You Don't Know JS: колбеки" },
  questions: [
    question(
      "zalgo",
      [
        "`load` calls `cb` right away when the value is cached, and later (after a request) when it isn't. What does this print on the first call, and then on a call when the value is cached?\n\n```js\nlet a = 0;\nload('x', () => console.log(a));\na++;\n```",
        "`load` викликає `cb` одразу, якщо значення є в кеші, і пізніше (після запиту), якщо його немає. Що виведе цей код під час першого виклику, а що — коли значення вже в кеші?\n\n```js\nlet a = 0;\nload('x', () => console.log(a));\na++;\n```",
      ],
      [
        ["`0` both times", "`0` обидва рази"],
        ["`1` both times", "`1` обидва рази"],
        [
          "`1` the first time and `0` when cached: a callback that is sometimes synchronous and sometimes asynchronous (\"releasing Zalgo\") makes the order unpredictable, so always call it asynchronously (or return a promise)",
          "`1` першого разу і `0`, коли значення в кеші: колбек, який іноді синхронний, а іноді асинхронний («випустити Zalgo»), робить порядок непередбачуваним, тож його слід завжди викликати асинхронно (або повертати проміс)",
        ],
        ["`0` the first time and `1` when cached", "`0` першого разу і `1`, коли значення в кеші"],
      ],
      "c",
    ),
    question(
      "error-first-callbacks",
      [
        "Which statements about error handling with callbacks are true?",
        "Які твердження про обробку помилок у колбеках правильні?",
      ],
      [
        [
          "In the error-first (Node.js) style, the callback's first argument is an error or `null`, and the callback must check it before using the result",
          "У стилі error-first (Node.js) перший аргумент колбека — помилка або `null`, і колбек має перевірити його, перш ніж використовувати результат",
        ],
        [
          "Split callbacks pass separate success and failure functions, like `ajax(url, onSuccess, onError)`",
          "Розділені колбеки передають окремі функції для успіху й помилки, як-от `ajax(url, onSuccess, onError)`",
        ],
        [
          "A `try/catch` around `setTimeout(() => { throw err; })` catches the error thrown inside the callback",
          "`try/catch` навколо `setTimeout(() => { throw err; })` перехоплює помилку, кинуту всередині колбека",
        ],
        [
          "Neither style stops a third-party library from calling both the success and the error path, or calling them twice",
          "Жоден зі стилів не заважає сторонній бібліотеці викликати і шлях успіху, і шлях помилки або викликати їх двічі",
        ],
      ],
      ["a", "b", "d"],
    ),
    question(
      "callback-guards",
      [
        "You pass a callback to a library you don't trust. How can you guard against it never being called, or being called more than once?",
        "Ви передаєте колбек бібліотеці, якій не довіряєте. Як захиститися від того, що його не викличуть жодного разу або викличуть кілька разів?",
      ],
      [
        ["You can't; this is only solvable with Web Workers", "Ніяк; це можна розв'язати лише через Web Workers"],
        [
          "Wrap it: start a timer that reports a timeout error if the callback hasn't run in time, and keep a flag so only the first call goes through. Promises give you both guarantees built in (settle once, `Promise.race` with a timeout)",
          "Обгорнути його: запустити таймер, який повідомить про помилку тайм-ауту, якщо колбек не виконався вчасно, і тримати прапорець, щоб пройшов лише перший виклик. Проміси дають обидві гарантії вбудовано (завершуються один раз, `Promise.race` із тайм-аутом)",
        ],
        ["Call the callback yourself right after passing it to the library", "Самому викликати колбек одразу після передавання бібліотеці"],
        ["Mark the callback `async`, which makes it run exactly once", "Позначити колбек як `async`, після чого він виконається рівно один раз"],
      ],
      "b",
    ),
  ],
};

/** Questions 147–151 of the JavaScript list: "You Don't Know JS: Async & Performance", chapter 4 (Generators). */
export const jsYdkjsGeneratorsQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-generators-quiz",
  title: { en: "You Don't Know JS: generators", uk: "You Don't Know JS: генератори" },
  questions: [
    question(
      "generator-messages",
      [
        "What do the two `next` calls return?\n\n```js\nfunction* foo(x) {\n  const y = x * (yield 'ask');\n  return y;\n}\nconst it = foo(6);\nconsole.log(it.next(99), it.next(7));\n```",
        "Що повертають два виклики `next`?\n\n```js\nfunction* foo(x) {\n  const y = x * (yield 'ask');\n  return y;\n}\nconst it = foo(6);\nconsole.log(it.next(99), it.next(7));\n```",
      ],
      [
        ["`{ value: 594, done: false }` and `{ value: 42, done: true }`", "`{ value: 594, done: false }` і `{ value: 42, done: true }`"],
        [
          "`{ value: 'ask', done: false }` and `{ value: 42, done: true }`: the first `next` starts the generator and its argument is ignored; the value passed to the second `next` becomes the result of the paused `yield`",
          "`{ value: 'ask', done: false }` і `{ value: 42, done: true }`: перший `next` запускає генератор, і його аргумент ігнорується; значення, передане другому `next`, стає результатом призупиненого `yield`",
        ],
        ["`{ value: 'ask', done: false }` and `{ value: NaN, done: true }`", "`{ value: 'ask', done: false }` і `{ value: NaN, done: true }`"],
        ["`{ value: 'ask', done: false }` and `{ value: 42, done: false }`", "`{ value: 'ask', done: false }` і `{ value: 42, done: false }`"],
      ],
      "b",
    ),
    question(
      "generator-for-of-return",
      [
        "What does this print?\n\n```js\nfunction* g() {\n  try {\n    yield 1;\n    yield 2;\n    return 3;\n  } finally {\n    console.log('cleanup');\n  }\n}\nfor (const v of g()) {\n  console.log(v);\n  break;\n}\nconsole.log([...g()]);\n```",
        "Що виведе цей код?\n\n```js\nfunction* g() {\n  try {\n    yield 1;\n    yield 2;\n    return 3;\n  } finally {\n    console.log('cleanup');\n  }\n}\nfor (const v of g()) {\n  console.log(v);\n  break;\n}\nconsole.log([...g()]);\n```",
      ],
      [
        ["`1`, then `[1, 2, 3]`; `finally` never runs after `break`", "`1`, потім `[1, 2, 3]`; `finally` не виконується після `break`"],
        [
          "`1`, `cleanup`, then `cleanup` and `[1, 2]`: `break` calls the iterator's `return()`, which runs `finally`, and `for..of`/spread ignore the value of `return`",
          "`1`, `cleanup`, потім `cleanup` і `[1, 2]`: `break` викликає метод `return()` ітератора, що виконує `finally`, а `for..of` і spread ігнорують значення з `return`",
        ],
        ["`1`, then `cleanup` and `[1, 2, 3]`", "`1`, потім `cleanup` і `[1, 2, 3]`"],
        ["`1`, `2`, `cleanup`, then `[1, 2]`", "`1`, `2`, `cleanup`, потім `[1, 2]`"],
      ],
      "b",
    ),
    question(
      "generator-throw",
      [
        "Which statements about `it.throw(err)` on a paused generator are true?",
        "Які твердження про `it.throw(err)` для призупиненого генератора правильні?",
      ],
      [
        [
          "The error is thrown at the paused `yield`, so a `try/catch` around that `yield` inside the generator can catch it and keep going",
          "Помилка кидається в місці призупиненого `yield`, тож `try/catch` навколо цього `yield` усередині генератора може її перехопити й продовжити роботу",
        ],
        [
          "If the generator doesn't catch it, the error comes back out of `it.throw()` to the caller and the generator is finished",
          "Якщо генератор її не перехопить, помилка повертається з `it.throw()` до того, хто викликав, а генератор завершується",
        ],
        [
          "`it.throw()` is ignored unless the generator has a `catch` block",
          "`it.throw()` ігнорується, якщо в генераторі немає блоку `catch`",
        ],
        [
          "This is what lets a promise-driven runner (and `async/await`) report a rejected promise as an exception at the `yield`/`await`",
          "Саме це дозволяє виконавцю на промісах (і `async/await`) повідомляти про відхилений проміс як про виняток у місці `yield`/`await`",
        ],
      ],
      ["a", "b", "d"],
    ),
    question(
      "generators-promises",
      [
        "How do generators combined with promises relate to `async/await`?",
        "Як генератори в поєднанні з промісами пов'язані з `async/await`?",
      ],
      [
        ["They are unrelated: `async` functions use threads", "Вони не пов'язані: функції `async` використовують потоки"],
        [
          "A runner calls the generator, waits for each yielded promise, then resumes it with `next(value)` or `throw(error)`. That gives synchronous-looking async code, and `async/await` is that pattern built into the language",
          "Виконавець запускає генератор, чекає на кожен проміс, який той повертає через `yield`, а потім відновлює його через `next(value)` чи `throw(error)`. Так асинхронний код виглядає синхронним, а `async/await` — це той самий патерн, вбудований у мову",
        ],
        ["Yielding a promise from a generator automatically waits for it, without any runner", "`yield` проміса в генераторі автоматично чекає на нього без жодного виконавця"],
        ["Generators replace promises: `async/await` can't be used with them", "Генератори замінюють проміси: `async/await` з ними використовувати не можна"],
      ],
      "b",
    ),
    question(
      "yield-delegation",
      [
        "What does this print?\n\n```js\nfunction* inner() {\n  const m = yield 'a';\n  console.log('inner got', m);\n  return 'r';\n}\nfunction* outer() {\n  const r = yield* inner();\n  yield r;\n  yield* [8, 9];\n}\nconst o = outer();\nconsole.log(o.next().value, o.next('msg').value, [...o]);\n```",
        "Що виведе цей код?\n\n```js\nfunction* inner() {\n  const m = yield 'a';\n  console.log('inner got', m);\n  return 'r';\n}\nfunction* outer() {\n  const r = yield* inner();\n  yield r;\n  yield* [8, 9];\n}\nconst o = outer();\nconsole.log(o.next().value, o.next('msg').value, [...o]);\n```",
      ],
      [
        [
          "`inner got msg`, then `a r [8, 9]`: `yield*` passes values and messages straight through to the inner generator, evaluates to its `return` value, and works with any iterable",
          "`inner got msg`, потім `a r [8, 9]`: `yield*` передає значення й повідомлення безпосередньо внутрішньому генератору, повертає значення його `return` і працює з будь-яким ітерованим об'єктом",
        ],
        ["`inner got undefined`, then `a r [8, 9]`", "`inner got undefined`, потім `a r [8, 9]`"],
        ["`inner got msg`, then `a undefined [[8, 9]]`", "`inner got msg`, потім `a undefined [[8, 9]]`"],
        ["A TypeError: `yield*` only accepts generators", "TypeError: `yield*` приймає лише генератори"],
      ],
      "a",
    ),
  ],
};

/** Questions 160–162 of the JavaScript list: "You Don't Know JS: Async & Performance", chapter 6 (Benchmarking & Tuning). */
export const jsYdkjsTuningQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-tuning-quiz",
  title: { en: "You Don't Know JS: benchmarking and tuning", uk: "You Don't Know JS: бенчмарки й оптимізація" },
  questions: [
    question(
      "fair-benchmark",
      [
        "A benchmark compares `arr.sort()` with `arr.sort((a, b) => a - b)` on an array of numbers and reports that the first is faster. What is wrong with this test?",
        "Бенчмарк порівнює `arr.sort()` з `arr.sort((a, b) => a - b)` на масиві чисел і показує, що перший швидший. Що не так із цим тестом?",
      ],
      [
        ["Nothing: the faster one should be used", "Нічого: варто використовувати швидший"],
        [
          "It isn't a fair comparison: without a comparator `sort` compares numbers as strings (`[10, 9, 1]` becomes `[1, 10, 9]`), so the two cases don't do the same job",
          "Це нечесне порівняння: без функції порівняння `sort` порівнює числа як рядки (`[10, 9, 1]` стає `[1, 10, 9]`), тож два варіанти виконують різну роботу",
        ],
        ["`sort` can't be benchmarked because it changes the array", "`sort` не можна заміряти, бо він змінює масив"],
        ["Arrow functions are always slower, so the test is pointless", "Стрілкові функції завжди повільніші, тож тест не має сенсу"],
      ],
      "b",
    ),
    question(
      "critical-path",
      [
        "Which statements about performance tuning are true?",
        "Які твердження про оптимізацію продуктивності правильні?",
      ],
      [
        [
          "Micro-optimizations like `++x` instead of `x++` or caching `arr.length` in a loop rarely matter, because engines already optimize such patterns",
          "Мікрооптимізації на кшталт `++x` замість `x++` чи кешування `arr.length` у циклі рідко мають значення, бо рушії вже оптимізують такі патерни",
        ],
        [
          "Effort pays off on the critical path, the code that runs often or blocks the user, which you find by profiling",
          "Зусилля окуповуються на критичному шляху — у коді, який виконується часто або блокує користувача, а знаходять його профілюванням",
        ],
        [
          "You should always write code in whatever form one engine's benchmark shows is fastest, even if it is less readable",
          "Код завжди слід писати в тій формі, яку бенчмарк одного рушія показав найшвидшою, навіть якщо вона менш читабельна",
        ],
        [
          "Engine-specific tricks can become slower when the engine changes, so readable code is usually the better long-term bet",
          "Трюки під конкретний рушій можуть стати повільнішими, коли рушій зміниться, тож читабельний код зазвичай надійніший у довгостроковій перспективі",
        ],
      ],
      ["a", "b", "d"],
    ),
    question(
      "tail-call-optimization",
      [
        "`function sum(n, acc = 0) { return n === 0 ? acc : sum(n - 1, acc + n); }` is a proper tail call in strict mode. What happens with `sum(1e6)` in Chrome or Node.js?",
        "`function sum(n, acc = 0) { return n === 0 ? acc : sum(n - 1, acc + n); }` у строгому режимі — це правильний хвостовий виклик. Що станеться з `sum(1e6)` у Chrome чи Node.js?",
      ],
      [
        [
          "It returns `500000500000`: ES2015 requires tail call optimization, so every engine reuses the stack frame",
          "Повертає `500000500000`: ES2015 вимагає оптимізації хвостових викликів, тож кожен рушій повторно використовує кадр стека",
        ],
        [
          "A RangeError (maximum call stack size exceeded): ES2015 specified proper tail calls, but only Safari implements them, so for deep recursion use a loop or a trampoline",
          "RangeError (перевищено максимальний розмір стека викликів): ES2015 описав правильні хвостові виклики, але реалізує їх лише Safari, тож для глибокої рекурсії використовуйте цикл чи trampoline",
        ],
        ["A SyntaxError: default parameters can't be used in recursion", "SyntaxError: параметри за замовчуванням не можна використовувати в рекурсії"],
        ["It returns `Infinity`", "Повертає `Infinity`"],
      ],
      "b",
    ),
  ],
};

/** Questions 166–172 of the JavaScript list: "You Don't Know JS: ES6 & Beyond", chapter 2 (Syntax). */
export const jsYdkjsEs6SyntaxQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-es6-syntax-quiz",
  title: { en: "You Don't Know JS: ES6 syntax", uk: "You Don't Know JS: синтаксис ES6" },
  questions: [
    question(
      "default-expressions",
      [
        "What does this print?\n\n```js\nlet calls = 0;\nconst next = () => ++calls;\nfunction f(a = [], id = next()) {\n  a.push(id);\n  return a;\n}\nfunction g(x, y = x * 2, z = y + 1) {\n  return [x, y, z];\n}\nconsole.log(f(), f(), g(1));\n```",
        "Що виведе цей код?\n\n```js\nlet calls = 0;\nconst next = () => ++calls;\nfunction f(a = [], id = next()) {\n  a.push(id);\n  return a;\n}\nfunction g(x, y = x * 2, z = y + 1) {\n  return [x, y, z];\n}\nconsole.log(f(), f(), g(1));\n```",
      ],
      [
        ["`[1] [1, 2] [1, 2, 3]`: the default array is created once and shared between calls", "`[1] [1, 2] [1, 2, 3]`: масив за замовчуванням створюється один раз і спільний для всіх викликів"],
        [
          "`[1] [2] [1, 2, 3]`: default expressions are evaluated lazily on every call that needs them, and a default can use earlier parameters",
          "`[1] [2] [1, 2, 3]`: вирази за замовчуванням обчислюються ліниво під час кожного виклику, якому вони потрібні, і можуть використовувати попередні параметри",
        ],
        ["`[1] [1] [1, NaN, NaN]`: defaults can't refer to other parameters", "`[1] [1] [1, NaN, NaN]`: значення за замовчуванням не можуть посилатися на інші параметри"],
        ["A SyntaxError: a default value must be a constant", "SyntaxError: значення за замовчуванням має бути константою"],
      ],
      "b",
    ),
    question(
      "destructuring-defaults",
      [
        "What do `b`, `c` and `e` hold?\n\n```js\nconst { a: { b } = {}, c = 5, d: e = 1 } = { c: null, d: undefined };\n```",
        "Що містять `b`, `c` і `e`?\n\n```js\nconst { a: { b } = {}, c = 5, d: e = 1 } = { c: null, d: undefined };\n```",
      ],
      [
        ["A TypeError, because `a` is missing", "TypeError, бо `a` немає"],
        ["`undefined`, `5`, `1`: defaults apply to any missing or empty value", "`undefined`, `5`, `1`: значення за замовчуванням застосовуються до будь-якого відсутнього чи порожнього значення"],
        [
          "`undefined`, `null`, `1`: the `= {}` default stops the nested pattern from throwing, `d: e` renames `d` to `e`, and defaults apply only to `undefined`, not `null`",
          "`undefined`, `null`, `1`: значення `= {}` не дає вкладеному шаблону кинути помилку, `d: e` перейменовує `d` на `e`, а значення за замовчуванням застосовуються лише для `undefined`, не для `null`",
        ],
        ["`{}`, `null`, `undefined`", "`{}`, `null`, `undefined`"],
      ],
      "c",
    ),
    question(
      "destructuring-assignment",
      [
        "Which statements about destructuring assignment (not declaration) are true?",
        "Які твердження про деструктуроване присвоєння (не оголошення) правильні?",
      ],
      [
        [
          "`[a, b] = [b, a]` swaps two variables without a temporary one",
          "`[a, b] = [b, a]` міняє дві змінні місцями без тимчасової",
        ],
        [
          "`({ m, n } = obj);` needs the parentheses: without them, a statement starting with `{` is parsed as a block",
          "`({ m, n } = obj);` потребує дужок: без них інструкція, що починається з `{`, розбирається як блок",
        ],
        [
          "Destructuring `null` or `undefined`, as in `const { z } = null`, throws a TypeError",
          "Деструктуризація `null` чи `undefined`, як у `const { z } = null`, кидає TypeError",
        ],
        [
          "Destructuring copies nested objects deeply",
          "Деструктуризація глибоко копіює вкладені об'єкти",
        ],
      ],
      ["a", "b", "c"],
    ),
    question(
      "object-literal-extensions",
      [
        "What does this print?\n\n```js\nconst base = { hi() { return 'hi'; } };\nconst o = {\n  __proto__: base,\n  ['k' + 1]: 1,\n  hi() { return super.hi() + '!'; },\n};\nconsole.log(o.k1, o.hi(), Object.keys(o));\n```",
        "Що виведе цей код?\n\n```js\nconst base = { hi() { return 'hi'; } };\nconst o = {\n  __proto__: base,\n  ['k' + 1]: 1,\n  hi() { return super.hi() + '!'; },\n};\nconsole.log(o.k1, o.hi(), Object.keys(o));\n```",
      ],
      [
        ["A SyntaxError: `super` works only inside classes", "SyntaxError: `super` працює лише в класах"],
        ["`undefined 'hi!' ['__proto__', 'k1', 'hi']`", "`undefined 'hi!' ['__proto__', 'k1', 'hi']`"],
        [
          "`1 'hi!' ['k1', 'hi']`: `__proto__` in a literal sets the prototype, `[expr]` computes the key, and concise methods can call `super`",
          "`1 'hi!' ['k1', 'hi']`: `__proto__` у літералі задає прототип, `[expr]` обчислює ключ, а короткі методи можуть викликати `super`",
        ],
        ["`1 'hi' ['k1', 'hi']`: `super.hi()` calls the method itself", "`1 'hi' ['k1', 'hi']`: `super.hi()` викликає сам цей метод"],
      ],
      "c",
    ),
    question(
      "unicode-strings",
      [
        "Which statements about Unicode strings are true?",
        "Які твердження про рядки в Unicode правильні?",
      ],
      [
        [
          "`'😀'.length` is `2`, because `length` counts UTF-16 code units, while `[...'😀'].length` is `1`",
          "`'😀'.length` дорівнює `2`, бо `length` рахує кодові одиниці UTF-16, а `[...'😀'].length` дорівнює `1`",
        ],
        [
          "`/^.$/.test('😀')` is `false`, but with the `u` flag it is `true`",
          "`/^.$/.test('😀')` дає `false`, а з прапорцем `u` — `true`",
        ],
        [
          "`'é'` and `'e\\u0301'` look the same but aren't `===` until you call `normalize()` on both",
          "`'é'` і `'e\\u0301'` виглядають однаково, але не рівні через `===`, доки не викликати `normalize()` для обох",
        ],
        [
          "`charCodeAt` returns the full code point of an emoji, so `codePointAt` is no longer needed",
          "`charCodeAt` повертає повну кодову точку емодзі, тож `codePointAt` більше не потрібен",
        ],
      ],
      ["a", "b", "c"],
    ),
    question(
      "symbol-registry",
      [
        "`const sym = Symbol('id'); const obj = { [sym]: 1, x: 2 };` Which statements are true?",
        "`const sym = Symbol('id'); const obj = { [sym]: 1, x: 2 };` Які твердження правильні?",
      ],
      [
        [
          "`Symbol('k') === Symbol('k')` is `false`, but `Symbol.for('k') === Symbol.for('k')` is `true`, because `Symbol.for` uses a global registry",
          "`Symbol('k') === Symbol('k')` дає `false`, а `Symbol.for('k') === Symbol.for('k')` — `true`, бо `Symbol.for` використовує глобальний реєстр",
        ],
        [
          "`Object.keys(obj)` and `JSON.stringify(obj)` skip the symbol key",
          "`Object.keys(obj)` і `JSON.stringify(obj)` пропускають ключ-символ",
        ],
        [
          "You can still get the symbol key with `Object.getOwnPropertySymbols(obj)` or `Reflect.ownKeys(obj)`, so symbol keys aren't private",
          "Ключ-символ усе одно можна отримати через `Object.getOwnPropertySymbols(obj)` чи `Reflect.ownKeys(obj)`, тож такі ключі не приватні",
        ],
        [
          "A `for...in` loop over `obj` lists both `x` and the symbol key",
          "Цикл `for...in` по `obj` перелічує і `x`, і ключ-символ",
        ],
      ],
      ["a", "b", "c"],
    ),
    question(
      "sticky-flag",
      [
        "What does this print?\n\n```js\nconst re = /\\d/y;\nconsole.log(re.test('a1'), re.lastIndex);\nre.lastIndex = 1;\nconsole.log(re.test('a1'), re.lastIndex, re.flags);\n```",
        "Що виведе цей код?\n\n```js\nconst re = /\\d/y;\nconsole.log(re.test('a1'), re.lastIndex);\nre.lastIndex = 1;\nconsole.log(re.test('a1'), re.lastIndex, re.flags);\n```",
      ],
      [
        ["`true 2`, then `true 2 'y'`", "`true 2`, потім `true 2 'y'`"],
        [
          "`false 0`, then `true 2 'y'`: a sticky regex matches only exactly at `lastIndex` and doesn't search ahead; a failed match resets `lastIndex` to `0`",
          "`false 0`, потім `true 2 'y'`: «липкий» (sticky) регулярний вираз шукає збіг лише точно в позиції `lastIndex` і не шукає далі; невдалий пошук скидає `lastIndex` до `0`",
        ],
        ["`true 2`, then `false 0 'y'`", "`true 2`, потім `false 0 'y'`"],
        ["A SyntaxError: there is no `y` flag", "SyntaxError: прапорця `y` не існує"],
      ],
      "b",
    ),
  ],
};

/** Questions 173–177 of the JavaScript list: "You Don't Know JS: ES6 & Beyond", chapter 6 (API Additions). */
export const jsYdkjsApiAdditionsQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-api-additions-quiz",
  title: { en: "You Don't Know JS: ES6 API additions", uk: "You Don't Know JS: нові API в ES6" },
  questions: [
    question(
      "array-of-from-copywithin",
      [
        "What does this print?\n\n```js\nconsole.log(\n  Array.of(3),\n  Array.from('abc', (c) => c.toUpperCase()),\n  [1, 2, 3, 4, 5].copyWithin(0, 3),\n);\n```",
        "Що виведе цей код?\n\n```js\nconsole.log(\n  Array.of(3),\n  Array.from('abc', (c) => c.toUpperCase()),\n  [1, 2, 3, 4, 5].copyWithin(0, 3),\n);\n```",
      ],
      [
        ["`[ <3 empty items> ]`, `['ABC']`, `[1, 2, 3, 4, 5]`", "`[ <3 empty items> ]`, `['ABC']`, `[1, 2, 3, 4, 5]`"],
        [
          "`[3]`, `['A', 'B', 'C']`, `[4, 5, 3, 4, 5]`: `Array.of` always treats its arguments as elements, `Array.from` takes a map function, and `copyWithin` copies a part of the array over another part in place",
          "`[3]`, `['A', 'B', 'C']`, `[4, 5, 3, 4, 5]`: `Array.of` завжди вважає аргументи елементами, `Array.from` приймає функцію перетворення, а `copyWithin` копіює частину масиву поверх іншої частини на місці",
        ],
        ["`[3]`, `['A', 'B', 'C']`, `[4, 5]`", "`[3]`, `['A', 'B', 'C']`, `[4, 5]`"],
        ["`[3]`, `['a', 'b', 'c']`, `[1, 2, 3, 1, 2]`", "`[3]`, `['a', 'b', 'c']`, `[1, 2, 3, 1, 2]`"],
      ],
      "b",
    ),
    question(
      "number-isfinite",
      [
        "What do `isFinite('42')`, `Number.isFinite('42')` and `Number.isFinite(null)` return?",
        "Що повертають `isFinite('42')`, `Number.isFinite('42')` і `Number.isFinite(null)`?",
      ],
      [
        ["`true`, `true`, `false`", "`true`, `true`, `false`"],
        [
          "`true`, `false`, `false`: the global `isFinite` converts its argument to a number first, while `Number.isFinite` returns `true` only for actual finite numbers",
          "`true`, `false`, `false`: глобальна `isFinite` спершу перетворює аргумент на число, а `Number.isFinite` повертає `true` лише для справжніх скінченних чисел",
        ],
        ["`false`, `false`, `true`", "`false`, `false`, `true`"],
        ["A TypeError for the string arguments", "TypeError для рядкових аргументів"],
      ],
      "b",
    ),
    question(
      "object-assign-details",
      [
        "Which statements about `Object.assign(target, ...sources)` are true?",
        "Які твердження про `Object.assign(target, ...sources)` правильні?",
      ],
      [
        [
          "It copies only own enumerable properties, including symbol keys; inherited and non-enumerable properties are skipped",
          "Він копіює лише власні перелічувані властивості, зокрема з ключами-символами; успадковані й неперелічувані властивості пропускаються",
        ],
        [
          "It reads getters on the sources and copies their values, so the target gets plain data properties, not the getters",
          "Він читає гетери джерел і копіює їхні значення, тож ціль отримує звичайні властивості з даними, а не гетери",
        ],
        [
          "It assigns with `=`, so a setter on the target runs instead of being replaced",
          "Він присвоює через `=`, тож сетер на цілі виконується, а не замінюється",
        ],
        [
          "A `null` or `undefined` source throws a TypeError",
          "Джерело `null` чи `undefined` кидає TypeError",
        ],
      ],
      ["a", "b", "c"],
    ),
    question(
      "string-raw-repeat",
      [
        "What do `` String.raw`a\\nb`.length ``, `'ab'.repeat(3)` and `` String.raw`C:\\temp\\new` `` return?",
        "Що повертають `` String.raw`a\\nb`.length ``, `'ab'.repeat(3)` і `` String.raw`C:\\temp\\new` ``?",
      ],
      [
        ["`3`, `'ab3'`, a string with a tab and a newline in it", "`3`, `'ab3'`, рядок із табуляцією та переходом на новий рядок"],
        [
          "`4`, `'ababab'`, `'C:\\temp\\new'`: `String.raw` is a built-in template tag that keeps backslashes as they are instead of processing escapes",
          "`4`, `'ababab'`, `'C:\\temp\\new'`: `String.raw` — вбудований тег шаблонів, який залишає зворотні скісні риски як є замість обробки escape-послідовностей",
        ],
        ["`3`, `'ababab'`, `'C:\\temp\\new'`", "`3`, `'ababab'`, `'C:\\temp\\new'`"],
        ["A SyntaxError: `String.raw` must be called with parentheses", "SyntaxError: `String.raw` треба викликати з дужками"],
      ],
      "b",
    ),
    question(
      "array-iterators",
      [
        "What does this print?\n\n```js\nconst sparse = [, 'x'];\nconsole.log([...sparse.keys()], Object.keys(sparse), [...['a', 'b'].entries()]);\n```",
        "Що виведе цей код?\n\n```js\nconst sparse = [, 'x'];\nconsole.log([...sparse.keys()], Object.keys(sparse), [...['a', 'b'].entries()]);\n```",
      ],
      [
        ["`['1']`, `['1']`, `['a', 'b']`", "`['1']`, `['1']`, `['a', 'b']`"],
        [
          "`[0, 1]`, `['1']`, `[[0, 'a'], [1, 'b']]`: the array iterators `keys()`, `values()` and `entries()` go over every index up to `length`, including holes, while `Object.keys` lists only existing string keys",
          "`[0, 1]`, `['1']`, `[[0, 'a'], [1, 'b']]`: ітератори масиву `keys()`, `values()` і `entries()` проходять кожен індекс до `length`, включно з порожніми, а `Object.keys` повертає лише наявні рядкові ключі",
        ],
        ["`[0, 1]`, `[0, 1]`, `{ 0: 'a', 1: 'b' }`", "`[0, 1]`, `[0, 1]`, `{ 0: 'a', 1: 'b' }`"],
        ["`[1]`, `['1']`, `[['a', 0], ['b', 1]]`", "`[1]`, `['1']`, `[['a', 0], ['b', 1]]`"],
      ],
      "b",
    ),
  ],
};

/** Questions 178–180 of the JavaScript list: "You Don't Know JS: ES6 & Beyond", chapter 8 (Beyond ES6). */
export const jsYdkjsBeyondEs6Quiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-beyond-es6-quiz",
  title: { en: "You Don't Know JS: beyond ES6", uk: "You Don't Know JS: після ES6" },
  questions: [
    question(
      "async-function-semantics",
      [
        "Which statements about `async` functions are true?",
        "Які твердження про функції `async` правильні?",
      ],
      [
        [
          "An `async` function always returns a promise: a returned value resolves it, and a thrown error rejects it",
          "Функція `async` завжди повертає проміс: повернуте значення виконує його, а кинута помилка — відхиляє",
        ],
        [
          "`await` also works on a non-promise value (such as `await 5`), but it still pauses until a later microtask",
          "`await` працює й зі значенням, що не є промісом (як-от `await 5`), але все одно призупиняє виконання до наступної мікрозадачі",
        ],
        [
          "The caller can't stop a running `async` function from outside; cancellation has to be built in, for example with an `AbortSignal` the function checks",
          "Той, хто викликав, не може зупинити запущену функцію `async` ззовні; скасування треба закласти самому, наприклад через `AbortSignal`, який функція перевіряє",
        ],
        [
          "A rejected `await` can't be caught with `try/catch`; you must use `.catch()`",
          "Відхилений `await` не можна перехопити через `try/catch`; треба використовувати `.catch()`",
        ],
      ],
      ["a", "b", "c"],
    ),
    question(
      "exponent-operator",
      [
        "What do `2 ** 3 ** 2` and `-2 ** 2` give?",
        "Що дають `2 ** 3 ** 2` і `-2 ** 2`?",
      ],
      [
        ["`64` and `4`", "`64` і `4`"],
        ["`512` and `-4`", "`512` і `-4`"],
        [
          "`512` and a SyntaxError: `**` groups from the right (`2 ** 9`), and a unary minus directly before the base is not allowed, so write `(-2) ** 2` or `-(2 ** 2)`",
          "`512` і SyntaxError: `**` групується справа (`2 ** 9`), а унарний мінус безпосередньо перед основою заборонений, тож пишіть `(-2) ** 2` чи `-(2 ** 2)`",
        ],
        ["`64` and a SyntaxError", "`64` і SyntaxError"],
      ],
      "c",
    ),
    question(
      "object-observe",
      [
        "Older books describe `Object.observe` for watching changes to an object. What should you use today?",
        "Старіші книжки описують `Object.observe` для відстеження змін об'єкта. Що використовувати сьогодні?",
      ],
      [
        ["`Object.observe`: it is part of ES2016", "`Object.observe`: він є частиною ES2016"],
        [
          "It was withdrawn and never became part of the language; use a `Proxy` or setters for objects (or a reactive library), and `MutationObserver` for DOM changes",
          "Його відкликали, і він так і не став частиною мови; для об'єктів використовуйте `Proxy` чи сетери (або реактивну бібліотеку), а для змін DOM — `MutationObserver`",
        ],
        ["`Object.watch`, its standard replacement", "`Object.watch`, його стандартну заміну"],
        ["Polling the object with `setInterval` is the only option", "Опитування об'єкта через `setInterval` — єдиний варіант"],
      ],
      "b",
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

/** Questions 152–159 of the JavaScript list: "You Don't Know JS: Async & Performance", chapter 1 (Asynchrony: Now & Later). */
export const jsYdkjsAsyncQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-async-quiz",
  title: { en: "You Don't Know JS: asynchrony now and later", uk: "You Don't Know JS: асинхронність «зараз» і «пізніше»" },
  questions: [
    question(
      "now-and-later",
      [
        "Why doesn't this log the server's response, and why isn't a synchronous request the fix?\n\n```js\nvar data = ajax('/api/user'); // ajax takes an optional callback\nconsole.log(data);\n```",
        "Чому цей код не виводить відповідь сервера і чому синхронний запит — не вихід?\n\n```js\nvar data = ajax('/api/user'); // ajax приймає необов'язковий колбек\nconsole.log(data);\n```",
      ],
      [
        ["It does log the response: `ajax` waits for the server before returning", "Виводить: `ajax` чекає на сервер, перш ніж повернути значення"],
        [
          "The program runs in chunks: the code \"now\" finishes before the response arrives \"later\", so the response has to be handled in a function that runs later (a callback or a promise handler); a synchronous request would freeze the page (clicks, scrolling, rendering) until it completes",
          "Програма виконується частинами: код «зараз» завершується раніше, ніж «пізніше» прийде відповідь, тож обробляти її треба у функції, яка виконається пізніше (колбек чи обробник проміса); синхронний запит заморозив би сторінку (кліки, прокручування, рендеринг), доки він не завершиться",
        ],
        ["`console.log` runs first because console calls are hoisted", "`console.log` виконується першим, бо виклики консолі піднімаються (hoisting)"],
        ["A synchronous request is the recommended fix, because it keeps the code linear", "Синхронний запит — рекомендований вихід, бо код лишається лінійним"],
      ],
      "b",
    ),
    question(
      "async-console",
      [
        "In some browsers DevTools shows `{ index: 2 }` for this. Why, and how do you see the value at the moment of logging?\n\n```js\nvar a = { index: 1 };\nconsole.log(a);\na.index++;\n```",
        "У деяких браузерах DevTools показує тут `{ index: 2 }`. Чому і як побачити значення на момент логування?\n\n```js\nvar a = { index: 1 };\nconsole.log(a);\na.index++;\n```",
      ],
      [
        ["`a.index++` is hoisted above `console.log`", "`a.index++` піднімається вище за `console.log`"],
        ["`console.log` always copies objects, so this can never happen", "`console.log` завжди копіює об'єкти, тож такого не буває"],
        ["Objects are passed to `console.log` by value", "Об'єкти передаються в `console.log` за значенням"],
        [
          "`console` isn't part of the language spec, and the host may defer its output or show a live reference to the object, so you can see a later state; use a breakpoint, or log a snapshot such as `JSON.stringify(a)`",
          "`console` не входить до специфікації мови, і середовище може відкласти виведення або показати живе посилання на об'єкт, тож видно пізніший стан; поставте точку зупинки або виведіть знімок, як-от `JSON.stringify(a)`",
        ],
      ],
      "d",
    ),
    question(
      "run-to-completion",
      [
        "`foo` and `bar` are callbacks of two requests that can finish in either order. What can be printed at the end?\n\n```js\nvar a = 1, b = 2;\nfunction foo() { a++; b = b * a; a = b + 3; }\nfunction bar() { b--; a = 8 + b; b = a * 2; }\najax(url1, foo);\najax(url2, bar);\n// later, after both: console.log(a, b);\n```",
        "`foo` і `bar` — колбеки двох запитів, які можуть завершитися в будь-якому порядку. Що може бути виведено наприкінці?\n\n```js\nvar a = 1, b = 2;\nfunction foo() { a++; b = b * a; a = b + 3; }\nfunction bar() { b--; a = 8 + b; b = a * 2; }\najax(url1, foo);\najax(url2, bar);\n// пізніше, після обох: console.log(a, b);\n```",
      ],
      [
        [
          "Only `11 22` (`foo` first) or `183 180` (`bar` first): JavaScript is single-threaded and each function runs to completion, so their statements never interleave; the order of whole functions is still a race condition",
          "Лише `11 22` (першою `foo`) або `183 180` (першою `bar`): JavaScript однопотоковий і кожна функція виконується до кінця, тож їхні інструкції ніколи не перемішуються; але порядок цілих функцій — усе одно стан гонитви (race condition)",
        ],
        ["Always `11 22`, because callbacks run in the order they were registered", "Завжди `11 22`, бо колбеки виконуються в порядку реєстрації"],
        ["Many different results, because the two callbacks run on separate threads and their statements interleave", "Багато різних результатів, бо колбеки виконуються в окремих потоках і їхні інструкції перемішуються"],
        ["`NaN NaN`, because the callbacks share variables", "`NaN NaN`, бо колбеки спільно використовують змінні"],
      ],
      "a",
    ),
    question(
      "response-order",
      [
        "Two requests store their results like this. What is wrong, and how do you fix it?\n\n```js\nvar res = [];\nfunction response(data) { res.push(data); }\najax('/a', response);\najax('/b', response);\n```",
        "Два запити зберігають результати ось так. Що не так і як це виправити?\n\n```js\nvar res = [];\nfunction response(data) { res.push(data); }\najax('/a', response);\najax('/b', response);\n```",
      ],
      [
        ["Nothing: `/a` was requested first, so its response always arrives first", "Нічого: `/a` запитали першим, тож його відповідь завжди приходить першою"],
        ["`push` isn't safe when two callbacks call it at the same moment, so use a lock", "`push` небезпечний, коли два колбеки викликають його одночасно, тож потрібне блокування"],
        [
          "Responses can arrive in either order, so `res[0]` may hold `/b`'s data, even if `/b` \"usually\" answers slower; store each result by what it is (for example `if (data.url === '/a') res[0] = data; else res[1] = data;`), or use `Promise.all`, which keeps the input order",
          "Відповіді можуть прийти в будь-якому порядку, тож у `res[0]` можуть опинитися дані `/b`, навіть якщо `/b` «зазвичай» відповідає повільніше; зберігайте кожен результат за тим, що він означає (наприклад, `if (data.url === '/a') res[0] = data; else res[1] = data;`), або скористайтеся `Promise.all`, який зберігає порядок вхідних даних",
        ],
        ["Use `unshift` instead of `push`", "Використати `unshift` замість `push`"],
      ],
      "c",
    ),
    question(
      "gate-and-latch",
      [
        "Which statements about coordinating two concurrent callbacks are true?\n\n```js\nvar a, b;\nfunction foo(x) { a = x * 2; baz(); }\nfunction bar(y) { b = y * 2; baz(); }\nfunction baz() { console.log(a + b); }\najax(url1, foo);\najax(url2, bar);\n```",
        "Які твердження про координацію двох конкурентних колбеків правильні?\n\n```js\nvar a, b;\nfunction foo(x) { a = x * 2; baz(); }\nfunction bar(y) { b = y * 2; baz(); }\nfunction baz() { console.log(a + b); }\najax(url1, foo);\najax(url2, bar);\n```",
      ],
      [
        ["The first `baz()` call always logs `NaN`, because one of the values is still `undefined`", "Перший виклик `baz()` завжди виводить `NaN`, бо одне зі значень ще `undefined`"],
        [
          "A \"gate\" fixes it: call `baz()` only when both values are set, for example `if (a !== undefined && b !== undefined)` (a plain `if (a && b)` breaks when a value is `0`)",
          "Це виправляє «шлагбаум» (gate): викликати `baz()`, лише коли задано обидва значення, наприклад `if (a !== undefined && b !== undefined)` (просте `if (a && b)` ламається, коли значення дорівнює `0`)",
        ],
        [
          "When only the first response should count, a \"latch\" does it: each callback sets the value and calls `baz()` only if nothing was set yet (`if (a === undefined)`)",
          "Коли має враховуватися лише перша відповідь, це робить «засувка» (latch): кожен колбек задає значення й викликає `baz()`, лише якщо нічого ще не задано (`if (a === undefined)`)",
        ],
        ["`baz()` can run while the other callback is halfway through its body", "`baz()` може виконатися, поки інший колбек на середині свого тіла"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "cooperative-batching",
      [
        "A response handler doubles 10 million records with `data.map(...)` and the page freezes for seconds. What does this version do?\n\n```js\nfunction response(data) {\n  var chunk = data.splice(0, 1000);\n  res = res.concat(chunk.map(v => v * 2));\n  if (data.length > 0) setTimeout(() => response(data), 0);\n}\n```",
        "Обробник відповіді подвоює 10 мільйонів записів через `data.map(...)`, і сторінка зависає на секунди. Що робить ця версія?\n\n```js\nfunction response(data) {\n  var chunk = data.splice(0, 1000);\n  res = res.concat(chunk.map(v => v * 2));\n  if (data.length > 0) setTimeout(() => response(data), 0);\n}\n```",
      ],
      [
        ["It runs the batches in parallel on several threads", "Виконує порції паралельно в кількох потоках"],
        ["`setTimeout(..., 0)` runs the next batch immediately, before anything else", "`setTimeout(..., 0)` запускає наступну порцію негайно, раніше за все інше"],
        ["It makes the total work faster", "Пришвидшує загальну роботу"],
        [
          "Cooperative concurrency: each batch is a short task, and scheduling the rest with `setTimeout(..., 0)` lets clicks, rendering and other responses run in between; the total work isn't faster, and if another response can interleave, the order of results must be coordinated",
          "Кооперативна конкурентність: кожна порція — коротка задача, а планування решти через `setTimeout(..., 0)` дає виконатися між ними клікам, рендерингу й іншим відповідям; загальна робота не стає швидшою, а якщо можуть втрутитися інші відповіді, порядок результатів треба координувати",
        ],
      ],
      "d",
    ),
    question(
      "job-queue",
      [
        "What does this print, and what happens if a promise callback keeps queuing new ones forever?\n\n```js\nconsole.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => {\n  console.log('C');\n  Promise.resolve().then(() => console.log('D'));\n});\n```",
        "Що виведе цей код і що станеться, якщо колбек проміса без кінця ставитиме в чергу нові?\n\n```js\nconsole.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => {\n  console.log('C');\n  Promise.resolve().then(() => console.log('D'));\n});\n```",
      ],
      [
        ["`A B C D`; endless promise callbacks are fine, because the timer still gets its turn", "`A B C D`; нескінченні колбеки промісів не страшні, бо таймер усе одно отримає свою чергу"],
        ["`A C B D`, because `D` was queued after the timer", "`A C B D`, бо `D` поставлено в чергу після таймера"],
        [
          "`A C D B`: promise callbacks go to the job (microtask) queue, which is drained at the end of the current tick, including jobs added while draining it; so endlessly queued jobs starve the event loop and freeze the page, unlike a recursive `setTimeout`, which yields between tasks",
          "`A C D B`: колбеки промісів потрапляють у чергу завдань (мікрозадач), яку спорожнюють наприкінці поточного тіку разом із завданнями, доданими під час цього; тож нескінченні завдання «заморюють» event loop і заморожують сторінку, на відміну від рекурсивного `setTimeout`, який поступається між задачами",
        ],
        ["`A D C B`, because nested callbacks run first", "`A D C B`, бо вкладені колбеки виконуються першими"],
      ],
      "c",
    ),
    question(
      "statement-ordering",
      [
        "May the engine run this as just `console.log(42)`?\n\n```js\nvar a = 10, b = 30;\na = a + 1;\nb = b + 1;\nconsole.log(a + b);\n```",
        "Чи може рушій виконати це просто як `console.log(42)`?\n\n```js\nvar a = 10, b = 30;\na = a + 1;\nb = b + 1;\nconsole.log(a + b);\n```",
      ],
      [
        ["No: statements always run exactly in source order", "Ні: інструкції завжди виконуються точно в порядку коду"],
        [
          "Yes: the engine may reorder or fold statements as long as the result can't be observed; side effects such as function calls, getters or a `Proxy` limit what it can do, so if code seems to run out of order, suspect a race condition in your own code first",
          "Так: рушій може переставляти чи згортати інструкції, доки результат неможливо помітити; побічні ефекти, як-от виклики функцій, гетери чи `Proxy`, обмежують його свободу, тож якщо здається, що код виконується не по порядку, спершу шукайте стан гонитви у власному коді",
        ],
        ["Yes, and the reordering can change what your program prints", "Так, і перестановка може змінити те, що виводить програма"],
        ["Only in strict mode", "Лише в строгому режимі"],
      ],
      "b",
    ),
  ],
};

/** Questions 163–165 of the JavaScript list: "You Don't Know JS: ES6 & Beyond", chapter 1 (ES? Now & Future). */
export const jsYdkjsEsVersionsQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-es-versions-quiz",
  title: { en: "You Don't Know JS: ES versions, now and future", uk: "You Don't Know JS: версії ES, зараз і в майбутньому" },
  questions: [
    question(
      "es-versioning",
      ["How are ES6 and ES2015 related, and what should \"our code needs ES6\" really mean?", "Як пов'язані ES6 і ES2015 і що насправді має означати «нашому коду потрібен ES6»?"],
      [
        ["ES2015 is an early draft of ES6, and ES6 was finalized in 2016", "ES2015 — ранній чернетковий варіант ES6, а ES6 затвердили 2016 року"],
        ["ES6 and ES2015 are different languages, and browsers support only one of them", "ES6 і ES2015 — різні мови, і браузери підтримують лише одну з них"],
        [
          "They are the same edition (the 6th, finalized in 2015); since then a new edition comes out every year and is named by year (ES2016, ES2017, ...), and ES4 was abandoned; engines ship features one by one, often before the edition is final, so check support feature by feature (for example on caniuse or with a Browserslist target) rather than labeling a codebase \"ES6\"",
          "Це одне й те саме видання (шосте, затверджене 2015 року); відтоді нове видання виходить щороку й називається за роком (ES2016, ES2017, ...), а ES4 так і не вийшов; рушії додають можливості по одній, часто ще до затвердження видання, тож підтримку варто перевіряти для кожної можливості окремо (наприклад, на caniuse чи через ціль Browserslist), а не називати кодову базу «ES6»",
        ],
        ["A browser either supports all of an edition or none of it, so you only need to know the edition number", "Браузер підтримує або все видання, або нічого з нього, тож досить знати номер видання"],
      ],
      "c",
    ),
    question(
      "object-is-polyfill",
      [
        "How does this polyfill handle the two cases where `Object.is` differs from `===`?\n\n```js\nif (!Object.is) {\n  Object.is = function (v1, v2) {\n    if (v1 === 0 && v2 === 0) return 1 / v1 === 1 / v2;\n    if (v1 !== v1) return v2 !== v2;\n    return v1 === v2;\n  };\n}\n```",
        "Як цей поліфіл обробляє два випадки, у яких `Object.is` відрізняється від `===`?\n\n```js\nif (!Object.is) {\n  Object.is = function (v1, v2) {\n    if (v1 === 0 && v2 === 0) return 1 / v1 === 1 / v2;\n    if (v1 !== v1) return v2 !== v2;\n    return v1 === v2;\n  };\n}\n```",
      ],
      [
        [
          "For two zeros, `1 / 0` is `Infinity` and `1 / -0` is `-Infinity`, so `0` and `-0` come out different; `NaN` is the only value not equal to itself, so `v1 !== v1` spots it and two `NaN`s come out equal; the `if (!Object.is)` guard keeps the native version where it exists",
          "Для двох нулів `1 / 0` дає `Infinity`, а `1 / -0` дає `-Infinity`, тож `0` і `-0` виходять різними; `NaN` — єдине значення, що не дорівнює собі, тож `v1 !== v1` його виявляє, і два `NaN` виходять рівними; перевірка `if (!Object.is)` залишає вбудовану версію там, де вона є",
        ],
        ["It doesn't: `1 / v1` throws for zero, so the polyfill only works for non-zero numbers", "Ніяк: `1 / v1` кидає помилку для нуля, тож поліфіл працює лише для ненульових чисел"],
        ["`v1 !== v1` is always `false`, so that line is dead code", "`v1 !== v1` завжди `false`, тож цей рядок — мертвий код"],
        ["The guard is pointless, because a polyfill should always replace the built-in version", "Перевірка не потрібна, бо поліфіл завжди має замінювати вбудовану версію"],
      ],
      "a",
    ),
    question(
      "adopting-new-features",
      ["Which statements about using new language features while still supporting older browsers are true?", "Які твердження про використання нових можливостей мови з одночасною підтримкою старих браузерів правильні?"],
      [
        [
          "Waiting until every old browser is gone keeps you years behind (ES5 strict mode was adopted only years after it shipped); the book's advice is to adopt features early with tooling",
          "Чекати, доки зникнуть усі старі браузери, означає відставати на роки (строгий режим ES5 почали використовувати лише через роки після виходу); книжка радить переходити на нові можливості рано, з допомогою інструментів",
        ],
        [
          "A transpiler rewrites new syntax during the build, for example `var obj = { foo };` into `var obj = { foo: foo };`",
          "Транспілятор переписує новий синтаксис під час збирання, наприклад `var obj = { foo };` на `var obj = { foo: foo };`",
        ],
        [
          "A transpiler and polyfills are usually used together: the transpiler for syntax, polyfills for missing APIs, both chosen for your target browsers",
          "Транспілятор і поліфіли зазвичай використовують разом: транспілятор для синтаксису, поліфіли для відсутніх API, і те, і те під цільові браузери",
        ],
        [
          "Once code is transpiled to ES5, polyfills are never needed, because the transpiler also adds missing APIs such as `Object.is` and `Promise`",
          "Коли код транспільовано в ES5, поліфіли вже не потрібні, бо транспілятор додає й відсутні API, як-от `Object.is` і `Promise`",
        ],
      ],
      ["a", "b", "c"],
    ),
  ],
};

/** Questions 181–188 of the JavaScript list: "You Don't Know JS: ES6 & Beyond", chapter 7 (Meta Programming). */
export const jsYdkjsMetaQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-ydkjs-meta-quiz",
  title: { en: "You Don't Know JS: meta programming", uk: "You Don't Know JS: метапрограмування" },
  questions: [
    question(
      "function-name-inference",
      ["Which statements about a function's `name` property are true?", "Які твердження про властивість `name` функції правильні?"],
      [
        ["`var abc = function () {};` gives `abc.name === 'abc'`, inferred from the variable", "`var abc = function () {};` дає `abc.name === 'abc'`, виведене зі змінної"],
        ["The getter in `{ get qux() {} }` is named `'get qux'`, and a method under the key `[Symbol('buz')]` is named `'[buz]'`", "Гетер у `{ get qux() {} }` має назву `'get qux'`, а метод під ключем `[Symbol('buz')]` — `'[buz]'`"],
        ["`window.foo = function () {};` gives `window.foo.name === 'foo'`", "`window.foo = function () {};` дає `window.foo.name === 'foo'`"],
        ["`new Function('return 1').name` is `'anonymous'`", "`new Function('return 1').name` дорівнює `'anonymous'`"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "to-primitive",
      [
        "What do these print?\n\n```js\nconst arr = [1, 2, 3, 4, 5];\narr[Symbol.toPrimitive] = function (hint) {\n  if (hint === 'default' || hint === 'number') {\n    return this.reduce((a, b) => a + b, 0);\n  }\n};\nconsole.log(arr + 10);\nconsole.log(arr == [1, 2, 3, 4, 5]);\n```",
        "Що виведе цей код?\n\n```js\nconst arr = [1, 2, 3, 4, 5];\narr[Symbol.toPrimitive] = function (hint) {\n  if (hint === 'default' || hint === 'number') {\n    return this.reduce((a, b) => a + b, 0);\n  }\n};\nconsole.log(arr + 10);\nconsole.log(arr == [1, 2, 3, 4, 5]);\n```",
      ],
      [
        ["`\"1,2,3,4,510\"` and `true`: `Symbol.toPrimitive` is ignored on arrays", "`\"1,2,3,4,510\"` і `true`: на масивах `Symbol.toPrimitive` ігнорується"],
        [
          "`25` and `false`: `+` calls `Symbol.toPrimitive` with the hint `'default'` (`*` would pass `'number'`, `String(x)` passes `'string'`), but `==` between two objects compares references and never converts them",
          "`25` і `false`: `+` викликає `Symbol.toPrimitive` з підказкою `'default'` (`*` передав би `'number'`, а `String(x)` передає `'string'`), але `==` між двома об'єктами порівнює посилання й нічого не перетворює",
        ],
        ["`25` and `true`, because both sides convert to `15`", "`25` і `true`, бо обидві сторони перетворюються на `15`"],
        ["`15` and `false`", "`15` і `false`"],
      ],
      "b",
    ),
    question(
      "well-known-symbols",
      ["Which statements about well-known symbols are true?", "Які твердження про загальновідомі символи (well-known symbols) правильні?"],
      [
        [
          "A static `[Symbol.hasInstance]` method changes what `x instanceof Foo` returns; on a plain function you must add it with `Object.defineProperty`, because the inherited `Function.prototype[Symbol.hasInstance]` isn't writable",
          "Статичний метод `[Symbol.hasInstance]` змінює результат `x instanceof Foo`; на звичайну функцію його треба додавати через `Object.defineProperty`, бо успадкований `Function.prototype[Symbol.hasInstance]` недоступний для запису",
        ],
        [
          "Setting `b[Symbol.isConcatSpreadable] = false` on an array makes `[1, 2, 3].concat(b)` keep `b` as one nested element",
          "Якщо задати масиву `b[Symbol.isConcatSpreadable] = false`, то `[1, 2, 3].concat(b)` залишить `b` одним вкладеним елементом",
        ],
        [
          "`Symbol.match`, `Symbol.replace`, `Symbol.search` and `Symbol.split` let an object take over the matching `String.prototype` methods",
          "`Symbol.match`, `Symbol.replace`, `Symbol.search` і `Symbol.split` дають об'єкту змогу перехопити відповідні методи `String.prototype`",
        ],
        ["Well-known symbols only work on classes, not on plain objects", "Загальновідомі символи працюють лише з класами, а не зі звичайними об'єктами"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "proxy-limits",
      ["Which statements about proxies are true?", "Які твердження про проксі правильні?"],
      [
        [
          "`typeof pobj`, `pobj === obj` and string conversion can't be trapped; identity always compares the proxy object itself",
          "`typeof pobj`, `pobj === obj` і перетворення на рядок не перехоплюються; порівняння ідентичності завжди порівнює сам об'єкт проксі",
        ],
        [
          "`Proxy.revocable(target, handler)` returns `{ proxy, revoke }`, and after `revoke()` any operation on the proxy throws a TypeError, which is useful for handing out access you can take back",
          "`Proxy.revocable(target, handler)` повертає `{ proxy, revoke }`, а після `revoke()` будь-яка операція з проксі кидає TypeError; це зручно, щоб видати доступ, який можна забрати",
        ],
        [
          "A trap should forward with `Reflect`, such as `get(target, key, receiver) { return Reflect.get(target, key, receiver); }`, so getters see the right `this` and default behavior is kept",
          "Пастка має передавати операцію далі через `Reflect`, як-от `get(target, key, receiver) { return Reflect.get(target, key, receiver); }`, щоб гетери бачили правильний `this` і зберігалася стандартна поведінка",
        ],
        ["A trap may return anything, because the engine never checks results against the target", "Пастка може повертати що завгодно, бо рушій ніколи не звіряє результати з ціллю"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "proxy-last",
      [
        "What does this do?\n\n```js\nconst guard = new Proxy({}, {\n  get(target, key) { throw new Error(`No such property: ${String(key)}`); },\n});\nconst obj = { a: 1 };\nObject.setPrototypeOf(obj, guard);\nobj.a;\nobj.b;\n```",
        "Що робить цей код?\n\n```js\nconst guard = new Proxy({}, {\n  get(target, key) { throw new Error(`No such property: ${String(key)}`); },\n});\nconst obj = { a: 1 };\nObject.setPrototypeOf(obj, guard);\nobj.a;\nobj.b;\n```",
      ],
      [
        ["Both lines throw, because every read goes through the proxy", "Обидва рядки кидають помилку, бо кожне читання проходить через проксі"],
        ["Neither throws: proxies can't be prototypes", "Жоден не кидає: проксі не може бути прототипом"],
        ["`obj.b` returns `undefined`, because the `get` trap only runs for own properties", "`obj.b` повертає `undefined`, бо пастка `get` спрацьовує лише для власних властивостей"],
        [
          "`obj.a` returns `1` without touching the proxy, while `obj.b` isn't found on `obj`, so the lookup reaches the proxy on the prototype chain and throws; this \"proxy last\" pattern catches only missing properties, while \"proxy first\" code works with the proxy directly and sees every access",
          "`obj.a` повертає `1`, не торкаючись проксі, а `obj.b` на `obj` немає, тож пошук доходить до проксі в ланцюжку прототипів і кидає помилку; патерн «проксі останнім» ловить лише відсутні властивості, тоді як із «проксі першим» код працює безпосередньо з проксі й бачить кожен доступ",
        ],
      ],
      "d",
    ),
    question(
      "reflect-api",
      ["How do `Reflect` methods differ from the similar `Object` methods?", "Чим методи `Reflect` відрізняються від схожих методів `Object`?"],
      [
        [
          "`Reflect` is a plain namespace (like `Math`) with one method per proxy trap; `Reflect.defineProperty` returns `true` or `false` where `Object.defineProperty` throws, `Reflect.getPrototypeOf(1)` throws where `Object.getPrototypeOf(1)` boxes the number, and `Reflect.apply` and `Reflect.construct` call a function or `new` it with an array of arguments",
          "`Reflect` — звичайний простір імен (як `Math`) з одним методом на кожну пастку проксі; `Reflect.defineProperty` повертає `true` чи `false` там, де `Object.defineProperty` кидає помилку, `Reflect.getPrototypeOf(1)` кидає помилку там, де `Object.getPrototypeOf(1)` загортає число в об'єкт, а `Reflect.apply` і `Reflect.construct` викликають функцію чи `new` з масивом аргументів",
        ],
        ["`Reflect` is a constructor: you create a reflector with `new Reflect(obj)`", "`Reflect` — конструктор: рефлектор створюють через `new Reflect(obj)`"],
        ["They are exact aliases with identical behavior", "Це точні псевдоніми з однаковою поведінкою"],
        ["`Reflect` methods only work inside proxy traps", "Методи `Reflect` працюють лише всередині пасток проксі"],
      ],
      "a",
    ),
    question(
      "property-order",
      [
        "What do these return?\n\n```js\nconst o = {};\no[Symbol('c')] = 1;\no[2] = 1;\no[1] = 1;\no.b = 1;\no.a = 1;\nconst p = Object.create(o);\np.d = 1;\n\nReflect.ownKeys(o);\nObject.keys(p);\n```",
        "Що повернуть ці виклики?\n\n```js\nconst o = {};\no[Symbol('c')] = 1;\no[2] = 1;\no[1] = 1;\no.b = 1;\no.a = 1;\nconst p = Object.create(o);\np.d = 1;\n\nReflect.ownKeys(o);\nObject.keys(p);\n```",
      ],
      [
        ["`[Symbol(c), '2', '1', 'b', 'a']` (creation order) and `['d', '1', '2', 'b', 'a']`", "`[Symbol(c), '2', '1', 'b', 'a']` (порядок створення) і `['d', '1', '2', 'b', 'a']`"],
        ["`['a', 'b', '1', '2']` (alphabetical) and `['d']`", "`['a', 'b', '1', '2']` (за абеткою) і `['d']`"],
        [
          "`['1', '2', 'b', 'a', Symbol(c)]` and `['d']`: own keys come as integer-like keys ascending, then string keys in creation order, then symbols in creation order; `Object.keys` and `JSON.stringify` list only own enumerable string keys, while `for..in` also walks inherited ones",
          "`['1', '2', 'b', 'a', Symbol(c)]` і `['d']`: власні ключі йдуть так — ключі-цілі числа за зростанням, потім рядкові ключі в порядку створення, потім символи в порядку створення; `Object.keys` і `JSON.stringify` повертають лише власні перелічувані рядкові ключі, а `for..in` проходить і успадковані",
        ],
        ["The order is random, so neither result can be predicted", "Порядок випадковий, тож жоден результат не передбачити"],
      ],
      "c",
    ),
    question(
      "syntax-feature-test",
      [
        "You want to check at runtime whether arrow functions are supported, then load either modern or transpiled code. Which test works?",
        "Ви хочете під час виконання перевірити, чи підтримуються стрілкові функції, і завантажити або сучасний, або транспільований код. Яка перевірка працює?",
      ],
      [
        ["`try { var f = () => {}; } catch (e) { /* not supported */ }`", "`try { var f = () => {}; } catch (e) { /* не підтримується */ }`"],
        ["`if (typeof ArrowFunction !== 'undefined')`", "`if (typeof ArrowFunction !== 'undefined')`"],
        ["`if (window.arrowFunctions)`", "`if (window.arrowFunctions)`"],
        [
          "`try { new Function('(() => {})'); } catch (e) { /* not supported */ }`: an unsupported syntax in the file itself is a SyntaxError for the whole script, before any `try` runs, so the new syntax has to be in a string compiled at runtime",
          "`try { new Function('(() => {})'); } catch (e) { /* не підтримується */ }`: непідтримуваний синтаксис у самому файлі дає SyntaxError для всього скрипту ще до запуску будь-якого `try`, тож новий синтаксис треба тримати в рядку, який компілюється під час виконання",
        ],
      ],
      "d",
    ),
  ],
};
