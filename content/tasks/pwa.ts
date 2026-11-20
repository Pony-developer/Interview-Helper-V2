import { defineTasks } from "@/lib/content/schema";
import { quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "pwa-requirements",
    ["pwa"],
    1,
    45,
    ["What makes a PWA", "Що робить застосунок PWA"],
    ["Which three ingredients make a website a Progressive Web App?", "Які три складники роблять сайт прогресивним вебзастосунком?"],
    [
      ["HTTPS, a web app manifest and a service worker", "HTTPS, маніфест вебзастосунку й service worker"],
      ["React, a CDN and a native wrapper", "React, CDN і нативна обгортка"],
      ["An App Store listing, push notifications and IndexedDB", "Сторінка в App Store, push-сповіщення й IndexedDB"],
      ["Server-side rendering, cookies and WebSockets", "Серверний рендеринг, cookie і WebSocket"],
    ],
    "a",
    [
      "HTTPS is required for service workers. The manifest describes how the installed app looks and launches. The service worker enables offline support, caching and push. No framework or app store is needed.",
      "HTTPS потрібен для service worker. Маніфест описує, як виглядає й запускається встановлений застосунок. Service worker дає офлайн-підтримку, кешування й push. Жоден фреймворк чи магазин застосунків не потрібен.",
    ],
  ),
  quiz(
    "pwa-sw-scope",
    ["pwa"],
    2,
    90,
    ["Service worker scope", "Область дії service worker"],
    ["The service worker is registered from `/js/sw.js`, but it doesn't intercept requests made by `/dashboard`. Why?", "Service worker зареєстровано з `/js/sw.js`, але він не перехоплює запити сторінки `/dashboard`. Чому?"],
    [
      ["By default its scope is the folder it's served from (`/js/`); serve it from the root (`/sw.js`) to control the whole site", "За замовчуванням його область дії є папкою, з якої його віддано (`/js/`); віддавайте його з кореня (`/sw.js`), щоб контролювати весь сайт"],
      ["Service workers only control the page that registered them", "Service worker контролює лише сторінку, яка його зареєструвала"],
      ["`/dashboard` must also call `register()`", "`/dashboard` теж має викликати `register()`"],
      ["Service workers don't work with client-side routing", "Service worker не працює з клієнтською маршрутизацією"],
    ],
    "a",
    [
      "A service worker controls pages within its scope, which defaults to the directory of the script's URL. A worker at `/js/sw.js` can only control URLs under `/js/`. Put the file at the root (a broader scope can also be allowed with the `Service-Worker-Allowed` header). Note that a page registered for the first time is only controlled after a reload, unless the worker calls `clients.claim()`.",
      "Service worker контролює сторінки в межах своєї області дії, яка за замовчуванням дорівнює каталогу URL скрипта. Worker за адресою `/js/sw.js` може контролювати лише URL у `/js/`. Покладіть файл у корінь (ширшу область також можна дозволити заголовком `Service-Worker-Allowed`). Зверніть увагу: сторінка, що реєструє worker уперше, стає контрольованою лише після перезавантаження, якщо worker не викликає `clients.claim()`.",
    ],
  ),
  quiz(
    "pwa-update-waiting",
    ["pwa"],
    3,
    120,
    ["Users stuck on the old version", "Користувачі застрягли на старій версії"],
    ["After a deploy, the new service worker installs, but users keep seeing the old version until they close every tab. Why, and what's a good fix?", "Після розгортання новий service worker встановлюється, але користувачі бачать стару версію, доки не закриють усі вкладки. Чому і як це добре виправити?"],
    [
      ["The new worker waits while old tabs use the previous one; show an \"Update available\" prompt that calls `skipWaiting()` and reloads", "Новий worker чекає, поки старі вкладки використовують попередній; покажіть підказку «Доступне оновлення», що викликає `skipWaiting()` і перезавантажує сторінку"],
      ["The CDN is serving stale files; purge it on every deploy", "CDN віддає застарілі файли; очищайте його при кожному розгортанні"],
      ["Service workers only update once a day", "Service worker оновлюється лише раз на добу"],
      ["The manifest's `start_url` is cached", "`start_url` з маніфесту закешовано"],
    ],
    "a",
    [
      "To avoid two versions controlling the app at once, a new worker stays in the waiting state until no client uses the old one. Asking the user, then calling `skipWaiting()` and reloading on `controllerchange`, rolls out updates quickly without breaking open forms. Also serve `sw.js` with `Cache-Control: no-cache` so the browser checks it.",
      "Щоб застосунком не керували дві версії одночасно, новий worker перебуває в стані очікування, доки жоден клієнт не використовує старий. Запит користувачу, а потім виклик `skipWaiting()` і перезавантаження при `controllerchange` швидко розгортають оновлення, не ламаючи відкритих форм. Також віддавайте `sw.js` з `Cache-Control: no-cache`, щоб браузер його перевіряв.",
    ],
  ),
  quiz(
    "pwa-caching-strategies",
    ["pwa", w("web-performance")],
    3,
    120,
    ["Choosing caching strategies", "Вибір стратегій кешування"],
    ["Which pairing of resources and strategies is most sensible?", "Яке поєднання ресурсів і стратегій найрозумніше?"],
    [
      ["Hashed JS/CSS: cache first; HTML navigations: network first; avatars: stale-while-revalidate", "Хешовані JS/CSS: спершу кеш; HTML-навігація: спершу мережа; аватари: stale-while-revalidate"],
      ["Everything: cache first", "Усе: спершу кеш"],
      ["HTML: cache only; JS: network only", "HTML: лише кеш; JS: лише мережа"],
      ["Payments API: stale-while-revalidate", "API платежів: stale-while-revalidate"],
    ],
    "a",
    [
      "Hashed assets never change, so the cache is always right. HTML must point to the latest assets, so try the network and fall back to cache offline. Stale-while-revalidate suits content where slightly old data is fine. Sensitive or mutating requests (payments, POSTs) shouldn't be cached at all.",
      "Хешовані ресурси ніколи не змінюються, тож кеш завжди правий. HTML має посилатися на найновіші ресурси, тож спершу пробуйте мережу, а офлайн повертайтеся до кешу. Stale-while-revalidate підходить для вмісту, де трохи застарілі дані прийнятні. Чутливі чи змінні запити (платежі, POST) взагалі не варто кешувати.",
    ],
  ),
  quiz(
    "pwa-html-cache-first",
    ["pwa", w("vite")],
    4,
    120,
    ["A blank page after deploy", "Порожня сторінка після розгортання"],
    ["The service worker serves HTML cache-first. After a deploy, some users get a blank page with 404s for JavaScript chunks. Why?", "Service worker віддає HTML за стратегією «спершу кеш». Після розгортання частина користувачів бачить порожню сторінку з 404 для JavaScript-фрагментів. Чому?"],
    [
      ["The cached old HTML references hashed chunks that the new deploy deleted from the server", "Закешований старий HTML посилається на хешовані фрагменти, які нове розгортання видалило з сервера"],
      ["Service workers can't cache JavaScript", "Service worker не може кешувати JavaScript"],
      ["The manifest is invalid", "Маніфест некоректний"],
      ["HTTPS certificates expire after a deploy", "HTTPS-сертифікати закінчуються після розгортання"],
    ],
    "a",
    [
      "Old HTML plus new server is a version mismatch: the referenced `index-abc123.js` no longer exists. Fixes: network-first for navigations, precaching the full set of assets for each version (so the old version stays self-consistent offline), keeping old assets on the CDN for a while, and prompting users to reload when a new version is ready.",
      "Старий HTML плюс новий сервер дають невідповідність версій: згаданого `index-abc123.js` більше не існує. Виправлення: «спершу мережа» для навігації, попереднє кешування повного набору ресурсів кожної версії (щоб стара версія лишалася узгодженою офлайн), зберігання старих ресурсів на CDN деякий час і пропозиція перезавантажити, коли нова версія готова.",
    ],
  ),
  quiz(
    "pwa-storage-in-worker",
    ["pwa", w("browser-apis")],
    4,
    90,
    ["Storing data in a service worker", "Зберігання даних у service worker"],
    ["A service worker needs to store queued messages until the user is back online. Where should it keep them?", "Service worker має зберігати повідомлення в черзі, доки користувач не повернеться онлайн. Де їх тримати?"],
    [
      ["IndexedDB (asynchronous and available in workers)", "В IndexedDB (асинхронна й доступна у worker)"],
      ["`localStorage`", "У `localStorage`"],
      ["A global variable in the worker", "У глобальній змінній worker"],
      ["`document.cookie`", "У `document.cookie`"],
    ],
    "a",
    [
      "`localStorage` and `document.cookie` are synchronous, DOM-bound APIs that don't exist in service workers. Global variables disappear because the browser stops idle workers at any time. IndexedDB is asynchronous, persistent and available in workers; Background Sync can then retry sending when connectivity returns.",
      "`localStorage` і `document.cookie` є синхронними API, прив'язаними до DOM, і в service worker їх немає. Глобальні змінні зникають, бо браузер будь-коли зупиняє worker у простої. IndexedDB асинхронна, постійна й доступна у worker; Background Sync потім може повторити надсилання, коли з'єднання повернеться.",
    ],
  ),
]);
