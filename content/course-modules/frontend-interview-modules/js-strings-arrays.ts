import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 25–38 of the JavaScript list: strings. */
export const jsStringsQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-strings-quiz",
  title: { en: "Strings", uk: "Рядки" },
  questions: [
    question(
      "slice-substring",
      ["What do `'Hello World'.slice(-5)` and `'Hello World'.substring(-5)` return?", "Що повертають `'Hello World'.slice(-5)` і `'Hello World'.substring(-5)`?"],
      [
        ["Both `'World'`", "Обидва `'World'`"],
        [
          "`'World'` and `'Hello World'`: `slice` counts negative indexes from the end, `substring` treats them as `0` (and `substr(start, length)` is deprecated)",
          "`'World'` і `'Hello World'`: `slice` рахує від'ємні індекси з кінця, а `substring` вважає їх нулем (а `substr(start, length)` застарів)",
        ],
        ["Both throw a RangeError", "Обидва кидають RangeError"],
        ["`'Hello'` and `'World'`", "`'Hello'` і `'World'`"],
      ],
      "b",
    ),
    question(
      "string-search",
      ["What does `'Hello World'.indexOf('world')` return?", "Що повертає `'Hello World'.indexOf('world')`?"],
      [
        ["`6`", "`6`"],
        ["`true`", "`true`"],
        ["`undefined`", "`undefined`"],
        ["`-1`: the search is case-sensitive, and `indexOf` returns `-1` when there is no match", "`-1`: пошук чутливий до регістру, а `indexOf` повертає `-1`, коли збігу немає"],
      ],
      "d",
    ),
    question(
      "replace-all",
      ["What does `'a-b-c'.replace('-', '+')` return?", "Що повертає `'a-b-c'.replace('-', '+')`?"],
      [
        ["`'a+b-c'`: with a string pattern only the first match is replaced; use `replaceAll` or a regex with the `g` flag for all", "`'a+b-c'`: із рядковим шаблоном замінюється лише перший збіг; для всіх — `replaceAll` або regex із прапорцем `g`"],
        ["`'a+b+c'`", "`'a+b+c'`"],
        ["`'a-b-c'`: strings can't be changed", "`'a-b-c'`: рядки не можна змінювати"],
        ["A TypeError", "TypeError"],
      ],
      "a",
    ),
    question(
      "split-chars",
      ["Why is `[...str]` safer than `str.split('')` for getting an array of characters?", "Чому `[...str]` безпечніший за `str.split('')`, щоб отримати масив символів?"],
      [
        ["`split('')` returns a string, not an array", "`split('')` повертає рядок, а не масив"],
        ["There is no difference", "Різниці немає"],
        [
          "`split('')` cuts by UTF-16 code units and breaks characters such as emoji into halves; spreading iterates by code points",
          "`split('')` ріже за кодовими одиницями UTF-16 і розбиває символи на кшталт емодзі на половинки; розгортання ітерує за кодовими точками",
        ],
        ["Spreading a string is not allowed", "Розгортати рядок не можна"],
      ],
      "c",
    ),
    question(
      "charat",
      ["What do `'Hello'.charAt(10)` and `'Hello'[10]` return?", "Що повертають `'Hello'.charAt(10)` і `'Hello'[10]`?"],
      [
        ["Both `undefined`", "Обидва `undefined`"],
        ["Both throw a RangeError", "Обидва кидають RangeError"],
        ["`'o'` and `'o'`", "`'o'` і `'o'`"],
        ["`''` (an empty string) and `undefined`", "`''` (порожній рядок) і `undefined`"],
      ],
      "d",
    ),
    question(
      "pad-start",
      ["What does `'5'.padStart(3, '0')` return?", "Що повертає `'5'.padStart(3, '0')`?"],
      [
        ["`'500'`", "`'500'`"],
        ["`'005'`", "`'005'`"],
        ["`'0005'`", "`'0005'`"],
        ["`5`", "`5`"],
      ],
      "b",
    ),
    question(
      "case-immutable",
      ["`let s = 'Hello'; s.toUpperCase(); console.log(s);` What is printed?", "`let s = 'Hello'; s.toUpperCase(); console.log(s);` Що виведеться?"],
      [
        ["`'Hello'`: strings are immutable, so `toUpperCase` returns a new string that was never stored", "`'Hello'`: рядки незмінні, тож `toUpperCase` повертає новий рядок, який ніде не збережено"],
        ["`'HELLO'`", "`'HELLO'`"],
        ["`undefined`", "`undefined`"],
        ["A TypeError", "TypeError"],
      ],
      "a",
    ),
    question(
      "compare-strings",
      ["How do you sort an array of names alphabetically, respecting the language's rules?", "Як відсортувати масив імен за абеткою з урахуванням правил мови?"],
      [
        ["`names.sort((a, b) => a - b)`", "`names.sort((a, b) => a - b)`"],
        ["`names.sort((a, b) => a > b)`", "`names.sort((a, b) => a > b)`"],
        [
          "`names.sort((a, b) => a.localeCompare(b, 'uk'))`: it returns a negative number, zero or a positive number and knows the alphabet's order",
          "`names.sort((a, b) => a.localeCompare(b, 'uk'))`: він повертає від'ємне число, нуль чи додатне й знає порядок літер в абетці",
        ],
        ["`names.reverse()`", "`names.reverse()`"],
      ],
      "c",
    ),
    question(
      "match-all",
      ["Why is `str.matchAll(/(\\d+)-(\\d+)/g)` often better than a loop with `regex.exec()`?", "Чому `str.matchAll(/(\\d+)-(\\d+)/g)` часто кращий за цикл із `regex.exec()`?"],
      [
        ["`matchAll` works without the `g` flag", "`matchAll` працює без прапорця `g`"],
        ["`exec` cannot return capture groups", "`exec` не може повертати групи захоплення"],
        ["`matchAll` returns a single string", "`matchAll` повертає один рядок"],
        [
          "It returns an iterator of full match objects with their groups and doesn't depend on the regex's mutable `lastIndex`, so it is shorter and avoids infinite-loop bugs",
          "Він повертає ітератор повних об'єктів збігів із групами й не залежить від змінного `lastIndex` регулярного виразу, тож код коротший і без багів із нескінченним циклом",
        ],
      ],
      "d",
    ),
    question(
      "parse-number",
      ["What do `parseInt('FF', 16)`, `parseInt('12px')` and `Number('12px')` return?", "Що повертають `parseInt('FF', 16)`, `parseInt('12px')` і `Number('12px')`?"],
      [
        ["`255`, `12` and `NaN`: `parseInt` stops at the first invalid character, `Number` needs the whole string to be a number", "`255`, `12` і `NaN`: `parseInt` зупиняється на першому неприпустимому символі, а `Number` вимагає, щоб увесь рядок був числом"],
        ["`NaN`, `12` and `12`", "`NaN`, `12` і `12`"],
        ["`255`, `NaN` and `NaN`", "`255`, `NaN` і `NaN`"],
        ["`15`, `12` and `12`", "`15`, `12` і `12`"],
      ],
      "a",
    ),
    question(
      "reverse-string",
      ["Which expression reverses a string?", "Який вираз перевертає рядок?"],
      [
        ["`str.reverse()`", "`str.reverse()`"],
        ["`[...str].reverse().join('')`", "`[...str].reverse().join('')`"],
        ["`str.split().reverse()`", "`str.split().reverse()`"],
        ["`str.sort().reverse()`", "`str.sort().reverse()`"],
      ],
      "b",
    ),
    question(
      "count-words",
      ["What are the problems with counting words as `str.match(/\\w+/g).length`?", "Які проблеми з підрахунком слів як `str.match(/\\w+/g).length`?"],
      [
        [
          "`match` returns `null` when there are no matches, so `.length` throws; and `\\w` matches only Latin letters, digits and `_`, so Cyrillic words aren't counted (use `/\\p{L}+/gu`)",
          "`match` повертає `null`, коли збігів немає, тож `.length` кидає помилку; а `\\w` знаходить лише латинські літери, цифри й `_`, тож кириличні слова не рахуються (використовуйте `/\\p{L}+/gu`)",
        ],
        ["There are no problems", "Проблем немає"],
        ["`match` cannot take the `g` flag", "`match` не приймає прапорець `g`"],
        ["It counts characters, not words", "Він рахує символи, а не слова"],
      ],
      "a",
    ),
    question(
      "longest-word",
      [
        "What does this return?\n\n```js\n'JavaScript is awesome'\n  .split(' ')\n  .reduce((longest, word) => (word.length > longest.length ? word : longest), '');\n```",
        "Що поверне цей код?\n\n```js\n'JavaScript is awesome'\n  .split(' ')\n  .reduce((longest, word) => (word.length > longest.length ? word : longest), '');\n```",
      ],
      [
        ["`'awesome'`", "`'awesome'`"],
        ["`10`", "`10`"],
        ["`'JavaScript'`", "`'JavaScript'`"],
        ["`['JavaScript']`", "`['JavaScript']`"],
      ],
      "c",
    ),
    question(
      "slug",
      [
        "What does this return?\n\n```js\n'JavaScript Tips & Tricks!'\n  .toLowerCase()\n  .replace(/[^a-z0-9]+/g, '-')\n  .replace(/^-|-$/g, '');\n```",
        "Що поверне цей код?\n\n```js\n'JavaScript Tips & Tricks!'\n  .toLowerCase()\n  .replace(/[^a-z0-9]+/g, '-')\n  .replace(/^-|-$/g, '');\n```",
      ],
      [
        ["`'javascript-tips-&-tricks!'`", "`'javascript-tips-&-tricks!'`"],
        ["`'javascripttipstricks'`", "`'javascripttipstricks'`"],
        ["`'javascript-tips--tricks-'`", "`'javascript-tips--tricks-'`"],
        ["`'javascript-tips-tricks'`", "`'javascript-tips-tricks'`"],
      ],
      "d",
    ),
  ],
};

/** Questions 39–51 of the JavaScript list: arrays. */
export const jsArraysQuiz: SlideDef = {
  kind: "quiz",
  slug: "js-arrays-quiz",
  title: { en: "Arrays", uk: "Масиви" },
  questions: [
    question(
      "push-unshift",
      ["Which statements about `push`, `pop`, `shift` and `unshift` are true?", "Які твердження про `push`, `pop`, `shift` і `unshift` правильні?"],
      [
        ["`push` and `unshift` add to the end and the start and return the new length", "`push` і `unshift` додають у кінець і на початок та повертають нову довжину"],
        ["`pop` and `shift` remove from the end and the start and return the removed element", "`pop` і `shift` видаляють з кінця й з початку та повертають видалений елемент"],
        ["All four return a new array and leave the original unchanged", "Усі чотири повертають новий масив і не змінюють початковий"],
        ["`shift` and `unshift` are slower on large arrays because every other element has to move", "`shift` і `unshift` повільніші на великих масивах, бо всі інші елементи мають зсунутися"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "is-array",
      ["How do you reliably check that a value is an array?", "Як надійно перевірити, що значення є масивом?"],
      [
        ["`typeof value === 'array'`", "`typeof value === 'array'`"],
        ["`Array.isArray(value)`, because `typeof []` is `'object'`", "`Array.isArray(value)`, бо `typeof []` дорівнює `'object'`"],
        ["`value.length > 0`", "`value.length > 0`"],
        ["`value instanceof Object`", "`value instanceof Object`"],
      ],
      "b",
    ),
    question(
      "copy-arrays",
      ["Which statements about `[...a, ...b]` and `a.concat(b)` are true?", "Які твердження про `[...a, ...b]` і `a.concat(b)` правильні?"],
      [
        ["Both create a new array and leave `a` and `b` unchanged", "Обидва створюють новий масив і не змінюють `a` та `b`"],
        ["Both copy deeply, so nested objects are independent", "Обидва копіюють глибоко, тож вкладені об'єкти незалежні"],
        ["`[...a]` and `Array.from(a)` make a shallow copy of a single array", "`[...a]` і `Array.from(a)` роблять поверхневу копію одного масиву"],
        ["`concat` modifies `a`", "`concat` змінює `a`"],
      ],
      ["a", "c"],
    ),
    question(
      "some-every",
      ["What do `[].some(x => x > 0)` and `[].every(x => x > 0)` return?", "Що повертають `[].some(x => x > 0)` і `[].every(x => x > 0)`?"],
      [
        ["`false` and `false`", "`false` і `false`"],
        ["`true` and `true`", "`true` і `true`"],
        ["`false` and `true`: no element passes the test, and no element fails it", "`false` і `true`: жоден елемент не проходить перевірку, і жоден її не провалює"],
        ["Both throw a TypeError", "Обидва кидають TypeError"],
      ],
      "c",
    ),
    question(
      "find-filter",
      ["How does `find()` differ from `filter()`, and what does `findLast()` add?", "Чим `find()` відрізняється від `filter()` і що додає `findLast()`?"],
      [
        [
          "`find` returns the first matching element (or `undefined`) and stops; `filter` returns a new array of all matches; `findLast` searches from the end, for example for the latest matching entry",
          "`find` повертає перший відповідний елемент (або `undefined`) і зупиняється; `filter` повертає новий масив усіх збігів; `findLast` шукає з кінця, наприклад останній відповідний запис",
        ],
        ["They are the same", "Вони однакові"],
        ["`filter` returns the first match, `find` all of them", "`filter` повертає перший збіг, а `find` усі"],
        ["`findLast` sorts the array first", "`findLast` спершу сортує масив"],
      ],
      "a",
    ),
    question(
      "includes-indexof",
      ["What do `[NaN].includes(NaN)` and `[NaN].indexOf(NaN)` return?", "Що повертають `[NaN].includes(NaN)` і `[NaN].indexOf(NaN)`?"],
      [
        ["`true` and `0`", "`true` і `0`"],
        ["`false` and `-1`", "`false` і `-1`"],
        ["`false` and `0`", "`false` і `0`"],
        ["`true` and `-1`: `includes` finds `NaN`, while `indexOf` uses `===`, and `NaN !== NaN`", "`true` і `-1`: `includes` знаходить `NaN`, а `indexOf` порівнює через `===`, і `NaN !== NaN`"],
      ],
      "d",
    ),
    question(
      "mutating-methods",
      ["`const a = [1, 2, 3]; const b = a.reverse();` What are `a` and `b`?", "`const a = [1, 2, 3]; const b = a.reverse();` Чому дорівнюють `a` і `b`?"],
      [
        ["`a` is `[1, 2, 3]` and `b` is `[3, 2, 1]`", "`a` — `[1, 2, 3]`, а `b` — `[3, 2, 1]`"],
        [
          "Both are `[3, 2, 1]` and are the same array: `reverse` mutates in place; `toReversed()` returns a new array instead",
          "Обидва `[3, 2, 1]` і це той самий масив: `reverse` змінює масив на місці; натомість `toReversed()` повертає новий",
        ],
        ["`b` is `undefined`", "`b` дорівнює `undefined`"],
        ["`a` is `[3, 2, 1]` and `b` is `[1, 2, 3]`", "`a` — `[3, 2, 1]`, а `b` — `[1, 2, 3]`"],
      ],
      "b",
    ),
    question(
      "fill",
      [
        "What is the problem here?\n\n```js\nconst grid = new Array(3).fill([]);\ngrid[0].push('x');\n```",
        "У чому проблема?\n\n```js\nconst grid = new Array(3).fill([]);\ngrid[0].push('x');\n```",
      ],
      [
        ["`fill` cannot take an array", "`fill` не може приймати масив"],
        ["`push` is not allowed on nested arrays", "`push` заборонений для вкладених масивів"],
        [
          "All three slots hold the same array, so every row now contains `'x'`; use `Array.from({ length: 3 }, () => [])`",
          "Усі три слоти містять той самий масив, тож тепер `'x'` є в кожному рядку; використовуйте `Array.from({ length: 3 }, () => [])`",
        ],
        ["There is no problem", "Проблеми немає"],
      ],
      "c",
    ),
    question(
      "splice",
      [
        "`const fruits = ['apple', 'banana', 'cherry']; const removed = fruits.splice(1, 1, 'mango', 'grape');` What are `fruits` and `removed`?",
        "`const fruits = ['apple', 'banana', 'cherry']; const removed = fruits.splice(1, 1, 'mango', 'grape');` Чому дорівнюють `fruits` і `removed`?",
      ],
      [
        ["`fruits` is unchanged and `removed` is `['mango', 'grape']`", "`fruits` не змінився, а `removed` — `['mango', 'grape']`"],
        ["`fruits` is `['apple', 'mango', 'grape', 'cherry']` and `removed` is `['banana']`", "`fruits` — `['apple', 'mango', 'grape', 'cherry']`, а `removed` — `['banana']`"],
        ["`fruits` is `['mango', 'grape']` and `removed` is `3`", "`fruits` — `['mango', 'grape']`, а `removed` — `3`"],
        ["`fruits` is `['apple', 'mango', 'grape']` and `removed` is `'cherry'`", "`fruits` — `['apple', 'mango', 'grape']`, а `removed` — `'cherry'`"],
      ],
      "b",
    ),
    question(
      "array-like",
      ["Which of these turn array-like objects (a `NodeList`, `arguments`) into real arrays?", "Що з цього перетворює масивоподібні об'єкти (`NodeList`, `arguments`) на справжні масиви?"],
      [
        ["`Array.from(nodeList)`", "`Array.from(nodeList)`"],
        ["`[...nodeList]`", "`[...nodeList]`"],
        ["`Array.from({ length: 3 }, (_, i) => i)`, which gives `[0, 1, 2]`", "`Array.from({ length: 3 }, (_, i) => i)`, що дає `[0, 1, 2]`"],
        ["`nodeList.toArray()`", "`nodeList.toArray()`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "flatmap",
      ["What does `[1, 2, 3].flatMap(n => [n, n * 2])` return?", "Що повертає `[1, 2, 3].flatMap(n => [n, n * 2])`?"],
      [
        ["`[[1, 2], [2, 4], [3, 6]]`", "`[[1, 2], [2, 4], [3, 6]]`"],
        ["`[2, 4, 6]`", "`[2, 4, 6]`"],
        ["`[1, 2, 3, 2, 4, 6]`", "`[1, 2, 3, 2, 4, 6]`"],
        ["`[1, 2, 2, 4, 3, 6]`", "`[1, 2, 2, 4, 3, 6]`"],
      ],
      "d",
    ),
    question(
      "sort",
      ["What does `[10, 2, 30, 4].sort()` return?", "Що повертає `[10, 2, 30, 4].sort()`?"],
      [
        [
          "`[10, 2, 30, 4]`: by default elements are compared as strings; for numbers pass `(a, b) => a - b`, and for objects `(a, b) => a.age - b.age`",
          "`[10, 2, 30, 4]`: за замовчуванням елементи порівнюються як рядки; для чисел передайте `(a, b) => a - b`, а для об'єктів — `(a, b) => a.age - b.age`",
        ],
        ["`[2, 4, 10, 30]`", "`[2, 4, 10, 30]`"],
        ["`[30, 10, 4, 2]`", "`[30, 10, 4, 2]`"],
        ["A new array, leaving the original unchanged", "Новий масив, не змінюючи початкового"],
      ],
      "a",
    ),
    question(
      "deep-copy",
      ["Which statement about shallow and deep copies is true?", "Яке твердження про поверхневу й глибоку копії правильне?"],
      [
        ["`{ ...obj }` copies nested objects too", "`{ ...obj }` копіює й вкладені об'єкти"],
        ["`JSON.parse(JSON.stringify(obj))` preserves dates, `Map`s and functions", "`JSON.parse(JSON.stringify(obj))` зберігає дати, `Map` і функції"],
        [
          "A shallow copy shares nested objects with the original; `structuredClone(obj)` makes a deep copy and handles dates, `Map`s and cycles (but not functions)",
          "Поверхнева копія ділить вкладені об'єкти з оригіналом; `structuredClone(obj)` робить глибоку копію й підтримує дати, `Map` і цикли (але не функції)",
        ],
        ["JavaScript has no way to make a deep copy", "У JavaScript немає способу зробити глибоку копію"],
      ],
      "c",
    ),
  ],
};
