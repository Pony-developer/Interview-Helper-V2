import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 52–61 of the JavaScript list: objects. */
export const jsObjectsQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-objects-quiz",
  title: { en: "Objects", uk: "Об'єкти" },
  questions: [
    question(
      "dynamic-keys",
      ["`const key = 'age';` Which of these create an object with an `age` property?", "`const key = 'age';` Що з цього створює об'єкт із властивістю `age`?"],
      [
        ["`const user = {}; user[key] = 25;`", "`const user = {}; user[key] = 25;`"],
        ["`const user = { [key]: 25 };`", "`const user = { [key]: 25 };`"],
        ["`const user = {}; user.key = 25;`", "`const user = {}; user.key = 25;`"],
        ["`const user = { key: 25 };`", "`const user = { key: 25 };`"],
      ],
      ["a", "b"],
    ),
    question(
      "duplicate-keys",
      ["`const obj = { a: 1, b: 2, a: 3 }; console.log(obj);` What is printed?", "`const obj = { a: 1, b: 2, a: 3 }; console.log(obj);` Що виведеться?"],
      [
        ["A SyntaxError", "SyntaxError"],
        ["`{ a: 1, b: 2 }`", "`{ a: 1, b: 2 }`"],
        ["`{ a: [1, 3], b: 2 }`", "`{ a: [1, 3], b: 2 }`"],
        ["`{ a: 3, b: 2 }`: the last value for a key wins", "`{ a: 3, b: 2 }`: перемагає останнє значення для ключа"],
      ],
      "d",
    ),
    question(
      "stringify-replacer",
      [
        "`JSON.stringify({ name: 'GFG', level: 4, company: true }, ['name', 'level'])` returns?",
        "Що повертає `JSON.stringify({ name: 'GFG', level: 4, company: true }, ['name', 'level'])`?",
      ],
      [
        ["`'{\"name\":\"GFG\",\"level\":4,\"company\":true}'`", "`'{\"name\":\"GFG\",\"level\":4,\"company\":true}'`"],
        ["`'{\"name\":\"GFG\",\"level\":4}'`: an array as the second argument lists the keys to keep", "`'{\"name\":\"GFG\",\"level\":4}'`: масив у другому аргументі перелічує ключі, які треба залишити"],
        ["`'[\"name\",\"level\"]'`", "`'[\"name\",\"level\"]'`"],
        ["A TypeError", "TypeError"],
      ],
      "b",
    ),
    question(
      "create-objects",
      ["What is special about `Object.create(null)` compared with `{}` and `new Object()`?", "Чим особливий `Object.create(null)` порівняно з `{}` і `new Object()`?"],
      [
        [
          "It has no prototype, so no inherited keys like `toString` or `constructor`, which makes it a safe dictionary; `{}` and `new Object()` are equivalent, and the literal is preferred",
          "Він не має прототипу, тож немає успадкованих ключів на кшталт `toString` чи `constructor`, і це безпечний словник; `{}` і `new Object()` рівнозначні, і перевагу надають літералу",
        ],
        ["It creates a frozen object", "Він створює заморожений об'єкт"],
        ["It is the same as `null`", "Це те саме, що `null`"],
        ["It creates an array", "Він створює масив"],
      ],
      "a",
    ),
    question(
      "keys-values-entries",
      ["`const o = { a: 1, b: 2 };` What does `Object.entries(o)` return?", "`const o = { a: 1, b: 2 };` Що повертає `Object.entries(o)`?"],
      [
        ["`['a', 'b']`", "`['a', 'b']`"],
        ["`[1, 2]`", "`[1, 2]`"],
        ["`[['a', 1], ['b', 2]]`; `Object.keys` gives the keys, `Object.values` the values, and `Object.fromEntries` turns pairs back into an object", "`[['a', 1], ['b', 2]]`; `Object.keys` дає ключі, `Object.values` — значення, а `Object.fromEntries` перетворює пари назад на об'єкт"],
        ["`{ a: 1, b: 2 }`", "`{ a: 1, b: 2 }`"],
      ],
      "c",
    ),
    question(
      "merge-objects",
      ["Which statements about merging objects are true?", "Які твердження про об'єднання об'єктів правильні?"],
      [
        ["`{ ...a, ...b }` creates a new object; for the same key, the value from `b` wins", "`{ ...a, ...b }` створює новий об'єкт; для однакового ключа перемагає значення з `b`"],
        ["`Object.assign(a, b)` copies `b` into `a` and changes `a`", "`Object.assign(a, b)` копіює `b` в `a` і змінює `a`"],
        ["Both merge nested objects deeply", "Обидва глибоко об'єднують вкладені об'єкти"],
        ["`Object.assign({}, a, b)` gives the same result as `{ ...a, ...b }` without changing `a`", "`Object.assign({}, a, b)` дає той самий результат, що й `{ ...a, ...b }`, не змінюючи `a`"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "object-references",
      [
        "What does this print?\n\n```js\nlet obj1 = { name: 'GFG' };\nconst list = [obj1];\nconst obj2 = obj1;\nobj1.name = 'Geeks';\nobj1 = null;\nconsole.log(obj2.name, list[0].name);\n```",
        "Що виведе цей код?\n\n```js\nlet obj1 = { name: 'GFG' };\nconst list = [obj1];\nconst obj2 = obj1;\nobj1.name = 'Geeks';\nobj1 = null;\nconsole.log(obj2.name, list[0].name);\n```",
      ],
      [
        ["`'GFG' 'GFG'`", "`'GFG' 'GFG'`"],
        ["A TypeError, because the object was set to `null`", "TypeError, бо об'єкт встановлено в `null`"],
        ["`'Geeks' undefined`", "`'Geeks' undefined`"],
        [
          "`'Geeks' 'Geeks'`: all three point to one object, and `obj1 = null` only changes that variable, not the object",
          "`'Geeks' 'Geeks'`: усі три вказують на один об'єкт, а `obj1 = null` змінює лише цю змінну, а не сам об'єкт",
        ],
      ],
      "d",
    ),
    question(
      "freeze-seal",
      ["Which pairing is correct?", "Яке поєднання правильне?"],
      [
        [
          "`freeze`: no adding, removing or changing; `seal`: no adding or removing, but values can change; `preventExtensions`: only adding is blocked; all three are shallow",
          "`freeze`: не можна додавати, видаляти чи змінювати; `seal`: не можна додавати й видаляти, але значення змінювати можна; `preventExtensions`: заблоковано лише додавання; усі три поверхневі",
        ],
        ["`seal` blocks everything, `freeze` only adding", "`seal` блокує все, а `freeze` — лише додавання"],
        ["All three freeze nested objects too", "Усі три заморожують і вкладені об'єкти"],
        ["They only work on arrays", "Вони працюють лише з масивами"],
      ],
      "a",
    ),
    question(
      "object-as-key",
      [
        "What does this print?\n\n```js\nconst obj1 = {};\nconst obj2 = { key: 'b' };\nconst obj3 = { key: 'c' };\nobj1[obj2] = 123;\nobj1[obj3] = 234;\nconsole.log(obj1[obj2]);\n```",
        "Що виведе цей код?\n\n```js\nconst obj1 = {};\nconst obj2 = { key: 'b' };\nconst obj3 = { key: 'c' };\nobj1[obj2] = 123;\nobj1[obj3] = 234;\nconsole.log(obj1[obj2]);\n```",
      ],
      [
        ["`123`", "`123`"],
        ["`undefined`", "`undefined`"],
        [
          "`234`: object keys are converted to the string `'[object Object]'`, so both writes use the same key; a `Map` keeps objects as real keys",
          "`234`: ключі-об'єкти перетворюються на рядок `'[object Object]'`, тож обидва записи йдуть в один ключ; `Map` зберігає об'єкти як справжні ключі",
        ],
        ["A TypeError", "TypeError"],
      ],
      "c",
    ),
    question(
      "multiply-by-two",
      [
        "Which implementation of `multiplyByTwo(obj)` doubles every numeric value and leaves the rest alone?",
        "Яка реалізація `multiplyByTwo(obj)` подвоює кожне числове значення й не чіпає решту?",
      ],
      [
        ["`for (const key in obj) obj[key] *= 2;`", "`for (const key in obj) obj[key] *= 2;`"],
        [
          "`for (const key in obj) if (typeof obj[key] === 'number') obj[key] *= 2;`",
          "`for (const key in obj) if (typeof obj[key] === 'number') obj[key] *= 2;`",
        ],
        ["`obj.map(v => v * 2);`", "`obj.map(v => v * 2);`"],
        ["`for (const value of obj) value *= 2;`", "`for (const value of obj) value *= 2;`"],
      ],
      "b",
    ),
  ],
};

/** Questions 62–73 of the JavaScript list: advanced topics. */
export const jsAdvancedQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-advanced-quiz",
  title: { en: "Advanced topics", uk: "Просунуті теми" },
  questions: [
    question(
      "loops",
      ["Which loop always runs its body at least once?", "Який цикл завжди виконує тіло хоча б один раз?"],
      [
        ["`while`", "`while`"],
        ["`for`", "`for`"],
        ["`for...of`", "`for...of`"],
        ["`do...while`, because it checks the condition after the body", "`do...while`, бо перевіряє умову після тіла"],
      ],
      "d",
    ),
    question(
      "class-style",
      ["Which is the preferred way to toggle a CSS class on an element?", "Який спосіб перемикання CSS-класу на елементі кращий?"],
      [
        [
          "`el.classList.toggle('active')` (with `add` and `remove`), which leaves the other classes alone; `el.className = 'x'` replaces them all, and `el.style.color` sets inline styles",
          "`el.classList.toggle('active')` (разом з `add` і `remove`), що не чіпає інших класів; `el.className = 'x'` замінює їх усі, а `el.style.color` задає inline-стилі",
        ],
        ["`el.className += ' active'` every time", "`el.className += ' active'` щоразу"],
        ["`el.style.class = 'active'`", "`el.style.class = 'active'`"],
        ["Rewriting the element's `outerHTML`", "Переписати `outerHTML` елемента"],
      ],
      "a",
    ),
    question(
      "dialogs",
      ["What do `confirm()` and `prompt()` return?", "Що повертають `confirm()` і `prompt()`?"],
      [
        ["Both return a promise", "Обидва повертають проміс"],
        [
          "`confirm` returns `true` or `false`, `prompt` returns the entered string or `null` if cancelled; like `alert`, they block the page until closed",
          "`confirm` повертає `true` чи `false`, `prompt` — введений рядок або `null`, якщо скасовано; як і `alert`, вони блокують сторінку, доки їх не закриють",
        ],
        ["Both return `undefined`", "Обидва повертають `undefined`"],
        ["`confirm` returns a string, `prompt` a boolean", "`confirm` повертає рядок, а `prompt` — булеве значення"],
      ],
      "b",
    ),
    question(
      "inner-html",
      ["Which of these are disadvantages of `innerHTML`?", "Що з цього — недоліки `innerHTML`?"],
      [
        ["Inserting user input with it opens the door to XSS", "Вставлення через нього даних користувача відкриває шлях до XSS"],
        ["It re-parses and recreates the whole subtree, which also drops existing event listeners and state", "Він заново розбирає й створює все піддерево, що також прибирає наявні обробники подій і стан"],
        ["It cannot insert any HTML tags", "Він не може вставляти жодних HTML-тегів"],
        ["`el.innerHTML += '...'` rebuilds all the existing content each time", "`el.innerHTML += '...'` щоразу перебудовує весь наявний вміст"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "void-zero",
      ["What is `<a href=\"javascript:void(0)\" onclick=\"run()\">` for, and what is better today?", "Для чого `<a href=\"javascript:void(0)\" onclick=\"run()\">` і що краще сьогодні?"],
      [
        ["It opens a new tab", "Він відкриває нову вкладку"],
        ["It reloads the page", "Він перезавантажує сторінку"],
        [
          "`void(0)` evaluates to `undefined`, so the link doesn't navigate; for an action, a `<button>` is better, and for a real link, `event.preventDefault()` in a listener",
          "`void(0)` дає `undefined`, тож посилання нікуди не переходить; для дії краще `<button>`, а для справжнього посилання — `event.preventDefault()` в обробнику",
        ],
        ["It makes the link faster", "Він пришвидшує посилання"],
      ],
      "c",
    ),
    question(
      "cookies-js",
      ["Which statements about working with cookies from JavaScript are true?", "Які твердження про роботу з cookies з JavaScript правильні?"],
      [
        ["Writing `document.cookie = 'theme=dark; max-age=86400; path=/'` adds or updates one cookie, not all of them", "Запис `document.cookie = 'theme=dark; max-age=86400; path=/'` додає чи оновлює одну cookie, а не всі"],
        ["Reading `document.cookie` returns all visible cookies as one `name=value; ...` string that you parse", "Читання `document.cookie` повертає всі доступні cookies одним рядком `name=value; ...`, який треба розібрати"],
        ["You delete a cookie by setting `max-age=0` (or a past `expires`) with the same `path` and domain", "Cookie видаляють, задавши `max-age=0` (чи `expires` у минулому) з тим самим `path` і доменом"],
        ["JavaScript can read `HttpOnly` cookies", "JavaScript може читати cookies з `HttpOnly`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "escape",
      ["What should you use instead of the deprecated `escape()` to put a value into a URL?", "Що використовувати замість застарілої `escape()`, щоб вставити значення в URL?"],
      [
        ["`encodeURIComponent(value)`, for example for query parameters", "`encodeURIComponent(value)`, наприклад для параметрів запиту"],
        ["`JSON.stringify(value)`", "`JSON.stringify(value)`"],
        ["Backslashes before every character", "Зворотні слеші перед кожним символом"],
        ["`btoa(value)`", "`btoa(value)`"],
      ],
      "a",
    ),
    question(
      "blur",
      ["Which statement about `blur` is true?", "Яке твердження про `blur` правильне?"],
      [
        ["`el.blur()` blurs the element visually with a CSS filter", "`el.blur()` візуально розмиває елемент CSS-фільтром"],
        [
          "`el.blur()` removes focus from the element; the `blur` event doesn't bubble, so for delegation you listen to `focusout`",
          "`el.blur()` знімає фокус з елемента; подія `blur` не спливає, тож для делегування слухають `focusout`",
        ],
        ["The `blur` event bubbles like `click`", "Подія `blur` спливає, як `click`"],
        ["`blur()` deletes the element", "`blur()` видаляє елемент"],
      ],
      "b",
    ),
    question(
      "files",
      ["How do you read and write files with JavaScript?", "Як читати й записувати файли за допомогою JavaScript?"],
      [
        ["The browser can read and write any file on the disk with `fs`", "Браузер може читати й записувати будь-який файл на диску через `fs`"],
        ["It is impossible in JavaScript", "У JavaScript це неможливо"],
        ["Only with cookies", "Лише через cookies"],
        [
          "In Node.js with `fs.readFile` / `fs.writeFile`; in the browser you read a file the user picks (`<input type=\"file\">`, `file.text()`) and save by downloading a `Blob` or with the File System Access API",
          "У Node.js — через `fs.readFile` / `fs.writeFile`; у браузері читають файл, який обрав користувач (`<input type=\"file\">`, `file.text()`), а зберігають завантаженням `Blob` чи через File System Access API",
        ],
      ],
      "d",
    ),
    question(
      "detect-os",
      ["What is the best practice for detecting the user's operating system?", "Яка найкраща практика визначення операційної системи користувача?"],
      [
        [
          "Prefer feature detection; when the OS really matters, read `navigator.userAgentData.platform` where supported, falling back to parsing `navigator.userAgent`, which is unreliable",
          "Надавати перевагу перевірці можливостей (feature detection); коли ОС справді важлива, читати `navigator.userAgentData.platform`, де він підтримується, з запасним розбором `navigator.userAgent`, який ненадійний",
        ],
        ["Read the OS from `document.os`", "Прочитати ОС із `document.os`"],
        ["Ask the server, which always knows the OS", "Запитати сервер, який завжди знає ОС"],
        ["It is impossible", "Це неможливо"],
      ],
      "a",
    ),
    question(
      "rest-last",
      ["Why does `function Items(list, ...param, list2) {}` throw a SyntaxError?", "Чому `function Items(list, ...param, list2) {}` кидає SyntaxError?"],
      [
        ["Functions can't have more than two parameters", "Функції не можуть мати більше двох параметрів"],
        ["`list` is a reserved word", "`list` — зарезервоване слово"],
        ["A rest parameter collects all remaining arguments, so it must be the last parameter", "Rest-параметр збирає всі решту аргументів, тож він мусить бути останнім"],
        ["Rest parameters only work in arrow functions", "Rest-параметри працюють лише в стрілкових функціях"],
      ],
      "c",
    ),
    question(
      "default-param-spread",
      [
        "What does this print?\n\n```js\nlet obj = { num: 2 };\nconst fun = (x = { ...obj }) => {\n  console.log((x.num /= 2));\n};\nfun();\nfun();\nfun(obj);\nfun(obj);\n```",
        "Що виведе цей код?\n\n```js\nlet obj = { num: 2 };\nconst fun = (x = { ...obj }) => {\n  console.log((x.num /= 2));\n};\nfun();\nfun();\nfun(obj);\nfun(obj);\n```",
      ],
      [
        ["`1 0.5 0.25 0.125`", "`1 0.5 0.25 0.125`"],
        ["`1 1 1 1`", "`1 1 1 1`"],
        ["`1 1 0.5 0.25`", "`1 1 0.5 0.25`"],
        [
          "`1 1 1 0.5`: each call without an argument makes a fresh copy, so `obj` is untouched until it is passed in directly",
          "`1 1 1 0.5`: кожен виклик без аргументу створює нову копію, тож `obj` не змінюється, доки його не передадуть напряму",
        ],
      ],
      "d",
    ),
  ],
};
