import { SHOP, WRITE_QUERY } from "../databases-data";
import type { ModuleDef } from "../types";

export const fundamentalsModule: ModuleDef = {
  slug: "db-fundamentals",
  title: { en: "Database fundamentals", uk: "Основи баз даних" },
  slides: [
    { kind: "lecture", slug: "what-is-a-database", title: { en: "What a database is", uk: "Що таке база даних" } },
    { kind: "lecture", slug: "relational-model", title: { en: "The relational model", uk: "Реляційна модель" } },
    { kind: "lecture", slug: "meet-postgresql", title: { en: "Meet PostgreSQL", uk: "Знайомство з PostgreSQL" } },
    {
      kind: "quiz",
      slug: "fundamentals-quiz",
      title: { en: "Fundamentals check", uk: "Перевірка основ" },
      questions: [
        {
          id: "dbms",
          mode: "single",
          prompt: { en: "What does a DBMS give you that a folder of CSV files does not?", uk: "Що дає СУБД, чого не дає тека з CSV-файлами?" },
          options: [
            { id: "a", text: { en: "Concurrent access, transactions, constraints and a query language over the same data", uk: "Одночасний доступ, транзакції, обмеження та мову запитів над тими самими даними" } },
            { id: "b", text: { en: "Only a smaller file size", uk: "Лише менший розмір файлів" } },
            { id: "c", text: { en: "Nothing: it is the same, only slower", uk: "Нічого: це те саме, лише повільніше" } },
          ],
          correct: ["a"],
        },
        {
          id: "primary-key",
          mode: "single",
          prompt: { en: "What is a primary key?", uk: "Що таке первинний ключ?" },
          options: [
            { id: "a", text: { en: "A column (or columns) whose value is unique and not NULL for every row, and identifies the row", uk: "Стовпець (або стовпці), значення якого унікальне й не NULL для кожного рядка та ідентифікує рядок" } },
            { id: "b", text: { en: "The first column of a table", uk: "Перший стовпець таблиці" } },
            { id: "c", text: { en: "A password that protects the table", uk: "Пароль, що захищає таблицю" } },
          ],
          correct: ["a"],
        },
        {
          id: "foreign-key",
          mode: "single",
          prompt: { en: "`orders.customer_id` references `customers.id`. What does this foreign key guarantee?", uk: "`orders.customer_id` посилається на `customers.id`. Що гарантує цей зовнішній ключ?" },
          options: [
            { id: "a", text: { en: "Every order points to a customer that exists", uk: "Кожне замовлення вказує на наявного клієнта" } },
            { id: "b", text: { en: "Every customer has at least one order", uk: "Кожен клієнт має принаймні одне замовлення" } },
            { id: "c", text: { en: "Orders are stored inside the customers table", uk: "Замовлення зберігаються всередині таблиці клієнтів" } },
          ],
          correct: ["a"],
        },
        {
          id: "row-order",
          mode: "single",
          prompt: { en: "In which order does `SELECT * FROM products` return rows?", uk: "У якому порядку `SELECT * FROM products` повертає рядки?" },
          options: [
            { id: "a", text: { en: "In no guaranteed order: only ORDER BY guarantees one", uk: "У жодному гарантованому порядку: порядок гарантує лише ORDER BY" } },
            { id: "b", text: { en: "Always by primary key", uk: "Завжди за первинним ключем" } },
            { id: "c", text: { en: "Always in insertion order", uk: "Завжди в порядку вставлення" } },
          ],
          correct: ["a"],
        },
        {
          id: "sql-parts",
          mode: "multi",
          prompt: { en: "Which statements belong to DDL (data definition)?", uk: "Які інструкції належать до DDL (визначення даних)?" },
          options: [
            { id: "a", text: { en: "`CREATE TABLE`", uk: "`CREATE TABLE`" } },
            { id: "b", text: { en: "`ALTER TABLE`", uk: "`ALTER TABLE`" } },
            { id: "c", text: { en: "`INSERT`", uk: "`INSERT`" } },
            { id: "d", text: { en: "`DROP TABLE`", uk: "`DROP TABLE`" } },
          ],
          correct: ["a", "b", "d"],
        },
        {
          id: "null",
          mode: "single",
          prompt: { en: "What does NULL mean in a relational database?", uk: "Що означає NULL у реляційній базі даних?" },
          options: [
            { id: "a", text: { en: "The value is unknown or missing", uk: "Значення невідоме або відсутнє" } },
            { id: "b", text: { en: "Zero or an empty string", uk: "Нуль або порожній рядок" } },
            { id: "c", text: { en: "The row was deleted", uk: "Рядок було видалено" } },
          ],
          correct: ["a"],
        },
      ],
    },
    {
      kind: "practice",
      slug: "first-query",
      title: { en: "Practice: Your first query", uk: "Практика «Перший запит»" },
      language: "sql",
      setup: SHOP,
      starter: WRITE_QUERY,
      solution: "SELECT name, city\nFROM customers\nORDER BY name;\n",
      expectedOutput: "       name        | city\n-------------------+-------\n Andrii Shevchenko | Odesa\n Iryna Bondar      | Kyiv\n Maksym Kravets    | Lviv\n Olena Koval       | Kyiv\n Sofia Tkachenko   | NULL\n Taras Melnyk      | Lviv\n(6 rows)\n",
      maxScore: 3,
    },
  ],
};
