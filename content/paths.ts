/**
 * Career paths: an ordered route through existing courses toward one role.
 * Paths only reference courses by slug; course titles, summaries and modules come from the course data.
 */
export type Localized = { en: string; uk: string };

export type PathStep = {
  /** Slug of a course in content/courses.ts (and the `courses` table). */
  course: string;
  /** Why this course sits at this point of the route. */
  why: Localized;
};

export type PathContent = {
  slug: string;
  title: Localized;
  summary: Localized;
  /** What someone who finishes the path can do on the job. */
  outcomes: Localized[];
  steps: PathStep[];
  /** Skill slugs (content/skills.ts) for the closing mock interview. */
  practiceSkills: string[];
};

export const paths: PathContent[] = [
  {
    slug: "dynamics-crm-developer",
    title: { en: "Dynamics CRM Developer", uk: "Dynamics CRM розробник" },
    summary: {
      en: "The route to a Dynamics 365 and Power Platform developer role: first the C# that plugins and custom APIs are written in and how it works under the hood, then the design patterns that shape well-built code, the relational thinking behind Dataverse tables, relationships and queries, and finally the platform itself: plug-ins, solutions, integrations and security.",
      uk: "Шлях до ролі розробника Dynamics 365 і Power Platform: спершу C#, яким пишуть плагіни та custom API, і те, як він працює під капотом, далі патерни проєктування, з яких складається добре збудований код, реляційне мислення, на якому тримаються таблиці, зв'язки та запити Dataverse, і насамкінець сама платформа: плагіни, рішення, інтеграції та безпека.",
    },
    outcomes: [
      {
        en: "Write and unit-test server-side C#, the language of plugins, custom workflow activities and custom APIs",
        uk: "Писати й покривати тестами серверний C#: мову плагінів, custom workflow activities і custom API",
      },
      {
        en: "Reason about async code, dependency injection and clean structure in Azure Functions and integrations",
        uk: "Розуміти асинхронний код, dependency injection і чисту структуру в Azure Functions та інтеграціях",
      },
      {
        en: "Explain what happens under the hood: garbage collection and disposal, thread safety, reflection, serialization and HttpClient usage in integrations",
        uk: "Пояснювати, що відбувається під капотом: збирання сміття та звільнення ресурсів, потокобезпечність, рефлексію, серіалізацію та використання HttpClient в інтеграціях",
      },
      {
        en: "Recognize and apply the classic design patterns, and explain in plain words why a plug-in or integration is built the way it is",
        uk: "Розпізнавати й застосовувати класичні патерни проєктування та простими словами пояснювати, чому плагін чи інтеграцію побудовано саме так",
      },
      {
        en: "Model tables and relationships the way Dataverse stores them: keys, lookups and many-to-many",
        uk: "Моделювати таблиці та зв'язки так, як їх зберігає Dataverse: ключі, lookup-поля, many-to-many",
      },
      {
        en: "Write and tune queries: the thinking behind FetchXML, views and reporting",
        uk: "Писати й оптимізувати запити: мислення, що стоїть за FetchXML, поданнями та звітами",
      },
      {
        en: "Explain transactions and locking, since synchronous plugins run inside the platform's database transaction",
        uk: "Пояснювати транзакції та блокування, адже синхронні плагіни виконуються всередині транзакції платформи",
      },
      {
        en: "Build plug-ins and Custom APIs, ship them in managed solutions, and design security roles, teams and integrations",
        uk: "Створювати плагіни та Custom API, постачати їх у керованих рішеннях, проєктувати ролі безпеки, команди та інтеграції",
      },
    ],
    steps: [
      {
        course: "csharp",
        why: {
          en: "Every server-side extension of Dynamics 365 is .NET code. Get fluent with types, LINQ, exceptions, async/await and testing before you meet IPlugin and the SDK.",
          uk: "Кожне серверне розширення Dynamics 365 це код на .NET. Опануйте типи, LINQ, винятки, async/await і тестування, перш ніж братися за IPlugin та SDK.",
        },
      },
      {
        course: "advanced-csharp",
        why: {
          en: "Then go deeper than everyday C#: how the CLR, garbage collector and thread pool really behave, delegates and expression trees behind LINQ, reflection and attributes, async pitfalls, locking, serialization and HTTP. Plug-ins run in a sandbox with strict time limits and are inspected via reflection by the platform, so this depth is what separates a working plug-in from a reliable one.",
          uk: "Далі заглибтеся за межі повсякденного C#: як насправді поводяться CLR, збирач сміття та пул потоків, делегати й дерева виразів за LINQ, рефлексія та атрибути, пастки async, блокування, серіалізація та HTTP. Плагіни виконуються в пісочниці зі строгими обмеженнями часу, а платформа досліджує їх через рефлексію, тож саме ця глибина відрізняє плагін, що просто працює, від надійного.",
        },
      },
      {
        course: "design-patterns",
        why: {
          en: "With the language in hand, learn how to shape code. Plug-ins are a pipeline of handlers, Execute takes request objects, services come from factories: knowing the patterns behind them makes plug-ins testable and the interview questions on architecture easy.",
          uk: "Коли мова вже в руках, навчіться правильно будувати код. Плагіни — це конвеєр обробників, Execute приймає об'єкти запитів, сервіси приходять із фабрик: знання патернів, що стоять за цим, робить плагіни тестованими, а питання про архітектуру на співбесіді — простими.",
        },
      },
      {
        course: "databases",
        why: {
          en: "Dataverse is a relational store underneath. Joins, indexes, transactions and schema design explain how tables, lookups and FetchXML behave, and how to keep them fast.",
          uk: "Під Dataverse лежить реляційне сховище. З'єднання, індекси, транзакції та проєктування схеми пояснюють, як поводяться таблиці, lookup-поля і FetchXML і як зберегти їхню швидкодію.",
        },
      },
      {
        course: "dynamics-crm",
        why: {
          en: "Now the platform itself: Dataverse tables, solutions and ALM, the SDK, plug-ins in the event pipeline, Custom APIs, integrations, form scripts and the security model. This is where the C#, patterns and SQL from the earlier stages turn into Dynamics 365 work.",
          uk: "Тепер сама платформа: таблиці Dataverse, рішення та ALM, SDK, плагіни в конвеєрі подій, Custom API, інтеграції, скрипти форм і модель безпеки. Саме тут C#, патерни й SQL із попередніх етапів перетворюються на роботу з Dynamics 365.",
        },
      },
      {
        course: "frontend-interview",
        why: {
          en: "Dynamics developers also own the client side: form scripts, web resources and PCF controls. This stage prepares you for the frontend questions of the interview.",
          uk: "Розробник Dynamics відповідає й за клієнтську частину: скрипти форм, веб-ресурси та PCF-контроли. Цей етап готує до frontend-питань співбесіди.",
        },
      },
    ],
    practiceSkills: ["dynamics-crm", "csharp", "sql"],
  },
];
