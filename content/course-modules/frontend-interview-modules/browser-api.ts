import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 104–112 of the list: browser APIs. */
export const browserApiQuiz: SlideDef = {
  kind: "quiz",
  slug: "browser-api-quiz",
  title: { en: "Browser APIs", uk: "API браузера" },
  questions: [
    question(
      "dom",
      ["What is the DOM?", "Що таке DOM?"],
      [
        ["A database built into the browser", "База даних, вбудована в браузер"],
        [
          "A tree of objects that the browser builds from the HTML; scripts read and change the page through it",
          "Дерево об'єктів, яке браузер будує з HTML; через нього скрипти читають і змінюють сторінку",
        ],
        ["The server's file system", "Файлова система сервера"],
        ["A CSS framework", "CSS-фреймворк"],
      ],
      "b",
    ),
    question(
      "js-dom",
      ["Which of these are ways JavaScript works with the DOM?", "Які з цих способів JavaScript використовує для роботи з DOM?"],
      [
        ["Finding elements: `querySelector`, `getElementById`", "Пошук елементів: `querySelector`, `getElementById`"],
        ["Changing content and attributes: `textContent`, `classList`, `setAttribute`", "Зміна вмісту й атрибутів: `textContent`, `classList`, `setAttribute`"],
        ["Creating and inserting nodes: `createElement`, `append`", "Створення й вставлення вузлів: `createElement`, `append`"],
        ["Editing the HTML file on the server", "Редагування HTML-файлу на сервері"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "ajax",
      ["What is AJAX?", "Що таке AJAX?"],
      [
        ["A JavaScript framework", "JavaScript-фреймворк"],
        ["A file format", "Формат файлів"],
        [
          "Exchanging data with the server in the background, without reloading the page (XMLHttpRequest, today usually `fetch`)",
          "Обмін даними із сервером у фоні, без перезавантаження сторінки (XMLHttpRequest, а сьогодні зазвичай `fetch`)",
        ],
        ["A CSS animation library", "Бібліотека CSS-анімацій"],
      ],
      "c",
    ),
    question(
      "fetch",
      [
        "`const res = await fetch('/api/users')`, and the server answers with 404. What happens?",
        "`const res = await fetch('/api/users')`, а сервер відповідає 404. Що станеться?",
      ],
      [
        ["`fetch` throws an error", "`fetch` кидає помилку"],
        [
          "The promise resolves; `res.ok` is `false` and `res.status` is `404`, so the code has to check it",
          "Проміс виконується успішно; `res.ok` дорівнює `false`, а `res.status` — `404`, тож код має перевірити це сам",
        ],
        ["`fetch` returns `null`", "`fetch` повертає `null`"],
        ["The page reloads", "Сторінка перезавантажується"],
      ],
      "b",
    ),
    question(
      "jsonp",
      ["What is JSONP?", "Що таке JSONP?"],
      [
        ["A newer, faster version of JSON", "Новіша й швидша версія JSON"],
        ["JSON with comments", "JSON із коментарями"],
        ["A binary encoding of JSON", "Двійкове кодування JSON"],
        [
          "An old cross-origin workaround: a `<script>` tag loads a URL that calls your callback with the data; it supports only GET, is unsafe, and CORS replaced it",
          "Старий обхідний шлях для cross-origin-запитів: тег `<script>` завантажує URL, що викликає ваш колбек із даними; підтримує лише GET, небезпечний, і його замінив CORS",
        ],
      ],
      "d",
    ),
    question(
      "browser-storage",
      ["Which of these are ways to store data in the browser?", "Які з цих способів зберігають дані в браузері?"],
      [
        ["Cookies", "Cookies"],
        ["localStorage and sessionStorage", "localStorage і sessionStorage"],
        ["IndexedDB and the Cache API", "IndexedDB і Cache API"],
        ["`<meta>` tags", "Теги `<meta>`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "event-handling",
      ["Which is the preferred way to handle a click on a button?", "Який спосіб обробки кліку на кнопці кращий?"],
      [
        ["An `onclick=\"...\"` attribute in the HTML of every button", "Атрибут `onclick=\"...\"` у HTML кожної кнопки"],
        ["Checking the button's state in a loop", "Перевіряти стан кнопки в циклі"],
        [
          "`button.addEventListener('click', handler)`: it allows several listeners and options like `once` and `passive`",
          "`button.addEventListener('click', handler)`: він дозволяє кілька обробників і опції на кшталт `once` та `passive`",
        ],
        ["`button.click = handler`", "`button.click = handler`"],
      ],
      "c",
    ),
    question(
      "capturing",
      ["In which order does a click event travel through the DOM by default?", "У якому порядку подія кліку за замовчуванням проходить через DOM?"],
      [
        ["It reaches only the target element", "Вона доходить лише до цільового елемента"],
        [
          "Capturing from `window` down to the target, then the target, then bubbling back up; `addEventListener` listens during bubbling unless `{ capture: true }` is passed",
          "Занурення (capturing) від `window` до цілі, потім ціль, потім спливання (bubbling) назад угору; `addEventListener` слухає на етапі спливання, якщо не передати `{ capture: true }`",
        ],
        ["From the target down to its children", "Від цілі вниз до її нащадків"],
        ["In a random order", "У випадковому порядку"],
      ],
      "b",
    ),
    question(
      "delegation",
      ["A list has 10,000 items, and each needs to react to clicks. What is the efficient approach?", "У списку 10 000 пунктів, і кожен має реагувати на клік. Який підхід ефективний?"],
      [
        ["Add 10,000 listeners, one per item", "Додати 10 000 обробників, по одному на пункт"],
        ["An `onclick` attribute on every item", "Атрибут `onclick` на кожному пункті"],
        ["Check every item with `setInterval`", "Перевіряти кожен пункт через `setInterval`"],
        ["One listener on the list that finds the item with `event.target.closest('li')`", "Один обробник на списку, що знаходить пункт через `event.target.closest('li')`"],
      ],
      "d",
    ),
  ],
};
