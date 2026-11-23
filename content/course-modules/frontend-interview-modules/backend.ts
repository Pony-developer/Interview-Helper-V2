import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 146–155 of the list: working with the backend. */
export const backendQuiz: SlideDef = {
  kind: "quiz",
  slug: "backend-quiz",
  title: { en: "Working with the backend", uk: "Робота з бекендом" },
  questions: [
    question(
      "api",
      ["How does a frontend usually talk to a backend API?", "Як фронтенд зазвичай взаємодіє з API бекенда?"],
      [
        ["It reads the database directly", "Напряму читає базу даних"],
        [
          "It sends HTTP requests to endpoints (with `fetch` or a client library) and gets data back, usually as JSON",
          "Надсилає HTTP-запити на ендпоінти (через `fetch` чи клієнтську бібліотеку) і отримує у відповідь дані, зазвичай у JSON",
        ],
        ["Through CSS files", "Через CSS-файли"],
        ["Only through cookies", "Лише через cookies"],
      ],
      "b",
    ),
    question(
      "data-formats",
      ["Which of these formats are used to exchange data between the frontend and the backend?", "Які з цих форматів використовують для обміну даними між фронтендом і бекендом?"],
      [
        ["JSON", "JSON"],
        ["PSD", "PSD"],
        ["`multipart/form-data` for forms and files", "`multipart/form-data` для форм і файлів"],
        ["Protocol Buffers, for example with gRPC-Web", "Protocol Buffers, наприклад із gRPC-Web"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "crud",
      ["How do CRUD operations usually map onto a REST API?", "Як CRUD-операції зазвичай відповідають REST API?"],
      [
        ["Every operation is a GET", "Кожна операція — це GET"],
        ["Create: DELETE, Read: PUT, Update: POST, Delete: GET", "Create: DELETE, Read: PUT, Update: POST, Delete: GET"],
        ["Only POST and GET exist", "Існують лише POST і GET"],
        ["Create: POST, Read: GET, Update: PUT or PATCH, Delete: DELETE", "Create: POST, Read: GET, Update: PUT чи PATCH, Delete: DELETE"],
      ],
      "d",
    ),
    question(
      "websocket-realtime",
      ["Which of these is a good use case for WebSockets?", "Що з цього — вдалий сценарій для вебсокетів?"],
      [
        ["Downloading a static image", "Завантаження статичного зображення"],
        ["A chat or live notifications, where the server pushes updates as they happen", "Чат чи сповіщення в реальному часі, де сервер надсилає оновлення, щойно вони стаються"],
        ["Pages that must be indexed by search engines", "Сторінки, які мають індексувати пошукові системи"],
        ["Submitting a sign-in form once", "Одноразова відправка форми входу"],
      ],
      "b",
    ),
    question(
      "auth",
      ["Which of these are common authentication and authorization mechanisms?", "Які з цього — поширені механізми аутентифікації та авторизації?"],
      [
        ["Session cookies with `HttpOnly`, `Secure` and `SameSite`", "Сесійні cookies з `HttpOnly`, `Secure` і `SameSite`"],
        ["JWT access tokens with refresh tokens", "JWT access-токени з refresh-токенами"],
        ["Storing the user's password in localStorage", "Зберігати пароль користувача в localStorage"],
        ["OAuth 2.0 and OpenID Connect, such as signing in with Google or Microsoft", "OAuth 2.0 та OpenID Connect, як-от вхід через Google чи Microsoft"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "secure-data",
      ["Which are principles of storing and transferring user data securely?", "Які з цього — принципи безпечного зберігання та передачі даних користувачів?"],
      [
        ["Transfer data only over HTTPS", "Передавати дані лише через HTTPS"],
        ["Hash passwords with bcrypt or Argon2, never store them as plain text", "Хешувати паролі через bcrypt чи Argon2, ніколи не зберігати їх відкритим текстом"],
        ["Collect and keep only the data you need, and restrict access to it", "Збирати й зберігати лише потрібні дані та обмежувати доступ до них"],
        ["Log full card numbers to make debugging easier", "Логувати повні номери карток, щоб легше налагоджувати"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "graphql",
      ["What is a key difference between GraphQL and REST?", "Яка ключова відмінність між GraphQL і REST?"],
      [
        ["GraphQL is a database", "GraphQL — це база даних"],
        ["GraphQL cannot change data", "GraphQL не вміє змінювати дані"],
        [
          "The client asks one endpoint for exactly the fields it needs, which avoids over- and under-fetching; the cost is harder HTTP caching and the need to limit expensive queries on the server",
          "Клієнт запитує в одного ендпоінта рівно ті поля, які йому потрібні, що позбавляє від надлишкових і недостатніх даних; ціна — складніше HTTP-кешування й потреба обмежувати дорогі запити на сервері",
        ],
        ["There is no difference", "Різниці немає"],
      ],
      "c",
    ),
    question(
      "frontend-caching",
      ["Which caching strategies are available on the frontend?", "Які стратегії кешування доступні на фронтенді?"],
      [
        ["HTTP cache headers", "HTTP-заголовки кешування"],
        ["Copying the data into CSS", "Копіювати дані в CSS"],
        ["An in-memory cache in a data library (stale-while-revalidate, as in TanStack Query or SWR)", "Кеш у пам'яті в бібліотеці даних (stale-while-revalidate, як у TanStack Query чи SWR)"],
        ["A Service Worker with the Cache API, including offline mode", "Service Worker із Cache API, зокрема для офлайн-режиму"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "large-data",
      ["How can you handle large amounts of data without hurting frontend performance?", "Як обробляти великі обсяги даних, не шкодячи продуктивності фронтенду?"],
      [
        ["Render all 100,000 rows at once", "Рендерити всі 100 000 рядків одразу"],
        ["Pagination or infinite scrolling, loading the data in parts", "Пагінація чи нескінченна прокрутка із завантаженням даних частинами"],
        ["Virtualizing lists so that only the visible rows are rendered", "Віртуалізація списків, щоб рендерилися лише видимі рядки"],
        ["Moving heavy computation into a Web Worker", "Винесення важких обчислень у Web Worker"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "debug-requests",
      ["Which tools help monitor and debug requests to the server?", "Які інструменти допомагають моніторити й налагоджувати запити до сервера?"],
      [
        ["The Network panel in DevTools", "Панель Network у DevTools"],
        ["The W3C CSS validator", "W3C-валідатор CSS"],
        ["Postman, Insomnia or curl", "Postman, Insomnia чи curl"],
        ["Error and performance monitoring such as Sentry", "Моніторинг помилок і продуктивності, як-от Sentry"],
      ],
      ["a", "c", "d"],
    ),
  ],
};
