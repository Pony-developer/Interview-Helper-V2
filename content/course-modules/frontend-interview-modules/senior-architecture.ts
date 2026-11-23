import type { SlideDef } from "../types";
import { question } from "./quiz";

/** Questions 91–104 of the Senior list: architecture. */
export const seniorArchitectureQuiz: SlideDef = {
  kind: "quiz",
  slug: "senior-architecture-quiz",
  title: { en: "Architecture", uk: "Архітектура" },
  questions: [
    question(
      "framework-criteria",
      ["Which characteristics matter when choosing a framework for a new project?", "Які характеристики важливі під час вибору фреймворку для нового проєкту?"],
      [
        ["How many logos are on its website", "Скільки логотипів на його сайті"],
        ["Rendering needs: SSR, SSG, SEO and interactivity", "Потреби в рендерингу: SSR, SSG, SEO та інтерактивність"],
        ["Ecosystem, long-term support and the team's experience", "Екосистема, довгострокова підтримка й досвід команди"],
        ["Performance and bundle size on the target devices", "Продуктивність і розмір бандла на цільових пристроях"],
      ],
      ["b", "c", "d"],
    ),
    question(
      "ui-lib-criteria",
      ["Which characteristics matter when choosing a UI library?", "Які характеристики важливі під час вибору UI-бібліотеки?"],
      [
        ["Accessibility of its components", "Доступність її компонентів"],
        ["How easily it can be themed to the brand's design", "Наскільки легко її підлаштувати під дизайн бренду"],
        ["Whether its default colors match yours, and nothing else", "Чи збігаються її кольори за замовчуванням із вашими, і більше нічого"],
        ["Bundle size and support for tree shaking", "Розмір бандла й підтримка tree shaking"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "signals",
      ["What are signals?", "Що таке сигнали (signals)?"],
      [
        [
          "Reactive values that track who reads them, so when one changes only the dependent computations and DOM parts update, without re-rendering a whole component; used in SolidJS, Preact Signals, Angular signals, Vue refs and Svelte 5 runes",
          "Реактивні значення, що відстежують, хто їх читає, тож коли одне змінюється, оновлюються лише залежні обчислення й частини DOM, без перерендеру всього компонента; використовуються в SolidJS, Preact Signals, сигналах Angular, ref у Vue та runes у Svelte 5",
        ],
        ["Operating system signals such as SIGTERM", "Сигнали операційної системи, як-от SIGTERM"],
        ["Another name for WebSockets", "Інша назва WebSockets"],
        ["DOM events", "Події DOM"],
      ],
      "a",
    ),
    question(
      "monorepo",
      ["What is the key trade-off of a monorepo versus many repositories?", "Який ключовий компроміс монорепозиторію порівняно з багатьма репозиторіями?"],
      [
        ["There is no trade-off", "Компромісу немає"],
        ["Separate repositories cannot use Git", "Окремі репозиторії не можуть використовувати Git"],
        ["A monorepo means the whole system is deployed as one monolith", "Монорепозиторій означає, що вся система розгортається як один моноліт"],
        [
          "A monorepo gives shared code, atomic changes across packages and one toolchain, but needs tooling for builds and CI at scale (Nx, Turborepo, pnpm workspaces) and has coarser access control; separate repos are independent but harder to share and coordinate",
          "Монорепозиторій дає спільний код, атомарні зміни в кількох пакетах і єдиний набір інструментів, але потребує засобів для збирання й CI у великому масштабі (Nx, Turborepo, pnpm workspaces) і має грубіший контроль доступу; окремі репозиторії незалежні, але їм складніше ділитися кодом і координуватися",
        ],
      ],
      "d",
    ),
    question(
      "cicd",
      ["Which description fits a typical CI/CD process?", "Який опис пасує до типового процесу CI/CD?"],
      [
        ["Manual upload over FTP", "Ручне завантаження через FTP"],
        [
          "On every push: install, lint, type check, test and build; a preview deployment for each pull request; after merging to `main`, deploy to staging and then production, automatically or with approval, with monitoring and rollback",
          "На кожен push: встановлення залежностей, лінтер, перевірка типів, тести й збирання; preview-розгортання для кожного pull request; після злиття в `main` — розгортання на staging, а потім на продакшн, автоматично чи з підтвердженням, із моніторингом і відкатом",
        ],
        ["Deploying to production without any tests", "Розгортання на продакшн без жодних тестів"],
        ["Running CI only on Fridays", "Запуск CI лише по п'ятницях"],
      ],
      "b",
    ),
    question(
      "microservices",
      ["What is the main advantage of microservices over a monolith, and what does it cost?", "Яка головна перевага мікросервісів над монолітом і яка її ціна?"],
      [
        ["Microservices are always faster", "Мікросервіси завжди швидші"],
        ["They have no costs", "Вони нічого не коштують"],
        [
          "Services can be developed, deployed and scaled independently by separate teams; the cost is the complexity of a distributed system: network calls, data consistency, observability and operations",
          "Сервіси можна розробляти, розгортати й масштабувати незалежно окремими командами; ціна — складність розподіленої системи: мережеві виклики, узгодженість даних, спостережуваність та експлуатація",
        ],
        ["All services must share one database", "Усі сервіси мають використовувати одну базу даних"],
      ],
      "c",
    ),
    question(
      "high-availability",
      ["Which techniques help design a system for high availability and scale?", "Які прийоми допомагають спроєктувати систему для високої доступності й масштабування?"],
      [
        ["Stateless services behind a load balancer, scaled horizontally", "Сервіси без стану за балансувальником навантаження з горизонтальним масштабуванням"],
        ["A single server with no backups", "Один сервер без резервних копій"],
        ["Redundancy across zones, and health checks with automatic failover", "Резервування в кількох зонах і перевірки стану з автоматичним перемиканням"],
        ["Caching and a CDN to take load off the origin", "Кешування та CDN, щоб зняти навантаження з основного сервера"],
      ],
      ["a", "c", "d"],
    ),
    question(
      "design-patterns-senior",
      [
        "Which pattern fits wrapping a third-party API so that the rest of the app doesn't depend on its shape?",
        "Який патерн підходить, щоб обгорнути стороннє API так, аби решта застосунку не залежала від його форми?",
      ],
      [
        ["Singleton", "Singleton (одинак)"],
        ["Adapter", "Adapter (адаптер)"],
        ["Observer", "Observer (спостерігач)"],
        ["Iterator", "Iterator (ітератор)"],
      ],
      "b",
    ),
    question(
      "scaling-strategies",
      ["Which of these are strategies for scaling web applications?", "Що з цього — стратегії масштабування вебзастосунків?"],
      [
        ["Horizontal scaling: more instances behind a load balancer", "Горизонтальне масштабування: більше екземплярів за балансувальником"],
        ["Caching at every layer: CDN, HTTP, application and database", "Кешування на кожному рівні: CDN, HTTP, застосунок і база даних"],
        ["Database read replicas and sharding", "Репліки бази даних для читання та шардинг"],
        ["Making every request synchronous and serial", "Робити кожен запит синхронним і послідовним"],
      ],
      ["a", "b", "c"],
    ),
    question(
      "spa",
      ["What is a main drawback of a purely client-rendered SPA?", "Який головний недолік SPA, що рендериться лише на клієнті?"],
      [
        ["It has no drawbacks", "Недоліків немає"],
        ["The page reloads on every click", "Сторінка перезавантажується на кожен клік"],
        ["It cannot call APIs", "Вона не може звертатися до API"],
        [
          "The first load needs a lot of JS before content appears, which hurts SEO and LCP without SSR; it also needs client-side routing, focus management and care about memory",
          "Перше завантаження потребує багато JS, перш ніж з'явиться вміст, що без SSR шкодить SEO і LCP; до того ж потрібні клієнтська маршрутизація, керування фокусом і увага до пам'яті",
        ],
      ],
      "d",
    ),
    question(
      "web-architecture-patterns",
      ["Which description fits the MVVM pattern used by many frameworks?", "Який опис пасує до патерну MVVM, що використовують багато фреймворків?"],
      [
        ["A way of splitting the backend into microservices", "Спосіб розділити бекенд на мікросервіси"],
        [
          "The View binds to a ViewModel that exposes state and commands, and the ViewModel talks to the Model; the View holds no business logic",
          "View прив'язується до ViewModel, яка надає стан і команди, а ViewModel взаємодіє з Model; у View немає бізнес-логіки",
        ],
        ["MVC without a model", "MVC без моделі"],
        ["A database indexing pattern", "Патерн індексування бази даних"],
      ],
      "b",
    ),
    question(
      "scalable-frontend",
      ["Which principles help build scalable, high-performance frontend systems?", "Які принципи допомагають будувати масштабовані й високопродуктивні фронтенд-системи?"],
      [
        ["Clear module boundaries and a shared design system", "Чіткі межі модулів і спільна дизайн-система"],
        ["Performance budgets and monitoring in production (RUM)", "Бюджети продуктивності та моніторинг на продакшні (RUM)"],
        ["One global store for everything, changed from anywhere", "Одне глобальне сховище для всього, яке змінюють звідусіль"],
        ["A rendering strategy per page: static, server or client", "Стратегія рендерингу для кожної сторінки: статичний, серверний чи клієнтський"],
      ],
      ["a", "b", "d"],
    ),
    question(
      "micro-frontends",
      ["What are micro-frontends?", "Що таке мікрофронтенди?"],
      [
        ["Very small CSS files", "Дуже маленькі CSS-файли"],
        ["A frontend for mobile devices only", "Фронтенд лише для мобільних пристроїв"],
        [
          "A frontend split into parts that different teams develop and deploy independently, composed at build time or at runtime (Module Federation, single-spa, iframes or web components); the costs are duplicated dependencies and keeping the UI consistent",
          "Фронтенд, розділений на частини, які різні команди розробляють і розгортають незалежно, а збирають разом під час збирання чи виконання (Module Federation, single-spa, iframe чи вебкомпоненти); ціна — дубльовані залежності й складність зберегти однорідність UI",
        ],
        ["A single React component", "Один React-компонент"],
      ],
      "c",
    ),
    question(
      "buy-vs-build",
      ["How do you decide between a ready-made solution and building your own?", "Як вирішити між готовим рішенням і розробкою власного?"],
      [
        [
          "Build what is core to the product and sets it apart; use ready-made or open-source solutions for commodity problems, after checking fit, maintenance, licensing, lock-in and the total cost of ownership",
          "Розробляти те, що є ядром продукту й вирізняє його; для типових задач брати готові чи опенсорсні рішення, перевіривши відповідність, підтримку, ліцензію, залежність від постачальника й загальну вартість володіння",
        ],
        ["Always build everything yourself", "Завжди все розробляти самому"],
        ["Always buy everything", "Завжди все купувати"],
        ["Whatever is fastest to start today", "Те, з чим найшвидше почати сьогодні"],
      ],
      "a",
    ),
  ],
};
