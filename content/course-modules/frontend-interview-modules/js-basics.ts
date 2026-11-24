import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–24 of the JavaScript list: basics. */
export const jsBasicsQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-basics-quiz",
  title: { en: "Basics", uk: "Основи" },
  questions: [
    question(
      "es2025",
      ["Which of these features arrived in ECMAScript 2025?", "Які з цих можливостей з'явилися в ECMAScript 2025?"],
      [
        ["`Promise.withResolvers()` and `toSorted()`", "`Promise.withResolvers()` і `toSorted()`"],
        ["Optional chaining `?.` and nullish coalescing `??`", "Опціональний ланцюжок `?.` і оператор `??`"],
        [
          "Iterator helpers (`.map()`, `.filter()`, `.take()` on iterators), new `Set` methods (`union`, `intersection`, `difference`), `Promise.try()` and `RegExp.escape()`",
          "Iterator helpers (`.map()`, `.filter()`, `.take()` на ітераторах), нові методи `Set` (`union`, `intersection`, `difference`), `Promise.try()` і `RegExp.escape()`",
        ],
        ["Classes and arrow functions", "Класи й стрілкові функції"],
      ],
      "c",
    ),
    question(
      "compiled-or-interpreted",
      ["Is JavaScript compiled or interpreted?", "JavaScript компільована чи інтерпретована мова?"],
      [
        [
          "Both: engines like V8 start by interpreting bytecode and compile hot code to optimized machine code just in time (JIT)",
          "І те, і те: рушії на кшталт V8 спершу інтерпретують байт-код, а «гарячий» код компілюють в оптимізований машинний код під час виконання (JIT)",
        ],
        ["Purely interpreted, line by line, with no compilation", "Суто інтерпретована, рядок за рядком, без жодної компіляції"],
        ["Compiled ahead of time into an `.exe`", "Заздалегідь компілюється в `.exe`"],
        ["Compiled into Java bytecode", "Компілюється в байт-код Java"],
      ],
      "a",
    ),
    question(
      "increment",
      ["`let x = 0; console.log(x++); console.log(++x);` What is printed?", "`let x = 0; console.log(x++); console.log(++x);` Що виведеться?"],
      [
        ["`1` and `2`", "`1` і `2`"],
        ["`0` and `1`", "`0` і `1`"],
        ["`1` and `1`", "`1` і `1`"],
        ["`0` and `2`", "`0` і `2`"],
      ],
      "d",
    ),
    question(
      "lexical-scope",
      ["What does lexical scoping mean in JavaScript?", "Що означає лексична область видимості в JavaScript?"],
      [
        ["A function sees the variables of whoever called it", "Функція бачить змінні того, хто її викликав"],
        [
          "A function sees variables from where it is written in the code, not from where it is called (dynamic scoping, as in Bash, works the other way)",
          "Функція бачить змінні з того місця, де вона написана в коді, а не звідки її викликали (динамічна область видимості, як у Bash, працює навпаки)",
        ],
        ["Variables are visible only inside loops", "Змінні видно лише всередині циклів"],
        ["All variables are global", "Усі змінні глобальні"],
      ],
      "b",
    ),
    question(
      "isnan",
      ["What do `isNaN('foo')` and `Number.isNaN('foo')` return?", "Що повертають `isNaN('foo')` і `Number.isNaN('foo')`?"],
      [
        ["`true` and `false`: `isNaN` converts the value to a number first, `Number.isNaN` doesn't", "`true` і `false`: `isNaN` спершу перетворює значення на число, а `Number.isNaN` ні"],
        ["Both `true`", "Обидва `true`"],
        ["Both `false`", "Обидва `false`"],
        ["`false` and `true`", "`false` і `true`"],
      ],
      "a",
    ),
    question(
      "sparse-array",
      ["`const arr = [1, 2, 3]; arr[10] = 99; console.log(arr.length);` What is printed?", "`const arr = [1, 2, 3]; arr[10] = 99; console.log(arr.length);` Що виведеться?"],
      [
        ["`4`", "`4`"],
        ["A RangeError", "RangeError"],
        ["`11`: indexes 3–9 become empty slots, and the length is the highest index plus one", "`11`: індекси 3–9 стають порожніми слотами, а довжина дорівнює найбільшому індексу плюс один"],
        ["`10`", "`10`"],
      ],
      "c",
    ),
    question(
      "negative-infinity",
      ["Which statement about `-Infinity` is true?", "Яке твердження про `-Infinity` правильне?"],
      [
        ["It throws an error when used in arithmetic", "Під час арифметики вона кидає помилку"],
        ["It equals `Number.MIN_VALUE`", "Вона дорівнює `Number.MIN_VALUE`"],
        ["It is a string", "Це рядок"],
        [
          "It is a number smaller than any other number, available as `Number.NEGATIVE_INFINITY`, and you get it from expressions such as `-1 / 0`",
          "Це число, менше за будь-яке інше, доступне як `Number.NEGATIVE_INFINITY`; його дають вирази на кшталт `-1 / 0`",
        ],
      ],
      "d",
    ),
    question(
      "typeof-null",
      ["Why is `typeof null === \"object\"`, and how do you check for `null`?", "Чому `typeof null === \"object\"` і як перевірити на `null`?"],
      [
        ["Because `null` really is an object", "Бо `null` справді об'єкт"],
        [
          "It is a historical bug kept for compatibility: `null` is a primitive; check with `value === null` (or `value == null` to match both `null` and `undefined`)",
          "Це історичний баг, збережений для сумісності: `null` — примітив; перевіряйте через `value === null` (або `value == null`, щоб врахувати і `null`, і `undefined`)",
        ],
        ["Because `null` inherits from `Object.prototype`", "Бо `null` успадковується від `Object.prototype`"],
        ["It is only like that in old browsers", "Так лише в старих браузерах"],
      ],
      "b",
    ),
    question(
      "truthy-falsy",
      ["Which of these values are falsy?", "Які з цих значень falsy?"],
      [
        ["`0` and `NaN`", "`0` і `NaN`"],
        ["`\"\"` (an empty string)", "`\"\"` (порожній рядок)"],
        ["`\"0\"`, `[]` and `{}`", "`\"0\"`, `[]` і `{}`"],
        ["`null` and `undefined`", "`null` і `undefined`"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "undeclared",
      ["What is the difference between an undeclared and an undefined variable?", "Яка різниця між неоголошеною та невизначеною змінною?"],
      [
        [
          "An undefined variable is declared but has no value, so reading it gives `undefined`; reading an undeclared one throws a ReferenceError (though `typeof` safely returns `\"undefined\"` for both)",
          "Невизначена змінна оголошена, але не має значення, тож читання дає `undefined`; читання неоголошеної кидає ReferenceError (хоча `typeof` безпечно повертає `\"undefined\"` для обох)",
        ],
        ["They are the same", "Це одне й те саме"],
        ["Reading an undeclared variable returns `null`", "Читання неоголошеної змінної повертає `null`"],
        ["`typeof` throws an error for an undeclared variable", "`typeof` кидає помилку для неоголошеної змінної"],
      ],
      "a",
    ),
    question(
      "nullish",
      ["What do `null ?? 'default'`, `undefined ?? 'default'` and `false ?? 'default'` return?", "Що повертають `null ?? 'default'`, `undefined ?? 'default'` і `false ?? 'default'`?"],
      [
        ["`'default'` three times", "Тричі `'default'`"],
        ["`null`, `undefined` and `false`", "`null`, `undefined` і `false`"],
        ["`'default'`, `'default'` and `false`: `??` falls back only for `null` and `undefined`, unlike `||`", "`'default'`, `'default'` і `false`: `??` підставляє значення лише для `null` і `undefined`, на відміну від `||`"],
        ["A syntax error", "Синтаксична помилка"],
      ],
      "c",
    ),
    question(
      "global-variables",
      ["What is the main problem with global variables?", "Яка головна проблема глобальних змінних?"],
      [
        ["They are slower to read than local ones by a factor of ten", "Їх читати вдесятеро повільніше, ніж локальні"],
        ["They can't hold objects", "Вони не можуть зберігати об'єкти"],
        ["They are removed after each function call", "Вони видаляються після кожного виклику функції"],
        [
          "Any code can read and change them, so names collide between scripts and bugs are hard to trace and test; modules and local scope avoid this",
          "Будь-який код може їх читати й змінювати, тож імена конфліктують між скриптами, а баги важко відстежити й протестувати; модулі й локальна область видимості цього уникають",
        ],
      ],
      "d",
    ),
    question(
      "delete-property",
      ["`const user = { name: 'Ann', age: 30 }; delete user.age;` What is the result?", "`const user = { name: 'Ann', age: 30 }; delete user.age;` Який результат?"],
      [
        ["`user` becomes `{ name: 'Ann', age: undefined }`", "`user` стає `{ name: 'Ann', age: undefined }`"],
        ["A TypeError, because `user` is a `const`", "TypeError, бо `user` — це `const`"],
        ["The `age` property is removed: `user` is `{ name: 'Ann' }`", "Властивість `age` видалено: `user` дорівнює `{ name: 'Ann' }`"],
        ["The whole object is deleted", "Видаляється весь об'єкт"],
      ],
      "c",
    ),
    question(
      "reference-equality",
      ["Why does `[1, 2] === [1, 2]` return `false`?", "Чому `[1, 2] === [1, 2]` повертає `false`?"],
      [
        [
          "Arrays and objects are compared by reference: each literal creates a new object in memory, so they are never the same object, whatever their contents",
          "Масиви й об'єкти порівнюються за посиланням: кожен літерал створює новий об'єкт у пам'яті, тож це ніколи не той самий об'єкт, хоч би який був вміст",
        ],
        ["Because `===` doesn't work with arrays", "Бо `===` не працює з масивами"],
        ["Because the arrays have different lengths", "Бо масиви мають різну довжину"],
        ["It returns `true`; only `==` returns `false`", "Воно повертає `true`; `false` повертає лише `==`"],
      ],
      "a",
    ),
    question(
      "multiple-inheritance",
      ["Does JavaScript support multiple inheritance?", "Чи підтримує JavaScript множинне успадкування?"],
      [
        ["Yes: `class A extends B, C`", "Так: `class A extends B, C`"],
        [
          "No: a class extends one parent and an object has one prototype; you combine behavior with mixins (for example `Object.assign(Target.prototype, mixin)`) or composition",
          "Ні: клас розширює одного батька, а об'єкт має один прототип; поведінку поєднують через міксини (наприклад, `Object.assign(Target.prototype, mixin)`) або композицію",
        ],
        ["Yes, through interfaces", "Так, через інтерфейси"],
        ["No, and there is no way to reuse behavior between classes", "Ні, і немає способу повторно використати поведінку між класами"],
      ],
      "b",
    ),
    question(
      "timers",
      ["Which statements about `setTimeout` and `setInterval` are true?", "Які твердження про `setTimeout` і `setInterval` правильні?"],
      [
        ["The delay is a minimum, not a guarantee: the callback waits until the call stack is free", "Затримка — це мінімум, а не гарантія: колбек чекає, доки звільниться стек викликів"],
        ["Browsers throttle timers in background tabs", "Браузери сповільнюють таймери у фонових вкладках"],
        ["A `setTimeout(fn, 0)` runs before any promise callbacks", "`setTimeout(fn, 0)` виконується раніше за будь-які колбеки промісів"],
        ["An interval that is never cleared with `clearInterval` keeps running and holding memory", "Інтервал, який не очистили через `clearInterval`, продовжує працювати й тримати пам'ять"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "let-loop-timeout",
      [
        "What does this print, and what would it print with `var` instead of `let`?\n\n```js\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), i * 100);\n}\n```",
        "Що виведе цей код і що він вивів би з `var` замість `let`?\n\n```js\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), i * 100);\n}\n```",
      ],
      [
        ["`3 3 3`, and `0 1 2` with `var`", "`3 3 3`, а з `var` — `0 1 2`"],
        ["`0 1 2` in both cases", "`0 1 2` в обох випадках"],
        ["`0 1 2`, and `3 3 3` with `var`, because `let` creates a new binding for each iteration", "`0 1 2`, а з `var` — `3 3 3`, бо `let` створює нове зв'язування на кожній ітерації"],
        ["Nothing: the timeouts are cancelled when the loop ends", "Нічого: таймаути скасовуються після завершення циклу"],
      ],
      "c",
    ),
    question(
      "viewstate-sessionstate",
      ["In ASP.NET Web Forms, how does ViewState differ from SessionState?", "Чим в ASP.NET Web Forms ViewState відрізняється від SessionState?"],
      [
        ["Both are stored in the browser's localStorage", "Обидва зберігаються в localStorage браузера"],
        ["They are JavaScript APIs", "Це API JavaScript"],
        ["ViewState is shared by all users", "ViewState спільний для всіх користувачів"],
        [
          "ViewState keeps a page's state in a hidden field that travels with each postback of that page; SessionState keeps a user's data on the server and is available on every page during the session",
          "ViewState зберігає стан сторінки в прихованому полі, яке передається з кожним postback цієї сторінки; SessionState зберігає дані користувача на сервері, і вони доступні на всіх сторінках протягом сесії",
        ],
      ],
      "d",
    ),
    question(
      "submit-form",
      ["How does `form.requestSubmit()` differ from `form.submit()`?", "Чим `form.requestSubmit()` відрізняється від `form.submit()`?"],
      [
        [
          "`requestSubmit()` behaves like a click on a submit button: it runs HTML validation and fires the `submit` event; `submit()` sends the form directly, skipping both",
          "`requestSubmit()` поводиться як натискання кнопки надсилання: запускає HTML-валідацію й подію `submit`; `submit()` надсилає форму одразу, пропускаючи і те, і те",
        ],
        ["They are identical", "Вони однакові"],
        ["`submit()` runs validation, `requestSubmit()` doesn't", "`submit()` запускає валідацію, а `requestSubmit()` ні"],
        ["`requestSubmit()` sends the form with `fetch`", "`requestSubmit()` надсилає форму через `fetch`"],
      ],
      "a",
    ),
    question(
      "higher-order-function",
      ["What is a higher-order function?", "Що таке функція вищого порядку?"],
      [
        ["A function declared at the top of a file", "Функція, оголошена на початку файлу"],
        ["A function that runs faster than others", "Функція, що працює швидше за інші"],
        ["A method of a class", "Метод класу"],
        [
          "A function that takes another function as an argument or returns a function, such as `map`, `filter`, `addEventListener` or a `debounce(fn)` helper",
          "Функція, що приймає іншу функцію як аргумент або повертає функцію, як-от `map`, `filter`, `addEventListener` чи хелпер `debounce(fn)`",
        ],
      ],
      "d",
    ),
    question(
      "strict-mode",
      ["Which statements about strict mode are true?", "Які твердження про строгий режим правильні?"],
      [
        ["It is enabled with `\"use strict\";` at the top of a script or function", "Він вмикається рядком `\"use strict\";` на початку скрипту чи функції"],
        ["ES modules and class bodies are always in strict mode", "ES-модулі й тіла класів завжди працюють у строгому режимі"],
        ["Assigning to an undeclared variable throws instead of creating a global", "Присвоєння неоголошеній змінній кидає помилку замість створення глобальної"],
        ["It makes all objects immutable", "Він робить усі об'єкти незмінними"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "this-plain-call",
      [
        "In strict mode, what does this return?\n\n```js\nfunction show() {\n  return this;\n}\nshow();\n```",
        "Що поверне цей код у строгому режимі?\n\n```js\nfunction show() {\n  return this;\n}\nshow();\n```",
      ],
      [
        ["`window` (or `globalThis`)", "`window` (або `globalThis`)"],
        ["`undefined`; in sloppy mode it would be the global object", "`undefined`; у нестрогому режимі це був би глобальний об'єкт"],
        ["The function `show` itself", "Саму функцію `show`"],
        ["A ReferenceError", "ReferenceError"],
      ],
      "b",
    ),
    question(
      "this-callbacks",
      ["Which statements about `this` in callbacks are true?", "Які твердження про `this` у колбеках правильні?"],
      [
        [
          "Inside a method, `setTimeout(() => console.log(this.name))` sees the method's `this`, because arrow functions take `this` from where they are written",
          "Усередині методу `setTimeout(() => console.log(this.name))` бачить `this` методу, бо стрілкові функції беруть `this` з місця, де їх написано",
        ],
        ["In a regular-function handler passed to `addEventListener`, `this` is the element the listener is attached to", "В обробнику-звичайній функції, переданому в `addEventListener`, `this` — це елемент, до якого прикріплено обробник"],
        ["The second argument of `forEach` sets `this` for a regular-function callback", "Другий аргумент `forEach` задає `this` для колбека-звичайної функції"],
        ["An arrow function gets `this` from whoever calls it", "Стрілкова функція отримує `this` від того, хто її викликає"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "method-chaining",
      [
        "What does this print?\n\n```js\nconst counter = {\n  count: 0,\n  increment() { this.count++; return this; },\n  show() { console.log(this.count); return this; },\n};\ncounter.increment().increment().show();\n```",
        "Що виведе цей код?\n\n```js\nconst counter = {\n  count: 0,\n  increment() { this.count++; return this; },\n  show() { console.log(this.count); return this; },\n};\ncounter.increment().increment().show();\n```",
      ],
      [
        ["`0`", "`0`"],
        ["`1`", "`1`"],
        ["`2`: each method returns the object itself, so the next call goes to the same object", "`2`: кожен метод повертає сам об'єкт, тож наступний виклик іде до того самого об'єкта"],
        ["A TypeError, because `increment()` returns `undefined`", "TypeError, бо `increment()` повертає `undefined`"],
      ],
      "c",
    ),
  ],
};
