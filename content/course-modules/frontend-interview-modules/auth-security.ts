import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–9 of the authentication and security list: authentication. */
export const authFlowsQuiz: SlideDef = {
  kind: "quiz",
  slug: "auth-flows-quiz",
  title: { en: "Authentication", uk: "Автентифікація" },
  questions: [
    question(
      "oauth-pkce",
      ["Which OAuth 2.0 flow should a single-page app use to sign in with Google or Auth0?", "Який потік OAuth 2.0 має використовувати односторінковий застосунок для входу через Google чи Auth0?"],
      [
        ["The implicit flow, which returns the access token in the URL", "Implicit flow, що повертає access-токен в URL"],
        ["Sending the user's Google password to your own API", "Надсилати пароль користувача від Google на власний API"],
        [
          "Authorization Code with PKCE: redirect to the provider with a `state` and a `code_challenge`, get a one-time `code` back on the redirect URI, and exchange it together with the secret `code_verifier` for tokens, ideally on your backend (BFF) so the browser only gets an `HttpOnly` session cookie",
          "Authorization Code з PKCE: переадресувати до провайдера зі `state` і `code_challenge`, отримати одноразовий `code` на redirect URI й обміняти його разом із секретним `code_verifier` на токени, найкраще на своєму бекенді (BFF), щоб браузер отримав лише сесійну cookie з `HttpOnly`",
        ],
        ["Client credentials with the client secret stored in the bundle", "Client credentials із client secret, збереженим у бандлі"],
      ],
      "c",
    ),
    question(
      "token-refresh",
      [
        "The access token lives in memory and the refresh token in an `HttpOnly` cookie. Five requests fail with 401 at the same time. What should the client do?",
        "Access-токен живе в пам'яті, а refresh-токен — у cookie з `HttpOnly`. П'ять запитів одночасно отримують 401. Що має зробити клієнт?",
      ],
      [
        ["Send five refresh requests, one per failed call", "Надіслати п'ять запитів на оновлення, по одному на кожен невдалий виклик"],
        [
          "In one interceptor, start a single refresh (share the pending promise), queue the failed requests, retry them with the new token once it arrives, and log the user out if the refresh itself fails",
          "В одному інтерсепторі запустити одне оновлення (спільний проміс, що очікує), поставити невдалі запити в чергу, повторити їх із новим токеном, щойно він прийде, і розлогінити користувача, якщо саме оновлення не вдалося",
        ],
        ["Move the refresh token into localStorage so it is easier to read", "Перенести refresh-токен у localStorage, щоб його було легше читати"],
        ["Reload the page", "Перезавантажити сторінку"],
      ],
      "b",
    ),
    question(
      "auth-errors",
      ["Which statements about handling authentication errors are true?", "Які твердження про обробку помилок автентифікації правильні?"],
      [
        ["401 means the user isn't authenticated (no or expired token): try a refresh, then send them to sign in", "401 означає, що користувач не автентифікований (токена немає чи він протух): спробувати оновлення, потім відправити на вхід"],
        ["403 means they are signed in but not allowed: show an \"access denied\" message, don't log them out", "403 означає, що користувач увійшов, але не має прав: показати «доступ заборонено», а не розлогінювати"],
        ["Tell the user whether the email or the password was wrong, to be helpful", "Повідомити, що саме неправильне — email чи пароль, щоб допомогти"],
        ["After a redirect to sign-in, return the user to the page they wanted (a validated `returnUrl`)", "Після переадресації на вхід повернути користувача на сторінку, яку він хотів (перевірений `returnUrl`)"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "mfa",
      ["Which choices make a multi-factor sign-in both safer and easier to use?", "Які рішення роблять вхід із багатофакторною автентифікацією і безпечнішим, і зручнішим?"],
      [
        ["After the password step the server issues only a short-lived \"MFA pending\" token, and full tokens only after the second factor", "Після кроку з паролем сервер видає лише короткоживучий токен «очікує MFA», а повні токени — лише після другого фактора"],
        ["The code field uses `autocomplete=\"one-time-code\"` and `inputmode=\"numeric\"` so the code can be autofilled", "Поле коду має `autocomplete=\"one-time-code\"` і `inputmode=\"numeric\"`, щоб код підставлявся автоматично"],
        ["Fallbacks such as recovery codes or another factor; passkeys or authenticator apps are preferred over SMS", "Запасні варіанти, як-от коди відновлення чи інший фактор; passkeys чи застосунки-автентифікатори кращі за SMS"],
        ["Checking the code only in the browser to keep the flow fast", "Перевіряти код лише в браузері, щоб потік був швидким"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "session-management",
      ["Which is a good way to manage the user's session in an SPA?", "Який гарний спосіб керувати сесією користувача в SPA?"],
      [
        [
          "Keep only the user profile (not tokens) in Redux or Zustand, restore it after a reload by calling `/me` with the session cookie, warn before an inactivity timeout, and sync sign-in and sign-out across tabs with `BroadcastChannel` or the `storage` event",
          "Тримати в Redux чи Zustand лише профіль користувача (не токени), відновлювати його після перезавантаження викликом `/me` із сесійною cookie, попереджати перед завершенням через неактивність і синхронізувати вхід і вихід між вкладками через `BroadcastChannel` чи подію `storage`",
        ],
        ["Store the password in sessionStorage to sign in again silently", "Зберігати пароль у sessionStorage, щоб непомітно входити знову"],
        ["Never let sessions expire", "Ніколи не завершувати сесії"],
        ["Persist the whole Redux store, tokens included, to localStorage", "Зберігати весь Redux store разом із токенами в localStorage"],
      ],
      "a",
    ),
    question(
      "rbac",
      ["How do you build role-based access control in a React app?", "Як побудувати рольовий контроль доступу (RBAC) у React-застосунку?"],
      [
        ["Read the role from a URL parameter", "Читати роль із параметра URL"],
        ["Hard-code `if (user.name === 'admin')` checks in components", "Жорстко прописати перевірки `if (user.name === 'admin')` у компонентах"],
        ["Only hide the admin menu with CSS", "Лише сховати меню адміністратора через CSS"],
        [
          "Map roles to permissions and check permissions, not role names: a `can('invoice:delete')` helper or `<Can>` component for UI, a route guard for pages; the same rules are enforced by the API, because the client check only shapes the UI",
          "Зіставити ролі з правами й перевіряти права, а не назви ролей: допоміжна функція `can('invoice:delete')` чи компонент `<Can>` для UI, guard маршруту для сторінок; ті самі правила перевіряє API, бо перевірка на клієнті лише формує UI",
        ],
      ],
      "d",
    ),
    question(
      "logout",
      ["What should a secure logout do?", "Що має робити безпечний вихід із системи?"],
      [
        ["Only redirect to the sign-in page", "Лише переадресувати на сторінку входу"],
        ["Delete the access token from memory; that's enough because JWTs expire anyway", "Видалити access-токен із пам'яті; цього досить, бо JWT однаково протухають"],
        [
          "Call the server to revoke the refresh token or session and clear the `HttpOnly` cookie (JavaScript can't), wipe client state and caches (store, React Query cache, any storage), tell other tabs, then redirect to sign-in",
          "Викликати сервер, щоб відкликати refresh-токен чи сесію й очистити cookie з `HttpOnly` (JavaScript цього не може), стерти стан і кеші клієнта (store, кеш React Query, будь-які сховища), повідомити інші вкладки, а потім переадресувати на вхід",
        ],
        ["Close the browser tab with `window.close()`", "Закрити вкладку через `window.close()`"],
      ],
      "c",
    ),
    question(
      "ssr-auth",
      ["How does authentication work in a server-rendered React app (for example Next.js)?", "Як працює автентифікація в React-застосунку з серверним рендерингом (наприклад, Next.js)?"],
      [
        ["The server reads the token from localStorage", "Сервер читає токен із localStorage"],
        [
          "The session lives in an `HttpOnly` cookie the server can read on each request (middleware, server components, `getServerSideProps`), so it redirects unauthenticated users before rendering; tokens are never serialized into the page, and personalized pages aren't cached publicly",
          "Сесія живе в cookie з `HttpOnly`, яку сервер читає на кожному запиті (middleware, серверні компоненти, `getServerSideProps`), тож він переадресовує неавтентифікованих користувачів ще до рендерингу; токени ніколи не серіалізуються в сторінку, а персоналізовані сторінки не кешуються публічно",
        ],
        ["Authentication is impossible with SSR", "З SSR автентифікація неможлива"],
        ["The page renders first and the server checks the user afterwards", "Сторінка спершу рендериться, а сервер перевіряє користувача потім"],
      ],
      "b",
    ),
    question(
      "cross-origin-auth",
      ["Micro-frontends on different subdomains must share one sign-in. Which approach is sound?", "Мікрофронтенди на різних піддоменах мають спільний вхід. Який підхід правильний?"],
      [
        ["Copy the token into every app's localStorage through URL parameters", "Копіювати токен у localStorage кожного застосунку через параметри URL"],
        ["Turn off CORS", "Вимкнути CORS"],
        ["Accept `postMessage` messages from any origin", "Приймати повідомлення `postMessage` з будь-якого джерела"],
        [
          "A central identity provider with single sign-on, a session cookie scoped to the parent domain where it fits, API calls with `credentials: 'include'` and a CORS allowlist of exact origins; if apps must talk through `postMessage`, check `event.origin` and never pass long-lived tokens",
          "Центральний провайдер ідентичності з єдиним входом (SSO), сесійна cookie на батьківський домен, де це доречно, виклики API з `credentials: 'include'` і CORS-список дозволених точних джерел; якщо застосунки спілкуються через `postMessage`, перевіряти `event.origin` і ніколи не передавати довгоживучі токени",
        ],
      ],
      "d",
    ),
  ],
};

/** Questions 10–16 of the authentication and security list: frontend security. */
export const frontendSecurityQuiz: SlideDef = {
  kind: "quiz",
  slug: "frontend-security-quiz",
  title: { en: "Frontend security", uk: "Безпека фронтенду" },
  questions: [
    question(
      "react-xss",
      ["React escapes values in `{…}`. Where can XSS still happen in a React app?", "React екранує значення в `{…}`. Де в React-застосунку все ще можлива XSS?"],
      [
        ["`dangerouslySetInnerHTML` with user HTML that wasn't sanitized (for example with DOMPurify)", "`dangerouslySetInnerHTML` з користувацьким HTML, який не очистили (наприклад, через DOMPurify)"],
        ["`<a href={userUrl}>` where the URL is `javascript:…`", "`<a href={userUrl}>`, де URL — це `javascript:…`"],
        ["Setting `ref.current.innerHTML` or passing user input to `eval`", "Запис у `ref.current.innerHTML` чи передавання введення користувача в `eval`"],
        ["Rendering `<p>{comment.text}</p>`", "Рендеринг `<p>{comment.text}</p>`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "hsts",
      ["What does the `Strict-Transport-Security` (HSTS) header protect against?", "Від чого захищає заголовок `Strict-Transport-Security` (HSTS)?"],
      [
        [
          "Man-in-the-middle downgrades: after the first secure visit the browser uses only HTTPS for the domain for `max-age` and won't let the user click through certificate errors; the `preload` list covers even the first visit",
          "Від атак «людина посередині» зі зниженням до HTTP: після першого захищеного візиту браузер використовує для домену лише HTTPS упродовж `max-age` і не дає користувачу проігнорувати помилки сертифіката; список `preload` захищає навіть перший візит",
        ],
        ["XSS in templates", "Від XSS у шаблонах"],
        ["CSRF attacks", "Від CSRF-атак"],
        ["Weak passwords", "Від слабких паролів"],
      ],
      "a",
    ),
    question(
      "sensitive-data",
      ["Which practices keep sensitive data from leaking in the browser?", "Які практики не дають чутливим даним витекти в браузері?"],
      [
        ["Logging the API response with the user's tokens to the console for support", "Виводити в консоль відповідь API з токенами користувача для підтримки"],
        ["Scrubbing tokens and personal data from error reports and logs (for example in Sentry's `beforeSend`)", "Вичищати токени й персональні дані зі звітів про помилки та логів (наприклад, у `beforeSend` Sentry)"],
        ["Not serving source maps publicly in production, or uploading them only to the error tracker", "Не віддавати source maps публічно в продакшені або завантажувати їх лише в трекер помилок"],
        ["Fetching only the fields a screen needs and masking values like card numbers", "Завантажувати лише поля, потрібні екрану, і маскувати значення на кшталт номерів карток"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "sri",
      ["How do you protect the app from a compromised third-party script or library?", "Як захистити застосунок від скомпрометованого стороннього скрипту чи бібліотеки?"],
      [
        ["Load all scripts from the newest version URL so fixes arrive automatically", "Вантажити всі скрипти з URL найновішої версії, щоб виправлення приходили автоматично"],
        ["Third-party scripts can't do any harm", "Сторонні скрипти не можуть зашкодити"],
        [
          "Pin versions and add Subresource Integrity (`<script src=\"…\" integrity=\"sha384-…\" crossorigin=\"anonymous\">`), so the browser refuses a changed file; limit sources with CSP, commit the lockfile, audit dependencies, and self-host what you can",
          "Фіксувати версії й додавати Subresource Integrity (`<script src=\"…\" integrity=\"sha384-…\" crossorigin=\"anonymous\">`), щоб браузер відмовився від зміненого файлу; обмежувати джерела через CSP, комітити lock-файл, перевіряти залежності й розміщувати на своєму сервері те, що можна",
        ],
        ["Wrap them in `try`/`catch`", "Загорнути їх у `try`/`catch`"],
      ],
      "c",
    ),
    question(
      "csp-design",
      ["Which is a sound way to introduce a Content Security Policy?", "Який правильний спосіб запровадити Content Security Policy?"],
      [
        ["Add `script-src * 'unsafe-inline' 'unsafe-eval'` so nothing breaks", "Додати `script-src * 'unsafe-inline' 'unsafe-eval'`, щоб нічого не зламалося"],
        ["Put the policy in a JavaScript variable", "Записати політику в змінну JavaScript"],
        ["Enforce a strict policy in production straight away without testing", "Одразу ввімкнути сувору політику в продакшені без тестування"],
        [
          "Start with `Content-Security-Policy-Report-Only` and a reporting endpoint, then enforce a strict policy: per-response nonces (with `'strict-dynamic'`) instead of `'unsafe-inline'`, `object-src 'none'`, `base-uri 'none'` and `frame-ancestors` against clickjacking",
          "Почати з `Content-Security-Policy-Report-Only` і адреси для звітів, а потім увімкнути сувору політику: nonce для кожної відповіді (з `'strict-dynamic'`) замість `'unsafe-inline'`, `object-src 'none'`, `base-uri 'none'` і `frame-ancestors` проти clickjacking",
        ],
      ],
      "d",
    ),
    question(
      "zero-trust",
      ["What does a zero-trust approach mean for a web app?", "Що означає підхід zero trust для вебзастосунку?"],
      [
        ["Trust every request from inside the company network", "Довіряти кожному запиту з корпоративної мережі"],
        [
          "No request is trusted because of where it comes from: every call is authenticated and authorized, traffic is encrypted, tokens are short-lived and scoped to least privilege, and CORS and permissions are strict",
          "Жоден запит не вважається довіреним через те, звідки він прийшов: кожен виклик автентифікується й авторизується, трафік шифрується, токени короткоживучі з мінімальними правами, а CORS і дозволи суворі",
        ],
        ["Users must not trust the app", "Користувачі не мають довіряти застосунку"],
        ["Disable authentication to reduce the attack surface", "Вимкнути автентифікацію, щоб зменшити поверхню атаки"],
      ],
      "b",
    ),
    question(
      "privacy-compliance",
      ["What does privacy law such as GDPR (or HIPAA for health data) require from the frontend?", "Чого вимагає від фронтенду закон про приватність, як-от GDPR (чи HIPAA для медичних даних)?"],
      [
        [
          "Load non-essential cookies and analytics only after opt-in consent, with rejecting as easy as accepting, and keep a record of it; collect only needed data, give users ways to download and delete their data, and keep health or other sensitive data out of browser storage, analytics and logs",
          "Вантажити необов'язкові cookies та аналітику лише після згоди (opt-in), де відмовитися так само легко, як погодитися, і зберігати підтвердження цієї згоди; збирати лише потрібні дані, давати користувачам змогу завантажити й видалити свої дані, а медичні чи інші чутливі дані не тримати в сховищах браузера, аналітиці та логах",
        ],
        ["Just add a cookie banner with only an \"OK\" button", "Просто додати банер про cookies із єдиною кнопкою «OK»"],
        ["Only the backend is affected; the frontend has no obligations", "Це стосується лише бекенду; у фронтенду немає обов'язків"],
        ["Encrypt the data in localStorage and then anything is allowed", "Зашифрувати дані в localStorage, і тоді можна все"],
      ],
      "a",
    ),
  ],
};

/**
 * Authentication and security: auth flows (OAuth with PKCE, token refresh, MFA, sessions, RBAC, SSR)
 * and frontend security in depth, keeping only what the Senior security quiz and other modules don't cover.
 */
export const authSecurityModule: ModuleDef = {
  slug: "auth-security-interview-questions",
  title: { en: "Authentication and security", uk: "Автентифікація та безпека" },
  slides: [
    { kind: "lecture", slug: "auth-security-questions", title: { en: "Questions", uk: "Питання" } },
    authFlowsQuiz,
    frontendSecurityQuiz,
  ],
};
