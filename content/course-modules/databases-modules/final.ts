import { SHOP, WRITE_QUERY } from "../databases-data";
import type { ModuleDef } from "../types";

export const finalModule: ModuleDef = {
  slug: "databases-final",
  title: { en: "Final challenge", uk: "Фінальне випробування" },
  slides: [
    {
      kind: "practice",
      slug: "monthly-report",
      title: { en: "Practice: The monthly report", uk: "Практика «Місячний звіт»" },
      language: "sql",
      setup: SHOP,
      starter: WRITE_QUERY,
      solution: `WITH lines AS (
    SELECT date_trunc('month', o.ordered_at)::date AS month,
           o.id AS order_id,
           p.name AS product,
           oi.quantity,
           oi.quantity * oi.unit_price AS amount
    FROM orders AS o
    JOIN order_items AS oi ON oi.order_id = o.id
    JOIN products AS p ON p.id = oi.product_id
    WHERE o.status <> 'cancelled'
),
monthly AS (
    SELECT month, count(DISTINCT order_id) AS orders, sum(amount) AS revenue
    FROM lines
    GROUP BY month
),
top_products AS (
    SELECT DISTINCT ON (month) month, product
    FROM (SELECT month, product, sum(quantity) AS sold
          FROM lines
          GROUP BY month, product) AS sold_per_product
    ORDER BY month, sold DESC, product
)
SELECT to_char(m.month, 'YYYY-MM') AS month,
       m.orders,
       m.revenue,
       t.product AS top_product,
       m.revenue - lag(m.revenue) OVER (ORDER BY m.month) AS change
FROM monthly AS m
JOIN top_products AS t ON t.month = m.month
ORDER BY m.month;
`,
      expectedOutput: "  month  | orders | revenue | top_product | change\n---------+--------+---------+-------------+---------\n 2024-06 |      3 |  516.99 | Puzzle 1000 | NULL\n 2024-07 |      2 |  139.50 | Garden Hose | -377.49\n 2024-08 |      2 |  149.88 | Chess Set   |   10.38\n(3 rows)\n",
      maxScore: 10,
    },
    {
      kind: "quiz",
      slug: "databases-final-exam",
      title: { en: "Final exam", uk: "Підсумковий тест" },
      questions: [
        {
          id: "count-left-join",
          mode: "single",
          prompt: {
            en: "`SELECT c.name, count(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.name`: what does a customer without orders get?",
            uk: "`SELECT c.name, count(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.name`: що отримає клієнт без замовлень?",
          },
          options: [
            { id: "a", text: { en: "1, because `count(*)` counts the row with NULLs; `count(o.id)` would give 0", uk: "1, бо `count(*)` рахує рядок із NULL; `count(o.id)` дав би 0" } },
            { id: "b", text: { en: "0", uk: "0" } },
            { id: "c", text: { en: "The customer is not in the result", uk: "Клієнта немає в результаті" } },
          ],
          correct: ["a"],
        },
        {
          id: "second-highest",
          mode: "multi",
          prompt: { en: "Which queries return the second-highest distinct salary?", uk: "Які запити повертають другу за величиною унікальну зарплату?" },
          options: [
            { id: "a", text: { en: "`SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1`", uk: "`SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1`" } },
            { id: "b", text: { en: "`SELECT max(salary) FROM employees WHERE salary < (SELECT max(salary) FROM employees)`", uk: "`SELECT max(salary) FROM employees WHERE salary < (SELECT max(salary) FROM employees)`" } },
            { id: "c", text: { en: "`SELECT salary FROM employees ORDER BY salary DESC LIMIT 2`", uk: "`SELECT salary FROM employees ORDER BY salary DESC LIMIT 2`" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "duplicates",
          mode: "single",
          prompt: { en: "How do you find emails that occur more than once in `users`?", uk: "Як знайти email, що трапляються в `users` більше одного разу?" },
          options: [
            { id: "a", text: { en: "`SELECT email FROM users GROUP BY email HAVING count(*) > 1`", uk: "`SELECT email FROM users GROUP BY email HAVING count(*) > 1`" } },
            { id: "b", text: { en: "`SELECT email FROM users WHERE count(*) > 1`", uk: "`SELECT email FROM users WHERE count(*) > 1`" } },
            { id: "c", text: { en: "`SELECT DISTINCT email FROM users`", uk: "`SELECT DISTINCT email FROM users`" } },
          ],
          correct: ["a"],
        },
        {
          id: "index-not-used",
          mode: "multi",
          prompt: { en: "Why might PostgreSQL not use an existing index on `created_at`?", uk: "Чому PostgreSQL може не використати наявний індекс по `created_at`?" },
          options: [
            { id: "a", text: { en: "The query wraps the column in a function, e.g. `date(created_at) = '2024-06-01'`", uk: "Запит обгортає стовпець функцією, напр. `date(created_at) = '2024-06-01'`" } },
            { id: "b", text: { en: "The condition matches a large part of the table, so a sequential scan is cheaper", uk: "Умова охоплює велику частину таблиці, тож послідовне сканування дешевше" } },
            { id: "c", text: { en: "The statistics are stale and the planner misjudges the row count", uk: "Статистика застаріла, і планувальник хибно оцінює кількість рядків" } },
            { id: "d", text: { en: "Indexes are only used for primary keys", uk: "Індекси використовуються лише для первинних ключів" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "n-plus-one",
          mode: "single",
          prompt: {
            en: "An ORM loads 50 orders, then runs one query per order to load its customer. What is this and the fix?",
            uk: "ORM завантажує 50 замовлень, а потім для кожного виконує окремий запит, щоб завантажити клієнта. Що це і як виправити?",
          },
          options: [
            { id: "a", text: { en: "The N+1 problem; load with a join or one `WHERE id IN (…)` query (eager loading)", uk: "Проблема N+1; завантажувати через з'єднання або один запит `WHERE id IN (…)` (eager loading)" } },
            { id: "b", text: { en: "A deadlock; add retries", uk: "Взаємоблокування; додати повтори" } },
            { id: "c", text: { en: "Normal behaviour with no cost", uk: "Нормальна поведінка без жодної ціни" } },
          ],
          correct: ["a"],
        },
        {
          id: "sql-injection",
          mode: "single",
          prompt: { en: "How do you safely put user input into a SQL query?", uk: "Як безпечно підставити введення користувача в SQL-запит?" },
          options: [
            { id: "a", text: { en: "Parameterised queries (`WHERE email = $1`), never string concatenation", uk: "Параметризовані запити (`WHERE email = $1`), ніколи не склеювання рядків" } },
            { id: "b", text: { en: "Remove single quotes from the input", uk: "Прибрати з введення одинарні лапки" } },
            { id: "c", text: { en: "Wrap the whole query in a transaction", uk: "Обгорнути весь запит у транзакцію" } },
          ],
          correct: ["a"],
        },
        {
          id: "isolation-report",
          mode: "single",
          prompt: {
            en: "A report runs 10 queries and must see one consistent state of the data while writes continue. Which isolation level?",
            uk: "Звіт виконує 10 запитів і має бачити один узгоджений стан даних, поки тривають записи. Який рівень ізоляції?",
          },
          options: [
            { id: "a", text: { en: "Repeatable Read: one snapshot for the whole transaction", uk: "Repeatable Read: один знімок на всю транзакцію" } },
            { id: "b", text: { en: "Read Committed: each query sees the latest data", uk: "Read Committed: кожен запит бачить найсвіжіші дані" } },
            { id: "c", text: { en: "Read Uncommitted", uk: "Read Uncommitted" } },
          ],
          correct: ["a"],
        },
        {
          id: "cap",
          mode: "single",
          prompt: { en: "According to CAP, during a network partition a distributed database must choose between…", uk: "Згідно з CAP, під час розділення мережі розподілена база мусить обирати між…" },
          options: [
            { id: "a", text: { en: "Consistency and availability", uk: "Узгодженістю та доступністю" } },
            { id: "b", text: { en: "Speed and durability", uk: "Швидкістю та довговічністю" } },
            { id: "c", text: { en: "SQL and NoSQL", uk: "SQL і NoSQL" } },
          ],
          correct: ["a"],
        },
        {
          id: "mongo-vs-pg",
          mode: "single",
          prompt: {
            en: "Which requirement is the strongest argument for MongoDB over PostgreSQL?",
            uk: "Яка вимога — найсильніший аргумент на користь MongoDB, а не PostgreSQL?",
          },
          options: [
            { id: "a", text: { en: "Self-contained documents read as a whole, at a scale that needs built-in sharding", uk: "Самодостатні документи, які читають цілком, у масштабі, що потребує вбудованого шардингу" } },
            { id: "b", text: { en: "Many-to-many relationships with strict integrity", uk: "Зв'язки «багато-до-багатьох» зі суворою цілісністю" } },
            { id: "c", text: { en: "Ad-hoc financial reports across many entities", uk: "Довільні фінансові звіти по багатьох сутностях" } },
          ],
          correct: ["a"],
        },
        {
          id: "delete-vs-soft",
          mode: "single",
          prompt: {
            en: "With soft delete (`deleted_at`), how do you keep emails unique among active users only?",
            uk: "Як за м'якого видалення (`deleted_at`) зберегти унікальність email лише серед активних користувачів?",
          },
          options: [
            { id: "a", text: { en: "A partial unique index: `UNIQUE (email) WHERE deleted_at IS NULL`", uk: "Частковий унікальний індекс: `UNIQUE (email) WHERE deleted_at IS NULL`" } },
            { id: "b", text: { en: "A normal `UNIQUE (email)` constraint", uk: "Звичайне обмеження `UNIQUE (email)`" } },
            { id: "c", text: { en: "It is impossible", uk: "Це неможливо" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
