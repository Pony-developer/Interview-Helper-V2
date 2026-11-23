import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 136–145 of the list: networking and protocols. */
export const networkQuiz: SlideDef = {
  kind: "quiz",
  slug: "network-quiz",
  title: { en: "Networking and protocols", uk: "Основи мережі та протоколи" },
  questions: [
    question(
      "http-https",
      ["What is the difference between HTTP and HTTPS?", "Яка різниця між HTTP і HTTPS?"],
      [
        ["HTTPS is a faster version of HTTP", "HTTPS — швидша версія HTTP"],
        ["HTTPS is used only for images", "HTTPS використовують лише для зображень"],
        [
          "HTTPS is HTTP over TLS: the traffic is encrypted and the server's identity is verified with a certificate",
          "HTTPS — це HTTP поверх TLS: трафік шифрується, а справжність сервера підтверджує сертифікат",
        ],
        ["There is no difference", "Різниці немає"],
      ],
      "c",
    ),
    question(
      "methods",
      [
        "Which HTTP method is meant to replace a resource completely, and which to update it partially?",
        "Який HTTP-метод призначений для повної заміни ресурсу, а який — для часткового оновлення?",
      ],
      [
        ["POST and GET", "POST і GET"],
        ["PUT for a full replacement, PATCH for a partial update", "PUT для повної заміни, PATCH для часткового оновлення"],
        ["DELETE and PUT", "DELETE і PUT"],
        ["GET and PATCH", "GET і PATCH"],
      ],
      "b",
    ),
    question(
      "status-codes",
      [
        "Which status code fits \"the user is signed in but has no rights to this resource\"?",
        "Який статус-код пасує до ситуації «користувач увійшов, але не має прав на цей ресурс»?",
      ],
      [
        ["401 Unauthorized", "401 Unauthorized"],
        ["404 Not Found", "404 Not Found"],
        ["500 Internal Server Error", "500 Internal Server Error"],
        ["403 Forbidden", "403 Forbidden"],
      ],
      "d",
    ),
    question(
      "rest",
      ["Which of these are principles of REST?", "Які з цього — принципи REST?"],
      [
        ["Resources are identified by URLs, for example `/users/42`", "Ресурси ідентифікуються через URL, наприклад `/users/42`"],
        ["Standard HTTP methods express the action", "Дію виражають стандартні HTTP-методи"],
        ["Statelessness: each request carries everything the server needs", "Відсутність стану: кожен запит містить усе, що потрібно серверу"],
        ["Every action is a POST to a single `/api` address", "Кожна дія — це POST на одну адресу `/api`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "request-security",
      ["Which of these measures protect web requests?", "Які з цих заходів захищають вебзапити?"],
      [
        ["Keeping secret API keys in the frontend bundle", "Тримати секретні ключі API у фронтенд-бандлі"],
        ["HTTPS everywhere", "HTTPS усюди"],
        ["CSRF protection: `SameSite` cookies or CSRF tokens", "Захист від CSRF: cookies із `SameSite` або CSRF-токени"],
        ["Validating input on the server, even if the browser already validated it", "Валідація вхідних даних на сервері, навіть якщо браузер уже їх перевірив"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "json-xml",
      ["How do JSON and XML differ in practice?", "Чим JSON і XML відрізняються на практиці?"],
      [
        [
          "JSON is lighter and maps directly onto JS objects, so it is the default for web APIs; XML is more verbose, with attributes, namespaces and schemas, and is still used in SOAP, RSS and configs",
          "JSON легший і напряму відповідає об'єктам JS, тож він стандарт для вебAPI; XML багатослівніший, з атрибутами, просторами імен і схемами, і досі трапляється в SOAP, RSS та конфігах",
        ],
        ["XML is the newer format and replaced JSON", "XML — новіший формат, що замінив JSON"],
        ["JSON cannot represent arrays", "JSON не вміє представляти масиви"],
        ["They are the same format with different file extensions", "Це той самий формат з різними розширеннями файлів"],
      ],
      "a",
    ),
    question(
      "cors",
      ["How does CORS work?", "Як працює CORS?"],
      [
        ["The server blocks all requests from other domains, with no way to allow them", "Сервер блокує всі запити з інших доменів без жодної змоги їх дозволити"],
        [
          "The browser sends the `Origin` header; the server allows the cross-origin request with `Access-Control-Allow-Origin` and related headers; for non-simple requests the browser first sends an `OPTIONS` preflight",
          "Браузер надсилає заголовок `Origin`; сервер дозволяє cross-origin-запит заголовком `Access-Control-Allow-Origin` та спорідненими; для непростих запитів браузер спершу надсилає попередній запит `OPTIONS`",
        ],
        ["It is a setting you turn off in `fetch` on the frontend", "Це налаштування, яке вимикають у `fetch` на фронтенді"],
        ["It encrypts requests between domains", "Він шифрує запити між доменами"],
      ],
      "b",
    ),
    question(
      "websocket",
      ["How does WebSocket differ from regular HTTP requests?", "Чим WebSocket відрізняється від звичайних HTTP-запитів?"],
      [
        ["It is a slower version of HTTP", "Це повільніша версія HTTP"],
        ["It can only transfer files", "Він може передавати лише файли"],
        ["There is no difference", "Різниці немає"],
        [
          "It keeps one persistent two-way connection, so the server can push messages at any time without the client asking",
          "Він тримає одне постійне двостороннє з'єднання, тож сервер може надсилати повідомлення будь-коли, без запиту клієнта",
        ],
      ],
      "d",
    ),
    question(
      "caching",
      [
        "What does `Cache-Control: max-age=31536000, immutable` on the file `app.3f9a1c.js` mean?",
        "Що означає `Cache-Control: max-age=31536000, immutable` на файлі `app.3f9a1c.js`?",
      ],
      [
        [
          "The browser may use its cached copy for a year without asking the server; a new version gets a new file name",
          "Браузер може рік користуватися копією з кешу, не питаючи сервер; нова версія отримає нову назву файлу",
        ],
        ["The file must never be cached", "Файл ніколи не можна кешувати"],
        ["The file is cached for one second", "Файл кешується на одну секунду"],
        ["Only the CDN may cache the file, never the browser", "Кешувати файл може лише CDN, але не браузер"],
      ],
      "a",
    ),
    question(
      "tls",
      ["What does TLS provide?", "Що забезпечує TLS?"],
      [
        ["Faster DNS lookups", "Швидші DNS-запити"],
        ["Only compression of the traffic", "Лише стиснення трафіку"],
        [
          "Encryption and integrity of the traffic, plus authentication of the server with certificates signed by trusted authorities",
          "Шифрування й цілісність трафіку, а також автентифікацію сервера сертифікатами, підписаними довіреними центрами",
        ],
        ["Users' sign-in to the site", "Вхід користувачів на сайт"],
      ],
      "c",
    ),
  ],
};
