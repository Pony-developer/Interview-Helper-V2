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

/**
 * Questions based on Kyle Simpson's "You Don't Know JS" books, keeping only what the other
 * JavaScript modules don't cover: "Up & Going" ch. 2 and "Scope & Closures" ch. 1, 3 and 5.
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
  ],
};
