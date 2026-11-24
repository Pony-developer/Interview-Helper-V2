import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 74–87 of the JavaScript list: functions and utilities. */
export const jsFunctionsQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-functions-quiz",
  title: { en: "Functions and utilities", uk: "Функції та утиліти" },
  questions: [
    question(
      "deep-equal",
      ["Why is `JSON.stringify(a) === JSON.stringify(b)` a poor deep equality check?", "Чому `JSON.stringify(a) === JSON.stringify(b)` — погана перевірка глибокої рівності?"],
      [
        [
          "Key order matters (`{ a: 1, b: 2 }` vs `{ b: 2, a: 1 }` gives `false`), `undefined` values and functions disappear, dates become strings, `Map`/`Set` become `{}`, and cycles throw; a real `deepEqual` recurses over keys, checks types and handles these cases",
          "Важить порядок ключів (`{ a: 1, b: 2 }` і `{ b: 2, a: 1 }` дають `false`), значення `undefined` і функції зникають, дати стають рядками, `Map`/`Set` стають `{}`, а цикли кидають помилку; справжній `deepEqual` рекурсивно обходить ключі, перевіряє типи й обробляє ці випадки",
        ],
        ["It is too slow, but always correct", "Він надто повільний, але завжди правильний"],
        ["`JSON.stringify` can't serialize numbers", "`JSON.stringify` не вміє серіалізувати числа"],
        ["There is nothing wrong with it", "Із ним усе гаразд"],
      ],
      "a",
    ),
    question(
      "event-emitter",
      ["Which details matter when implementing an event emitter?", "Які деталі важливі під час реалізації event emitter?"],
      [
        ["Store a list of listeners per event name, and have `on` return an unsubscribe function", "Зберігати список обробників для кожної назви події, а `on` має повертати функцію відписки"],
        ["`off` removes a listener by reference, so an inline anonymous function can't be removed later", "`off` прибирає обробник за посиланням, тож inline-анонімну функцію згодом не прибрати"],
        ["`emit` iterates over a copy of the list, so a `once` listener that removes itself doesn't make the next one get skipped", "`emit` перебирає копію списку, тож обробник `once`, що прибирає себе, не змушує пропустити наступний"],
        ["Listeners should run in random order for fairness", "Обробники мають виконуватися у випадковому порядку заради справедливості"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "reduce-initial",
      ["What does `[].reduce((sum, x) => sum + x)` do?", "Що робить `[].reduce((sum, x) => sum + x)`?"],
      [
        ["Returns `0`", "Повертає `0`"],
        ["Returns `undefined`", "Повертає `undefined`"],
        ["Returns `NaN`", "Повертає `NaN`"],
        [
          "Throws a TypeError: without an initial value, `reduce` uses the first element as the accumulator, and an empty array has none; pass one, `reduce((sum, x) => sum + x, 0)`",
          "Кидає TypeError: без початкового значення `reduce` бере перший елемент як акумулятор, а в порожньому масиві його немає; передайте його: `reduce((sum, x) => sum + x, 0)`",
        ],
      ],
      "d",
    ),
    question(
      "flat",
      ["What does `[1, [2, [3, [4]]]].flat()` return?", "Що повертає `[1, [2, [3, [4]]]].flat()`?"],
      [
        ["`[1, 2, 3, 4]`", "`[1, 2, 3, 4]`"],
        ["`[1, 2, [3, [4]]]`: the default depth is 1, so `.flat(Infinity)` is needed to flatten everything", "`[1, 2, [3, [4]]]`: глибина за замовчуванням — 1, тож щоб сплющити все, потрібен `.flat(Infinity)`"],
        ["`[[1, 2, 3, 4]]`", "`[[1, 2, 3, 4]]`"],
        ["It mutates the original array", "Він змінює початковий масив"],
      ],
      "b",
    ),
    question(
      "deep-merge",
      ["Which statements about merging nested objects are true?", "Які твердження про злиття вкладених об'єктів правильні?"],
      [
        ["`{ ...a, ...b }` is shallow: if both have a nested `settings` object, `b.settings` replaces `a.settings` entirely", "`{ ...a, ...b }` поверхневий: якщо обидва мають вкладений об'єкт `settings`, `b.settings` повністю замінює `a.settings`"],
        ["A deep merge recurses into plain objects and needs a rule for arrays: replace them or concatenate", "Глибоке злиття рекурсивно заходить у звичайні об'єкти й потребує правила для масивів: замінювати чи об'єднувати"],
        ["Deep-merging untrusted JSON must skip keys like `__proto__` and `constructor`, or it can lead to prototype pollution", "Глибоке злиття неперевіреного JSON має пропускати ключі на кшталт `__proto__` і `constructor`, інакше можливе забруднення прототипу (prototype pollution)"],
        ["`Object.assign` merges nested objects deeply", "`Object.assign` глибоко зливає вкладені об'єкти"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "live-collections",
      [
        "This loop is meant to remove the `active` class from every element. Why does it skip some?\n\n```js\nconst items = document.getElementsByClassName('active');\nfor (let i = 0; i < items.length; i++) {\n  items[i].classList.remove('active');\n}\n```",
        "Цей цикл має прибрати клас `active` з усіх елементів. Чому він деякі пропускає?\n\n```js\nconst items = document.getElementsByClassName('active');\nfor (let i = 0; i < items.length; i++) {\n  items[i].classList.remove('active');\n}\n```",
      ],
      [
        ["`classList.remove` doesn't work in loops", "`classList.remove` не працює в циклах"],
        ["Because `i` should start at 1", "Бо `i` має починатися з 1"],
        [
          "`getElementsByClassName` returns a live `HTMLCollection`: removing the class drops the element from the collection, so the indexes shift; `querySelectorAll` returns a static `NodeList`, which doesn't change while you loop",
          "`getElementsByClassName` повертає «живу» `HTMLCollection`: коли клас прибрано, елемент зникає з колекції, і індекси зсуваються; `querySelectorAll` повертає статичний `NodeList`, що не змінюється під час циклу",
        ],
        ["It doesn't skip anything", "Він нічого не пропускає"],
      ],
      "c",
    ),
    question(
      "object-is",
      ["How does `Object.is()` differ from `===`?", "Чим `Object.is()` відрізняється від `===`?"],
      [
        [
          "It is the same except for two cases: `Object.is(NaN, NaN)` is `true` and `Object.is(0, -0)` is `false`; React uses it to compare state and dependencies",
          "Він такий самий, крім двох випадків: `Object.is(NaN, NaN)` дає `true`, а `Object.is(0, -0)` дає `false`; React використовує його для порівняння стану й залежностей",
        ],
        ["It compares objects deeply", "Він порівнює об'єкти глибоко"],
        ["It converts types like `==`", "Він приводить типи, як `==`"],
        ["It only works with strings", "Він працює лише з рядками"],
      ],
      "a",
    ),
    question(
      "bind-arrow",
      [
        "What does this print?\n\n```js\nfunction Person(name) {\n  this.name = name;\n  this.sayName = () => console.log(this.name);\n}\nconst john = new Person('John');\nconst dave = new Person('Dave');\njohn.sayName.call(dave);\n```",
        "Що виведе цей код?\n\n```js\nfunction Person(name) {\n  this.name = name;\n  this.sayName = () => console.log(this.name);\n}\nconst john = new Person('John');\nconst dave = new Person('Dave');\njohn.sayName.call(dave);\n```",
      ],
      [
        ["`Dave`", "`Dave`"],
        ["`undefined`", "`undefined`"],
        [
          "`John`: an arrow function keeps the `this` of the constructor call that created it, and `call`, `apply` and `bind` can't change it (the same holds for a function already returned by `bind`, which can also preset arguments)",
          "`John`: стрілкова функція зберігає `this` виклику конструктора, що її створив, і `call`, `apply` та `bind` не можуть його змінити (те саме стосується функції, яку вже повернув `bind`, що також може заздалегідь задати аргументи)",
        ],
        ["A TypeError", "TypeError"],
      ],
      "c",
    ),
    question(
      "new-vs-call",
      ["What happens with `const person = Person('Ann')` (no `new`) when `Person` is `function Person(name) { this.name = name; }`?", "Що станеться з `const person = Person('Ann')` (без `new`), якщо `Person` — це `function Person(name) { this.name = name; }`?"],
      [
        ["`person` is a new object with `name: 'Ann'`", "`person` — новий об'єкт з `name: 'Ann'`"],
        [
          "`person` is `undefined`, because the function returns nothing; in sloppy mode `this` is the global object, so it creates a global `name`, and in strict mode it throws a TypeError (calling a `class` without `new` always throws)",
          "`person` дорівнює `undefined`, бо функція нічого не повертає; у нестрогому режимі `this` — глобальний об'єкт, тож створюється глобальна `name`, а в строгому режимі буде TypeError (виклик `class` без `new` завжди кидає помилку)",
        ],
        ["It works exactly like `new Person('Ann')`", "Це працює точно як `new Person('Ann')`"],
        ["A SyntaxError", "SyntaxError"],
      ],
      "b",
    ),
    question(
      "function-hoisting",
      [
        "What happens here?\n\n```js\ngreet();\nsay();\n\nfunction greet() { console.log('hi'); }\nvar say = function () { console.log('hey'); };\n```",
        "Що станеться тут?\n\n```js\ngreet();\nsay();\n\nfunction greet() { console.log('hi'); }\nvar say = function () { console.log('hey'); };\n```",
      ],
      [
        ["Both print", "Обидва щось виведуть"],
        ["Both throw a ReferenceError", "Обидва кинуть ReferenceError"],
        ["`greet()` throws, `say()` prints `hey`", "`greet()` кидає помилку, а `say()` виводить `hey`"],
        [
          "`greet()` prints `hi`, then `say()` throws \"TypeError: say is not a function\": a declaration is hoisted with its body, while for `var say` only the variable is hoisted, as `undefined` (with `let` or `const` it would be a ReferenceError)",
          "`greet()` виводить `hi`, а потім `say()` кидає «TypeError: say is not a function»: оголошення піднімається разом із тілом, а для `var say` піднімається лише змінна зі значенням `undefined` (з `let` чи `const` була б ReferenceError)",
        ],
      ],
      "d",
    ),
    question(
      "class-vs-constructor",
      ["Which statements about ES2015 classes compared with ES5 constructor functions are true?", "Які твердження про класи ES2015 порівняно з функціями-конструкторами ES5 правильні?"],
      [
        ["A class must be called with `new`, and its body always runs in strict mode", "Клас мусить викликатися з `new`, а його тіло завжди виконується в строгому режимі"],
        ["Class declarations are in the temporal dead zone until their line, so using one earlier throws", "Оголошення класу перебуває в temporal dead zone до свого рядка, тож використання раніше кидає помилку"],
        ["A derived class's constructor must call `super()` before using `this`", "Конструктор похідного класу мусить викликати `super()`, перш ніж використовувати `this`"],
        ["Classes replace prototypes with a different inheritance model", "Класи замінюють прототипи іншою моделлю успадкування"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "mouseenter-mouseover",
      ["How does `mouseenter` differ from `mouseover`?", "Чим `mouseenter` відрізняється від `mouseover`?"],
      [
        ["They are identical", "Вони однакові"],
        ["`mouseenter` bubbles, `mouseover` doesn't", "`mouseenter` спливає, а `mouseover` ні"],
        [
          "`mouseenter` (and `mouseleave`) don't bubble and fire once when the pointer enters the element; `mouseover` bubbles and fires again every time the pointer moves onto a child",
          "`mouseenter` (і `mouseleave`) не спливають і спрацьовують один раз, коли вказівник заходить на елемент; `mouseover` спливає й спрацьовує знову щоразу, коли вказівник переходить на дочірній елемент",
        ],
        ["`mouseover` only works on touch screens", "`mouseover` працює лише на сенсорних екранах"],
      ],
      "c",
    ),
    question(
      "xhr-vs-fetch",
      ["Which statement about `XMLHttpRequest` and `fetch()` is true?", "Яке твердження про `XMLHttpRequest` і `fetch()` правильне?"],
      [
        [
          "`fetch` is promise-based, supports `AbortController` and streaming responses, and doesn't reject on HTTP errors; `XMLHttpRequest` is event-based but still offers upload progress events (`xhr.upload.onprogress`), which `fetch` lacks",
          "`fetch` побудований на промісах, підтримує `AbortController` і потокові відповіді та не відхиляє проміс за HTTP-помилок; `XMLHttpRequest` побудований на подіях, але досі дає події прогресу завантаження на сервер (`xhr.upload.onprogress`), яких у `fetch` немає",
        ],
        ["`XMLHttpRequest` was removed from browsers", "`XMLHttpRequest` прибрали з браузерів"],
        ["`fetch` can't send POST requests", "`fetch` не вміє надсилати POST-запити"],
        ["They are the same API with different names", "Це той самий API з різними назвами"],
      ],
      "a",
    ),
    question(
      "weakmap",
      ["How do `WeakMap` and `WeakSet` differ from `Map` and `Set`?", "Чим `WeakMap` і `WeakSet` відрізняються від `Map` і `Set`?"],
      [
        ["They are faster versions of `Map` and `Set`", "Це швидші версії `Map` і `Set`"],
        ["They can only store strings", "Вони можуть зберігати лише рядки"],
        ["They are iterable and have a `size`", "Вони ітеровані й мають `size`"],
        [
          "Their keys must be objects and are held weakly, so they don't stop the garbage collector; they aren't iterable and have no `size`, which suits attaching metadata or caches to objects such as DOM nodes",
          "Їхні ключі мають бути об'єктами й тримаються «слабко», тож не заважають збиральнику сміття; вони не ітеровані й не мають `size`, що зручно для прив'язування метаданих чи кешів до об'єктів, як-от DOM-вузлів",
        ],
      ],
      "d",
    ),
  ],
};

/** Questions 88–98 of the JavaScript list: modern JavaScript (ES2020+). */
export const jsModernQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-modern-quiz",
  title: { en: "Modern JavaScript (ES2020+)", uk: "Сучасний JavaScript (ES2020+)" },
  questions: [
    question(
      "optional-chaining",
      [
        "`const user = { profile: null };` What do `user.profile?.name.first` and `user.settings.theme?.dark` do?",
        "`const user = { profile: null };` Що роблять `user.profile?.name.first` і `user.settings.theme?.dark`?",
      ],
      [
        ["Both return `undefined`", "Обидва повертають `undefined`"],
        [
          "The first returns `undefined`, because `?.` short-circuits the rest of the chain once `profile` is nullish; the second throws, because `user.settings` is `undefined` and there is no `?.` before `.theme`",
          "Перший повертає `undefined`, бо `?.` зупиняє решту ланцюжка, щойно `profile` виявляється nullish; другий кидає помилку, бо `user.settings` дорівнює `undefined`, а перед `.theme` немає `?.`",
        ],
        ["Both throw a TypeError", "Обидва кидають TypeError"],
        ["The first throws, the second returns `undefined`", "Перший кидає помилку, а другий повертає `undefined`"],
      ],
      "b",
    ),
    question(
      "logical-assignment",
      [
        "After `const config = { retries: 0, host: '' }; config.retries ??= 3; config.host ||= 'localhost';`, what is `config`?",
        "Після `const config = { retries: 0, host: '' }; config.retries ??= 3; config.host ||= 'localhost';` чому дорівнює `config`?",
      ],
      [
        ["`{ retries: 3, host: 'localhost' }`", "`{ retries: 3, host: 'localhost' }`"],
        ["`{ retries: 3, host: '' }`", "`{ retries: 3, host: '' }`"],
        [
          "`{ retries: 0, host: 'localhost' }`: `??=` assigns only when the value is `null` or `undefined`, while `||=` assigns for any falsy value, including `''`",
          "`{ retries: 0, host: 'localhost' }`: `??=` присвоює лише тоді, коли значення `null` чи `undefined`, а `||=` присвоює для будь-якого falsy-значення, зокрема `''`",
        ],
        ["`{ retries: 0, host: '' }`", "`{ retries: 0, host: '' }`"],
      ],
      "c",
    ),
    question(
      "promise-combinators",
      ["Which pairing of Promise combinators is correct?", "Яке поєднання комбінаторів Promise правильне?"],
      [
        [
          "`all` rejects as soon as one rejects; `allSettled` always resolves with each result's `status`; `any` resolves with the first success and rejects with an `AggregateError` only if all fail; `race` settles with whichever settles first, success or failure",
          "`all` відхиляється, щойно відхиляється один; `allSettled` завжди виконується зі `status` кожного результату; `any` виконується з першим успіхом і відхиляється з `AggregateError`, лише якщо всі провалилися; `race` завершується з тим, хто завершився першим, успіхом чи помилкою",
        ],
        ["`all` waits for every promise even if one fails", "`all` чекає на всі проміси, навіть якщо один провалився"],
        ["`any` is the same as `race`", "`any` — те саме, що й `race`"],
        ["`allSettled` rejects if any promise rejects", "`allSettled` відхиляється, якщо будь-який проміс відхилено"],
      ],
      "a",
    ),
    question(
      "abort-controller",
      ["Which statements about `AbortController` are true?", "Які твердження про `AbortController` правильні?"],
      [
        ["Passing `{ signal: controller.signal }` to `fetch` and calling `controller.abort()` rejects the request with an `AbortError`", "Якщо передати `{ signal: controller.signal }` у `fetch` і викликати `controller.abort()`, запит відхиляється з `AbortError`"],
        ["`AbortSignal.timeout(5000)` gives a signal that aborts after five seconds", "`AbortSignal.timeout(5000)` дає сигнал, що скасовує через п'ять секунд"],
        ["One signal can cancel several operations, including listeners added with `addEventListener(type, fn, { signal })`", "Один сигнал може скасувати кілька операцій, зокрема обробники, додані через `addEventListener(type, fn, { signal })`"],
        ["An aborted controller can be reused for new requests", "Скасований контролер можна повторно використати для нових запитів"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "error-cause",
      ["What is `error.cause` for?", "Для чого `error.cause`?"],
      [
        ["It lists the line number of the error", "Він містить номер рядка помилки"],
        ["It suppresses the error", "Він приглушує помилку"],
        ["It retries the failed operation", "Він повторює невдалу операцію"],
        [
          "When you wrap a low-level error in a clearer one, `throw new Error('Failed to load user', { cause: err })` keeps the original error and its stack, which DevTools and loggers can follow",
          "Коли низькорівневу помилку обгортають у зрозумілішу, `throw new Error('Failed to load user', { cause: err })` зберігає початкову помилку та її стек, за якими можуть пройти DevTools і логери",
        ],
      ],
      "d",
    ),
    question(
      "group-by",
      ["What does `Object.groupBy(people, (p) => p.team)` return?", "Що повертає `Object.groupBy(people, (p) => p.team)`?"],
      [
        ["A `Map` from teams to people", "`Map` від команд до людей"],
        [
          "An object whose keys are team names and whose values are arrays of people (with no prototype); `Map.groupBy` does the same into a `Map`, so keys can be any value, such as objects",
          "Об'єкт, ключі якого — назви команд, а значення — масиви людей (без прототипу); `Map.groupBy` робить те саме в `Map`, тож ключем може бути будь-яке значення, як-от об'єкт",
        ],
        ["The array sorted by team", "Масив, відсортований за командою"],
        ["The number of teams", "Кількість команд"],
      ],
      "b",
    ),
    question(
      "array-from-async",
      ["What does `await Array.fromAsync(asyncIterable)` do?", "Що робить `await Array.fromAsync(asyncIterable)`?"],
      [
        ["Runs all items in parallel", "Виконує всі елементи паралельно"],
        ["Converts an array into an async iterable", "Перетворює масив на асинхронний ітерований об'єкт"],
        [
          "Collects the values of an async iterable (or an iterable of promises) into an array, awaiting them one after another; for parallel requests, `Promise.all` is the right tool",
          "Збирає значення асинхронного ітерованого об'єкта (чи ітерованого об'єкта з промісами) у масив, чекаючи на них по черзі; для паралельних запитів правильний інструмент — `Promise.all`",
        ],
        ["Creates an empty array", "Створює порожній масив"],
      ],
      "c",
    ),
    question(
      "custom-iterable",
      ["How do you make objects of a `Range` class work with `for...of` and spread?", "Як зробити так, щоб об'єкти класу `Range` працювали з `for...of` і розгортанням?"],
      [
        [
          "Give it a `[Symbol.iterator]()` method that returns an iterator with `next()` returning `{ value, done }`; the easiest way is a generator method, `*[Symbol.iterator]() { for (...) yield n; }` (plain objects aren't iterable)",
          "Додати метод `[Symbol.iterator]()`, що повертає ітератор, у якого `next()` повертає `{ value, done }`; найпростіше — метод-генератор `*[Symbol.iterator]() { for (...) yield n; }` (звичайні об'єкти не ітеровані)",
        ],
        ["Add a `length` property", "Додати властивість `length`"],
        ["Extend `Array`", "Розширити `Array`"],
        ["Any object already works with `for...of`", "Будь-який об'єкт уже працює з `for...of`"],
      ],
      "a",
    ),
    question(
      "esm-vs-cjs",
      ["Which statements about ES modules compared with CommonJS are true?", "Які твердження про ES-модулі порівняно з CommonJS правильні?"],
      [
        ["ES module `import`/`export` are static, so bundlers can tree-shake unused exports", "`import`/`export` в ES-модулях статичні, тож бандлери можуть прибирати невикористані експорти"],
        ["ES module imports are live bindings: importers see later changes to an exported variable", "Імпорти ES-модулів — «живі» зв'язки: модулі, що імпортують, бачать пізніші зміни експортованої змінної"],
        ["ES modules run in strict mode and support top-level `await`; CommonJS `require` is synchronous and resolved at runtime", "ES-модулі виконуються в строгому режимі й підтримують `await` на верхньому рівні; `require` у CommonJS синхронний і розв'язується під час виконання"],
        ["CommonJS is the standard module system in browsers", "CommonJS — стандартна система модулів у браузерах"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "tagged-templates",
      ["What happens with `` html`<p>${name}</p>` ``?", "Що відбувається з `` html`<p>${name}</p>` ``?"],
      [
        ["The browser parses it as HTML automatically", "Браузер автоматично розбирає це як HTML"],
        ["It is a syntax error", "Це синтаксична помилка"],
        ["`html` is ignored, and it's a normal template literal", "`html` ігнорується, і це звичайний шаблонний рядок"],
        [
          "The `html` function is called with the array of static string parts and the interpolated values as separate arguments, so it can escape the values, which is how safe HTML helpers, `gql` and styled-components work",
          "Функція `html` викликається з масивом статичних частин рядка й підставленими значеннями як окремими аргументами, тож вона може екранувати значення; так працюють безпечні HTML-хелпери, `gql` і styled-components",
        ],
      ],
      "d",
    ),
    question(
      "bigint",
      ["Which statements about `BigInt` are true?", "Які твердження про `BigInt` правильні?"],
      [
        ["It represents integers beyond `Number.MAX_SAFE_INTEGER` (2^53 - 1) exactly, written like `9007199254740993n`", "Він точно представляє цілі числа, більші за `Number.MAX_SAFE_INTEGER` (2^53 - 1), і записується як `9007199254740993n`"],
        ["Mixing it with numbers, as in `1n + 1`, throws a TypeError, and `JSON.stringify` throws on it", "Змішування з числами, як-от `1n + 1`, кидає TypeError, і `JSON.stringify` теж кидає на ньому помилку"],
        ["Division truncates: `5n / 2n` is `2n`", "Ділення відкидає дробову частину: `5n / 2n` дорівнює `2n`"],
        ["It supports decimal fractions such as `1.5n`", "Він підтримує десяткові дроби на кшталт `1.5n`"],
      ],
      ["a", "b", "c"],
    ),
  ],
};
