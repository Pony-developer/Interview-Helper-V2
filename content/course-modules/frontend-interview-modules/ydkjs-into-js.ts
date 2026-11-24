import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–9 of "Into JavaScript": values, types and comparison. */
export const ydkjsValuesQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-values-quiz",
  title: { en: "Values, types and comparison", uk: "Значення, типи й порівняння" },
  questions: [
    question(
      "typeof-values",
      ["`let a = 42; a = 'hi';` What do `typeof a` and `typeof typeof 42` return?", "`let a = 42; a = 'hi';` Що повертають `typeof a` і `typeof typeof 42`?"],
      [
        ["`\"number\"` and `\"number\"`: a variable keeps the type of its first value", "`\"number\"` і `\"number\"`: змінна зберігає тип свого першого значення"],
        ["`string` and `number`, without quotes", "`string` і `number`, без лапок"],
        [
          "`\"string\"` and `\"string\"`: in JavaScript values have types, variables don't, so `typeof` reports the value currently held; and `typeof` always returns a string",
          "`\"string\"` і `\"string\"`: у JavaScript типи мають значення, а не змінні, тож `typeof` повідомляє тип значення, яке змінна містить зараз; а `typeof` завжди повертає рядок",
        ],
        ["A TypeError, because the type of `a` can't change", "TypeError, бо тип `a` не може змінитися"],
      ],
      "c",
    ),
    question(
      "functions-are-objects",
      [
        "`function foo() { return 42; } foo.bar = 'hi';` What do `typeof foo`, `typeof foo()`, `typeof foo.bar` and `typeof [1, 2]` return?",
        "`function foo() { return 42; } foo.bar = 'hi';` Що повертають `typeof foo`, `typeof foo()`, `typeof foo.bar` і `typeof [1, 2]`?",
      ],
      [
        [
          "`\"function\"`, `\"number\"`, `\"string\"`, `\"object\"`: functions and arrays are subtypes of object, so a function can hold properties, but only functions get their own `typeof` result",
          "`\"function\"`, `\"number\"`, `\"string\"`, `\"object\"`: функції й масиви — підтипи об'єкта, тож функція може мати властивості, але власний результат `typeof` мають лише функції",
        ],
        ["`\"object\"`, `\"number\"`, `\"undefined\"`, `\"array\"`: you can't add properties to a function", "`\"object\"`, `\"number\"`, `\"undefined\"`, `\"array\"`: функції не можна додати властивість"],
        ["`\"function\"`, `\"function\"`, `\"string\"`, `\"array\"`", "`\"function\"`, `\"function\"`, `\"string\"`, `\"array\"`"],
        ["A TypeError on `foo.bar = 'hi'`", "TypeError на `foo.bar = 'hi'`"],
      ],
      "a",
    ),
    question(
      "boxing",
      ["How can a primitive string call `'hello'.toUpperCase()`?", "Як примітивний рядок може викликати `'hello'.toUpperCase()`?"],
      [
        ["Strings are objects in JavaScript, not primitives", "Рядки в JavaScript — це об'єкти, а не примітиви"],
        ["The method is copied onto every string when it is created", "Метод копіюється в кожен рядок під час його створення"],
        ["It can't: you must write `new String('hello').toUpperCase()`", "Не може: треба писати `new String('hello').toUpperCase()`"],
        [
          "JavaScript temporarily \"boxes\" the primitive in its `String` wrapper object, whose prototype has the method; you should keep using primitives, since `new String()`, `new Number()` and `new Boolean()` create objects (`new Boolean(false)` is even truthy)",
          "JavaScript тимчасово «загортає» (boxing) примітив в об'єкт-обгортку `String`, у прототипі якого є метод; варто й далі користуватися примітивами, бо `new String()`, `new Number()` і `new Boolean()` створюють об'єкти (`new Boolean(false)` навіть truthy)",
        ],
      ],
      "d",
    ),
    question(
      "explicit-implicit",
      ["Which of these are explicit coercion, visible from the code itself?", "Що з цього — явне приведення типів, видиме з самого коду?"],
      [
        ["`Number('42')`", "`Number('42')`"],
        ["`'42' * 1`", "`'42' * 1`"],
        ["`String(42)`", "`String(42)`"],
        ["`Boolean(value)`", "`Boolean(value)`"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "array-string-equality",
      [
        "`const a = [1, 2, 3]; const b = [1, 2, 3]; const c = '1,2,3';` What do `a == c`, `b == c` and `a == b` return?",
        "`const a = [1, 2, 3]; const b = [1, 2, 3]; const c = '1,2,3';` Що повертають `a == c`, `b == c` і `a == b`?",
      ],
      [
        ["`false`, `false`, `true`", "`false`, `false`, `true`"],
        [
          "`true`, `true`, `false`: comparing an array with a string coerces the array to `'1,2,3'`, but two objects are compared by reference, with no coercion",
          "`true`, `true`, `false`: під час порівняння масиву з рядком масив приводиться до `'1,2,3'`, а два об'єкти порівнюються за посиланням, без приведення",
        ],
        ["`true`, `true`, `true`", "`true`, `true`, `true`"],
        ["A TypeError: arrays can't be compared with strings", "TypeError: масиви не можна порівнювати з рядками"],
      ],
      "b",
    ),
    question(
      "when-loose-equality",
      ["What does `==` actually do, and when is it risky?", "Що насправді робить `==` і коли він ризикований?"],
      [
        ["`==` compares only values and `===` compares values and types, so `==` never converts anything", "`==` порівнює лише значення, а `===` — значення й типи, тож `==` нічого не перетворює"],
        ["`==` is always wrong and must never be used", "`==` завжди помилковий, і його ніколи не можна використовувати"],
        [
          "`==` allows coercion and `===` doesn't (in `'42' == 42` the string becomes a number); `==` is risky when either side could be `true`/`false`, `0`, `''` or `[]`, so use `===` unless you're sure what values can arrive",
          "`==` дозволяє приведення типів, а `===` — ні (у `'42' == 42` рядок стає числом); `==` ризикований, коли з будь-якого боку може бути `true`/`false`, `0`, `''` чи `[]`, тож використовуйте `===`, якщо не впевнені, які значення можуть прийти",
        ],
        ["`==` converts both sides to strings", "`==` перетворює обидва боки на рядки"],
      ],
      "c",
    ),
    question(
      "relational-strings",
      ["What do `41 < '42'`, `'42' < '43'` and `'10' < '9'` return?", "Що повертають `41 < '42'`, `'42' < '43'` і `'10' < '9'`?"],
      [
        ["`true`, `true`, `false`", "`true`, `true`, `false`"],
        ["A TypeError for mixed types", "TypeError для змішаних типів"],
        ["`false`, `true`, `false`", "`false`, `true`, `false`"],
        [
          "`true`, `true`, `true`: if one side isn't a string both become numbers, but two strings are compared character by character like in a dictionary, and `'1'` comes before `'9'`; there is no \"strict\" form of `<`",
          "`true`, `true`, `true`: якщо один бік не рядок, обидва стають числами, а два рядки порівнюються посимвольно, як у словнику, і `'1'` іде раніше за `'9'`; «строгої» форми `<` не існує",
        ],
      ],
      "d",
    ),
    question(
      "nan-comparisons",
      ["What do `42 < 'foo'`, `42 > 'foo'` and `42 == 'foo'` return?", "Що повертають `42 < 'foo'`, `42 > 'foo'` і `42 == 'foo'`?"],
      [
        [
          "`false`, `false`, `false`: `'foo'` becomes `NaN`, and `NaN` is neither less than, greater than nor equal to anything",
          "`false`, `false`, `false`: `'foo'` стає `NaN`, а `NaN` не менший, не більший і не рівний нічому",
        ],
        ["`true`, `false`, `false`: numbers are always less than strings", "`true`, `false`, `false`: числа завжди менші за рядки"],
        ["`false`, `true`, `false`: strings are compared by length", "`false`, `true`, `false`: рядки порівнюються за довжиною"],
        ["A TypeError", "TypeError"],
      ],
      "a",
    ),
    question(
      "identifiers",
      ["Which of these are valid?", "Що з цього правильне?"],
      [
        ["`const $el = 1; const _id = 2;`", "`const $el = 1; const _id = 2;`"],
        ["`const 2fast = 1;`", "`const 2fast = 1;`"],
        ["`obj.if = 1; obj.null = 2;`: reserved words are allowed as property names", "`obj.if = 1; obj.null = 2;`: зарезервовані слова можна використовувати як назви властивостей"],
        ["`const settings = { class: 'big', for: 'email' };`", "`const settings = { class: 'big', for: 'email' };`"],
      ],
      ["a", "c", "d"],
    ),
  ],
};

/** Questions 10–17 of "Into JavaScript": functions, `this`, prototypes, old and new code. */
export const ydkjsFunctionsQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-functions-quiz",
  title: { en: "Functions, this and beyond", uk: "Функції, this і не лише" },
  questions: [
    question(
      "switch-fallthrough",
      [
        "What does this print for `a = 2`?\n\n```js\nswitch (a) {\n  case 2:\n  case 10:\n    console.log('small');\n  case 42:\n    console.log('answer');\n    break;\n  default:\n    console.log('other');\n}\n```",
        "Що виведе цей код для `a = 2`?\n\n```js\nswitch (a) {\n  case 2:\n  case 10:\n    console.log('small');\n  case 42:\n    console.log('answer');\n    break;\n  default:\n    console.log('other');\n}\n```",
      ],
      [
        ["Only `small`", "Лише `small`"],
        [
          "`small`, then `answer`: without `break`, execution falls through into the next case; empty `case 2:` deliberately shares the code of `case 10:`. `switch` compares with `===`, so `'2'` wouldn't match",
          "`small`, потім `answer`: без `break` виконання «провалюється» в наступний case; порожній `case 2:` навмисно використовує код `case 10:`. `switch` порівнює через `===`, тож `'2'` не збіглося б",
        ],
        ["`small`, `answer`, `other`", "`small`, `answer`, `other`"],
        ["Nothing: `case 2:` has no code", "Нічого: у `case 2:` немає коду"],
      ],
      "b",
    ),
    question(
      "named-function-expression",
      ["`const x = function bar() { return typeof bar; };` What do `x()` and `typeof bar` (outside) return?", "`const x = function bar() { return typeof bar; };` Що повертають `x()` і `typeof bar` (ззовні)?"],
      [
        ["`\"undefined\"` and `\"function\"`", "`\"undefined\"` і `\"function\"`"],
        ["A SyntaxError: a function expression can't have a name", "SyntaxError: функціональний вираз не може мати назву"],
        ["`\"function\"` and `\"function\"`", "`\"function\"` і `\"function\"`"],
        [
          "`\"function\"` and `\"undefined\"`: the name of a function expression exists only inside the function itself, where it helps with recursion and readable stack traces, so named expressions are often preferred to anonymous ones",
          "`\"function\"` і `\"undefined\"`: назва функціонального виразу існує лише всередині самої функції, де вона допомагає з рекурсією й зрозумілими stack trace, тож іменовані вирази часто кращі за анонімні",
        ],
      ],
      "d",
    ),
    question(
      "iife",
      ["Which statements about `(function IIFE() { … })();` are true?", "Які твердження про `(function IIFE() { … })();` правильні?"],
      [
        ["The outer parentheses make it an expression rather than a function declaration, and the final `()` calls it right away", "Зовнішні дужки роблять це виразом, а не оголошенням функції, а фінальні `()` одразу його викликають"],
        ["Variables declared inside don't leak into the surrounding scope", "Змінні, оголошені всередині, не потрапляють у зовнішню область видимості"],
        ["It can return a value: `const x = (function () { return 42; })();` sets `x` to `42`", "Вона може повертати значення: `const x = (function () { return 42; })();` присвоює `x` значення `42`"],
        ["It runs every time the variable it's assigned to is read", "Вона виконується щоразу, коли читають змінну, якій її присвоєно"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "this-four-rules",
      [
        "In a classic (non-module, non-strict) script:\n\n```js\nfunction foo() { console.log(this.bar); }\nvar bar = 'global';\nconst obj1 = { bar: 'obj1', foo };\nconst obj2 = { bar: 'obj2' };\n\nfoo();\nobj1.foo();\nfoo.call(obj2);\nnew foo();\n```\n\nWhat is printed?",
        "У класичному (не модульному, не строгому) скрипті:\n\n```js\nfunction foo() { console.log(this.bar); }\nvar bar = 'global';\nconst obj1 = { bar: 'obj1', foo };\nconst obj2 = { bar: 'obj2' };\n\nfoo();\nobj1.foo();\nfoo.call(obj2);\nnew foo();\n```\n\nЩо буде виведено?",
      ],
      [
        [
          "`global`, `obj1`, `obj2`, `undefined`: `this` depends only on how the function is called — a plain call gets the global object (`undefined` in strict mode), a method call gets the object before the dot, `call`/`apply` set it explicitly, and `new` gives a brand-new empty object",
          "`global`, `obj1`, `obj2`, `undefined`: `this` залежить лише від того, як викликано функцію: звичайний виклик отримує глобальний об'єкт (`undefined` у строгому режимі), виклик методу — об'єкт перед крапкою, `call`/`apply` задають його явно, а `new` дає новий порожній об'єкт",
        ],
        ["`global` four times: `this` is fixed where the function is declared", "`global` чотири рази: `this` фіксується там, де оголошено функцію"],
        ["`undefined` four times: `this` refers to the function `foo` itself", "`undefined` чотири рази: `this` посилається на саму функцію `foo`"],
        ["`global`, `obj1`, `obj2`, `global`", "`global`, `obj1`, `obj2`, `global`"],
      ],
      "a",
    ),
    question(
      "object-create-delegation",
      [
        "`const foo = { a: 42 }; const bar = Object.create(foo); bar.b = 'hi';` What do `bar.a` and `Object.hasOwn(bar, 'a')` return?",
        "`const foo = { a: 42 }; const bar = Object.create(foo); bar.b = 'hi';` Що повертають `bar.a` і `Object.hasOwn(bar, 'a')`?",
      ],
      [
        ["`undefined` and `false`", "`undefined` і `false`"],
        ["`42` and `true`: `Object.create` copies the properties of `foo`", "`42` і `true`: `Object.create` копіює властивості `foo`"],
        [
          "`42` and `false`: `bar` doesn't have `a`, but it is linked to `foo` as its prototype, so the lookup falls back to `foo`; designing objects to delegate like this is called behavior delegation",
          "`42` і `false`: у `bar` немає `a`, але він пов'язаний із `foo` як із прототипом, тож пошук переходить до `foo`; проєктування об'єктів, що так делегують один одному, називають делегуванням поведінки",
        ],
        ["A TypeError: `Object.create` needs a class", "TypeError: `Object.create` потребує класу"],
      ],
      "c",
    ),
    question(
      "polyfill-vs-transpile",
      ["How does polyfilling differ from transpiling?", "Чим поліфіли відрізняються від транспіляції?"],
      [
        ["They are two names for the same thing", "Це дві назви одного й того самого"],
        ["Transpiling adds missing functions at runtime; polyfills rewrite syntax", "Транспіляція додає відсутні функції під час виконання, а поліфіли переписують синтаксис"],
        ["Both are only needed for Internet Explorer", "Обидва потрібні лише для Internet Explorer"],
        [
          "A polyfill adds a missing API in the old environment if it isn't there yet, such as `if (!Number.isNaN) Number.isNaN = (x) => x !== x;` (`NaN` is the only value not equal to itself); new syntax can't be polyfilled because old engines can't even parse it, so a transpiler such as Babel rewrites it into older code at build time",
          "Поліфіл додає відсутній API в старому середовищі, якщо його там ще немає, як-от `if (!Number.isNaN) Number.isNaN = (x) => x !== x;` (`NaN` — єдине значення, що не дорівнює собі); новий синтаксис поліфілом не додати, бо старі рушії навіть не можуть його розібрати, тож транспілятор на кшталт Babel переписує його на старіший код під час збирання",
        ],
      ],
      "d",
    ),
    question(
      "default-param-undefined",
      ["`function foo(a = 2) { return a; }` What do `foo()`, `foo(undefined)` and `foo(null)` return?", "`function foo(a = 2) { return a; }` Що повертають `foo()`, `foo(undefined)` і `foo(null)`?"],
      [
        ["`2`, `2`, `2`", "`2`, `2`, `2`"],
        [
          "`2`, `2`, `null`: the default applies only when the argument is `undefined`, whether omitted or passed explicitly; `null` is a real value",
          "`2`, `2`, `null`: значення за замовчуванням застосовується лише тоді, коли аргумент `undefined` — пропущений чи переданий явно; `null` — це справжнє значення",
        ],
        ["`2`, `undefined`, `null`", "`2`, `undefined`, `null`"],
        ["`undefined`, `undefined`, `null`", "`undefined`, `undefined`, `null`"],
      ],
      "b",
    ),
    question(
      "host-objects",
      ["Where do `document`, `alert()` and `console.log()` come from?", "Звідки беруться `document`, `alert()` і `console.log()`?"],
      [
        [
          "From the host environment (the browser, or Node.js for `console`), not from the JavaScript language: the ECMAScript spec doesn't define them, which is why `document` doesn't exist in Node.js",
          "Із середовища виконання (браузера чи Node.js для `console`), а не з мови JavaScript: специфікація ECMAScript їх не визначає, тому в Node.js немає `document`",
        ],
        ["They are built into the JavaScript language like `Array` and `Math`", "Вони вбудовані в мову JavaScript, як `Array` і `Math`"],
        ["From npm packages that browsers install automatically", "З npm-пакетів, які браузери встановлюють автоматично"],
        ["From the HTML spec's `<script>` tag only", "Лише з тегу `<script>` у специфікації HTML"],
      ],
      "a",
    ),
  ],
};

/** Questions 18–23: "Scope & Closures", chapter 1 "What is Scope?". */
export const ydkjsScopeQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-scope-quiz",
  title: { en: "What is scope?", uk: "Що таке область видимості?" },
  questions: [
    question(
      "compile-phases",
      ["Which order describes the classic compilation steps that a JS engine also goes through?", "Який порядок описує класичні кроки компіляції, які проходить і JS-рушій?"],
      [
        ["Code generation, then parsing, then tokenizing", "Генерація коду, потім парсинг, потім токенізація"],
        [
          "Tokenizing/lexing (`var a = 2;` becomes the tokens `var`, `a`, `=`, `2`, `;`), parsing those tokens into an abstract syntax tree (AST), then generating executable code from the AST; in JS this happens just before the code runs, not in a separate build step",
          "Токенізація/лексичний аналіз (`var a = 2;` стає токенами `var`, `a`, `=`, `2`, `;`), парсинг цих токенів у абстрактне синтаксичне дерево (AST), а потім генерація виконуваного коду з AST; у JS це відбувається безпосередньо перед виконанням коду, а не на окремому кроці збирання",
        ],
        ["JS is never compiled: each line is read and run one at a time", "JS ніколи не компілюється: кожен рядок читається й виконується по одному"],
        ["Minifying, bundling, then uploading to a CDN", "Мініфікація, збирання в бандл, потім завантаження на CDN"],
      ],
      "b",
    ),
    question(
      "var-two-steps",
      ["`var a = 1; var a; console.log(a);` What is printed, and why?", "`var a = 1; var a; console.log(a);` Що буде виведено і чому?"],
      [
        [
          "`1`: `var a = 1` is two steps — the compiler declares `a` in the scope before execution (and ignores a repeated `var a` in the same scope), then at runtime the engine looks `a` up and assigns `1` to it; the second `var a` assigns nothing",
          "`1`: `var a = 1` — це два кроки: компілятор оголошує `a` в області видимості до виконання (і ігнорує повторне `var a` у тій самій області), а під час виконання рушій знаходить `a` і присвоює їй `1`; друге `var a` нічого не присвоює",
        ],
        ["`undefined`: the second `var a` resets the variable", "`undefined`: друге `var a` скидає змінну"],
        ["A SyntaxError: a variable can't be declared twice", "SyntaxError: змінну не можна оголосити двічі"],
        ["A ReferenceError", "ReferenceError"],
      ],
      "a",
    ),
    question(
      "lhs-rhs",
      ["Which statements about LHS and RHS look-ups are true?", "Які твердження про LHS- і RHS-пошук правильні?"],
      [
        ["In `a = 2`, `a` is an LHS look-up: the engine needs the variable itself as the target of an assignment", "У `a = 2` для `a` виконується LHS-пошук: рушію потрібна сама змінна як ціль присвоєння"],
        ["In `console.log(a)`, `a` is an RHS look-up: the engine only needs its value", "У `console.log(a)` для `a` виконується RHS-пошук: рушію потрібне лише її значення"],
        ["Calling `foo(2)` assigns `2` to the parameter `a`, which is also an LHS look-up", "Виклик `foo(2)` присвоює `2` параметру `a`, і це теж LHS-пошук"],
        ["LHS and RHS describe only the literal left and right sides of the `=` character", "LHS і RHS описують лише буквально лівий і правий боки символу `=`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "count-lookups",
      [
        "How many LHS and RHS look-ups are there?\n\n```js\nfunction double(x) {\n  var y = x;\n  return x + y;\n}\nvar result = double(2);\n```",
        "Скільки тут LHS- і RHS-пошуків?\n\n```js\nfunction double(x) {\n  var y = x;\n  return x + y;\n}\nvar result = double(2);\n```",
      ],
      [
        ["1 LHS (`result = …`) and 2 RHS (`x`, `y`)", "1 LHS (`result = …`) і 2 RHS (`x`, `y`)"],
        ["2 LHS and 2 RHS", "2 LHS і 2 RHS"],
        [
          "3 LHS (`result = …`, the implicit `x = 2` when the argument is passed, `y = …`) and 4 RHS (`double` to call it, `x` in `y = x`, and `x` and `y` in `x + y`)",
          "3 LHS (`result = …`, неявне `x = 2` під час передавання аргументу, `y = …`) і 4 RHS (`double`, щоб її викликати, `x` у `y = x`, а також `x` і `y` у `x + y`)",
        ],
        ["0 LHS: function code has no assignments", "0 LHS: у коді функції немає присвоєнь"],
      ],
      "c",
    ),
    question(
      "failed-lookups",
      [
        "In a non-strict script, what does `function foo(a) { console.log(a + b); b = a; } foo(2);` do, and what changes if the two lines inside are swapped?",
        "Що робить у нестрогому скрипті `function foo(a) { console.log(a + b); b = a; } foo(2);` і що зміниться, якщо поміняти місцями два рядки всередині?",
      ],
      [
        ["It prints `NaN` both ways", "В обох випадках виводить `NaN`"],
        ["It prints `4` both ways", "В обох випадках виводить `4`"],
        ["Both versions create a global `b` silently", "Обидві версії мовчки створюють глобальну `b`"],
        [
          "As written it throws a ReferenceError: the RHS look-up for `b` reaches the global scope without finding it. Swapped, `b = a` is an LHS look-up that fails, so sloppy mode quietly creates a global `b` and it prints `4`; in strict mode that LHS failure would also throw a ReferenceError",
          "У поточному вигляді кидає ReferenceError: RHS-пошук `b` доходить до глобальної області й не знаходить її. Якщо поміняти рядки, `b = a` — це невдалий LHS-пошук, тож нестрогий режим мовчки створює глобальну `b` і виводить `4`; у строгому режимі ця невдача LHS теж кинула б ReferenceError",
        ],
      ],
      "d",
    ),
    question(
      "reference-vs-type-error",
      ["How does a ReferenceError differ from a TypeError?", "Чим ReferenceError відрізняється від TypeError?"],
      [
        ["They are interchangeable names for the same error", "Це взаємозамінні назви однієї помилки"],
        [
          "A ReferenceError means scope resolution failed: the variable wasn't found in any scope up to the global one. A TypeError means the variable was found, but you did something impossible with its value, such as calling a non-function or reading a property of `null` or `undefined`",
          "ReferenceError означає, що пошук в області видимості не вдався: змінну не знайдено в жодній області аж до глобальної. TypeError означає, що змінну знайдено, але з її значенням зроблено щось неможливе, як-от виклик не-функції чи читання властивості `null` або `undefined`",
        ],
        ["A ReferenceError comes from wrong types, a TypeError from typos in variable names", "ReferenceError виникає через неправильні типи, а TypeError — через друкарські помилки в назвах змінних"],
        ["A TypeError can only happen in TypeScript", "TypeError можливий лише в TypeScript"],
      ],
      "b",
    ),
  ],
};

/** Questions 24–29: "Scope & Closures", chapter 3 "Function vs. Block Scope". */
export const ydkjsBlockScopeQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-block-scope-quiz",
  title: { en: "Function vs. block scope", uk: "Функціональна й блокова область видимості" },
  questions: [
    question(
      "accidental-collision",
      [
        "What happens here?\n\n```js\nfunction foo() {\n  function bar(a) {\n    i = 3;\n    console.log(a + i);\n  }\n  for (var i = 0; i < 10; i++) {\n    bar(i * 2);\n  }\n}\nfoo();\n```",
        "Що тут відбувається?\n\n```js\nfunction foo() {\n  function bar(a) {\n    i = 3;\n    console.log(a + i);\n  }\n  for (var i = 0; i < 10; i++) {\n    bar(i * 2);\n  }\n}\nfoo();\n```",
      ],
      [
        ["It prints ten numbers and stops", "Виводить десять чисел і зупиняється"],
        ["A ReferenceError, because `i` isn't declared in `bar`", "ReferenceError, бо `i` не оголошено в `bar`"],
        ["`bar` gets its own `i`, so the loop isn't affected", "`bar` отримує власну `i`, тож цикл не страждає"],
        [
          "An infinite loop: `i = 3` in `bar` isn't declared, so it finds and overwrites the loop's `i` in `foo`, which never reaches 10; declaring `let i = 3` (or a different name) inside `bar` fixes it, and keeping helpers and their variables in the narrowest scope (least exposure) prevents such collisions",
          "Нескінченний цикл: `i = 3` у `bar` не оголошено, тож воно знаходить і перезаписує `i` циклу в `foo`, яка ніколи не досягає 10; оголошення `let i = 3` (чи іншої назви) усередині `bar` це виправляє, а тримання допоміжних функцій і змінних у найвужчій області видимості (принцип найменшої відкритості) запобігає таким колізіям",
        ],
      ],
      "d",
    ),
    question(
      "declaration-or-expression",
      ["Which of these are function expressions rather than function declarations?", "Що з цього — функціональні вирази, а не оголошення функцій?"],
      [
        ["`(function foo() { … })`", "`(function foo() { … })`"],
        ["`function foo() { … }` as its own statement", "`function foo() { … }` як окрема інструкція"],
        ["`const x = function foo() { … };`", "`const x = function foo() { … };`"],
        ["`setTimeout(function tick() { … }, 1000);`", "`setTimeout(function tick() { … }, 1000);`"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "iife-variants",
      ["Which statements about IIFE variations are true?", "Які твердження про різновиди IIFE правильні?"],
      [
        ["`(function () { … })()` and `(function () { … }())` behave the same; the choice is only style", "`(function () { … })()` і `(function () { … }())` поводяться однаково; вибір — лише питання стилю"],
        ["An IIFE can take arguments, such as `(function (global) { … })(window)`, to name outer values clearly", "IIFE може приймати аргументи, як-от `(function (global) { … })(window)`, щоб чітко називати зовнішні значення"],
        ["The UMD pattern passes the function to run as an argument to the IIFE, which then calls it", "Патерн UMD передає функцію, яку треба виконати, аргументом у IIFE, а та її викликає"],
        ["Only anonymous functions can be immediately invoked", "Одразу викликати можна лише анонімні функції"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "catch-scope",
      [
        "`try { undefined(); } catch (err) { console.log('caught'); } console.log(err);` What happens?",
        "`try { undefined(); } catch (err) { console.log('caught'); } console.log(err);` Що станеться?",
      ],
      [
        [
          "It prints `caught`, then throws a ReferenceError: the `err` parameter of `catch` has been block-scoped to the catch clause since ES3, long before `let` existed",
          "Виводить `caught`, а потім кидає ReferenceError: параметр `err` у `catch` має блокову область видимості в межах catch ще з ES3, задовго до появи `let`",
        ],
        ["It prints `caught`, then the TypeError object", "Виводить `caught`, а потім об'єкт TypeError"],
        ["It prints `caught`, then `undefined`", "Виводить `caught`, а потім `undefined`"],
        ["Nothing: `undefined()` stops the whole script", "Нічого: `undefined()` зупиняє весь скрипт"],
      ],
      "a",
    ),
    question(
      "explicit-block-gc",
      [
        "Why might you wrap `let bigData = load(); process(bigData);` in its own `{ … }` block before adding a click handler below it?",
        "Навіщо загортати `let bigData = load(); process(bigData);` в окремий блок `{ … }` перед тим, як нижче додати обробник кліку?",
      ],
      [
        ["Blocks run faster than plain statements", "Блоки виконуються швидше за звичайні інструкції"],
        ["It's required syntax for `let`", "Це обов'язковий синтаксис для `let`"],
        [
          "The block makes it clear that `bigData` is needed only there; a closure such as the click handler can keep its whole surrounding scope alive, so a block-scoped variable is easier for the engine to garbage-collect once the block ends",
          "Блок показує, що `bigData` потрібна лише там; замикання, як-от обробник кліку, може тримати живою всю навколишню область видимості, тож змінну з блоковою областю рушію легше прибрати збирачем сміття, щойно блок завершиться",
        ],
        ["It hides `bigData` from the debugger", "Це ховає `bigData` від налагоджувача"],
      ],
      "c",
    ),
    question(
      "let-refactor",
      [
        "Inside `if (ok) { let limit = 3; if (count > limit) { … } }` you move the inner `if` below the outer block. What happens, and what if `limit` were a `var`?",
        "Усередині `if (ok) { let limit = 3; if (count > limit) { … } }` ви переносите внутрішній `if` нижче зовнішнього блоку. Що станеться і що було б, якби `limit` був `var`?",
      ],
      [
        ["Both versions keep working", "Обидві версії працюють і далі"],
        [
          "With `let` the moved code throws a ReferenceError, because `limit` belongs only to the `if` block; with `var` it would still work, since `var` belongs to the whole function, so switching `var` to `let` needs care with code that relied on that",
          "З `let` перенесений код кине ReferenceError, бо `limit` належить лише блоку `if`; з `var` він і далі працював би, бо `var` належить усій функції, тож заміна `var` на `let` потребує уважності до коду, що на це покладався",
        ],
        ["Both throw a ReferenceError", "Обидві кидають ReferenceError"],
        ["With `let` it works; with `var` it throws", "З `let` працює, а з `var` кидає помилку"],
      ],
      "b",
    ),
  ],
};

/** Questions 30–35: "Scope & Closures", chapter 5 "Scope Closure". */
export const ydkjsClosureQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-closure-quiz",
  title: { en: "Scope closure", uk: "Замикання" },
  questions: [
    question(
      "observed-closure",
      [
        "Closure is a function remembering its lexical scope while it runs outside that scope. In which snippets is closure actually observed?",
        "Замикання — це коли функція пам'ятає свою лексичну область видимості, виконуючись поза нею. У яких фрагментах замикання справді спостерігається?",
      ],
      [
        ["`function wait(msg) { setTimeout(function timer() { console.log(msg); }, 1000); }`", "`function wait(msg) { setTimeout(function timer() { console.log(msg); }, 1000); }`"],
        ["`function foo() { const a = 2; return function bar() { return a; }; } foo()();`", "`function foo() { const a = 2; return function bar() { return a; }; } foo()();`"],
        ["`const a = 2; (function IIFE() { console.log(a); })();`", "`const a = 2; (function IIFE() { console.log(a); })();`"],
        ["`function setup(name) { button.addEventListener('click', () => console.log(name)); }`", "`function setup(name) { button.addEventListener('click', () => console.log(name)); }`"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "iife-loop",
      [
        "What does this print, and why?\n\n```js\nfor (var i = 1; i <= 3; i++) {\n  (function () {\n    setTimeout(function timer() { console.log(i); }, i * 100);\n  })();\n}\n```",
        "Що виведе цей код і чому?\n\n```js\nfor (var i = 1; i <= 3; i++) {\n  (function () {\n    setTimeout(function timer() { console.log(i); }, i * 100);\n  })();\n}\n```",
      ],
      [
        ["`1 2 3`: the IIFE gives each iteration its own scope", "`1 2 3`: IIFE дає кожній ітерації власну область видимості"],
        ["Nothing: the IIFE ends before the timers fire, so they are cancelled", "Нічого: IIFE завершується до спрацювання таймерів, тож їх скасовано"],
        [
          "`4 4 4`: each IIFE creates a scope, but it's empty, so every `timer` still reads the one shared `i`, which is 4 after the loop; it needs a per-iteration variable such as `var j = i;` inside, an `(function (j) { … })(i)` parameter, or simply `let i` in the loop head",
          "`4 4 4`: кожна IIFE створює область видимості, але порожню, тож кожен `timer` читає ту саму спільну `i`, яка після циклу дорівнює 4; потрібна змінна для кожної ітерації, як-от `var j = i;` усередині, параметр `(function (j) { … })(i)` або просто `let i` у заголовку циклу",
        ],
        ["`1 1 1`", "`1 1 1`"],
      ],
      "c",
    ),
    question(
      "module-requirements",
      ["What makes a function-based module, in the closure sense?", "Що робить функцію модулем у сенсі замикань?"],
      [
        ["Any object literal with methods, such as `const api = { log() {} }`", "Будь-який об'єктний літерал із методами, як-от `const api = { log() {} }`"],
        ["A function that returns an object with only data properties", "Функція, що повертає об'єкт лише з властивостями-даними"],
        ["Calling it with `new`", "Виклик із `new`"],
        [
          "An outer function that is actually called (each call makes a new instance, or an IIFE makes a single one), and a return value with at least one inner function that closes over the private scope; the returned object is the public API (the \"revealing module\"), and it can even be a single function, like jQuery's `$`",
          "Зовнішня функція, яку справді викликають (кожен виклик створює новий екземпляр, а IIFE — єдиний), і результат, що містить хоча б одну внутрішню функцію із замиканням на приватну область; повернений об'єкт — це публічний API («revealing module»), і це навіть може бути одна функція, як `$` у jQuery",
        ],
      ],
      "d",
    ),
    question(
      "public-api-reference",
      [
        "What do the two `identify()` calls print?\n\n```js\nconst foo = (function (id) {\n  function upper() { console.log(id.toUpperCase()); }\n  const api = {\n    identify() { console.log(id); },\n    change() { api.identify = upper; },\n  };\n  return api;\n})('foo module');\n\nfoo.identify();\nfoo.change();\nfoo.identify();\n```",
        "Що виведуть два виклики `identify()`?\n\n```js\nconst foo = (function (id) {\n  function upper() { console.log(id.toUpperCase()); }\n  const api = {\n    identify() { console.log(id); },\n    change() { api.identify = upper; },\n  };\n  return api;\n})('foo module');\n\nfoo.identify();\nfoo.change();\nfoo.identify();\n```",
      ],
      [
        [
          "`foo module`, then `FOO MODULE`: the module keeps a reference to its own public API object, so it can swap methods from the inside at runtime",
          "`foo module`, потім `FOO MODULE`: модуль тримає посилання на власний об'єкт публічного API, тож може замінювати методи зсередини під час виконання",
        ],
        ["`foo module` twice: a returned object can't be changed", "`foo module` двічі: повернений об'єкт не можна змінити"],
        ["A ReferenceError: `api` doesn't exist after the IIFE returns", "ReferenceError: `api` не існує після повернення з IIFE"],
        ["`FOO MODULE` twice", "`FOO MODULE` двічі"],
      ],
      "a",
    ),
    question(
      "module-manager",
      [
        "A tiny module loader has `define(name, deps, impl)` and `get(name)`. What does `define` essentially do?",
        "Крихітний завантажувач модулів має `define(name, deps, impl)` і `get(name)`. Що по суті робить `define`?",
      ],
      [
        ["Downloads `impl` from the network", "Завантажує `impl` з мережі"],
        [
          "Looks up the already defined dependency modules by name, calls the wrapper function `impl` with them as arguments (`impl.apply(impl, deps)`), and stores its return value, the module's public API, under `name`; there's no magic, just the module pattern",
          "Знаходить за назвою вже визначені модулі-залежності, викликає з ними як аргументами функцію-обгортку `impl` (`impl.apply(impl, deps)`) і зберігає її результат — публічний API модуля — під `name`; жодної магії, лише патерн Module",
        ],
        ["Copies the source of `impl` into a global variable", "Копіює вихідний код `impl` у глобальну змінну"],
        ["Turns `impl` into an ES module file", "Перетворює `impl` на файл ES-модуля"],
      ],
      "b",
    ),
    question(
      "static-esm-api",
      [
        "`import { helo } from './greet.js';` has a typo and `greet.js` only exports `hello`. When does it fail, compared with calling a missing method on a function-based module?",
        "`import { helo } from './greet.js';` містить друкарську помилку, а `greet.js` експортує лише `hello`. Коли це впаде порівняно з викликом відсутнього методу у модуля на функціях?",
      ],
      [
        ["Both fail only when the line runs", "Обидва падають лише тоді, коли виконується рядок"],
        ["The import quietly gives `undefined`", "Імпорт тихо дає `undefined`"],
        ["Neither fails", "Жоден не падає"],
        [
          "The ES module fails early with a SyntaxError while the module graph is linked, before any of its code runs, because ES module APIs are static; a function-based module's API is just an object that can change at runtime, so a missing method only throws a TypeError when it is called",
          "ES-модуль падає заздалегідь із SyntaxError під час зв'язування графа модулів, ще до виконання будь-якого його коду, бо API ES-модулів статичні; API модуля на функціях — це просто об'єкт, що може змінюватися під час виконання, тож відсутній метод кидає TypeError лише в момент виклику",
        ],
      ],
      "d",
    ),
  ],
};

/** Questions 36–37: "Scope & Closures", appendix A "Dynamic Scope". */
export const ydkjsDynamicScopeQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-dynamic-scope-quiz",
  title: { en: "Dynamic scope", uk: "Динамічна область видимості" },
  questions: [
    question(
      "lexical-vs-dynamic-output",
      [
        "What does this print in JavaScript, and what would a dynamically scoped language print?\n\n```js\nfunction foo() { console.log(a); }\nfunction bar() { var a = 3; foo(); }\nvar a = 2;\nbar();\n```",
        "Що виведе цей код у JavaScript і що вивела б мова з динамічною областю видимості?\n\n```js\nfunction foo() { console.log(a); }\nfunction bar() { var a = 3; foo(); }\nvar a = 2;\nbar();\n```",
      ],
      [
        ["`3` in both", "`3` в обох"],
        ["`2` in both", "`2` в обох"],
        [
          "`2` in JavaScript, because `foo` looks up `a` in the scopes around where it was written, reaching the global `a`; with dynamic scope it would print `3`, because the lookup would follow the call stack into `bar`, which called `foo`",
          "`2` у JavaScript, бо `foo` шукає `a` в областях видимості навколо місця, де її написано, і доходить до глобальної `a`; з динамічною областю вивело б `3`, бо пошук ішов би стеком викликів у `bar`, яка викликала `foo`",
        ],
        ["A ReferenceError in JavaScript, because `foo` has no `a`", "ReferenceError у JavaScript, бо в `foo` немає `a`"],
      ],
      "c",
    ),
    question(
      "this-like-dynamic-scope",
      ["Which pairing describes when each mechanism is decided?", "Яке поєднання описує, коли визначається кожен механізм?"],
      [
        [
          "Lexical scope is fixed at author time by where a function is declared; dynamic scope (which JS doesn't have) would follow where it is called from; `this` is decided at runtime by how a function is called, which makes it the part of JS closest to dynamic scope",
          "Лексична область видимості фіксується під час написання коду тим, де оголошено функцію; динамічна (якої в JS немає) залежала б від того, звідки функцію викликано; `this` визначається під час виконання тим, як функцію викликано, тож це найближча до динамічної області частина JS",
        ],
        ["All three are decided at author time", "Усі три визначаються під час написання коду"],
        ["`this` follows lexical scope in every function, like variables do", "`this` у кожній функції підпорядковується лексичній області видимості, як і змінні"],
        ["JavaScript uses dynamic scope for `var` and lexical scope for `let`", "JavaScript використовує динамічну область видимості для `var` і лексичну для `let`"],
      ],
      "a",
    ),
  ],
};

/** Questions 38–39: "Scope & Closures", appendix C "Lexical-this". */
export const ydkjsLexicalThisQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-lexical-this-quiz",
  title: { en: "Lexical this", uk: "Лексичний this" },
  questions: [
    question(
      "lost-this-timeout",
      [
        "In a classic (non-module) browser script, what do the two calls print?\n\n```js\nvar obj = {\n  id: 'awesome',\n  cool: function coolFn() { console.log(this.id); },\n};\nvar id = 'not awesome';\n\nobj.cool();\nsetTimeout(obj.cool, 100);\n```",
        "Що виведуть два виклики в класичному (не модульному) скрипті в браузері?\n\n```js\nvar obj = {\n  id: 'awesome',\n  cool: function coolFn() { console.log(this.id); },\n};\nvar id = 'not awesome';\n\nobj.cool();\nsetTimeout(obj.cool, 100);\n```",
      ],
      [
        ["`awesome` twice: a method always remembers its object", "`awesome` двічі: метод завжди пам'ятає свій об'єкт"],
        ["`awesome`, then a TypeError", "`awesome`, потім TypeError"],
        [
          "`awesome`, then `not awesome`: `setTimeout` receives just the function, not `obj`, so the later plain call gets the global object as `this`, and the global `var id` is found there",
          "`awesome`, потім `not awesome`: `setTimeout` отримує лише функцію, без `obj`, тож пізніший звичайний виклик отримує глобальний об'єкт як `this`, а там є глобальна `var id`",
        ],
        ["`not awesome` twice", "`not awesome` двічі"],
      ],
      "c",
    ),
    question(
      "self-arrow-bind",
      [
        "A method starts `setTimeout(function timer() { this.count++; }, 100)`. Which statements about the usual fixes are true?",
        "Метод запускає `setTimeout(function timer() { this.count++; }, 100)`. Які твердження про звичні способи це виправити правильні?",
      ],
      [
        ["`const self = this;` with `self.count++` sidesteps `this`: `self` is a normal variable reached through lexical scope and closure", "`const self = this;` із `self.count++` оминає `this`: `self` — звичайна змінна, доступна через лексичну область видимості й замикання"],
        ["An arrow function `() => { this.count++; }` uses the `this` of the enclosing method (\"lexical this\")", "Стрілкова функція `() => { this.count++; }` використовує `this` зовнішнього методу («лексичний this»)"],
        ["`function timer() { this.count++; }.bind(this)` keeps a named regular function and fixes its `this` explicitly", "`function timer() { this.count++; }.bind(this)` зберігає іменовану звичайну функцію й явно фіксує її `this`"],
        ["`const self = this;` changes how `this` is bound inside `timer`", "`const self = this;` змінює, як `this` прив'язується всередині `timer`"],
      ],
      ["a", "b", "c"],
    ),
  ],
};

/** Questions 40–47: "this & Object Prototypes", chapter 2 "this All Makes Sense Now!". */
export const ydkjsThisBindingQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-this-binding-quiz",
  title: { en: "this binding in depth", uk: "Прив'язка this докладно" },
  questions: [
    question(
      "strict-body-not-callsite",
      [
        "In a classic script, what does this print?\n\n```js\nfunction foo() { console.log(this.a); }\nvar a = 2;\n\n(function () {\n  'use strict';\n  foo();\n})();\n```",
        "Що виведе цей код у класичному скрипті?\n\n```js\nfunction foo() { console.log(this.a); }\nvar a = 2;\n\n(function () {\n  'use strict';\n  foo();\n})();\n```",
      ],
      [
        ["A TypeError, because the call happens in strict mode", "TypeError, бо виклик відбувається в строгому режимі"],
        ["`undefined`", "`undefined`"],
        [
          "`2`: for the default binding, what matters is whether the body of `foo` is strict, not the code that calls it; `foo` isn't strict, so `this` is the global object, where `var a` lives",
          "`2`: для прив'язки за замовчуванням важить, чи строге тіло `foo`, а не код, що її викликає; `foo` не строга, тож `this` — глобальний об'єкт, де живе `var a`",
        ],
        ["A ReferenceError", "ReferenceError"],
      ],
      "c",
    ),
    question(
      "implicit-chain",
      [
        "`const obj2 = { a: 42, foo }; const obj1 = { a: 2, obj2 };` where `foo` logs `this.a`. What does `obj1.obj2.foo()` print?",
        "`const obj2 = { a: 42, foo }; const obj1 = { a: 2, obj2 };`, де `foo` виводить `this.a`. Що виведе `obj1.obj2.foo()`?",
      ],
      [
        ["`2`: the first object in the chain wins", "`2`: перемагає перший об'єкт у ланцюжку"],
        [
          "`42`: for implicit binding only the last object before the function, the one directly in front of `.foo()`, becomes `this`",
          "`42`: для неявної прив'язки `this` стає лише останній об'єкт перед функцією, той, що стоїть просто перед `.foo()`",
        ],
        ["`undefined`: nested objects lose `this`", "`undefined`: вкладені об'єкти втрачають `this`"],
        ["A TypeError", "TypeError"],
      ],
      "b",
    ),
    question(
      "new-overrides-bind",
      [
        "What do the logs print?\n\n```js\nfunction foo(x) { this.a = x; }\nconst obj1 = {};\nconst bar = foo.bind(obj1);\nbar(2);\nconst baz = new bar(3);\nconsole.log(obj1.a, baz.a);\n```",
        "Що виведе цей код?\n\n```js\nfunction foo(x) { this.a = x; }\nconst obj1 = {};\nconst bar = foo.bind(obj1);\nbar(2);\nconst baz = new bar(3);\nconsole.log(obj1.a, baz.a);\n```",
      ],
      [
        ["`3 undefined`: a bound function always writes to `obj1`", "`3 undefined`: прив'язана функція завжди пише в `obj1`"],
        ["A TypeError: bound functions can't be used with `new`", "TypeError: прив'язані функції не можна використовувати з `new`"],
        ["`2 2`", "`2 2`"],
        [
          "`2 3`: `new` outranks even a hard binding, so `new bar(3)` ignores `obj1` and sets `a` on the brand-new object; that's what lets `foo.bind(null, 'p1')` act as a constructor with a preset first argument",
          "`2 3`: `new` сильніший навіть за жорстку прив'язку, тож `new bar(3)` ігнорує `obj1` і записує `a` в новий об'єкт; саме тому `foo.bind(null, 'p1')` може працювати як конструктор із наперед заданим першим аргументом",
        ],
      ],
      "d",
    ),
    question(
      "bind-facts",
      ["Which statements about `const bar = foo.bind(obj, 1)` are true?", "Які твердження про `const bar = foo.bind(obj, 1)` правильні?"],
      [
        ["`bar` is a new function; `foo` isn't called yet", "`bar` — нова функція; `foo` ще не викликано"],
        ["Arguments after `obj` are preset (partial application), so `bar(2)` calls `foo` with `1, 2`", "Аргументи після `obj` задаються наперед (часткове застосування), тож `bar(2)` викликає `foo` з `1, 2`"],
        ["`bar.name` is `\"bound foo\"`, which shows up in stack traces", "`bar.name` дорівнює `\"bound foo\"`, і це видно в stack trace"],
        ["`bar.call(other)` changes `this` to `other`", "`bar.call(other)` змінює `this` на `other`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "null-this",
      [
        "Why is `fn.apply(null, args)` or `fn.bind(null, x)` risky when you don't control `fn`, and what is safer?",
        "Чому `fn.apply(null, args)` чи `fn.bind(null, x)` ризиковані, коли ви не контролюєте `fn`, і що безпечніше?",
      ],
      [
        [
          "If `fn` isn't strict, a `null` or `undefined` `this` is replaced by the global object, so any `this.x = …` inside it can silently change globals; prefer spread (`fn(...args)`) when `this` doesn't matter, or pass an empty placeholder such as `Object.create(null)`",
          "Якщо `fn` не строга, `this` зі значенням `null` чи `undefined` замінюється глобальним об'єктом, тож будь-яке `this.x = …` усередині може непомітно змінити глобальні змінні; коли `this` неважливий, краще spread (`fn(...args)`) або порожній об'єкт-заглушка на кшталт `Object.create(null)`",
        ],
        ["`null` makes `fn` throw immediately", "`null` змушує `fn` одразу кинути помилку"],
        ["It's always safe: `null` means \"no `this`\" everywhere", "Це завжди безпечно: `null` усюди означає «без `this`»"],
        ["`apply` doesn't accept `null`", "`apply` не приймає `null`"],
      ],
      "a",
    ),
    question(
      "indirect-reference",
      [
        "In a classic script, what does `(p.foo = o.foo)()` print?\n\n```js\nfunction foo() { console.log(this.a); }\nvar a = 2;\nvar o = { a: 3, foo };\nvar p = { a: 4 };\no.foo();\n(p.foo = o.foo)();\n```",
        "Що виведе `(p.foo = o.foo)()` у класичному скрипті?\n\n```js\nfunction foo() { console.log(this.a); }\nvar a = 2;\nvar o = { a: 3, foo };\nvar p = { a: 4 };\no.foo();\n(p.foo = o.foo)();\n```",
      ],
      [
        ["`4`: the function is now on `p`", "`4`: функція тепер на `p`"],
        ["`3`: it still belongs to `o`", "`3`: вона досі належить `o`"],
        [
          "`2`: the value of an assignment expression is just the function itself, so the call has no context object and gets the default binding (the global object here)",
          "`2`: значенням виразу присвоєння є просто сама функція, тож виклик не має об'єкта-контексту й отримує прив'язку за замовчуванням (тут глобальний об'єкт)",
        ],
        ["A SyntaxError", "SyntaxError"],
      ],
      "c",
    ),
    question(
      "soft-bind",
      ["What would a \"soft binding\" helper `foo.softBind(obj)` do differently from `bind`?", "Що робив би допоміжний метод «м'якої прив'язки» `foo.softBind(obj)` інакше, ніж `bind`?"],
      [
        ["Nothing: it is the built-in name for `bind`", "Нічого: це вбудована назва `bind`"],
        ["It makes `this` impossible to change, even with `new`", "Він унеможливлює зміну `this`, навіть через `new`"],
        ["It binds `this` only for the first call", "Він прив'язує `this` лише для першого виклику"],
        [
          "It uses `obj` only when `this` would otherwise fall back to the global object or `undefined`, so `obj2.foo()` or `.call(obj3)` still work, unlike a hard `bind`; it isn't built into JavaScript, you'd write it yourself",
          "Він використовує `obj` лише тоді, коли `this` інакше став би глобальним об'єктом чи `undefined`, тож `obj2.foo()` чи `.call(obj3)` і далі працюють, на відміну від жорсткого `bind`; у JavaScript його немає, його пишуть самостійно",
        ],
      ],
      "d",
    ),
    question(
      "boxed-this",
      [
        "`function f() { return typeof this; }` What does `f.call(5)` return in sloppy mode, and in strict mode?",
        "`function f() { return typeof this; }` Що повертає `f.call(5)` у нестрогому режимі, а що в строгому?",
      ],
      [
        [
          "`\"object\"` in sloppy mode, because a primitive `this` is boxed into a `Number` object; `\"number\"` in strict mode, where `this` is passed as is",
          "`\"object\"` у нестрогому режимі, бо примітивний `this` загортається в об'єкт `Number`; `\"number\"` у строгому режимі, де `this` передається як є",
        ],
        ["`\"number\"` in both", "`\"number\"` в обох"],
        ["`\"undefined\"` in both: primitives can't be `this`", "`\"undefined\"` в обох: примітиви не можуть бути `this`"],
        ["`\"object\"` in both", "`\"object\"` в обох"],
      ],
      "a",
    ),
  ],
};

/** Questions 48–52: "this & Object Prototypes", chapter 4 "Mixing (Up) Class Objects". */
export const ydkjsMixinsQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-mixins-quiz",
  title: { en: "Classes and mixins", uk: "Класи й міксини" },
  questions: [
    question(
      "polymorphic-resolution",
      [
        "What does `new Boat().pilot()` print?\n\n```js\nclass Vehicle {\n  ignition() { console.log('one engine'); }\n  drive() { this.ignition(); }\n}\nclass Boat extends Vehicle {\n  ignition() { console.log('two engines'); }\n  pilot() { super.drive(); }\n}\nnew Boat().pilot();\n```",
        "Що виведе `new Boat().pilot()`?\n\n```js\nclass Vehicle {\n  ignition() { console.log('one engine'); }\n  drive() { this.ignition(); }\n}\nclass Boat extends Vehicle {\n  ignition() { console.log('two engines'); }\n  pilot() { super.drive(); }\n}\nnew Boat().pilot();\n```",
      ],
      [
        ["`one engine`: `super.drive()` runs entirely in the parent", "`one engine`: `super.drive()` виконується повністю в батьківському класі"],
        [
          "`two engines`: `super.drive()` is a relative reference one level up, but inside it `this.ignition()` is looked up on the instance, so the most specific override wins (polymorphism)",
          "`two engines`: `super.drive()` — відносне посилання на рівень вище, але всередині `this.ignition()` шукається на екземплярі, тож перемагає найконкретніше перевизначення (поліморфізм)",
        ],
        ["Both lines, parent first", "Обидва рядки, спершу батьківський"],
        ["A TypeError: `drive` isn't defined on `Boat`", "TypeError: `drive` не визначено в `Boat`"],
      ],
      "b",
    ),
    question(
      "mixin-shared-references",
      [
        "`function mixin(src, target) { for (const k in src) if (!(k in target)) target[k] = src[k]; return target; }`. After `const Car = mixin(Vehicle, { wheels: 4 }); Car.parts.push('wheel');`, where `Vehicle.parts` was `[]`, what is `Vehicle.parts`?",
        "`function mixin(src, target) { for (const k in src) if (!(k in target)) target[k] = src[k]; return target; }`. Після `const Car = mixin(Vehicle, { wheels: 4 }); Car.parts.push('wheel');`, де `Vehicle.parts` був `[]`, чому дорівнює `Vehicle.parts`?",
      ],
      [
        ["`[]`: the mixin made `Car` an independent copy", "`[]`: міксин зробив `Car` незалежною копією"],
        ["A TypeError: `Car` has no `parts`", "TypeError: у `Car` немає `parts`"],
        ["`undefined`", "`undefined`"],
        [
          "`['wheel']`: a mixin copies property values, so objects, arrays and functions are shared by reference, unlike the full copy a class-based language makes when it instantiates or inherits",
          "`['wheel']`: міксин копіює значення властивостей, тож об'єкти, масиви й функції спільні за посиланням, на відміну від повної копії, яку робить мова з класами під час створення екземпляра чи успадкування",
        ],
      ],
      "d",
    ),
    question(
      "pseudo-polymorphism",
      [
        "Why do mixin-based objects write `Vehicle.drive.call(this)` inside `Car.drive`, and what is the downside?",
        "Чому об'єкти на міксинах пишуть `Vehicle.drive.call(this)` усередині `Car.drive` і в чому мінус?",
      ],
      [
        [
          "`Car.drive` shadows `Vehicle.drive`, so the parent's version has to be named absolutely, and `.call(this)` runs it with `Car` as `this` instead of `Vehicle`; this \"explicit pseudo-polymorphism\" hard-codes the parent in every such method, which is brittle (ES6 `super` gives a relative reference instead)",
          "`Car.drive` затінює `Vehicle.drive`, тож батьківську версію треба називати абсолютно, а `.call(this)` виконує її з `Car` як `this` замість `Vehicle`; такий «явний псевдополіморфізм» жорстко прописує батька в кожному такому методі, що крихко (ES6 `super` дає відносне посилання)",
        ],
        ["`.call(this)` makes the call faster", "`.call(this)` пришвидшує виклик"],
        ["Without `.call`, `Vehicle.drive` would throw a SyntaxError", "Без `.call` виклик `Vehicle.drive` кинув би SyntaxError"],
        ["It copies `Vehicle` into `Car` on every call", "Він копіює `Vehicle` у `Car` під час кожного виклику"],
      ],
      "a",
    ),
    question(
      "parasitic-inheritance",
      [
        "In \"parasitic inheritance\", `function Car() { const car = new Vehicle(); car.wheels = 4; return car; }`. What are `new Car() instanceof Car` and `new Car() instanceof Vehicle`?",
        "У «паразитичному успадкуванні» `function Car() { const car = new Vehicle(); car.wheels = 4; return car; }`. Чому дорівнюють `new Car() instanceof Car` і `new Car() instanceof Vehicle`?",
      ],
      [
        ["`true` and `true`", "`true` і `true`"],
        ["`true` and `false`", "`true` і `false`"],
        [
          "`false` and `true`: when a function called with `new` returns its own object, that object replaces the one `new` created, so the new object is thrown away and `Car()` could just as well be called without `new`",
          "`false` і `true`: коли функція, викликана з `new`, повертає власний об'єкт, він замінює той, що створив `new`, тож новий об'єкт викидається, і `Car()` можна було б викликати й без `new`",
        ],
        ["A TypeError: constructors can't return objects", "TypeError: конструктори не можуть повертати об'єкти"],
      ],
      "c",
    ),
    question(
      "mixin-collisions",
      ["Which statements about faking multiple inheritance with mixins are true?", "Які твердження про імітацію множинного успадкування міксинами правильні?"],
      [
        ["Mixing several sources that define the same method gives no built-in way to resolve the clash: with `Object.assign` the last source silently wins", "Якщо кілька джерел визначають той самий метод, вбудованого способу розв'язати конфлікт немає: з `Object.assign` мовчки перемагає останнє джерело"],
        ["The \"diamond problem\" is when D inherits from B and C, which both override a method from A, so it's unclear which version D should use", "«Проблема ромба» — це коли D успадковує від B і C, які обидва перевизначають метод з A, і незрозуміло, яку версію має використати D"],
        ["JavaScript resolves mixin conflicts automatically by method order in the prototype chain", "JavaScript автоматично розв'язує конфлікти міксинів за порядком методів у ланцюжку прототипів"],
        ["If mixins make code harder to trace, composition or plain delegation is usually the simpler choice", "Якщо міксини ускладнюють відстеження коду, простішим вибором зазвичай є композиція чи звичайне делегування"],
      ],
      ["a", "b", "d"],
    ),
  ],
};

/** Questions 53–59: "this & Object Prototypes", chapter 6 "Behavior Delegation". */
export const ydkjsDelegationQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-delegation-quiz",
  title: { en: "Behavior delegation", uk: "Делегування поведінки" },
  questions: [
    question(
      "delegated-this",
      [
        "What do `Task.id` and `XYZ.id` hold after this runs?\n\n```js\nconst Task = {\n  setID(id) { this.id = id; },\n};\nconst XYZ = Object.create(Task);\nXYZ.prepare = function (id) { this.setID(id); };\nXYZ.prepare(7);\n```",
        "Що містять `Task.id` і `XYZ.id` після виконання?\n\n```js\nconst Task = {\n  setID(id) { this.id = id; },\n};\nconst XYZ = Object.create(Task);\nXYZ.prepare = function (id) { this.setID(id); };\nXYZ.prepare(7);\n```",
      ],
      [
        ["`7` and `7`: they share the property", "`7` і `7`: вони мають спільну властивість"],
        ["`7` and `undefined`: the method lives on `Task`, so it writes there", "`7` і `undefined`: метод живе на `Task`, тож пише туди"],
        ["A TypeError: `XYZ` has no `setID`", "TypeError: у `XYZ` немає `setID`"],
        [
          "`undefined` and `7`: `setID` is found on `Task` through delegation, but it is called as `this.setID()`, so `this` is `XYZ` and the state lands on the delegating object, which is where OLOO wants state to live",
          "`undefined` і `7`: `setID` знаходиться на `Task` через делегування, але викликається як `this.setID()`, тож `this` — це `XYZ`, і стан опиняється на об'єкті, що делегує, а саме там OLOO і хоче тримати стан",
        ],
      ],
      "d",
    ),
    question(
      "oloo-design",
      ["Which are design guidelines of behavior delegation (OLOO)?", "Які з цього — принципи проєктування з делегуванням поведінки (OLOO)?"],
      [
        ["Keep state on the delegating objects, not on the shared delegate", "Тримати стан на об'єктах, що делегують, а не на спільному делегаті"],
        ["Avoid giving methods the same name at different levels of the chain; prefer specific names like `insert` and `build` over overriding `render`", "Уникати однакових назв методів на різних рівнях ланцюжка; надавати перевагу конкретним назвам на кшталт `insert` і `build` замість перевизначення `render`"],
        ["Treat objects as peers that delegate to each other, not as parents and children", "Розглядати об'єкти як рівноправних, що делегують один одному, а не як батьків і дітей"],
        ["Always add a base \"parent\" object plus composition, as in class design", "Завжди додавати базовий «батьківський» об'єкт і композицію, як у дизайні з класами"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "cyclic-delegation",
      [
        "`const A = {}; const B = Object.create(A); Object.setPrototypeOf(A, B);` What happens?",
        "`const A = {}; const B = Object.create(A); Object.setPrototypeOf(A, B);` Що станеться?",
      ],
      [
        ["A and B now delegate to each other", "A і B тепер делегують одне одному"],
        [
          "A TypeError (\"Cyclic __proto__ value\"): mutual delegation is forbidden, because a missing property would loop forever, and engines reject the cycle once when it's set instead of guarding every lookup",
          "TypeError («Cyclic __proto__ value»): взаємне делегування заборонене, бо пошук відсутньої властивості зациклився б, і рушії відхиляють цикл один раз під час встановлення, а не перевіряють кожен пошук",
        ],
        ["Nothing: the call is ignored", "Нічого: виклик ігнорується"],
        ["The page freezes in an infinite loop right away", "Сторінка одразу зависає в нескінченному циклі"],
      ],
      "b",
    ),
    question(
      "create-then-init",
      [
        "OLOO creates objects in two steps: `const btn = Object.create(Button); btn.setup(125, 30, 'Hello');`. What is the advantage over `new Button(125, 30, 'Hello')`?",
        "OLOO створює об'єкти у два кроки: `const btn = Object.create(Button); btn.setup(125, 30, 'Hello');`. У чому перевага над `new Button(125, 30, 'Hello')`?",
      ],
      [
        [
          "Creation and initialization are separate, so objects can be created early (for example in a pool) and set up later, where they are actually used, without any constructor, `.prototype` or `new`",
          "Створення й ініціалізація розділені, тож об'єкти можна створити заздалегідь (наприклад, у пулі), а налаштувати пізніше, там, де вони справді потрібні, без жодного конструктора, `.prototype` чи `new`",
        ],
        ["It's always faster to run", "Він завжди швидше виконується"],
        ["It makes the object immutable", "Він робить об'єкт незмінним"],
        ["There is none: it's just more code", "Її немає: це просто більше коду"],
      ],
      "a",
    ),
    question(
      "concise-method-recursion",
      [
        "`const Foo = { bar(x) { return x < 10 ? bar(x * 2) : x; } };` What does `Foo.bar(3)` do?",
        "`const Foo = { bar(x) { return x < 10 ? bar(x * 2) : x; } };` Що робить `Foo.bar(3)`?",
      ],
      [
        ["Returns `12`", "Повертає `12`"],
        ["Returns `3`", "Повертає `3`"],
        [
          "Throws a ReferenceError: a concise method gets a `.name` for stack traces, but no lexical name binding inside itself, so `bar` isn't defined there; use `Foo.bar(…)`, `this.bar(…)`, or a named function expression `bar: function bar(x) { … }`",
          "Кидає ReferenceError: скорочений метод отримує `.name` для stack trace, але не має лексичного зв'язування своєї назви всередині, тож `bar` там не визначено; використовуйте `Foo.bar(…)`, `this.bar(…)` чи іменований функціональний вираз `bar: function bar(x) { … }`",
        ],
        ["Loops forever", "Нескінченно зациклюється"],
      ],
      "c",
    ),
    question(
      "oloo-introspection",
      [
        "With `const Foo = {}; const Bar = Object.create(Foo); const b1 = Object.create(Bar);`, which checks work?",
        "Маємо `const Foo = {}; const Bar = Object.create(Foo); const b1 = Object.create(Bar);`. Які перевірки працюють?",
      ],
      [
        ["`Foo.isPrototypeOf(b1)` returns `true`", "`Foo.isPrototypeOf(b1)` повертає `true`"],
        ["`Object.getPrototypeOf(b1) === Bar` returns `true`", "`Object.getPrototypeOf(b1) === Bar` повертає `true`"],
        ["`b1 instanceof Foo` returns `true`", "`b1 instanceof Foo` повертає `true`"],
        ["`b1 instanceof Foo` throws a TypeError, because `instanceof` needs a function on the right and really checks its `.prototype`", "`b1 instanceof Foo` кидає TypeError, бо `instanceof` потребує функції праворуч і насправді перевіряє її `.prototype`"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "thenable-duck-typing",
      [
        "What does `await { then(resolve) { resolve(42); } }` give, and why is that a duck-typing risk?",
        "Що дає `await { then(resolve) { resolve(42); } }` і чому це ризик «качиної типізації»?",
      ],
      [
        ["The object itself: `await` only unwraps real `Promise` instances", "Сам об'єкт: `await` розгортає лише справжні екземпляри `Promise`"],
        ["A TypeError: only promises can be awaited", "TypeError: чекати можна лише проміси"],
        ["`undefined`", "`undefined`"],
        [
          "`42`: promises treat any object with a `then` method as a \"thenable\" and call it, so an unrelated object that happens to have `then` can hang or misbehave when it reaches `await` or `Promise.resolve`",
          "`42`: проміси вважають будь-який об'єкт із методом `then` «thenable» і викликають його, тож сторонній об'єкт, що випадково має `then`, може зависнути чи поводитися неправильно, потрапивши в `await` чи `Promise.resolve`",
        ],
      ],
      "d",
    ),
  ],
};

/** Questions 60–64: "this & Object Prototypes", appendix A "ES6 class". */
export const ydkjsClassGotchasQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-class-gotchas-quiz",
  title: { en: "ES6 class gotchas", uk: "Підступи класів ES6" },
  questions: [
    question(
      "live-prototype",
      [
        "What does the last line print?\n\n```js\nclass C {\n  rand() { return 'old'; }\n}\nconst c1 = new C();\nC.prototype.rand = function () { return 'new'; };\nconsole.log(c1.rand());\n```",
        "Що виведе останній рядок?\n\n```js\nclass C {\n  rand() { return 'old'; }\n}\nconst c1 = new C();\nC.prototype.rand = function () { return 'new'; };\nconsole.log(c1.rand());\n```",
      ],
      [
        ["`old`: `c1` got its own copy of the method when it was created", "`old`: `c1` отримав власну копію методу під час створення"],
        ["A TypeError: class prototypes are read-only", "TypeError: прототипи класів доступні лише для читання"],
        [
          "`new`: `class` is syntax over prototypes, so instances keep a live delegation link to `C.prototype` rather than a copy made at declaration time, and changing a method there changes it for existing instances too",
          "`new`: `class` — це синтаксис над прототипами, тож екземпляри зберігають живе посилання-делегування на `C.prototype`, а не копію, зроблену під час оголошення, і зміна методу там змінює його й для вже створених екземплярів",
        ],
        ["`undefined`", "`undefined`"],
      ],
      "c",
    ),
    question(
      "method-shadowing",
      [
        "`class C { constructor(id) { this.id = id; } id() { return 'Id: ' + this.id; } }` What does `new C('c1').id()` do?",
        "`class C { constructor(id) { this.id = id; } id() { return 'Id: ' + this.id; } }` Що робить `new C('c1').id()`?",
      ],
      [
        [
          "Throws a TypeError: the constructor creates an own property `id` (the string `'c1'`) on the instance, which shadows the `id()` method on the prototype, so the call tries to run a string",
          "Кидає TypeError: конструктор створює на екземплярі власну властивість `id` (рядок `'c1'`), яка затінює метод `id()` у прототипі, тож виклик намагається виконати рядок",
        ],
        ["Returns `'Id: c1'`", "Повертає `'Id: c1'`"],
        ["Returns `'Id: undefined'`", "Повертає `'Id: undefined'`"],
        ["Throws a SyntaxError: a field and a method can't share a name", "Кидає SyntaxError: поле й метод не можуть мати однакову назву"],
      ],
      "a",
    ),
    question(
      "shared-state",
      [
        "`class E { count = 0; static total = 0; constructor() { E.total++; this.count++; } }` After `new E(); new E();`, what are the first instance's `count` and `E.total`?",
        "`class E { count = 0; static total = 0; constructor() { E.total++; this.count++; } }` Після `new E(); new E();` чому дорівнюють `count` першого екземпляра й `E.total`?",
      ],
      [
        ["`2` and `2`: fields are shared through the prototype", "`2` і `2`: поля спільні через прототип"],
        [
          "`1` and `2`: a class field becomes an own property of each instance, while a `static` field lives on the class itself, so it is the place for shared state (the 2014 book predates class fields and suggests putting data on `C.prototype`, where `this.count++` would quietly create an own, shadowing property anyway)",
          "`1` і `2`: поле класу стає власною властивістю кожного екземпляра, а поле `static` живе на самому класі, тож саме там місце для спільного стану (книжка 2014 року старша за поля класів і радить класти дані на `C.prototype`, де `this.count++` однаково непомітно створило б власну властивість, що затінює спільну)",
        ],
        ["`0` and `0`: fields can't be changed in the constructor", "`0` і `0`: поля не можна змінювати в конструкторі"],
        ["A SyntaxError: classes can't declare fields", "SyntaxError: класи не можуть оголошувати поля"],
      ],
      "b",
    ),
    question(
      "super-home-object",
      [
        "What does `E.foo()` print?\n\n```js\nclass P { foo() { return 'P.foo'; } }\nclass C extends P { foo() { return super.foo(); } }\n\nconst D = { foo() { return 'D.foo'; } };\nconst E = { foo: C.prototype.foo };\nObject.setPrototypeOf(E, D);\nconsole.log(E.foo());\n```",
        "Що виведе `E.foo()`?\n\n```js\nclass P { foo() { return 'P.foo'; } }\nclass C extends P { foo() { return super.foo(); } }\n\nconst D = { foo() { return 'D.foo'; } };\nconst E = { foo: C.prototype.foo };\nObject.setPrototypeOf(E, D);\nconsole.log(E.foo());\n```",
      ],
      [
        ["`D.foo`: `super` follows `E`'s prototype, like `this` follows the call site", "`D.foo`: `super` іде за прототипом `E`, як `this` іде за місцем виклику"],
        ["A ReferenceError: `super` is undefined outside a class", "ReferenceError: `super` не визначено поза класом"],
        ["An infinite loop", "Нескінченний цикл"],
        [
          "`P.foo`: unlike `this`, `super` isn't decided at call time; it comes from the method's home object fixed when it was defined (`C.prototype`), so borrowing the method onto another object doesn't change where `super` points",
          "`P.foo`: на відміну від `this`, `super` не визначається під час виклику; він береться з «домашнього» об'єкта методу, зафіксованого під час оголошення (`C.prototype`), тож позичання методу іншим об'єктом не змінює, куди вказує `super`",
        ],
      ],
      "d",
    ),
    question(
      "extends-builtins",
      [
        "With `class MyArr extends Array { sum() { return this.reduce((a, b) => a + b, 0); } }` and `const m = MyArr.from([1, 2, 3]); m.push(4);`, which statements are true?",
        "Маємо `class MyArr extends Array { sum() { return this.reduce((a, b) => a + b, 0); } }` і `const m = MyArr.from([1, 2, 3]); m.push(4);`. Які твердження правильні?",
      ],
      [
        ["`m.length` is `4` and `m.sum()` is `10`: the subclass keeps the array's special behavior", "`m.length` дорівнює `4`, а `m.sum()` — `10`: підклас зберігає особливу поведінку масиву"],
        ["`Array.isArray(m)` is `true`, and `m.map(x => x)` returns a `MyArr`", "`Array.isArray(m)` дорівнює `true`, а `m.map(x => x)` повертає `MyArr`"],
        ["`class X extends someFn.bind(null) {}` throws a TypeError, because a bound function has no `prototype` to extend", "`class X extends someFn.bind(null) {}` кидає TypeError, бо прив'язана функція не має `prototype`, який можна розширити"],
        ["Subclassing built-ins like `Array` isn't possible in JavaScript", "Створювати підкласи вбудованих типів на кшталт `Array` у JavaScript неможливо"],
      ],
      ["a", "b", "c"],
    ),
  ],
};

/** Questions 65–73: "Types & Grammar", chapter 2 "Values". */
export const ydkjsValuesInDepthQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-values-in-depth-quiz",
  title: { en: "Values in depth", uk: "Значення докладно" },
  questions: [
    question(
      "float-epsilon",
      ["Why is `0.1 + 0.2 === 0.3` false, and how do you compare such numbers?", "Чому `0.1 + 0.2 === 0.3` дає false і як порівнювати такі числа?"],
      [
        ["It's a JavaScript bug that other languages don't have", "Це баг JavaScript, якого немає в інших мовах"],
        ["Because `+` turns them into strings", "Бо `+` перетворює їх на рядки"],
        [
          "0.1 and 0.2 have no exact binary floating-point (IEEE 754) form, so the sum is 0.30000000000000004, as in any language using doubles; compare with a tolerance, `Math.abs(a - b) < Number.EPSILON`, and for money keep whole cents or use a decimal library",
          "0.1 і 0.2 не мають точного двійкового представлення з рухомою комою (IEEE 754), тож сума дорівнює 0.30000000000000004, як у будь-якій мові з типом double; порівнюйте з допуском, `Math.abs(a - b) < Number.EPSILON`, а для грошей зберігайте цілі копійки чи використовуйте бібліотеку десяткових чисел",
        ],
        ["Use `==` instead of `===`", "Використовувати `==` замість `===`"],
      ],
      "c",
    ),
    question(
      "integers-in-js",
      ["Which statements about integers in JavaScript numbers are true?", "Які твердження про цілі числа серед чисел JavaScript правильні?"],
      [
        ["`Number.isInteger(42.0)` is `true`: there is one `number` type, and an \"integer\" is just a number with no fractional part", "`Number.isInteger(42.0)` дорівнює `true`: є один тип `number`, а «ціле» — це просто число без дробової частини"],
        ["`2 ** 53 + 1 === 2 ** 53` is `true`, because above `Number.MAX_SAFE_INTEGER` not every integer can be represented", "`2 ** 53 + 1 === 2 ** 53` дорівнює `true`, бо понад `Number.MAX_SAFE_INTEGER` не кожне ціле можна представити"],
        ["64-bit database IDs should travel as strings (or `BigInt`), not as numbers", "64-бітні ідентифікатори з бази даних варто передавати рядками (чи `BigInt`), а не числами"],
        ["`Number.isSafeInteger(2 ** 53)` is `true`", "`Number.isSafeInteger(2 ** 53)` дорівнює `true`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "number-literal-methods",
      ["Which statements about calling methods on number literals are true?", "Які твердження про виклик методів на числових літералах правильні?"],
      [
        ["`42.toFixed(2)` is a SyntaxError, because the first `.` is read as part of the literal `42.`", "`42.toFixed(2)` — це SyntaxError, бо першу `.` прочитано як частину літерала `42.`"],
        ["`(42).toFixed(2)` and `42..toFixed(2)` both return `\"42.00\"`, a string, not a number", "`(42).toFixed(2)` і `42..toFixed(2)` обидва повертають `\"42.00\"` — рядок, а не число"],
        ["`42.59.toPrecision(1)` is `\"4e+1\"`, because `toPrecision` counts significant digits, unlike `toFixed`, which counts decimal places", "`42.59.toPrecision(1)` дорівнює `\"4e+1\"`, бо `toPrecision` рахує значущі цифри, на відміну від `toFixed`, що рахує знаки після коми"],
        ["`(42.59).toFixed(0)` returns the number `42`", "`(42.59).toFixed(0)` повертає число `42`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "bitwise-int32",
      ["What do `3.7 | 0`, `NaN | 0` and `(2 ** 31) | 0` give?", "Що дають `3.7 | 0`, `NaN | 0` і `(2 ** 31) | 0`?"],
      [
        ["`4`, `NaN` and `2147483648`", "`4`, `NaN` і `2147483648`"],
        [
          "`3`, `0` and `-2147483648`: bitwise operators work on 32-bit signed integers, so `| 0` drops the fraction, turns `NaN` and `Infinity` into `0`, and wraps values outside about ±2.1 billion",
          "`3`, `0` і `-2147483648`: побітові оператори працюють із 32-бітними цілими зі знаком, тож `| 0` відкидає дробову частину, перетворює `NaN` та `Infinity` на `0` і «загортає» значення поза межами приблизно ±2,1 мільярда",
        ],
        ["`3`, `NaN` and `2147483648`", "`3`, `NaN` і `2147483648`"],
        ["A TypeError for `NaN`", "TypeError для `NaN`"],
      ],
      "b",
    ),
    question(
      "negative-zero",
      ["Which statements about `-0` are true?", "Які твердження про `-0` правильні?"],
      [
        ["`-0 === 0` is `true`, and `String(-0)` and `JSON.stringify(-0)` both give `\"0\"`", "`-0 === 0` дорівнює `true`, а `String(-0)` і `JSON.stringify(-0)` обидва дають `\"0\"`"],
        ["`JSON.parse(\"-0\")` and `Number(\"-0\")` do give `-0`", "`JSON.parse(\"-0\")` і `Number(\"-0\")` справді дають `-0`"],
        ["You detect it with `Object.is(x, -0)` or `1 / x === -Infinity`; it can keep the sign, such as a direction of movement, when a value reaches zero", "Його виявляють через `Object.is(x, -0)` чи `1 / x === -Infinity`; він може зберегти знак, наприклад напрямок руху, коли значення доходить до нуля"],
        ["`0 > -0` is `true`", "`0 > -0` дорівнює `true`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "infinity-math",
      ["What do `Infinity / Infinity`, `Number.MAX_VALUE * 2` and `1 / Infinity` give?", "Що дають `Infinity / Infinity`, `Number.MAX_VALUE * 2` і `1 / Infinity`?"],
      [
        ["`1`, a RangeError and `0`", "`1`, RangeError і `0`"],
        ["`Infinity`, `Infinity` and `0`", "`Infinity`, `Infinity` і `0`"],
        ["A RangeError for all three", "RangeError для всіх трьох"],
        [
          "`NaN`, `Infinity` and `0`: dividing infinity by infinity is undefined, an overflow becomes `Infinity` instead of an error (and you can't get back to a finite value), and a finite number over infinity is `0` (or `-0` if it's negative)",
          "`NaN`, `Infinity` і `0`: ділення нескінченності на нескінченність невизначене, переповнення стає `Infinity`, а не помилкою (і повернутися до скінченного значення вже не можна), а скінченне число, поділене на нескінченність, дорівнює `0` (чи `-0`, якщо воно від'ємне)",
        ],
      ],
      "d",
    ),
    question(
      "borrow-array-methods",
      ["Which of these work on the string `'foo'`?", "Що з цього працює з рядком `'foo'`?"],
      [
        ["`Array.prototype.join.call('foo', '-')` returns `\"f-o-o\"`", "`Array.prototype.join.call('foo', '-')` повертає `\"f-o-o\"`"],
        ["`Array.prototype.map.call('foo', c => c.toUpperCase()).join('')` returns `\"FOO\"`", "`Array.prototype.map.call('foo', c => c.toUpperCase()).join('')` повертає `\"FOO\"`"],
        ["`Array.prototype.reverse.call('foo')` returns `\"oof\"`", "`Array.prototype.reverse.call('foo')` повертає `\"oof\"`"],
        ["Non-mutating array methods can be borrowed for strings, but mutating ones like `reverse` throw a TypeError, because strings are immutable", "Незмінювальні методи масивів можна позичати для рядків, а змінювальні на кшталт `reverse` кидають TypeError, бо рядки незмінні"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "undefined-identifier",
      [
        "`null` is a keyword but `undefined` is an identifier. What happens with `undefined = 2;`, and inside a function with `let undefined = 2;`?",
        "`null` — ключове слово, а `undefined` — ідентифікатор. Що станеться з `undefined = 2;`, а що всередині функції з `let undefined = 2;`?",
      ],
      [
        [
          "The global `undefined` is read-only: the assignment is silently ignored in sloppy mode and throws a TypeError in strict mode; but a local variable named `undefined` is allowed and really holds `2`, which is a terrible idea (the 2014 book says the global could be reassigned, which was true only before ES5)",
          "Глобальний `undefined` доступний лише для читання: у нестрогому режимі присвоєння мовчки ігнорується, а в строгому кидає TypeError; проте локальна змінна з назвою `undefined` дозволена й справді містить `2`, і це жахлива ідея (книжка 2014 року каже, що глобальний можна переприсвоїти, але це було так лише до ES5)",
        ],
        ["Both are SyntaxErrors, like `null = 2`", "Обидва — SyntaxError, як `null = 2`"],
        ["Both change `undefined` to `2` everywhere", "Обидва змінюють `undefined` на `2` усюди"],
        ["The global assignment works; the local one throws", "Глобальне присвоєння працює, а локальне кидає помилку"],
      ],
      "a",
    ),
    question(
      "reassign-parameter",
      [
        "What is `a` after each call?\n\n```js\nfunction foo(x) { x.push(4); x = [4, 5, 6]; x.push(7); }\nfunction bar(x) { x.length = 0; x.push(9); }\nconst a = [1, 2, 3];\nfoo(a); // a = ?\nbar(a); // a = ?\n```",
        "Чому дорівнює `a` після кожного виклику?\n\n```js\nfunction foo(x) { x.push(4); x = [4, 5, 6]; x.push(7); }\nfunction bar(x) { x.length = 0; x.push(9); }\nconst a = [1, 2, 3];\nfoo(a); // a = ?\nbar(a); // a = ?\n```",
      ],
      [
        ["`[4, 5, 6, 7]`, then `[9]`", "`[4, 5, 6, 7]`, потім `[9]`"],
        ["`[1, 2, 3]`, then `[1, 2, 3]`", "`[1, 2, 3]`, потім `[1, 2, 3]`"],
        ["`[1, 2, 3, 4]`, then `[1, 2, 3, 4, 9]`", "`[1, 2, 3, 4]`, потім `[1, 2, 3, 4, 9]`"],
        [
          "`[1, 2, 3, 4]`, then `[9]`: the parameter gets a copy of the reference, so mutating through it changes the shared array, but `x = [...]` only re-points the local `x`; to replace the contents you mutate in place, as `bar` does",
          "`[1, 2, 3, 4]`, потім `[9]`: параметр отримує копію посилання, тож зміна через нього змінює спільний масив, але `x = [...]` лише перенаправляє локальну `x`; щоб замінити вміст, масив змінюють на місці, як це робить `bar`",
        ],
      ],
      "d",
    ),
  ],
};

/** Questions 74–80: "Types & Grammar", chapter 4 "Coercion" — conversions and explicit coercion. */
export const ydkjsExplicitCoercionQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-explicit-coercion-quiz",
  title: { en: "Coercion: conversions", uk: "Приведення типів: перетворення" },
  questions: [
    question(
      "json-stringify-skips",
      ["Which statements about `JSON.stringify` are true?", "Які твердження про `JSON.stringify` правильні?"],
      [
        ["`JSON.stringify({ a: undefined, b() {}, c: 1 })` gives `'{\"c\":1}'`: properties holding `undefined`, functions or symbols are skipped", "`JSON.stringify({ a: undefined, b() {}, c: 1 })` дає `'{\"c\":1}'`: властивості зі значеннями `undefined`, функціями чи символами пропускаються"],
        ["Inside an array the same values become `null`: `JSON.stringify([undefined, () => {}])` gives `'[null,null]'`", "Усередині масиву ті самі значення стають `null`: `JSON.stringify([undefined, () => {}])` дає `'[null,null]'`"],
        ["If an object has a `toJSON()` method, its return value is serialized instead, which is how a `Date` becomes an ISO string", "Якщо об'єкт має метод `toJSON()`, серіалізується його результат, і саме так `Date` стає ISO-рядком"],
        ["`JSON.stringify(undefined)` returns the string `\"undefined\"`", "`JSON.stringify(undefined)` повертає рядок `\"undefined\"`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "falsy-objects",
      ["In browsers, `document.all` is an object, yet `if (document.all)` doesn't run and `typeof document.all` is `\"undefined\"`. Why?", "У браузерах `document.all` — об'єкт, але `if (document.all)` не виконується, а `typeof document.all` дорівнює `\"undefined\"`. Чому?"],
      [
        ["It's a bug that will be fixed soon", "Це баг, який скоро виправлять"],
        ["All DOM collections are falsy", "Усі DOM-колекції falsy"],
        [
          "It's a deliberate legacy exception, a \"falsy object\" made so old scripts that sniffed for ancient Internet Explorer take the modern path; it's the only such case, and every ordinary object, even `new Boolean(false)`, is truthy",
          "Це навмисний спадковий виняток, «falsy-об'єкт», зроблений, щоб старі скрипти, які розпізнавали давній Internet Explorer, ішли сучасним шляхом; це єдиний такий випадок, а кожен звичайний об'єкт, навіть `new Boolean(false)`, truthy",
        ],
        ["Because it's empty on modern pages", "Бо на сучасних сторінках він порожній"],
      ],
      "c",
    ),
    question(
      "tilde-indexof",
      ["What is `if (~str.indexOf('x'))` for, and what replaces it today?", "Для чого `if (~str.indexOf('x'))` і що використовують замість нього сьогодні?"],
      [
        [
          "`~n` is `-(n + 1)`, so it turns `indexOf`'s \"not found\" result `-1` into the only falsy value, `0`, and any found index into a truthy number; today `str.includes('x')` says the same thing clearly",
          "`~n` дорівнює `-(n + 1)`, тож він перетворює результат «не знайдено» `-1` від `indexOf` на єдине falsy-значення `0`, а будь-який знайдений індекс — на truthy-число; сьогодні `str.includes('x')` каже те саме зрозуміло",
        ],
        ["`~` rounds the index", "`~` округлює індекс"],
        ["It checks that `x` is at position 0", "Він перевіряє, що `x` стоїть на позиції 0"],
        ["It's a syntax error", "Це синтаксична помилка"],
      ],
      "a",
    ),
    question(
      "parseint-non-strings",
      ["What do `parseInt(0.0000008)` and `parseInt(1 / 0, 19)` return?", "Що повертають `parseInt(0.0000008)` і `parseInt(1 / 0, 19)`?"],
      [
        ["`0` and `NaN`", "`0` і `NaN`"],
        ["`0` and `Infinity`", "`0` і `Infinity`"],
        ["A TypeError for both: `parseInt` only accepts strings", "TypeError для обох: `parseInt` приймає лише рядки"],
        [
          "`8` and `18`: `parseInt` first turns its argument into a string (`\"8e-7\"`, `\"Infinity\"`) and parses the leading digits valid in the radix (`\"I\"` is 18 in base 19), so pass it only strings and use `Math.trunc` or `Number` for numbers",
          "`8` і `18`: `parseInt` спершу перетворює аргумент на рядок (`\"8e-7\"`, `\"Infinity\"`) і розбирає початкові цифри, допустимі в системі числення (`\"I\"` — це 18 у системі з основою 19), тож передавайте йому лише рядки, а для чисел використовуйте `Math.trunc` чи `Number`",
        ],
      ],
      "d",
    ),
    question(
      "valueof-tostring",
      [
        "`const o = { valueOf() { return 42; }, toString() { return '4'; } };` What do `o + ''` and `String(o)` give?",
        "`const o = { valueOf() { return 42; }, toString() { return '4'; } };` Що дають `o + ''` і `String(o)`?",
      ],
      [
        ["`\"4\"` and `\"4\"`", "`\"4\"` і `\"4\"`"],
        [
          "`\"42\"` and `\"4\"`: `+` converts an object with the default hint, which tries `valueOf` first, while `String()` (and template literals) ask for a string and call `toString` first",
          "`\"42\"` і `\"4\"`: `+` перетворює об'єкт із підказкою за замовчуванням, що спершу пробує `valueOf`, а `String()` (і шаблонні рядки) просять рядок і спершу викликають `toString`",
        ],
        ["`\"42\"` and `\"42\"`", "`\"42\"` і `\"42\"`"],
        ["`\"[object Object]\"` for both", "`\"[object Object]\"` для обох"],
      ],
      "b",
    ),
    question(
      "plus-with-objects",
      ["What do `[1, 2] + [3, 4]` and `[] + {}` give?", "Що дають `[1, 2] + [3, 4]` і `[] + {}`?"],
      [
        ["`[1, 2, 3, 4]` and `{}`", "`[1, 2, 3, 4]` і `{}`"],
        ["`10` and `0`", "`10` і `0`"],
        [
          "`\"1,23,4\"` and `\"[object Object]\"`: if either operand of `+` is an object, both are turned into primitives, arrays become comma-joined strings, and then strings are concatenated",
          "`\"1,23,4\"` і `\"[object Object]\"`: якщо хоч один операнд `+` — об'єкт, обидва перетворюються на примітиви, масиви стають рядками через кому, а потім рядки зчіплюються",
        ],
        ["A TypeError for both", "TypeError для обох"],
      ],
      "c",
    ),
    question(
      "symbol-coercion",
      ["`const s = Symbol('cool');` Which of these work?", "`const s = Symbol('cool');` Що з цього працює?"],
      [
        ["`String(s)` gives `\"Symbol(cool)\"`", "`String(s)` дає `\"Symbol(cool)\"`"],
        ["`!!s` is `true`, like any symbol", "`!!s` дорівнює `true`, як і для будь-якого символу"],
        ["`s + ''` gives `\"Symbol(cool)\"`", "`s + ''` дає `\"Symbol(cool)\"`"],
        ["`+s` and `s + ''` both throw a TypeError: symbols can be converted to strings only explicitly, and never to numbers", "`+s` і `s + ''` обидва кидають TypeError: символи можна перетворити на рядок лише явно, а на число — ніколи"],
      ],
      ["a", "b", "d"],
    ),
  ],
};

/** Questions 81–84: "Types & Grammar", chapter 4 "Coercion" — implicit coercion and equality. */
export const ydkjsImplicitCoercionQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-implicit-coercion-quiz",
  title: { en: "Coercion: operators and equality", uk: "Приведення типів: оператори й рівність" },
  questions: [
    question(
      "or-and-operands",
      ["What do `0 || 'default'`, `'' && 'x'`, `1 && 'b'` and `null || 0 || ''` return?", "Що повертають `0 || 'default'`, `'' && 'x'`, `1 && 'b'` і `null || 0 || ''`?"],
      [
        ["`true`, `false`, `true`, `false`", "`true`, `false`, `true`, `false`"],
        [
          "`'default'`, `''`, `'b'`, `''`: `||` and `&&` return one of their operands, not a boolean; `||` returns the first truthy one (or the last), `&&` the first falsy one (or the last), which is why `0 || x` can't keep a real `0` and `??` exists",
          "`'default'`, `''`, `'b'`, `''`: `||` і `&&` повертають один зі своїх операндів, а не булеве значення; `||` повертає перший truthy (або останній), `&&` — перший falsy (або останній), тому `0 || x` не може зберегти справжній `0`, і саме тому існує `??`",
        ],
        ["`'default'`, `'x'`, `1`, `null`", "`'default'`, `'x'`, `1`, `null`"],
        ["`0`, `''`, `1`, `null`", "`0`, `''`, `1`, `null`"],
      ],
      "b",
    ),
    question(
      "equals-true",
      ["What do `'42' == true` and `'42' == false` return?", "Що повертають `'42' == true` і `'42' == false`?"],
      [
        ["`true` and `false`: `'42'` is truthy", "`true` і `false`: `'42'` truthy"],
        ["`false` and `true`", "`false` і `true`"],
        ["A TypeError for both", "TypeError для обох"],
        [
          "`false` and `false`: `==` doesn't check truthiness; it turns the boolean into a number (`1` or `0`) and then `'42'` into `42`, so neither matches, which is why you should never write `== true` or `== false`",
          "`false` і `false`: `==` не перевіряє truthy; він перетворює булеве значення на число (`1` чи `0`), а потім `'42'` на `42`, тож жодне не збігається, і саме тому ніколи не варто писати `== true` чи `== false`",
        ],
      ],
      "d",
    ),
    question(
      "crazy-equality",
      ["Which of these are `true`?", "Що з цього дорівнює `true`?"],
      [
        ["`[] == ![]`", "`[] == ![]`"],
        ["`'0' == false`", "`'0' == false`"],
        ["`0 == '\\n'`", "`0 == '\\n'`"],
        ["`null == 0`", "`null == 0`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "relational-objects",
      [
        "`const a = { b: 42 }; const b = { b: 43 };` What do `a < b`, `a == b` and `a <= b` return?",
        "`const a = { b: 42 }; const b = { b: 43 };` Що повертають `a < b`, `a == b` і `a <= b`?",
      ],
      [
        ["`true`, `false`, `true`", "`true`, `false`, `true`"],
        ["`false`, `false`, `false`", "`false`, `false`, `false`"],
        [
          "`false`, `false`, `true`: both objects become `\"[object Object]\"`, so neither is less than the other; `==` compares references and fails; and `a <= b` is evaluated as \"not `b < a`\", which is `true`",
          "`false`, `false`, `true`: обидва об'єкти стають `\"[object Object]\"`, тож жоден не менший за інший; `==` порівнює посилання й не збігається; а `a <= b` обчислюється як «не `b < a`», тобто `true`",
        ],
        ["A TypeError: objects can't be compared with `<`", "TypeError: об'єкти не можна порівнювати через `<`"],
      ],
      "c",
    ),
  ],
};

/** Questions 85–92: "Async & Performance", chapter 3 "Promises". */
export const ydkjsPromisesQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-promises-quiz",
  title: { en: "Promises in depth", uk: "Проміси докладно" },
  questions: [
    question(
      "executor-behavior",
      [
        "In what order do the entries end up in `log`?\n\n```js\nconst log = [];\nconst p = new Promise((resolve) => {\n  log.push('executor');\n  resolve(1);\n  resolve(2);\n});\nlog.push('after');\np.then((v) => log.push('then ' + v));\n```",
        "У якому порядку записи потраплять у `log`?\n\n```js\nconst log = [];\nconst p = new Promise((resolve) => {\n  log.push('executor');\n  resolve(1);\n  resolve(2);\n});\nlog.push('after');\np.then((v) => log.push('then ' + v));\n```",
      ],
      [
        ["`after`, `executor`, `then 1`", "`after`, `executor`, `then 1`"],
        ["`executor`, `then 1`, `then 2`, `after`", "`executor`, `then 1`, `then 2`, `after`"],
        [
          "`executor`, `after`, `then 1`: the executor runs synchronously, the first `resolve` wins and later calls are ignored, and `then` callbacks always run asynchronously, even for an already settled promise; an exception thrown in the executor becomes a rejection",
          "`executor`, `after`, `then 1`: виконавець запускається синхронно, перемагає перший `resolve`, а наступні виклики ігноруються, і колбеки `then` завжди виконуються асинхронно, навіть для вже завершеного промісу; виняток, кинутий у виконавці, стає відхиленням",
        ],
        ["`executor`, `then 2`, `after`", "`executor`, `then 2`, `after`"],
      ],
      "c",
    ),
    question(
      "chain-flow",
      ["Which statements about chaining `then` are true?", "Які твердження про ланцюжки `then` правильні?"],
      [
        ["Each `then` returns a new promise, fulfilled with whatever its handler returns", "Кожен `then` повертає новий проміс, виконаний значенням, яке повертає його обробник"],
        ["If a handler returns a promise (or thenable), the chain waits for it and continues with its result", "Якщо обробник повертає проміс (чи thenable), ланцюжок чекає на нього й продовжує з його результатом"],
        ["If a handler throws, the following `then` handlers are skipped until a `catch` (or rejection handler) takes the error", "Якщо обробник кидає помилку, наступні обробники `then` пропускаються, доки її не перехопить `catch` (чи обробник відхилення)"],
        ["Returning nothing from a handler stops the chain", "Якщо обробник нічого не повертає, ланцюжок зупиняється"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "same-then-error",
      [
        "`p.then(v => { throw new Error('oops'); }, err => console.log('handled', err));` where `p` is fulfilled. Is the error handled?",
        "`p.then(v => { throw new Error('oops'); }, err => console.log('handled', err));`, де `p` виконано. Чи буде помилку оброблено?",
      ],
      [
        ["Yes, by the second handler of the same `then`", "Так, другим обробником того самого `then`"],
        ["Yes, it's printed by the browser automatically and that's enough", "Так, браузер автоматично її виводить, і цього досить"],
        ["No, and `p` becomes rejected too", "Ні, і `p` теж стає відхиленим"],
        [
          "No: the rejection handler of a `then` only watches `p`, not the promise produced by its own fulfillment handler, so the error rejects the next promise in the chain; end chains with `.catch()` (or `try/catch` around `await`) so errors aren't lost as unhandled rejections",
          "Ні: обробник відхилення в `then` стежить лише за `p`, а не за промісом, який створює його власний обробник виконання, тож помилка відхиляє наступний проміс у ланцюжку; завершуйте ланцюжки `.catch()` (чи `try/catch` навколо `await`), щоб помилки не губилися як необроблені відхилення",
        ],
      ],
      "d",
    ),
    question(
      "resolve-vs-reject",
      ["Which statements about `resolve`, `reject` and `Promise.resolve` are true?", "Які твердження про `resolve`, `reject` і `Promise.resolve` правильні?"],
      [
        ["`resolve(somePromise)` adopts that promise's outcome, so resolving with a rejected promise rejects", "`resolve(somePromise)` переймає результат того промісу, тож виконання відхиленим промісом відхиляє"],
        ["`reject(somePromise)` doesn't unwrap: the rejection reason is the promise object itself", "`reject(somePromise)` нічого не розгортає: причиною відхилення стає сам об'єкт промісу"],
        ["`Promise.resolve(p)` returns `p` itself if it's a native promise, and wraps other values or thenables in a trustworthy promise", "`Promise.resolve(p)` повертає сам `p`, якщо це нативний проміс, а інші значення чи thenable загортає в надійний проміс"],
        ["\"Resolved\" always means \"fulfilled\"", "«Resolved» завжди означає «fulfilled»"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "resolution-order",
      [
        "In what order are `A` and `B` printed?\n\n```js\nconst p3 = new Promise((r) => r('B'));\nconst p1 = new Promise((r) => r(p3));\nconst p2 = Promise.resolve('A');\np1.then(console.log);\np2.then(console.log);\n```",
        "У якому порядку буде виведено `A` і `B`?\n\n```js\nconst p3 = new Promise((r) => r('B'));\nconst p1 = new Promise((r) => r(p3));\nconst p2 = Promise.resolve('A');\np1.then(console.log);\np2.then(console.log);\n```",
      ],
      [
        ["`B`, then `A`: `p1.then` was registered first", "`B`, потім `A`: `p1.then` зареєстровано першим"],
        [
          "`A`, then `B`: `p1` is resolved with another promise, so unwrapping `p3` takes extra microtask steps, and `p2`'s handler runs first; don't rely on the order of callbacks across separate promise chains",
          "`A`, потім `B`: `p1` виконано іншим промісом, тож розгортання `p3` займає додаткові кроки мікрозадач, і обробник `p2` спрацьовує першим; не покладайтеся на порядок колбеків різних ланцюжків промісів",
        ],
        ["Only `A`: `p1` never settles", "Лише `A`: `p1` ніколи не завершується"],
        ["The order is random", "Порядок випадковий"],
      ],
      "b",
    ),
    question(
      "timeout-race",
      [
        "You write `Promise.race([fetch(url), timeout(3000)])`, where `timeout` rejects after 3 seconds. What does it do?",
        "Ви пишете `Promise.race([fetch(url), timeout(3000)])`, де `timeout` відхиляється через 3 секунди. Що це робить?",
      ],
      [
        [
          "It settles with whichever finishes first, so you get a rejection if the request is slower than 3 s, but the request itself keeps running, because promises can't be cancelled; to really stop it, pass an `AbortSignal` (for example `AbortSignal.timeout(3000)`) to `fetch`",
          "Він завершується тим, що закінчиться першим, тож ви отримаєте відхилення, якщо запит триває понад 3 с, але сам запит продовжує виконуватися, бо проміси не можна скасувати; щоб справді його зупинити, передайте `fetch` `AbortSignal` (наприклад, `AbortSignal.timeout(3000)`)",
        ],
        ["It cancels the request after 3 seconds", "Скасовує запит через 3 секунди"],
        ["It waits for both and returns an array", "Чекає на обидва й повертає масив"],
        ["`race` ignores rejections, so the timeout never matters", "`race` ігнорує відхилення, тож тайм-аут ніколи не має значення"],
      ],
      "a",
    ),
    question(
      "empty-all-race",
      ["What do `Promise.all([])` and `Promise.race([])` do?", "Що роблять `Promise.all([])` і `Promise.race([])`?"],
      [
        ["Both reject immediately", "Обидва одразу відхиляються"],
        ["Both fulfill with `undefined`", "Обидва виконуються з `undefined`"],
        ["Both throw a TypeError", "Обидва кидають TypeError"],
        [
          "`Promise.all([])` fulfills right away with `[]`, but `Promise.race([])` stays pending forever, so guard against an empty list before racing",
          "`Promise.all([])` одразу виконується з `[]`, а `Promise.race([])` назавжди лишається в стані pending, тож перед `race` перевіряйте, що список не порожній",
        ],
      ],
      "d",
    ),
    question(
      "promise-limitations",
      ["Which are real limitations of promises?", "Які з цього — справжні обмеження промісів?"],
      [
        ["A promise settles once, so it can't represent a stream of repeated events like clicks; use event listeners, async iterators or observables", "Проміс завершується один раз, тож не може представляти потік повторюваних подій на кшталт кліків; для цього є обробники подій, асинхронні ітератори чи observable"],
        ["A promise can't be cancelled; cancellation is a separate mechanism such as `AbortController`", "Проміс не можна скасувати; скасування — це окремий механізм, як-от `AbortController`"],
        ["A promise carries a single value, so several results have to be wrapped in an array or object", "Проміс несе одне значення, тож кілька результатів доводиться загортати в масив чи об'єкт"],
        ["Promises always run on a separate thread", "Проміси завжди виконуються в окремому потоці"],
      ],
      ["a", "b", "c"],
    ),
  ],
};

/** Questions 93–95: "Async & Performance", chapter 5 "Program Performance". */
export const ydkjsWorkersQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-workers-quiz",
  title: { en: "Web Workers in depth", uk: "Web Workers докладно" },
  questions: [
    question(
      "transferables",
      [
        "`const buf = new Uint8Array(1024).buffer; worker.postMessage(buf, [buf]);` What is `buf.byteLength` on the sending side afterwards, and why?",
        "`const buf = new Uint8Array(1024).buffer; worker.postMessage(buf, [buf]);` Чому дорівнює `buf.byteLength` на боці відправника після цього і чому?",
      ],
      [
        ["`1024`: `postMessage` always copies its data", "`1024`: `postMessage` завжди копіює дані"],
        ["`512`: the buffer is split between the two threads", "`512`: буфер ділиться між двома потоками"],
        [
          "`0`: listing the buffer in the second argument transfers ownership instead of copying it, so it's moved to the worker without duplicating memory and becomes detached (unusable) on the sending side; without that list, the structured clone algorithm copies the data",
          "`0`: перелік буфера в другому аргументі передає володіння ним замість копіювання, тож він переходить до worker без дублювання пам'яті й стає від'єднаним (непридатним) на боці відправника; без цього переліку алгоритм структурованого клонування копіює дані",
        ],
        ["A TypeError: `ArrayBuffer`s can't be sent to workers", "TypeError: `ArrayBuffer` не можна надсилати в worker"],
      ],
      "c",
    ),
    question(
      "worker-environment",
      ["Which statements about what code inside a dedicated Web Worker can do are true?", "Які твердження про можливості коду всередині виділеного Web Worker правильні?"],
      [
        ["It can make network requests (`fetch`, WebSocket) and set timers", "Він може робити мережеві запити (`fetch`, WebSocket) і ставити таймери"],
        ["A classic worker loads more scripts with `importScripts()`, which blocks until they load; a worker created with `{ type: 'module' }` can use `import` instead", "Класичний worker завантажує додаткові скрипти через `importScripts()`, що блокує виконання до їх завантаження; worker, створений з `{ type: 'module' }`, може використовувати `import`"],
        ["`worker.terminate()` from the page stops it immediately, with no chance to clean up", "`worker.terminate()` зі сторінки зупиняє його негайно, без можливості щось прибрати"],
        ["It can read the page's global variables and `localStorage`", "Він може читати глобальні змінні сторінки й `localStorage`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "shared-worker",
      ["How does a `SharedWorker` differ from a dedicated `Worker`?", "Чим `SharedWorker` відрізняється від виділеного `Worker`?"],
      [
        ["It runs on the main thread", "Він виконується в головному потоці"],
        [
          "One instance is shared by all tabs and frames of the same origin that create it from the same URL (two tabs with a dedicated `Worker` get two separate workers); each page talks to it through its own `port` (`worker.port.postMessage`, `port.start()`), and the worker gets a `connect` event per page, which is useful for sharing one WebSocket connection across tabs",
          "Один екземпляр спільний для всіх вкладок і фреймів одного джерела, що створюють його з тієї самої URL-адреси (дві вкладки з виділеним `Worker` отримують два окремі worker); кожна сторінка спілкується з ним через власний `port` (`worker.port.postMessage`, `port.start()`), а worker отримує подію `connect` для кожної сторінки, що зручно, щоб мати одне WebSocket-з'єднання на всі вкладки",
        ],
        ["It shares memory and variables with every page automatically", "Він автоматично ділить пам'ять і змінні з кожною сторінкою"],
        ["It is the same as a Service Worker", "Це те саме, що й Service Worker"],
      ],
      "b",
    ),
  ],
};

/** Questions 96–102: "ES6 & Beyond", chapter 3 "Organization". */
export const ydkjsOrganizationQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-organization-quiz",
  title: { en: "Iterators, modules and classes", uk: "Ітератори, модулі й класи" },
  questions: [
    question(
      "one-shot-iterator",
      [
        "`function* g() { yield 1; yield 2; } const it = g();` What do `[...it]`, a second `[...it]`, and `[...g()]` give?",
        "`function* g() { yield 1; yield 2; } const it = g();` Що дають `[...it]`, повторне `[...it]` і `[...g()]`?",
      ],
      [
        ["`[1, 2]` three times", "`[1, 2]` тричі"],
        [
          "`[1, 2]`, `[]`, `[1, 2]`: an iterator is consumed once, so spreading the same one again finds it already `done`; calling the generator again creates a fresh iterator (an array, by contrast, hands out a new iterator every time you iterate it)",
          "`[1, 2]`, `[]`, `[1, 2]`: ітератор споживається один раз, тож повторне розгортання того самого ітератора застає його вже в стані `done`; повторний виклик генератора створює новий ітератор (масив, навпаки, видає новий ітератор щоразу, коли його перебирають)",
        ],
        ["`[1, 2]`, then a TypeError", "`[1, 2]`, потім TypeError"],
        ["`[1, 2]`, `[1, 2, 1, 2]`, `[1, 2]`", "`[1, 2]`, `[1, 2, 1, 2]`, `[1, 2]`"],
      ],
      "b",
    ),
    question(
      "live-bindings",
      [
        "`counter.js`: `export let count = 0; export function inc() { count++; }`. In `main.js`: `import { count, inc } from './counter.js'; inc(); inc(); console.log(count); count = 5;` What happens?",
        "`counter.js`: `export let count = 0; export function inc() { count++; }`. У `main.js`: `import { count, inc } from './counter.js'; inc(); inc(); console.log(count); count = 5;` Що станеться?",
      ],
      [
        ["It prints `0`, because imports are copies, and then `count` becomes `5`", "Виведе `0`, бо імпорти — це копії, а потім `count` стане `5`"],
        ["It prints `2`, and then `count` becomes `5` in both files", "Виведе `2`, а потім `count` стане `5` в обох файлах"],
        ["It prints `0`, then throws a TypeError", "Виведе `0`, потім кине TypeError"],
        [
          "It prints `2`, then throws a TypeError: an import is a live, read-only binding to the exporting module's variable, so it sees updates made there, but only the exporting module can change it (CommonJS `require`, by contrast, gives you a copy of the value at that moment)",
          "Виведе `2`, потім кине TypeError: імпорт — це живе зв'язування лише для читання зі змінною модуля-експортера, тож він бачить зміни, зроблені там, але змінювати її може лише сам експортер (CommonJS `require`, навпаки, дає копію значення на той момент)",
        ],
      ],
      "d",
    ),
    question(
      "import-forms",
      ["Which statements about `import` forms are true?", "Які твердження про форми `import` правильні?"],
      [
        ["`import hello, { count } from './m.js'` takes the default export under any name you choose, plus a named export under its exact name", "`import hello, { count } from './m.js'` бере експорт за замовчуванням під будь-якою вибраною назвою, а також іменований експорт під його точною назвою"],
        ["`import * as ns from './m.js'` gives a namespace object with every export as a property; you can't add or reassign its properties", "`import * as ns from './m.js'` дає об'єкт простору імен, де кожен експорт — властивість; додавати чи переприсвоювати його властивості не можна"],
        ["`import { count as total } from './m.js'` renames the binding locally", "`import { count as total } from './m.js'` локально перейменовує зв'язування"],
        ["`import` statements can be placed inside `if` blocks to load modules conditionally", "Інструкції `import` можна ставити всередині блоків `if`, щоб завантажувати модулі за умовою"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "circular-imports",
      [
        "`a.js` imports `b.js`, and `b.js` imports `a.js`. Running `a.js` first, `b.js`'s top-level code calls `getA()` (a function declaration exported by `a.js`) and reads `a` (an exported `const`). What happens?",
        "`a.js` імпортує `b.js`, а `b.js` імпортує `a.js`. Під час запуску `a.js` верхньорівневий код `b.js` викликає `getA()` (оголошення функції, експортоване з `a.js`) і читає `a` (експортовану `const`). Що станеться?",
      ],
      [
        [
          "`getA()` works, because function declarations are hoisted and ready before any module code runs, but reading `a` throws a ReferenceError, because `a.js` hasn't run its `const a = …` line yet (the binding is in its TDZ); circular imports work only if neither side uses the other's values too early",
          "`getA()` працює, бо оголошення функцій піднімаються й готові ще до виконання коду модулів, а читання `a` кидає ReferenceError, бо `a.js` ще не виконав рядок `const a = …` (зв'язування в TDZ); циклічні імпорти працюють, лише якщо жоден бік не використовує значення іншого зарано",
        ],
        ["Both work, because imports are resolved before any code runs", "Обидва працюють, бо імпорти розв'язуються до виконання будь-якого коду"],
        ["The loader detects the cycle and throws before running anything", "Завантажувач виявляє цикл і кидає помилку, нічого не виконавши"],
        ["The modules load forever in an infinite loop", "Модулі нескінченно завантажують один одного"],
      ],
      "a",
    ),
    question(
      "new-target",
      ["What is `new.target` used for?", "Для чого використовують `new.target`?"],
      [
        ["It returns the object being created", "Він повертає об'єкт, що створюється"],
        ["It lists all classes in the inheritance chain", "Він перелічує всі класи в ланцюжку успадкування"],
        [
          "Inside a function or constructor it is the constructor that `new` was called on, or `undefined` for a plain call; so you can detect a missing `new`, or make an abstract base class with `if (new.target === Shape) throw new TypeError('abstract')` while subclasses still work",
          "Усередині функції чи конструктора це конструктор, з яким викликано `new`, або `undefined` для звичайного виклику; тож можна виявити відсутній `new` чи зробити абстрактний базовий клас через `if (new.target === Shape) throw new TypeError('abstract')`, а підкласи й далі працюватимуть",
        ],
        ["It is the same as `this.constructor`", "Це те саме, що й `this.constructor`"],
      ],
      "c",
    ),
    question(
      "static-inheritance",
      [
        "`class A { static make() { return new this(); } } class B extends A {}` What is `B.make() instanceof B`?",
        "`class A { static make() { return new this(); } } class B extends A {}` Чому дорівнює `B.make() instanceof B`?",
      ],
      [
        ["A TypeError: static methods aren't inherited", "TypeError: статичні методи не успадковуються"],
        [
          "`true`: `extends` links `B` itself to `A` (`Object.getPrototypeOf(B) === A`), so static methods are inherited, and `this` inside `B.make()` is `B`",
          "`true`: `extends` пов'язує сам `B` з `A` (`Object.getPrototypeOf(B) === A`), тож статичні методи успадковуються, а `this` усередині `B.make()` — це `B`",
        ],
        ["`false`: it creates an `A`", "`false`: він створює `A`"],
        ["`undefined`", "`undefined`"],
      ],
      "b",
    ),
    question(
      "symbol-species",
      [
        "`class MyArr extends Array { static get [Symbol.species]() { return Array; } }` For `m = MyArr.from([1, 2])`, what are `m instanceof MyArr` and `m.map(x => x) instanceof MyArr`?",
        "`class MyArr extends Array { static get [Symbol.species]() { return Array; } }` Для `m = MyArr.from([1, 2])` чому дорівнюють `m instanceof MyArr` і `m.map(x => x) instanceof MyArr`?",
      ],
      [
        ["`true` and `true`", "`true` і `true`"],
        ["`false` and `false`", "`false` і `false`"],
        ["A TypeError: `Symbol.species` is read-only", "TypeError: `Symbol.species` доступний лише для читання"],
        [
          "`true` and `false`: built-in methods that create new arrays (`map`, `filter`, `slice`) use the constructor from `Symbol.species`, so overriding it makes them return plain `Array`s instead of your subclass",
          "`true` і `false`: вбудовані методи, що створюють нові масиви (`map`, `filter`, `slice`), беруть конструктор із `Symbol.species`, тож його перевизначення змушує їх повертати звичайні `Array`, а не ваш підклас",
        ],
      ],
      "d",
    ),
  ],
};

/** Questions 103–107: "ES6 & Beyond", chapter 5 "Collections". */
export const ydkjsCollectionsQuiz: SlideDef = {
  kind: "quiz",
  slug: "ydkjs-collections-quiz",
  title: { en: "Collections", uk: "Колекції" },
  questions: [
    question(
      "typed-array-views",
      [
        "`const buf = new ArrayBuffer(2); new Uint16Array(buf)[0] = 258;` On a typical (little-endian) machine, what is `[...new Uint8Array(buf)]`?",
        "`const buf = new ArrayBuffer(2); new Uint16Array(buf)[0] = 258;` Чому дорівнює `[...new Uint8Array(buf)]` на типовій (little-endian) машині?",
      ],
      [
        ["`[258]`", "`[258]`"],
        ["`[1, 2]`", "`[1, 2]`"],
        ["`[0, 0]`: each view has its own copy of the data", "`[0, 0]`: кожне подання має власну копію даних"],
        [
          "`[2, 1]`: typed arrays are views over the same raw `ArrayBuffer`, so writing through one shows up in the other; 258 is `0x0102`, and little-endian CPUs store the low byte first; use a `DataView` with an explicit endianness flag when bytes go over the network or into files",
          "`[2, 1]`: типізовані масиви — це подання над тим самим «сирим» `ArrayBuffer`, тож запис через одне видно в іншому; 258 — це `0x0102`, а little-endian процесори зберігають молодший байт першим; коли байти йдуть мережею чи у файли, використовуйте `DataView` з явним прапорцем порядку байтів",
        ],
      ],
      "d",
    ),
    question(
      "typed-array-overflow",
      [
        "What do `new Uint8Array([256, -1, 1.7])` and `new Uint8ClampedArray([256, -1, 1.7])` contain?",
        "Що містять `new Uint8Array([256, -1, 1.7])` і `new Uint8ClampedArray([256, -1, 1.7])`?",
      ],
      [
        [
          "`[0, 255, 1]` and `[255, 0, 2]`: a `Uint8Array` wraps values modulo 256 and drops the fraction, while the clamped version (used for canvas pixel data) clamps to 0–255 and rounds; typed arrays also have a fixed length, with no `push`",
          "`[0, 255, 1]` і `[255, 0, 2]`: `Uint8Array` бере значення за модулем 256 і відкидає дробову частину, а «затиснута» версія (її використовують для пікселів canvas) обмежує діапазоном 0–255 і округлює; також типізовані масиви мають фіксовану довжину й не мають `push`",
        ],
        ["Both throw a RangeError", "Обидва кидають RangeError"],
        ["Both contain `[256, -1, 1.7]`", "Обидва містять `[256, -1, 1.7]`"],
        ["`[255, 0, 2]` and `[0, 255, 1]`", "`[255, 0, 2]` і `[0, 255, 1]`"],
      ],
      "a",
    ),
    question(
      "map-key-equality",
      [
        "`const m = new Map(); m.set(NaN, 'a'); m.set(0, 'zero');` What do `m.get(NaN)`, `m.get(-0)` and `m.get({})` return?",
        "`const m = new Map(); m.set(NaN, 'a'); m.set(0, 'zero');` Що повертають `m.get(NaN)`, `m.get(-0)` і `m.get({})`?",
      ],
      [
        ["`undefined`, `undefined`, `undefined`: `NaN` and `-0` can't be keys", "`undefined`, `undefined`, `undefined`: `NaN` і `-0` не можуть бути ключами"],
        ["`'a'`, `undefined`, `undefined`", "`'a'`, `undefined`, `undefined`"],
        [
          "`'a'`, `'zero'`, `undefined`: `Map` (and `Set`) compare keys with SameValueZero, which is `===` except that `NaN` matches `NaN` and `0` and `-0` are the same key; objects match only by reference, so a new `{}` is a different key",
          "`'a'`, `'zero'`, `undefined`: `Map` (і `Set`) порівнюють ключі через SameValueZero — це `===`, окрім того, що `NaN` збігається з `NaN`, а `0` і `-0` — той самий ключ; об'єкти збігаються лише за посиланням, тож новий `{}` — інший ключ",
        ],
        ["`'a'`, `'zero'`, `'[object Object]'`", "`'a'`, `'zero'`, `'[object Object]'`"],
      ],
      "c",
    ),
    question(
      "map-api",
      [
        "`const m = new Map([['b', 1], ['a', 2]]); m['c'] = 3;` Which statements are true?",
        "`const m = new Map([['b', 1], ['a', 2]]); m['c'] = 3;` Які твердження правильні?",
      ],
      [
        ["`[...m.keys()]` is `['b', 'a']`: a `Map` keeps insertion order", "`[...m.keys()]` дорівнює `['b', 'a']`: `Map` зберігає порядок додавання"],
        ["`m['c'] = 3` only adds a plain property to the object, so `m.size` is still `2` and `m.has('c')` is `false`; use `m.set()`", "`m['c'] = 3` лише додає звичайну властивість об'єкту, тож `m.size` досі `2`, а `m.has('c')` — `false`; використовуйте `m.set()`"],
        ["`Object.fromEntries(m)` turns it into `{ b: 1, a: 2 }`, for example before `JSON.stringify`", "`Object.fromEntries(m)` перетворює його на `{ b: 1, a: 2 }`, наприклад перед `JSON.stringify`"],
        ["A `Map` sorts its keys alphabetically", "`Map` сортує ключі за алфавітом"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "set-uniqueness",
      [
        "What is `new Set([NaN, NaN, 0, -0, 1, '1']).size`, and what does `new Set([1, 2, 3]).intersection(new Set([2, 3, 4]))` give?",
        "Чому дорівнює `new Set([NaN, NaN, 0, -0, 1, '1']).size` і що дає `new Set([1, 2, 3]).intersection(new Set([2, 3, 4]))`?",
      ],
      [
        ["`6`, and a TypeError: sets have no such method", "`6` і TypeError: у множин немає такого методу"],
        ["`3`, and `{1, 4}`", "`3` і `{1, 4}`"],
        ["`5`, and `{2, 3, 4}`", "`5` і `{2, 3, 4}`"],
        [
          "`4` (`NaN`, `0`, `1`, `'1'`), and a new `Set {2, 3}`: duplicates are detected with SameValueZero, so `NaN` and `-0` collapse but `1` and `'1'` stay separate; ES2025 added `union`, `intersection`, `difference` and similar methods that return new sets",
          "`4` (`NaN`, `0`, `1`, `'1'`) і новий `Set {2, 3}`: дублікати визначаються через SameValueZero, тож `NaN` і `-0` зливаються, а `1` і `'1'` лишаються окремими; ES2025 додав `union`, `intersection`, `difference` та подібні методи, що повертають нові множини",
        ],
      ],
      "d",
    ),
  ],
};

/**
 * Questions based on Kyle Simpson's "You Don't Know JS" books, keeping only what the other
 * JavaScript modules don't cover: "Up & Going" ch. 2, "Scope & Closures" ch. 1, 3, 5 and appendices A and C,
 * "this & Object Prototypes" ch. 2, 4, 6 and appendix A, "Types & Grammar" ch. 2 and 4,
 * "Async & Performance" ch. 3 and 5, and "ES6 & Beyond" ch. 3 and 5.
 */
export const ydkjsIntoJsModule: ModuleDef = {
  slug: "ydkjs-into-javascript",
  title: { en: "You Don't Know JS", uk: "You Don't Know JS" },
  slides: [
    { kind: "lecture", slug: "ydkjs-into-js-questions", title: { en: "Questions", uk: "Питання" } },
    ydkjsValuesQuiz,
    ydkjsFunctionsQuiz,
    ydkjsScopeQuiz,
    ydkjsBlockScopeQuiz,
    ydkjsClosureQuiz,
    ydkjsDynamicScopeQuiz,
    ydkjsLexicalThisQuiz,
    ydkjsThisBindingQuiz,
    ydkjsMixinsQuiz,
    ydkjsDelegationQuiz,
    ydkjsClassGotchasQuiz,
    ydkjsValuesInDepthQuiz,
    ydkjsExplicitCoercionQuiz,
    ydkjsImplicitCoercionQuiz,
    ydkjsPromisesQuiz,
    ydkjsWorkersQuiz,
    ydkjsOrganizationQuiz,
    ydkjsCollectionsQuiz,
  ],
};
