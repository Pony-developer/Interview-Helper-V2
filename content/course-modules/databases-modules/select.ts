import { SHOP, WRITE_QUERY } from "../databases-data";
import type { ModuleDef } from "../types";

export const selectModule: ModuleDef = {
  slug: "sql-select",
  title: { en: "Querying data with SELECT", uk: "Вибірка даних через SELECT" },
  slides: [
    { kind: "lecture", slug: "select-basics", title: { en: "SELECT and expressions", uk: "SELECT і вирази" } },
    { kind: "lecture", slug: "where-and-null", title: { en: "WHERE, NULL and three-valued logic", uk: "WHERE, NULL і тризначна логіка" } },
    {
      kind: "practice",
      slug: "cheap-in-stock",
      title: { en: "Practice: Cheap and in stock", uk: "Практика «Дешево й у наявності»" },
      language: "sql",
      setup: SHOP,
      starter: WRITE_QUERY,
      solution: "SELECT name, price, stock\nFROM products\nWHERE price < 30 AND stock > 0\nORDER BY price DESC;\n",
      expectedOutput: "      name      | price | stock\n----------------+-------+-------\n SQL Basics     | 25.00 |    40\n Wireless Mouse | 19.99 |   150\n Puzzle 1000    | 14.50 |    60\n Seed Kit       |  9.99 |   100\n(4 rows)\n",
      maxScore: 3,
    },
    {
      kind: "practice",
      slug: "contact-gaps",
      title: { en: "Practice: Gaps in contacts", uk: "Практика «Прогалини в контактах»" },
      language: "sql",
      setup: SHOP,
      starter: WRITE_QUERY,
      solution:
        "SELECT name,\n       COALESCE(email, 'no email') AS email,\n       COALESCE(city, 'unknown') AS city\nFROM customers\nWHERE email IS NULL OR city IS NULL\nORDER BY name;\n",
      expectedOutput: "       name        |       email       |  city\n-------------------+-------------------+---------\n Andrii Shevchenko | no email          | Odesa\n Sofia Tkachenko   | sofia@example.com | unknown\n(2 rows)\n",
      maxScore: 3,
    },
    { kind: "lecture", slug: "order-limit", title: { en: "ORDER BY, LIMIT and pagination", uk: "ORDER BY, LIMIT і пагінація" } },
    {
      kind: "practice",
      slug: "second-page",
      title: { en: "Practice: The second page", uk: "Практика «Друга сторінка»" },
      language: "sql",
      setup: SHOP,
      starter: WRITE_QUERY,
      solution: "SELECT id, name, price\nFROM products\nORDER BY price DESC, id\nLIMIT 3 OFFSET 3;\n",
      expectedOutput: " id |      name       | price\n----+-----------------+-------\n  3 | Mongo in Action | 39.90\n  7 | Chess Set       | 35.00\n  1 | SQL Basics      | 25.00\n(3 rows)\n",
      maxScore: 3,
    },
    {
      kind: "quiz",
      slug: "select-quiz",
      title: { en: "SELECT check", uk: "Перевірка SELECT" },
      questions: [
        {
          id: "logical-order",
          mode: "single",
          prompt: {
            en: "In which order does PostgreSQL logically evaluate the clauses of a query?",
            uk: "У якому порядку PostgreSQL логічно обчислює частини запиту?",
          },
          options: [
            { id: "a", text: { en: "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT", uk: "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT" } },
            { id: "b", text: { en: "SELECT → FROM → WHERE → ORDER BY → LIMIT", uk: "SELECT → FROM → WHERE → ORDER BY → LIMIT" } },
            { id: "c", text: { en: "In the order the clauses are written", uk: "У тому порядку, в якому їх написано" } },
          ],
          correct: ["a"],
        },
        {
          id: "alias-in-where",
          mode: "single",
          prompt: {
            en: "Why does `SELECT price * 2 AS double_price FROM products WHERE double_price > 50` fail?",
            uk: "Чому `SELECT price * 2 AS double_price FROM products WHERE double_price > 50` падає?",
          },
          options: [
            { id: "a", text: { en: "WHERE is evaluated before SELECT, so the alias does not exist yet", uk: "WHERE обчислюється раніше за SELECT, тож псевдоніма ще не існує" } },
            { id: "b", text: { en: "Aliases cannot contain an underscore", uk: "Псевдоніми не можуть містити підкреслення" } },
            { id: "c", text: { en: "`price * 2` is not allowed in SELECT", uk: "`price * 2` не дозволено в SELECT" } },
          ],
          correct: ["a"],
        },
        {
          id: "null-equals",
          mode: "single",
          prompt: { en: "What does `SELECT * FROM customers WHERE city = NULL` return?", uk: "Що поверне `SELECT * FROM customers WHERE city = NULL`?" },
          options: [
            { id: "a", text: { en: "No rows: `city = NULL` is NULL (unknown), never true", uk: "Жодного рядка: `city = NULL` дає NULL (невідомо), а не true" } },
            { id: "b", text: { en: "Customers without a city", uk: "Клієнтів без міста" } },
            { id: "c", text: { en: "An error", uk: "Помилку" } },
          ],
          correct: ["a"],
        },
        {
          id: "not-in-null",
          mode: "single",
          prompt: { en: "What is `5 NOT IN (1, 2, NULL)`?", uk: "Чому дорівнює `5 NOT IN (1, 2, NULL)`?" },
          options: [
            { id: "a", text: { en: "NULL, so a WHERE with it keeps no rows", uk: "NULL, тож WHERE з таким виразом не залишить жодного рядка" } },
            { id: "b", text: { en: "true", uk: "true" } },
            { id: "c", text: { en: "false", uk: "false" } },
          ],
          correct: ["a"],
        },
        {
          id: "between",
          mode: "single",
          prompt: { en: "Does `price BETWEEN 10 AND 20` include 10 and 20?", uk: "Чи включає `price BETWEEN 10 AND 20` значення 10 і 20?" },
          options: [
            { id: "a", text: { en: "Yes, both ends are included", uk: "Так, обидва кінці включено" } },
            { id: "b", text: { en: "Only 10", uk: "Лише 10" } },
            { id: "c", text: { en: "Neither", uk: "Жодного" } },
          ],
          correct: ["a"],
        },
        {
          id: "offset-cost",
          mode: "single",
          prompt: {
            en: "Why does `LIMIT 20 OFFSET 100000` get slow on a big table?",
            uk: "Чому `LIMIT 20 OFFSET 100000` повільний на великій таблиці?",
          },
          options: [
            { id: "a", text: { en: "The database still has to produce and skip the first 100,000 rows", uk: "База однаково має знайти й пропустити перші 100 000 рядків" } },
            { id: "b", text: { en: "OFFSET disables all indexes", uk: "OFFSET вимикає всі індекси" } },
            { id: "c", text: { en: "It is not slow: OFFSET jumps straight to the row", uk: "Він не повільний: OFFSET одразу стрибає до потрібного рядка" } },
          ],
          correct: ["a"],
        },
        {
          id: "ilike",
          mode: "multi",
          prompt: { en: "Which conditions match the product name `'Postgres Internals'`?", uk: "Які умови відповідають назві товару `'Postgres Internals'`?" },
          options: [
            { id: "a", text: { en: "`name LIKE 'Post%'`", uk: "`name LIKE 'Post%'`" } },
            { id: "b", text: { en: "`name ILIKE '%internals'`", uk: "`name ILIKE '%internals'`" } },
            { id: "c", text: { en: "`name LIKE '%internals'`", uk: "`name LIKE '%internals'`" } },
            { id: "d", text: { en: "`name LIKE 'Postgres_Internals'`", uk: "`name LIKE 'Postgres_Internals'`" } },
          ],
          correct: ["a", "b", "d"],
        },
      ],
    },
  ],
};
