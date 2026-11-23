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
      en: "From your first class to async/await: the C# language and the .NET runtime that backend and desktop interviews test.",
      uk: "Від першого класу до async/await: мова C# і платформа .NET, які перевіряють на співбесідах для backend- та desktop-ролей.",
    },
    topics: [
      { en: "Types, variables and nullable reference types", uk: "Типи, змінні та nullable-посилання" },
      { en: "Classes, records and structs", uk: "Класи, record і struct" },
      { en: "Interfaces, generics and LINQ", uk: "Інтерфейси, узагальнення та LINQ" },
      { en: "async/await and Task", uk: "async/await і Task" },
      { en: "Dependency injection and ASP.NET Core", uk: "Dependency injection та ASP.NET Core" },
      { en: "Testing with xUnit", uk: "Тестування з xUnit" },
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
      en: "SQL on PostgreSQL from the first SELECT to joins, window functions, indexes and transactions, then NoSQL with MongoDB and when to choose which. Practice runs on a real PostgreSQL in your browser.",
      uk: "SQL у PostgreSQL від першого SELECT до з'єднань, віконних функцій, індексів і транзакцій, а далі NoSQL на прикладі MongoDB і коли що обирати. Практика виконується на справжньому PostgreSQL просто у браузері.",
    },
    topics: [
      { en: "Relational model and PostgreSQL", uk: "Реляційна модель і PostgreSQL" },
      { en: "SELECT, joins and aggregation", uk: "SELECT, з'єднання та агрегація" },
      { en: "Subqueries, CTEs and window functions", uk: "Підзапити, CTE та віконні функції" },
      { en: "Schema design and normalization", uk: "Проєктування схеми та нормалізація" },
      { en: "Indexes, EXPLAIN and transactions", uk: "Індекси, EXPLAIN і транзакції" },
      { en: "NoSQL with MongoDB, SQL vs NoSQL", uk: "NoSQL на прикладі MongoDB, SQL проти NoSQL" },
    ],
  },
];
