import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–14 of the frontend system design list. */
export const systemDesignQuiz: SlideDef = {
  kind: "quiz",
  slug: "system-design-quiz",
  title: { en: "Frontend system design", uk: "Frontend system design" },
  questions: [
    question(
      "offline-sync",
      ["Which practices make an offline-capable app reliable?", "Які практики роблять застосунок із підтримкою офлайну надійним?"],
      [
        ["A Service Worker caches the app shell and assets, so the app opens without a network", "Service Worker кешує оболонку застосунку й ресурси, тож застосунок відкривається без мережі"],
        ["Changes made offline are queued in IndexedDB and replayed when the connection returns", "Зміни, зроблені офлайн, ставлять у чергу в IndexedDB і відтворюють, коли з'єднання повертається"],
        ["Each queued request carries an idempotency key, so a retry after a lost response doesn't create duplicates", "Кожен запит у черзі має ключ ідемпотентності, тож повтор після втраченої відповіді не створює дублікатів"],
        ["`navigator.onLine === true` guarantees that the server is reachable", "`navigator.onLine === true` гарантує, що сервер доступний"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "i18n",
      ["Which practices belong in an i18n architecture?", "Які практики мають бути в архітектурі i18n?"],
      [
        ["Keep all strings in translation files and load only the active locale's bundle", "Тримати всі рядки у файлах перекладів і завантажувати лише бандл активної мови"],
        [
          "Format dates, numbers and currency with `Intl` and use plural rules (ICU messages), because languages like Ukrainian have several plural forms",
          "Форматувати дати, числа й валюти через `Intl` і використовувати правила множини (ICU-повідомлення), бо в мовах на кшталт української кілька форм множини",
        ],
        ["Put the locale in the URL (`/uk/...`) with `hreflang` links, and plan for right-to-left languages and longer text", "Розміщувати мову в URL (`/uk/...`) з посиланнями `hreflang` і передбачати мови з письмом справа наліво та довший текст"],
        ["Build sentences by concatenating translated fragments, such as `t('you have') + n + t('items')`", "Складати речення з перекладених фрагментів, як-от `t('you have') + n + t('items')`"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "bff-adapter",
      ["The frontend talks to many microservices and a legacy API with inconsistent field names. What helps most?", "Фронтенд звертається до багатьох мікросервісів і застарілого API з неузгодженими назвами полів. Що допоможе найбільше?"],
      [
        ["Calling every microservice directly from each component", "Викликати кожен мікросервіс напряму з кожного компонента"],
        [
          "An API gateway or a Backend-for-Frontend that aggregates calls into responses shaped for the UI, plus an adapter layer in the client that normalizes legacy data in one place, with timeouts, caching and graceful errors",
          "API gateway чи Backend-for-Frontend, що збирає виклики у відповіді, зручні для UI, плюс шар адаптерів на клієнті, що нормалізує застарілі дані в одному місці, з таймаутами, кешуванням і коректною обробкою помилок",
        ],
        ["Rewriting the legacy backend before any frontend work", "Переписати застарілий бекенд, перш ніж братися за фронтенд"],
        ["Copying the legacy field names everywhere in the UI", "Копіювати застарілі назви полів усюди в UI"],
      ],
      "b",
    ),
    question(
      "cursor-pagination",
      ["Why is cursor-based pagination often better than `?page=500&limit=20` for a large, changing feed?", "Чому пагінація з курсором часто краща за `?page=500&limit=20` для великої стрічки, що змінюється?"],
      [
        ["It lets the user jump to any page number", "Вона дає змогу перейти на будь-який номер сторінки"],
        ["It needs no index on the server", "Їй не потрібен індекс на сервері"],
        [
          "It continues after the last item seen (`?after=<id>`), so new or deleted items don't cause skipped or duplicated rows, and the database avoids scanning large offsets; on the client, infinite scroll uses `IntersectionObserver` with a virtualized list",
          "Вона продовжує після останнього побаченого елемента (`?after=<id>`), тож нові чи видалені елементи не спричиняють пропущених чи дубльованих рядків, а базі не треба проглядати великі зсуви; на клієнті нескінченна прокрутка використовує `IntersectionObserver` разом із віртуалізованим списком",
        ],
        ["It loads all 100,000 records at once", "Вона завантажує всі 100 000 записів одразу"],
      ],
      "c",
    ),
    question(
      "traffic-peaks",
      ["Which measures help a storefront survive a Black Friday traffic spike?", "Які заходи допомагають інтернет-магазину пережити сплеск трафіку в Black Friday?"],
      [
        ["Serve product and category pages from a CDN cache with stale-while-revalidate", "Віддавати сторінки товарів і категорій із кешу CDN зі stale-while-revalidate"],
        ["Ship less JavaScript with islands or partial hydration", "Постачати менше JavaScript завдяки islands чи частковій гідратації"],
        ["Use feature flags as kill switches to turn off non-critical features, such as recommendations, under load", "Використовувати feature flags як аварійні вимикачі, щоб під навантаженням вимикати некритичні функції, як-от рекомендації"],
        ["Disable all caching so every user sees the freshest data", "Вимкнути все кешування, щоб кожен користувач бачив найсвіжіші дані"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "push-notifications",
      ["How do web push notifications work in a PWA?", "Як працюють вебpush-сповіщення в PWA?"],
      [
        [
          "After the user grants permission, the Service Worker subscribes via the Push API with your VAPID public key; your server sends messages through the browser's push service, and the Service Worker shows them in its `push` event, even when the page is closed",
          "Після дозволу користувача Service Worker підписується через Push API з вашим публічним ключем VAPID; ваш сервер надсилає повідомлення через push-сервіс браузера, а Service Worker показує їх в обробнику події `push`, навіть коли сторінку закрито",
        ],
        ["The page polls the server every second", "Сторінка опитує сервер щосекунди"],
        ["They work without the user's permission", "Вони працюють без дозволу користувача"],
        ["They need a WebSocket that stays open in every tab", "Вони потребують WebSocket, відкритого в кожній вкладці"],
      ],
      "a",
    ),
    question(
      "normalized-state",
      ["Why normalize relational data in client state?", "Навіщо нормалізувати пов'язані дані в стані клієнта?"],
      [
        ["To make it look like the API response", "Щоб він виглядав як відповідь API"],
        ["Normalization makes state slower", "Нормалізація сповільнює стан"],
        ["To store everything as one deeply nested tree", "Щоб зберігати все одним глибоко вкладеним деревом"],
        [
          "Storing each entity once by id (`{ ids: [...], entities: { [id]: ... } }`) and referencing others by id means an update happens in one place and no copy goes stale; derived views come from memoized selectors (Redux Toolkit's `createEntityAdapter` does this)",
          "Якщо зберігати кожну сутність один раз за id (`{ ids: [...], entities: { [id]: ... } }`) і посилатися на інші через id, оновлення відбувається в одному місці й жодна копія не застаріває; похідні подання дають мемоїзовані селектори (так робить `createEntityAdapter` з Redux Toolkit)",
        ],
      ],
      "d",
    ),
    question(
      "unreliable-apis",
      ["Which practices are right for a rate-limited or flaky API?", "Які практики правильні для API з лімітами чи нестабільного API?"],
      [
        ["Retry with exponential backoff and jitter, and only for idempotent requests", "Повторювати з експоненційною затримкою та випадковим розкидом (jitter), і лише ідемпотентні запити"],
        ["On `429 Too Many Requests`, wait for the time in the `Retry-After` header", "На `429 Too Many Requests` чекати час із заголовка `Retry-After`"],
        ["A circuit breaker stops calling a failing service for a while and shows cached data or a fallback instead", "Circuit breaker на певний час припиняє виклики збійного сервісу й показує натомість кешовані дані чи запасний варіант"],
        ["Retry immediately in a tight loop until it succeeds", "Повторювати одразу в щільному циклі, доки не вдасться"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "optimistic-ui",
      ["What does a correct optimistic update do?", "Що робить правильне оптимістичне оновлення?"],
      [
        ["Updates the UI and never talks to the server", "Оновлює UI й ніколи не звертається до сервера"],
        ["Waits for the server before showing anything", "Чекає на сервер, перш ніж щось показати"],
        [
          "Saves a snapshot, updates the cache immediately, sends the request, rolls back to the snapshot and tells the user if it fails, and reconciles with the server's response when it succeeds (cancelling in-flight refetches so they don't overwrite it)",
          "Зберігає знімок, одразу оновлює кеш, надсилає запит, у разі помилки відкочується до знімка й повідомляє користувача, а в разі успіху звіряється з відповіддю сервера (скасовуючи запити, що вже тривають, щоб вони її не перезаписали)",
        ],
        ["Applies the change twice to be safe", "Застосовує зміну двічі про всяк випадок"],
      ],
      "c",
    ),
    question(
      "feature-flags",
      ["Which practices belong in a feature flag and A/B testing system?", "Які практики мають бути в системі feature flags і A/B-тестів?"],
      [
        ["Evaluate flags before rendering (on the server or at the edge) so the UI doesn't flicker between variants", "Обчислювати прапорці до рендерингу (на сервері чи на edge), щоб UI не блимав між варіантами"],
        ["Assign A/B variants consistently per user and record which variant each user saw", "Призначати A/B-варіанти стабільно для кожного користувача й записувати, який варіант бачив кожен"],
        ["Remove flags after a rollout or experiment ends, because old flags become technical debt", "Прибирати прапорці після завершення викочування чи експерименту, бо старі прапорці стають технічним боргом"],
        ["Use client-side flags to protect paid or admin-only features", "Використовувати прапорці на клієнті, щоб захистити платні чи адмінські функції"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "contract-first",
      ["What does a contract-first workflow with the backend team look like?", "Як виглядає робота з бекенд-командою за підходом contract-first?"],
      [
        [
          "The OpenAPI or GraphQL schema is the source of truth: types and clients are generated from it (`openapi-typescript`, `graphql-codegen`), mocks such as MSW let the frontend start before the API exists, responses are validated at the boundary (Zod), and CI flags breaking changes",
          "Схема OpenAPI чи GraphQL — джерело правди: з неї генерують типи й клієнти (`openapi-typescript`, `graphql-codegen`), моки на кшталт MSW дають фронтенду почати до появи API, відповіді валідують на межі (Zod), а CI виявляє несумісні зміни",
        ],
        ["The frontend writes types by hand and updates them when something breaks", "Фронтенд пише типи вручну й оновлює їх, коли щось ламається"],
        ["The backend changes fields freely, and the frontend adapts later", "Бекенд вільно змінює поля, а фронтенд підлаштовується згодом"],
        ["Only manual testing in staging", "Лише ручне тестування на staging"],
      ],
      "a",
    ),
    question(
      "env-config",
      ["Which statement about environment configuration in a frontend is true?", "Яке твердження про налаштування середовищ у фронтенді правильне?"],
      [
        ["`.env` values are hidden from users after the build", "Значення з `.env` приховані від користувачів після збирання"],
        [
          "Build-time variables (`VITE_*`, `NEXT_PUBLIC_*`) are embedded in the JavaScript bundle and readable by anyone, so they must never hold secrets; to promote one build through dev, staging and prod, load runtime config (for example a `config.json` fetched at startup)",
          "Змінні часу збирання (`VITE_*`, `NEXT_PUBLIC_*`) вбудовуються в JavaScript-бандл, і їх може прочитати будь-хто, тож у них ніколи не має бути секретів; щоб просувати одну збірку через dev, staging і prod, завантажують налаштування під час виконання (наприклад, `config.json` на старті)",
        ],
        ["Secrets are safe as long as the variable name starts with `SECRET_`", "Секрети в безпеці, якщо назва змінної починається з `SECRET_`"],
        ["Each environment must use a different framework", "Кожне середовище має використовувати інший фреймворк"],
      ],
      "b",
    ),
    question(
      "zero-downtime",
      ["Which practices give zero-downtime frontend deployments?", "Які практики забезпечують розгортання фронтенду без простою?"],
      [
        ["Content-hashed, immutable assets (`main.3f9a1c.js`) cached for a long time, with HTML served without caching", "Незмінні ресурси з хешем у назві (`main.3f9a1c.js`), що довго кешуються, а HTML віддається без кешування"],
        ["Keeping the previous release's assets for a while, because open tabs still load old chunks (and reloading on a chunk load error)", "Зберігати ресурси попереднього релізу якийсь час, бо відкриті вкладки ще завантажують старі чанки (і перезавантажувати сторінку в разі помилки завантаження чанка)"],
        ["Backward-compatible API and storage changes, and feature flags to separate deploying from releasing", "Зворотно сумісні зміни API та сховищ, а також feature flags, щоб розділити розгортання й реліз"],
        ["Deleting the old files the moment the new version is uploaded", "Видаляти старі файли щойно завантажено нову версію"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "corrupted-state",
      ["A bad value saved in localStorage makes the app crash on every load. How should the system be designed to recover?", "Хибне значення в localStorage змушує застосунок падати під час кожного завантаження. Як спроєктувати систему, щоб вона відновлювалася?"],
      [
        ["Ask users to clear their browser data", "Попросити користувачів очистити дані браузера"],
        ["Store more data in localStorage", "Зберігати в localStorage більше даних"],
        ["Ignore errors during startup", "Ігнорувати помилки під час запуску"],
        [
          "Version persisted data, validate it on load (for example with a Zod schema), migrate or discard what doesn't fit and fall back to defaults, and wrap features in error boundaries with a \"reset\" option",
          "Версіонувати збережені дані, перевіряти їх під час завантаження (наприклад, схемою Zod), мігрувати чи відкидати те, що не підходить, і повертатися до значень за замовчуванням, а функції обгортати в error boundaries з можливістю «скинути»",
        ],
      ],
      "d",
    ),
  ],
};

/** Frontend system design: scenario questions not covered by the other modules. */
export const systemDesignModule: ModuleDef = {
  slug: "system-design-interview-questions",
  title: { en: "Frontend system design", uk: "Frontend system design" },
  slides: [{ kind: "lecture", slug: "system-design-questions", title: { en: "Questions", uk: "Питання" } }, systemDesignQuiz],
};
