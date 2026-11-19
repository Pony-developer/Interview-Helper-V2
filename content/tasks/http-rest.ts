import { defineTasks } from "@/lib/content/schema";
import { quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "http-401-vs-403",
    ["http-rest"],
    1,
    60,
    ["401 or 403", "401 чи 403"],
    ["A signed-in user tries to delete another user's post. Which status code fits?", "Автентифікований користувач намагається видалити чужий допис. Який код стану підходить?"],
    [
      ["401 Unauthorized", "401 Unauthorized"],
      ["403 Forbidden", "403 Forbidden"],
      ["404 Not Found", "404 Not Found"],
      ["400 Bad Request", "400 Bad Request"],
    ],
    "b",
    [
      "401 means \"we don't know who you are\": missing or invalid credentials. 403 means \"we know who you are, but you're not allowed\". Some APIs return 404 to hide that a resource exists at all, a deliberate trade-off.",
      "401 означає «ми не знаємо, хто ви»: облікові дані відсутні чи недійсні. 403 означає «ми знаємо, хто ви, але вам не дозволено». Деякі API повертають 404, щоб приховати саме існування ресурсу; це свідомий компроміс.",
    ],
  ),
  quiz(
    "http-idempotent-methods",
    ["http-rest"],
    2,
    90,
    ["Idempotent methods", "Ідемпотентні методи"],
    ["Which methods are **idempotent** by definition? Select all that apply.", "Які методи **ідемпотентні** за визначенням? Оберіть усі правильні."],
    [
      ["GET", "GET"],
      ["POST", "POST"],
      ["PUT", "PUT"],
      ["DELETE", "DELETE"],
    ],
    "acd",
    [
      "Repeating GET, PUT (replace with the same representation) or DELETE leaves the server in the same state as doing it once, so clients can retry them safely. POST may create a new resource each time; use an idempotency key for safe retries.",
      "Повторення GET, PUT (заміна тим самим представленням) чи DELETE залишає сервер у тому ж стані, що й одне виконання, тож клієнти можуть безпечно повторювати їх. POST може щоразу створювати новий ресурс; для безпечних повторів використовуйте ключ ідемпотентності.",
    ],
  ),
  quiz(
    "http-cors-preflight",
    ["http-rest", w("web-security")],
    3,
    120,
    ["CORS preflight", "CORS preflight"],
    ["Your app on `https://app.com` sends `PUT https://api.com/items/1` with `Content-Type: application/json`. What does the browser do first?", "Ваш застосунок на `https://app.com` надсилає `PUT https://api.com/items/1` з `Content-Type: application/json`. Що браузер робить спершу?"],
    [
      ["Sends an `OPTIONS` preflight and only sends the PUT if the response allows the method, headers and origin", "Надсилає preflight `OPTIONS` і надсилає PUT лише якщо відповідь дозволяє метод, заголовки й джерело"],
      ["Sends the PUT and hides the response if CORS headers are missing", "Надсилає PUT і приховує відповідь, якщо немає заголовків CORS"],
      ["Blocks the request: cross-origin PUT is never allowed", "Блокує запит: PUT між різними джерелами ніколи не дозволено"],
      ["Converts it to a POST", "Перетворює його на POST"],
    ],
    "a",
    [
      "PUT and a JSON content type are not \"simple\", so the browser asks first with `OPTIONS` (including `Access-Control-Request-Method`/`-Headers`). The server must reply with matching `Access-Control-Allow-*` headers. The fix belongs on the server, not in the client.",
      "PUT і тип вмісту JSON не є «простими», тож браузер спершу питає дозволу через `OPTIONS` (з `Access-Control-Request-Method`/`-Headers`). Сервер має відповісти відповідними заголовками `Access-Control-Allow-*`. Виправлення робиться на сервері, а не в клієнті.",
    ],
  ),
  quiz(
    "http-cache-control",
    ["http-rest", w("web-performance")],
    3,
    120,
    ["Caching fingerprinted assets", "Кешування ресурсів із відбитком"],
    ["Your build outputs `app.3f9a1c.js` (a content hash in the name). Which header is best?", "Збірка створює `app.3f9a1c.js` (хеш вмісту в назві). Який заголовок найкращий?"],
    [
      ["`Cache-Control: no-store`", "`Cache-Control: no-store`"],
      ["`Cache-Control: public, max-age=31536000, immutable`", "`Cache-Control: public, max-age=31536000, immutable`"],
      ["`Cache-Control: no-cache`", "`Cache-Control: no-cache`"],
      ["`Expires: 0`", "`Expires: 0`"],
    ],
    "b",
    [
      "A content hash means the URL changes whenever the file changes, so the response can be cached for a year without revalidation. The HTML that references it should use `no-cache` so users pick up new hashes.",
      "Хеш вмісту означає, що URL змінюється разом із файлом, тож відповідь можна кешувати рік без перевірки. HTML, що на неї посилається, має використовувати `no-cache`, щоб користувачі отримували нові хеші.",
    ],
  ),
  quiz(
    "http-rest-create",
    ["http-rest", w("rest-api-design")],
    2,
    90,
    ["Creating a resource", "Створення ресурсу"],
    ["What is the most RESTful response to `POST /orders` that successfully creates order 42?", "Яка відповідь на `POST /orders`, що успішно створив замовлення 42, найбільше відповідає REST?"],
    [
      ["`200 OK` with `{ \"success\": true }`", "`200 OK` з `{ \"success\": true }`"],
      ["`201 Created` with `Location: /orders/42` and the order in the body", "`201 Created` з `Location: /orders/42` і замовленням у тілі"],
      ["`204 No Content`", "`204 No Content`"],
      ["`302 Found` redirecting to `/orders/42`", "`302 Found` з переспрямуванням на `/orders/42`"],
    ],
    "b",
    [
      "201 signals that a resource was created, and `Location` tells the client its URL. Returning the representation saves an extra GET.",
      "201 повідомляє, що ресурс створено, а `Location` повідомляє клієнту його URL. Повернення представлення в тілі заощаджує додатковий GET.",
    ],
  ),
]);
