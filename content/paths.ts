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
      en: "The route to a Dynamics 365 and Power Platform developer role: first the C# that plugins and custom APIs are written in, then the relational thinking behind Dataverse tables, relationships and queries, and finally the platform itself: plug-ins, solutions, integrations and security.",
      uk: "Шлях до ролі розробника Dynamics 365 і Power Platform: спершу C#, яким пишуть плагіни та custom API, далі реляційне мислення, на якому тримаються таблиці, зв'язки та запити Dataverse, і насамкінець сама платформа: плагіни, рішення, інтеграції та безпека.",
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
        course: "databases",
        why: {
          en: "Dataverse is a relational store underneath. Joins, indexes, transactions and schema design explain how tables, lookups and FetchXML behave, and how to keep them fast.",
          uk: "Під Dataverse лежить реляційне сховище. З'єднання, індекси, транзакції та проєктування схеми пояснюють, як поводяться таблиці, lookup-поля і FetchXML і як зберегти їхню швидкодію.",
        },
      },
      {
        course: "dynamics-crm",
        why: {
          en: "Now the platform itself: Dataverse tables, solutions and ALM, the SDK, plug-ins in the event pipeline, Custom APIs, integrations, form scripts and the security model. This is where the C# and SQL from the first two stages turn into Dynamics 365 work.",
          uk: "Тепер сама платформа: таблиці Dataverse, рішення та ALM, SDK, плагіни в конвеєрі подій, Custom API, інтеграції, скрипти форм і модель безпеки. Саме тут C# і SQL із перших двох етапів перетворюються на роботу з Dynamics 365.",
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
