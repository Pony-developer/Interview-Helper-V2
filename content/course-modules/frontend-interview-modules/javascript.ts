import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 68–92 of the list: JavaScript basics. */
export const javascriptQuiz: SlideDef = {
  kind: "quiz",
  slug: "javascript-quiz",
  title: { en: "JavaScript basics", uk: "Основи JavaScript" },
  questions: [
    question(
      "data-types",
      ["Which list contains all of the JavaScript primitive types?", "Який список містить усі примітивні типи JavaScript?"],
      [
        ["string, number, boolean, array, object", "string, number, boolean, array, object"],
        [
          "string, number, bigint, boolean, undefined, null, symbol (everything else is an object)",
          "string, number, bigint, boolean, undefined, null, symbol (усе інше — об'єкти)",
        ],
        ["int, float, char, string, boolean", "int, float, char, string, boolean"],
        ["string, number, boolean, undefined, null", "string, number, boolean, undefined, null"],
      ],
      "b",
    ),
    question(
      "array-vs-object",
      ["When is an array a better choice than an object?", "Коли масив кращий вибір, ніж об'єкт?"],
      [
        [
          "For an ordered list of values accessed by index, such as a list of products to iterate over",
          "Для впорядкованого списку значень із доступом за індексом, як-от списку товарів, який треба перебрати",
        ],
        ["For a set of named properties of one entity, such as a user's profile", "Для набору іменованих властивостей однієї сутності, як-от профілю користувача"],
        ["Never: an object can always replace an array", "Ніколи: об'єкт завжди може замінити масив"],
        ["When the values are objects, because objects cannot hold objects", "Коли значення — об'єкти, бо об'єкт не може містити об'єкти"],
      ],
      "a",
    ),
    question(
      "events",
      ["Which statements about DOM events are true?", "Які твердження про події DOM правильні?"],
      [
        ["By default, an event bubbles up from its target through the target's ancestors", "За замовчуванням подія спливає від цільового елемента через його предків"],
        [
          "Event delegation is one listener on a parent that handles events from many children via `event.target`",
          "Делегування подій — це один обробник на батьківському елементі, що обробляє події багатьох нащадків через `event.target`",
        ],
        ["`event.preventDefault()` stops the event from bubbling", "`event.preventDefault()` зупиняє спливання події"],
        ["`event.stopPropagation()` stops the event from reaching further elements", "`event.stopPropagation()` не дає події дійти до наступних елементів"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "var-let-const",
      ["Which statement about `var`, `let` and `const` is true?", "Яке твердження про `var`, `let` і `const` правильне?"],
      [
        ["All three are block-scoped", "Усі три мають блокову область видимості"],
        ["A `let` variable cannot be changed", "Змінну `let` не можна змінити"],
        ["`const` makes an object immutable", "`const` робить об'єкт незмінним"],
        [
          "`var` is function-scoped and hoisted as `undefined`; `let` and `const` are block-scoped and sit in the temporal dead zone before their declaration; `const` cannot be reassigned",
          "`var` має функціональну область видимості й піднімається як `undefined`; `let` і `const` блокові та до оголошення перебувають у temporal dead zone; `const` не можна переприсвоїти",
        ],
      ],
      "d",
    ),
    question(
      "const-redefine",
      [
        "What happens here?\n\n```js\nconst user = { name: 'Ann' };\nuser.name = 'Bob';\nuser = {};\n```",
        "Що станеться тут?\n\n```js\nconst user = { name: 'Ann' };\nuser.name = 'Bob';\nuser = {};\n```",
      ],
      [
        ["Both the second and the third line throw an error", "І другий, і третій рядки кидають помилку"],
        [
          "`user.name` becomes 'Bob'; `user = {}` throws a TypeError, because a `const` cannot be reassigned",
          "`user.name` стає 'Bob'; `user = {}` кидає TypeError, бо `const` не можна переприсвоїти",
        ],
        ["Both lines work", "Обидва рядки працюють"],
        ["Only the second line throws an error", "Помилку кидає лише другий рядок"],
      ],
      "b",
    ),
    question(
      "dry-kiss-yagni",
      ["Which description of DRY, KISS and YAGNI is correct?", "Який опис DRY, KISS і YAGNI правильний?"],
      [
        ["They are names of JavaScript frameworks", "Це назви JavaScript-фреймворків"],
        ["DRY: write tests first; KISS: keep code short at any cost; YAGNI: optimize early", "DRY: спершу пиши тести; KISS: код якомога коротший за будь-яку ціну; YAGNI: оптимізуй заздалегідь"],
        [
          "DRY: don't repeat the same knowledge in several places; KISS: keep the solution simple; YAGNI: don't build what isn't needed yet",
          "DRY: не повторюй те саме знання в кількох місцях; KISS: тримай рішення простим; YAGNI: не роби того, що ще не потрібно",
        ],
        ["DRY: duplicate code for clarity; KISS and YAGNI are about Git", "DRY: дублюй код заради зрозумілості; KISS і YAGNI стосуються Git"],
      ],
      "c",
    ),
    question(
      "storage",
      ["How does sessionStorage differ from localStorage?", "Чим sessionStorage відрізняється від localStorage?"],
      [
        [
          "sessionStorage lives only for the tab's session and is not shared between tabs; localStorage stays until cleared and is shared by all tabs of the same origin",
          "sessionStorage живе лише протягом сесії вкладки й не спільний між вкладками; localStorage зберігається, доки його не очистять, і спільний для всіх вкладок того самого origin",
        ],
        ["It is the other way around", "Навпаки"],
        ["sessionStorage is sent to the server with every request", "sessionStorage надсилається на сервер із кожним запитом"],
        ["localStorage is a safe place for auth tokens because scripts cannot read it", "localStorage — безпечне місце для токенів, бо скрипти не можуть його читати"],
      ],
      "a",
    ),
    question(
      "closure",
      [
        "What does this code print?\n\n```js\nfunction counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst next = counter();\nnext();\nnext();\nconsole.log(next());\n```",
        "Що виведе цей код?\n\n```js\nfunction counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst next = counter();\nnext();\nnext();\nconsole.log(next());\n```",
      ],
      [
        ["1", "1"],
        ["3", "3"],
        ["0", "0"],
        ["undefined", "undefined"],
      ],
      "b",
    ),
    question(
      "scope",
      [
        "What does this code print?\n\n```js\nlet x = 1;\n{\n  let x = 2;\n}\nconsole.log(x);\n```",
        "Що виведе цей код?\n\n```js\nlet x = 1;\n{\n  let x = 2;\n}\nconsole.log(x);\n```",
      ],
      [
        ["2", "2"],
        ["ReferenceError", "ReferenceError"],
        ["1", "1"],
        ["undefined", "undefined"],
      ],
      "c",
    ),
    question(
      "anonymous-function",
      ["Which of these passes an anonymous function?", "У якому з варіантів передано анонімну функцію?"],
      [
        ["`function greet() {}`", "`function greet() {}`"],
        ["`class Greet {}`", "`class Greet {}`"],
        ["`const greet = 'hi'`", "`const greet = 'hi'`"],
        ["`setTimeout(function () { console.log('hi'); }, 100)`", "`setTimeout(function () { console.log('hi'); }, 100)`"],
      ],
      "d",
    ),
    question(
      "arrow-function",
      ["How do arrow functions differ from regular functions?", "Чим стрілкові функції відрізняються від звичайних?"],
      [
        ["They have no `this` of their own and take it from the enclosing scope", "Вони не мають власного `this` і беруть його з зовнішньої області видимості"],
        ["They have no `arguments` object and cannot be called with `new`", "Вони не мають об'єкта `arguments` і їх не можна викликати з `new`"],
        ["They are always asynchronous", "Вони завжди асинхронні"],
        ["Shorter syntax, with an implicit return for a single expression", "Коротший синтаксис із неявним return для одного виразу"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "array-methods",
      [
        "Which array method returns a new array of the same length, with each element transformed?",
        "Який метод масиву повертає новий масив тієї самої довжини, де кожен елемент перетворено?",
      ],
      [
        ["`forEach`", "`forEach`"],
        ["`filter`", "`filter`"],
        ["`map`", "`map`"],
        ["`reduce`", "`reduce`"],
      ],
      "c",
    ),
    question(
      "json",
      ["How do you turn a JSON string into an object, and an object back into JSON?", "Як перетворити JSON-рядок на об'єкт, а об'єкт назад на JSON?"],
      [
        ["`JSON.toObject(text)` and `JSON.toString(obj)`", "`JSON.toObject(text)` і `JSON.toString(obj)`"],
        ["`eval(text)` and `obj.toString()`", "`eval(text)` і `obj.toString()`"],
        ["`new JSON(text)` and `obj.json()`", "`new JSON(text)` і `obj.json()`"],
        ["`JSON.parse(text)` and `JSON.stringify(obj)`", "`JSON.parse(text)` і `JSON.stringify(obj)`"],
      ],
      "d",
    ),
    question(
      "event-loop",
      [
        "In what order are the numbers printed?\n\n```js\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n```",
        "У якому порядку виведуться числа?\n\n```js\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n```",
      ],
      [
        ["1 2 3 4", "1 2 3 4"],
        ["1 4 3 2", "1 4 3 2"],
        ["1 4 2 3", "1 4 2 3"],
        ["1 3 4 2", "1 3 4 2"],
      ],
      "b",
    ),
    question(
      "async-without-await",
      ["Which of these are ways to handle asynchronous code without async/await?", "Які з цих способів працюють з асинхронним кодом без async/await?"],
      [
        ["Callbacks", "Колбеки"],
        ["Promise chains with `.then()` and `.catch()`, and `Promise.all` or `Promise.allSettled`", "Ланцюжки промісів із `.then()` і `.catch()`, а також `Promise.all` чи `Promise.allSettled`"],
        ["Observables (RxJS) or event emitters", "Observable (RxJS) чи event emitter-и"],
        ["A `while` loop that keeps checking until the result arrives", "Цикл `while`, що перевіряє, доки не прийде результат"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "equality",
      ["What do `0 == '0'` and `0 === '0'` return?", "Що повертають `0 == '0'` і `0 === '0'`?"],
      [
        ["Both are `true`", "Обидва `true`"],
        ["Both are `false`", "Обидва `false`"],
        ["`true` and `false`", "`true` і `false`"],
        ["`false` and `true`", "`false` і `true`"],
      ],
      "c",
    ),
    question(
      "prototype",
      ["What is a prototype in JavaScript?", "Що таке прототип у JavaScript?"],
      [
        [
          "An object that another object inherits properties from: when a property is missing, the lookup continues along the prototype chain",
          "Об'єкт, від якого інший об'єкт успадковує властивості: якщо властивості немає, пошук продовжується ланцюжком прототипів",
        ],
        ["A draft version of a function", "Чорнова версія функції"],
        ["A copy of a class created with `new`", "Копія класу, створена через `new`"],
        ["A TypeScript type", "Тип у TypeScript"],
      ],
      "a",
    ),
    question(
      "null-undefined",
      ["What is true about `null` and `undefined`?", "Що правильно про `null` і `undefined`?"],
      [
        ["They are the same thing", "Це одне й те саме"],
        [
          "`undefined` means no value was assigned (a missing property, a function with no return); `null` is an empty value set on purpose; `null == undefined` is `true`, `null === undefined` is `false`",
          "`undefined` означає, що значення не присвоєно (відсутня властивість, функція без return); `null` — порожнє значення, задане навмисно; `null == undefined` дає `true`, `null === undefined` дає `false`",
        ],
        ["`typeof null` returns `'null'`", "`typeof null` повертає `'null'`"],
        ["`undefined` is an object", "`undefined` — це об'єкт"],
      ],
      "b",
    ),
    question(
      "context",
      [
        "Which method calls a function right away with a given `this`, passing the arguments as an array?",
        "Який метод одразу викликає функцію із заданим `this`, передаючи аргументи масивом?",
      ],
      [
        ["`bind`", "`bind`"],
        ["`call`", "`call`"],
        ["`apply`", "`apply`"],
        ["`new`", "`new`"],
      ],
      "c",
    ),
    question(
      "promise",
      ["Which states can a Promise be in?", "У яких станах може бути Promise?"],
      [
        ["started, running, finished", "started, running, finished"],
        ["`true` or `false`", "`true` або `false`"],
        ["pending, fulfilled, rejected, and then back to pending", "pending, fulfilled, rejected, а потім знову pending"],
        [
          "pending, then either fulfilled or rejected; once settled, it never changes",
          "pending, а потім fulfilled або rejected; після цього стан уже не змінюється",
        ],
      ],
      "d",
    ),
    question(
      "oop-in-js",
      ["What is true about OOP in JavaScript?", "Що правильно про ООП у JavaScript?"],
      [
        [
          "Inheritance is prototype-based; `class` is syntax on top of prototypes; private fields are written with `#`",
          "Успадкування побудоване на прототипах; `class` — це синтаксис поверх прототипів; приватні поля пишуть через `#`",
        ],
        ["JS has class-based inheritance with interfaces, just like Java", "У JS класове успадкування з інтерфейсами, як у Java"],
        ["JS has no objects", "У JS немає об'єктів"],
        ["JS classes are compiled into Java classes", "Класи JS компілюються в класи Java"],
      ],
      "a",
    ),
    question(
      "dom-text",
      ["How do you change the text of `<h1 id=\"title\">`?", "Як змінити текст `<h1 id=\"title\">`?"],
      [
        ["`document.title = 'Hello'`", "`document.title = 'Hello'`"],
        ["`document.getElementById('title').textContent = 'Hello'`", "`document.getElementById('title').textContent = 'Hello'`"],
        ["`h1.text('Hello')`", "`h1.text('Hello')`"],
        ["`document.querySelector('title').value = 'Hello'`", "`document.querySelector('title').value = 'Hello'`"],
      ],
      "b",
    ),
    question(
      "destructuring",
      [
        "What do you get from `const { name, ...rest } = { name: 'Ann', age: 30, city: 'Kyiv' }`?",
        "Що дає `const { name, ...rest } = { name: 'Ann', age: 30, city: 'Kyiv' }`?",
      ],
      [
        ["`rest` is `['age', 'city']`", "`rest` дорівнює `['age', 'city']`"],
        ["A syntax error", "Синтаксичну помилку"],
        ["`name` is `'Ann'` and `rest` is `{ age: 30, city: 'Kyiv' }`", "`name` дорівнює `'Ann'`, а `rest` — `{ age: 30, city: 'Kyiv' }`"],
        ["`name` is `undefined`", "`name` дорівнює `undefined`"],
      ],
      "c",
    ),
    question(
      "out-of-range",
      ["`const arr = ['a', 'b']; console.log(arr[20]);` What is printed?", "`const arr = ['a', 'b']; console.log(arr[20]);` Що виведеться?"],
      [
        ["A RangeError", "RangeError"],
        ["`undefined`", "`undefined`"],
        ["`null`", "`null`"],
        ["`'b'`", "`'b'`"],
      ],
      "b",
    ),
    question(
      "for-of-in",
      ["What does `for (const x in ['a', 'b'])` iterate over?", "Що перебирає `for (const x in ['a', 'b'])`?"],
      [
        ["The values `'a'` and `'b'`", "Значення `'a'` і `'b'`"],
        ["Nothing: `for...in` does not work on arrays", "Нічого: `for...in` не працює з масивами"],
        ["It throws an error", "Кидає помилку"],
        ["The keys `'0'` and `'1'`, as strings", "Ключі `'0'` і `'1'` як рядки"],
      ],
      "d",
    ),
  ],
};
