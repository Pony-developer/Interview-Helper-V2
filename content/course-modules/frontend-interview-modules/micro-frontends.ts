import type { ModuleDef, SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 1–10 of the micro-frontends list. */
export const microFrontendsQuiz: SlideDef = {
  kind: "quiz",
  slug: "micro-frontends-quiz",
  title: { en: "Micro-frontends", uk: "Мікрофронтенди" },
  questions: [
    question(
      "mfe-boundaries",
      ["How should a large app be split into micro-frontends?", "Як варто ділити великий застосунок на мікрофронтенди?"],
      [
        ["By technical layer: one team owns all components, another all styles, a third all API calls", "За технічними шарами: одна команда володіє всіма компонентами, інша — всіма стилями, третя — всіма викликами API"],
        ["One micro-frontend per React component", "Один мікрофронтенд на кожен React-компонент"],
        [
          "Along business domains (auth, catalog, checkout), each owned end to end by one team and mounted by an app shell, for example through Module Federation `exposes`; for a small app or a single team the extra cost usually isn't worth it",
          "За бізнес-доменами (автентифікація, каталог, оформлення замовлення), кожним від початку до кінця володіє одна команда, а монтує їх app shell, наприклад через `exposes` у Module Federation; для невеликого застосунку чи однієї команди додаткові витрати зазвичай не варті того",
        ],
        ["Randomly, so that all parts are the same size", "Довільно, аби всі частини були однакового розміру"],
      ],
      "c",
    ),
    question(
      "mfe-shared-deps",
      ["How do you keep micro-frontends from each loading their own copy of React?", "Як не дати кожному мікрофронтенду завантажувати власну копію React?"],
      [
        [
          "List them in Module Federation's `shared` config, `react: { singleton: true, requiredVersion: '^18.0.0' }`, so one copy is negotiated at runtime; keep versions aligned across repos and check for conflicts in CI, and declare React as a `peerDependency` in shared packages",
          "Вказати їх у конфігурації `shared` у Module Federation, `react: { singleton: true, requiredVersion: '^18.0.0' }`, щоб одна копія узгоджувалася під час виконання; тримати версії узгодженими між репозиторіями й перевіряти конфлікти в CI, а в спільних пакетах оголошувати React як `peerDependency`",
        ],
        ["Copy React's source into each micro-frontend", "Скопіювати вихідний код React у кожен мікрофронтенд"],
        ["It can't be avoided; each part always ships its own React", "Цього не уникнути: кожна частина завжди постачає власний React"],
        ["Load React from a different CDN in each micro-frontend", "Вантажити React з іншого CDN у кожному мікрофронтенді"],
      ],
      "a",
    ),
    question(
      "mfe-state",
      ["How should micro-frontends share state?", "Як мікрофронтендам ділитися станом?"],
      [
        ["Through one big shared Redux store that every team can change freely", "Через один великий спільний Redux store, який кожна команда може вільно змінювати"],
        [
          "As little as possible: pass context such as the user or locale from the shell, communicate through events (`CustomEvent` on `window`, a small pub/sub) or the URL, and treat any shared store exposed through Module Federation as a versioned contract",
          "Якомога менше: передавати контекст, як-от користувача чи мову, з shell, спілкуватися через події (`CustomEvent` на `window`, невеликий pub/sub) або URL, а будь-який спільний store, відкритий через Module Federation, вважати версійованим контрактом",
        ],
        ["Through global variables on `window` that anyone can overwrite", "Через глобальні змінні на `window`, які будь-хто може перезаписати"],
        ["Micro-frontends can't communicate at all", "Мікрофронтенди взагалі не можуть спілкуватися"],
      ],
      "b",
    ),
    question(
      "mfe-routing",
      ["How is routing usually split between the shell and micro-frontends?", "Як зазвичай розподіляють маршрутизацію між shell і мікрофронтендами?"],
      [
        ["Every micro-frontend listens to every URL and decides on its own", "Кожен мікрофронтенд слухає кожен URL і вирішує сам"],
        ["Each micro-frontend uses its own domain", "Кожен мікрофронтенд використовує власний домен"],
        ["Routing is impossible with micro-frontends", "З мікрофронтендами маршрутизація неможлива"],
        [
          "The shell owns top-level prefixes and mounts each app there, such as `<Route path=\"/checkout/*\" element={<CheckoutApp />} />` (or single-spa activity functions); the app handles its own sub-routes under that base path, so URL prefixes are agreed upfront and don't collide",
          "Shell володіє префіксами верхнього рівня й монтує туди кожен застосунок, як-от `<Route path=\"/checkout/*\" element={<CheckoutApp />} />` (чи activity functions у single-spa); застосунок обробляє власні підмаршрути під цим базовим шляхом, тож URL-префікси узгоджують заздалегідь, і вони не конфліктують",
        ],
      ],
      "d",
    ),
    question(
      "mfe-consistent-ui",
      ["Which practices keep the UI consistent across micro-frontends from different teams?", "Які практики зберігають єдиний UI у мікрофронтендах різних команд?"],
      [
        ["A shared design system package with design tokens, documented in Storybook", "Спільний пакет дизайн-системи з дизайн-токенами, задокументований у Storybook"],
        ["Scoped styles (CSS Modules, CSS-in-JS or Shadow DOM) so one app's CSS doesn't leak into another", "Ізольовані стилі (CSS Modules, CSS-in-JS чи Shadow DOM), щоб CSS одного застосунку не протікав в інший"],
        ["Every team writes global CSS with generic class names like `.button`", "Кожна команда пише глобальний CSS із загальними назвами класів, як-от `.button`"],
        ["Shared lint rules and visual regression tests in CI", "Спільні правила лінтингу й візуальні регресійні тести в CI"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "mfe-testing",
      ["How do you test a micro-frontend system?", "Як тестувати систему мікрофронтендів?"],
      [
        [
          "Each micro-frontend has its own unit and integration tests (with mocked APIs, for example MSW) and contract tests for what it exposes; a smaller set of end-to-end tests in Playwright or Cypress runs against the integrated shell for the critical flows",
          "Кожен мікрофронтенд має власні модульні й інтеграційні тести (з мокнутими API, наприклад через MSW) та контрактні тести для того, що він відкриває; менший набір end-to-end тестів у Playwright чи Cypress перевіряє критичні сценарії на зібраному shell",
        ],
        ["Only end-to-end tests of the whole system, nothing per app", "Лише end-to-end тести всієї системи, нічого для окремих застосунків"],
        ["Each team tests only manually in production", "Кожна команда тестує лише вручну в продакшені"],
        ["Testing is unnecessary because the parts are independent", "Тестування не потрібне, бо частини незалежні"],
      ],
      "a",
    ),
    question(
      "mfe-deploy",
      ["How are micro-frontends deployed independently?", "Як незалежно розгортають мікрофронтенди?"],
      [
        ["All teams merge into one repository and release together once a month", "Усі команди зливають код в один репозиторій і випускають разом раз на місяць"],
        ["The shell is rebuilt every time any micro-frontend changes", "Shell перезбирають щоразу, коли змінюється будь-який мікрофронтенд"],
        [
          "Each pipeline lints, tests and builds its app, uploads the versioned files (including `remoteEntry.js`) to a CDN, then updates a manifest that tells the shell which version to load per environment, so a rollback is just pointing the manifest back",
          "Кожен конвеєр перевіряє лінтером, тестує й збирає свій застосунок, завантажує версійовані файли (зокрема `remoteEntry.js`) на CDN, а потім оновлює маніфест, що каже shell, яку версію вантажити в кожному середовищі, тож відкат — це просто повернути маніфест назад",
        ],
        ["By editing files directly on the production server", "Редагуючи файли просто на продакшен-сервері"],
      ],
      "c",
    ),
    question(
      "mfe-debugging",
      ["A page built from several micro-frontends breaks. What helps find the cause quickly?", "Сторінка, зібрана з кількох мікрофронтендів, ламається. Що допомагає швидко знайти причину?"],
      [
        ["Rebuilding every micro-frontend from scratch", "Перезібрати кожен мікрофронтенд з нуля"],
        [
          "Check the Network tab for a missing or outdated `remoteEntry.js` and the console for shared-version warnings, expose each app's version or build hash, use source maps and error tracking tagged by app, and use feature flags to switch a suspect micro-frontend off",
          "Перевірити на вкладці Network, чи немає відсутнього чи застарілого `remoteEntry.js`, а в консолі — попередження про версії спільних залежностей, показувати версію чи хеш збірки кожного застосунку, використовувати source maps і трекінг помилок із тегом застосунку, а підозрілий мікрофронтенд вимикати feature flag-ом",
        ],
        ["Removing Module Federation", "Прибрати Module Federation"],
        ["Asking every team to check their code at the same time", "Попросити всі команди одночасно перевірити свій код"],
      ],
      "b",
    ),
    question(
      "mfe-performance",
      ["Which of these improve the performance of a micro-frontend app?", "Що з цього покращує продуктивність застосунку з мікрофронтендами?"],
      [
        ["Lazy-loading each micro-frontend only when its route is opened, for example with `React.lazy(() => import('checkout/CheckoutApp'))`", "Ліниво вантажити кожен мікрофронтенд лише тоді, коли відкривають його маршрут, наприклад через `React.lazy(() => import('checkout/CheckoutApp'))`"],
        ["Sharing big libraries as singletons instead of bundling them in every app", "Ділити великі бібліотеки як singleton, а не включати їх у кожен застосунок"],
        ["Caching `remoteEntry.js` for a year under the same URL", "Кешувати `remoteEntry.js` на рік за тим самим URL"],
        ["Long-term caching of hashed chunks, while `remoteEntry.js` is either versioned in its URL or cached only briefly", "Довготривале кешування chunks із хешем, тоді як `remoteEntry.js` або має версію в URL, або кешується лише ненадовго"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "mfe-onboarding",
      ["What helps a team adopt micro-frontends without creating chaos?", "Що допомагає команді перейти на мікрофронтенди без хаосу?"],
      [
        ["Letting every team pick its own framework, build tool and conventions with no guidance", "Дозволити кожній команді обрати власний фреймворк, інструмент збирання й домовленості без жодних настанов"],
        ["Skipping documentation because the code explains itself", "Не писати документацію, бо код пояснює себе сам"],
        ["Sharing internal modules freely between apps instead of defining interfaces", "Вільно ділитися внутрішніми модулями між застосунками замість визначення інтерфейсів"],
        [
          "Architecture docs and diagrams, a template repository with Module Federation, tests and CI already set up, a catalog of available remotes and shared packages, and reviews that focus on boundaries and small, contract-based interfaces between apps",
          "Документація й діаграми архітектури, шаблонний репозиторій із готовими Module Federation, тестами й CI, каталог доступних remotes і спільних пакетів та рев'ю, що зосереджені на межах і невеликих контрактних інтерфейсах між застосунками",
        ],
      ],
      "d",
    ),
  ],
};

/**
 * Micro-frontends: splitting, shared dependencies, state, routing, UI consistency, testing,
 * deployment, debugging, performance and onboarding. The basic "what are micro-frontends" is in the Senior module.
 */
export const microFrontendsModule: ModuleDef = {
  slug: "micro-frontends-interview-questions",
  title: { en: "Micro-frontends", uk: "Мікрофронтенди" },
  slides: [
    { kind: "lecture", slug: "micro-frontends-questions", title: { en: "Questions", uk: "Питання" } },
    microFrontendsQuiz,
  ],
};
