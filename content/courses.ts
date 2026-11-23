/**
 * Local copy of the courses seeded by supabase/migrations/20261122120000_courses.sql.
 * Used only when Supabase isn't configured (local development without a database).
 * Keep both in sync.
 */
export type CourseContent = {
  slug: string;
  title: { en: string; uk: string };
  summary: { en: string; uk: string };
  topics: { en: string; uk: string }[];
};

export const courses: CourseContent[] = [
  {
    slug: "csharp",
    title: { en: "C#", uk: "C#" },
    summary: {
      en: "From your first program to async/await and ASP.NET Core: the C# language, algorithms, OOP and the .NET runtime that backend and desktop interviews test, with coding practice in every module.",
      uk: "Від першої програми до async/await і ASP.NET Core: мова C#, алгоритми, ООП і платформа .NET, які перевіряють на співбесідах для backend- та desktop-ролей, з практикою коду в кожному модулі.",
    },
    topics: [
      { en: "Basics: types, branching, loops, arrays, strings and files", uk: "Основи: типи, розгалуження, цикли, масиви, рядки та файли" },
      { en: "Algorithms: Big O, recursion, searching and sorting", uk: "Алгоритми: Big O, рекурсія, пошук і сортування" },
      { en: "OOP: inheritance, encapsulation, abstraction and polymorphism", uk: "ООП: успадкування, інкапсуляція, абстракція та поліморфізм" },
      { en: "Generics, collections and yield return", uk: "Узагальнення, колекції та yield return" },
      { en: "Delegates, events and LINQ", uk: "Делегати, події та LINQ" },
      { en: "Modern C#: records, pattern matching and nullable types", uk: "Сучасний C#: record, зіставлення зі зразком і nullable-типи" },
      { en: "Under the hood: CLR, memory, garbage collection and exceptions", uk: "Під капотом: CLR, пам'ять, збирання сміття та винятки" },
      { en: "Multithreading, async/await and concurrency", uk: "Багатопотоковість, async/await і конкурентність" },
      { en: "ASP.NET Core, dependency injection and testing with xUnit", uk: "ASP.NET Core, dependency injection і тестування з xUnit" },
    ],
  },
  {
    slug: "javascript",
    title: { en: "JavaScript", uk: "JavaScript" },
    summary: {
      en: "The language behind every frontend interview: how values, scope and the event loop really work, from the first line to modern async code.",
      uk: "Мова, на якій тримаються всі frontend-співбесіди: як насправді працюють значення, область видимості та event loop, від першого рядка до сучасного асинхронного коду.",
    },
    topics: [
      { en: "Values, types and coercion", uk: "Значення, типи та приведення типів" },
      { en: "Scope, closures and this", uk: "Область видимості, замикання та this" },
      { en: "Prototypes and classes", uk: "Прототипи та класи" },
      { en: "Promises, async/await and the event loop", uk: "Проміси, async/await і event loop" },
      { en: "Modules and the DOM", uk: "Модулі та DOM" },
      { en: "Testing and tooling", uk: "Тестування та інструменти" },
    ],
  },
  {
    slug: "databases",
    title: { en: "Databases", uk: "Бази даних" },
    summary: {
      en: "SQL on PostgreSQL from the first SELECT to joins, window functions, indexes, transactions and triggers, then NoSQL with MongoDB and when to choose which, ending with a final challenge. Practice runs on a real PostgreSQL in your browser.",
      uk: "SQL у PostgreSQL від першого SELECT до з'єднань, віконних функцій, індексів, транзакцій і тригерів, а далі NoSQL на прикладі MongoDB і коли що обирати, із фінальним випробуванням наприкінці. Практика виконується на справжньому PostgreSQL просто у браузері.",
    },
    topics: [
      { en: "Relational model: tables, types and constraints", uk: "Реляційна модель: таблиці, типи та обмеження" },
      { en: "SELECT, INSERT, UPDATE and DELETE", uk: "SELECT, INSERT, UPDATE і DELETE" },
      { en: "Joins, aggregation and grouping", uk: "З'єднання, агрегація та групування" },
      { en: "Subqueries, CTEs and window functions", uk: "Підзапити, CTE та віконні функції" },
      { en: "Schema design and normalization", uk: "Проєктування схеми та нормалізація" },
      { en: "Indexes, EXPLAIN and performance", uk: "Індекси, EXPLAIN і продуктивність" },
      { en: "Transactions, isolation levels and locking", uk: "Транзакції, рівні ізоляції та блокування" },
      { en: "Views, functions, triggers and JSON", uk: "Представлення, функції, тригери та JSON" },
      { en: "NoSQL with MongoDB, SQL vs NoSQL", uk: "NoSQL на прикладі MongoDB, SQL проти NoSQL" },
    ],
  },
  {
    slug: "dynamics-crm",
    title: { en: "Dynamics CRM Development", uk: "Розробка для Dynamics CRM" },
    summary: {
      en: "Server- and client-side development on Dynamics 365 and Dataverse: the data model, solutions and ALM, the SDK and FetchXML, plug-ins and the event pipeline, Custom APIs and integrations, form scripts and PCF, and the security model, with C# and SQL practice that models the platform.",
      uk: "Серверна та клієнтська розробка на Dynamics 365 і Dataverse: модель даних, рішення та ALM, SDK і FetchXML, плагіни та конвеєр подій, Custom API та інтеграції, скрипти форм і PCF, модель безпеки, з практикою на C# і SQL, що моделює платформу.",
    },
    topics: [
      { en: "Dynamics 365, Power Platform and Dataverse tables", uk: "Dynamics 365, Power Platform і таблиці Dataverse" },
      { en: "Solutions, layers and ALM pipelines", uk: "Рішення, шари та конвеєри ALM" },
      { en: "IOrganizationService, QueryExpression and FetchXML", uk: "IOrganizationService, QueryExpression і FetchXML" },
      { en: "Plug-in fundamentals: architecture, messages, the pipeline, a Hello World plug-in", uk: "Основи плагінів: архітектура, повідомлення, конвеєр, плагін Hello World" },
      { en: "Impersonation, shared variables, depth, configuration and async plug-ins", uk: "Імперсонація, shared variables, глибина, конфігурація та асинхронні плагіни" },
      { en: "Custom workflow activities: development, deployment, debugging, versioning", uk: "Власні workflow activities: розробка, розгортання, налагодження, версіонування" },
      { en: "Service.Execute: request and response classes, ExecuteMultiple", uk: "Service.Execute: класи запитів і відповідей, ExecuteMultiple" },
      { en: "Testable plug-ins and common pitfalls", uk: "Тестовані плагіни та типові пастки" },
      { en: "Custom APIs, integrations and service protection limits", uk: "Custom API, інтеграції та ліміти захисту сервісу" },
      { en: "Client API: form scripts, lookups, grids, business process flows and PCF controls", uk: "Client API: скрипти форм, lookup-поля, сітки, business process flows і PCF-контроли" },
      { en: "Client-side best practices: TypeScript, performance, debugging, supported code", uk: "Найкращі практики клієнта: TypeScript, продуктивність, налагодження, підтримуваний код" },
      { en: "HTML web resources and the Web API", uk: "HTML веб-ресурси та Web API" },
      { en: "Security: business units, roles, teams and column security", uk: "Безпека: бізнес-підрозділи, ролі, команди та безпека стовпців" },
    ],
  },
  {
    slug: "frontend-interview",
    title: { en: "Frontend Interview Preparation", uk: "Підготовка до frontend-співбесіди" },
    summary: {
      en: "Preparation for the frontend part of a Dynamics CRM developer interview at Junior, Middle and Senior level: typical questions on HTML, CSS, JavaScript and TypeScript, browser APIs, frameworks, networking, the backend, algorithms, Git, testing, accessibility and performance, with a quiz for each section.",
      uk: "Підготовка до frontend-частини співбесіди на розробника Dynamics CRM рівня Junior, Middle і Senior: типові питання з HTML, CSS, JavaScript і TypeScript, API браузера, фреймворків, мережі, бекенда, алгоритмів, Git, тестування, доступності та продуктивності із квізом до кожного розділу.",
    },
    topics: [
      { en: "General questions: code quality, HTTP, security, OOP", uk: "Загальні питання: якість коду, HTTP, безпека, ООП" },
      { en: "HTML: structure, semantics, forms, links and SVG", uk: "HTML: структура, семантика, форми, посилання та SVG" },
      { en: "CSS: selectors, box model, Flexbox and Grid, positioning, responsive design", uk: "CSS: селектори, модель коробки, Flexbox і Grid, позиціонування, адаптивність" },
      { en: "Web performance: Core Web Vitals, images, optimization", uk: "Web performance: Core Web Vitals, зображення, оптимізація" },
      { en: "JavaScript basics: types, scope, closures, events, async code", uk: "Основи JavaScript: типи, область видимості, замикання, події, асинхронний код" },
      { en: "TypeScript: types, interfaces, generics, migration from JS", uk: "TypeScript: типи, інтерфейси, generics, міграція з JS" },
      { en: "Browser APIs: the DOM, requests, storage, events", uk: "API браузера: DOM, запити, сховища, події" },
      { en: "Frameworks: components, state, SSR, React, Angular, Vue", uk: "Фреймворки: компоненти, стан, SSR, React, Angular, Vue" },
      { en: "Networking and the backend: HTTP, REST, CORS, WebSocket, auth, GraphQL", uk: "Мережа та бекенд: HTTP, REST, CORS, WebSocket, автентифікація, GraphQL" },
      { en: "Algorithms and data structures: complexity, sorting, search, trees, graphs", uk: "Алгоритми та структури даних: складність, сортування, пошук, дерева, графи" },
      { en: "Git, testing and accessibility", uk: "Git, тестування та доступність" },
      { en: "Middle level: SOLID, project structure, modern CSS, performance in practice, JavaScript and React in depth, tests and accessibility", uk: "Рівень Middle: SOLID, структура проєкту, сучасний CSS, продуктивність на практиці, JavaScript і React глибше, тести та доступність" },
      { en: "Senior level: teamwork, estimation, mentoring, CSS architecture at scale, React internals, testing strategy, system architecture, security", uk: "Рівень Senior: робота в команді, оцінювання, менторство, CSS-архітектура великих проєктів, React зсередини, стратегія тестування, архітектура систем, безпека" },
    ],
  },
];
