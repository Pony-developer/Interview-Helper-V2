import { COMPANY, SHOP, WRITE_QUERY } from "../databases-data";
import type { ModuleDef } from "../types";

export const joinsModule: ModuleDef = {
  slug: "joins",
  title: { en: "Joins", uk: "З'єднання таблиць" },
  slides: [
    { kind: "lecture", slug: "inner-join", title: { en: "INNER JOIN", uk: "INNER JOIN" } },
    {
      kind: "practice",
      slug: "order-lines",
      title: { en: "Practice: Shipped order lines", uk: "Практика «Рядки відправлених замовлень»" },
      language: "sql",
      setup: SHOP,
      starter: WRITE_QUERY,
      solution: `SELECT o.id AS order_id,
       c.name AS customer,
       p.name AS product,
       oi.quantity
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id
JOIN order_items AS oi ON oi.order_id = o.id
JOIN products AS p ON p.id = oi.product_id
WHERE o.status = 'shipped'
ORDER BY o.id, p.name;
`,
      expectedOutput: " order_id |   customer   |       product       | quantity\n----------+--------------+---------------------+----------\n        1 | Olena Koval  | SQL Basics          |        2\n        1 | Olena Koval  | Wireless Mouse      |        1\n        3 | Taras Melnyk | Mechanical Keyboard |        1\n        3 | Taras Melnyk | Puzzle 1000         |        2\n        5 | Iryna Bondar | Postgres Internals  |        1\n        5 | Iryna Bondar | SQL Basics          |        1\n        7 | Olena Koval  | Chess Set           |        2\n        7 | Olena Koval  | Wireless Mouse      |        2\n(8 rows)\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "outer-joins", title: { en: "Outer joins", uk: "Зовнішні з'єднання" } },
    {
      kind: "practice",
      slug: "never-ordered",
      title: { en: "Practice: Never ordered", uk: "Практика «Ніколи не замовляли»" },
      language: "sql",
      setup: SHOP,
      starter: `-- 1. Customers without orders


-- 2. Products that were never ordered
`,
      solution: `-- 1. Customers without orders
SELECT c.name
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
WHERE o.id IS NULL
ORDER BY c.name;

-- 2. Products that were never ordered
SELECT p.name
FROM products AS p
LEFT JOIN order_items AS oi ON oi.product_id = p.id
WHERE oi.product_id IS NULL
ORDER BY p.name;
`,
      expectedOutput: "      name\n-----------------\n Maksym Kravets\n Sofia Tkachenko\n(2 rows)\n\n   name\n----------\n Seed Kit\n(1 row)\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "self-cross-joins", title: { en: "Self joins, cross joins and USING", uk: "Самоз'єднання, перехресні з'єднання та USING" } },
    {
      kind: "practice",
      slug: "who-is-the-boss",
      title: { en: "Practice: Who is the boss", uk: "Практика «Хто начальник»" },
      language: "sql",
      setup: COMPANY,
      starter: WRITE_QUERY,
      solution: `SELECT e.name AS employee,
       m.name AS manager
FROM employees AS e
LEFT JOIN employees AS m ON m.id = e.manager_id
ORDER BY e.id;
`,
      expectedOutput: " employee | manager\n----------+---------\n Oksana   | NULL\n Bohdan   | Oksana\n Dmytro   | Bohdan\n Kateryna | Bohdan\n Yulia    | Bohdan\n Roman    | Oksana\n Natalia  | Roman\n Petro    | Roman\n Halyna   | Oksana\n Vasyl    | Halyna\n Lesia    | Dmytro\n(11 rows)\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "joins-quiz",
      title: { en: "Joins check", uk: "Перевірка з'єднань" },
      questions: [
        {
          id: "inner-drops",
          mode: "single",
          prompt: {
            en: "`customers JOIN orders ON orders.customer_id = customers.id`: what happens to customers without orders?",
            uk: "`customers JOIN orders ON orders.customer_id = customers.id`: що стається з клієнтами без замовлень?",
          },
          options: [
            { id: "a", text: { en: "They are not in the result", uk: "Їх немає в результаті" } },
            { id: "b", text: { en: "They appear with NULL order columns", uk: "Вони з'являються зі стовпцями замовлення NULL" } },
            { id: "c", text: { en: "The query fails", uk: "Запит падає" } },
          ],
          correct: ["a"],
        },
        {
          id: "left-where",
          mode: "single",
          prompt: {
            en: "`customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'paid'` behaves like…",
            uk: "`customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'paid'` поводиться як…",
          },
          options: [
            { id: "a", text: { en: "An inner join: WHERE throws away the rows where `o.status` is NULL", uk: "Внутрішнє з'єднання: WHERE відкидає рядки, де `o.status` дорівнює NULL" } },
            { id: "b", text: { en: "A left join that keeps every customer", uk: "Ліве з'єднання, що зберігає всіх клієнтів" } },
            { id: "c", text: { en: "A full join", uk: "Повне з'єднання" } },
          ],
          correct: ["a"],
        },
        {
          id: "row-multiplication",
          mode: "single",
          prompt: {
            en: "A customer has 3 orders and 2 addresses. You join customers to both orders and addresses. How many rows does that customer produce?",
            uk: "Клієнт має 3 замовлення і 2 адреси. Ви з'єднуєте клієнтів і з замовленнями, і з адресами. Скільки рядків дасть цей клієнт?",
          },
          options: [
            { id: "a", text: { en: "6", uk: "6" } },
            { id: "b", text: { en: "5", uk: "5" } },
            { id: "c", text: { en: "3", uk: "3" } },
          ],
          correct: ["a"],
        },
        {
          id: "anti-join",
          mode: "multi",
          prompt: { en: "Which queries find customers without orders?", uk: "Які запити знаходять клієнтів без замовлень?" },
          options: [
            { id: "a", text: { en: "`LEFT JOIN orders o … WHERE o.id IS NULL`", uk: "`LEFT JOIN orders o … WHERE o.id IS NULL`" } },
            { id: "b", text: { en: "`WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`", uk: "`WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`" } },
            { id: "c", text: { en: "`JOIN orders o … WHERE o.id IS NULL`", uk: "`JOIN orders o … WHERE o.id IS NULL`" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "cross-join",
          mode: "single",
          prompt: { en: "`sizes CROSS JOIN colors` with 3 sizes and 4 colors returns…", uk: "`sizes CROSS JOIN colors` із 3 розмірами й 4 кольорами повертає…" },
          options: [
            { id: "a", text: { en: "12 rows: every size with every color", uk: "12 рядків: кожен розмір із кожним кольором" } },
            { id: "b", text: { en: "7 rows", uk: "7 рядків" } },
            { id: "c", text: { en: "3 rows", uk: "3 рядки" } },
          ],
          correct: ["a"],
        },
        {
          id: "self-join-alias",
          mode: "single",
          prompt: { en: "Why does a self join need table aliases?", uk: "Навіщо самоз'єднанню псевдоніми таблиць?" },
          options: [
            { id: "a", text: { en: "The same table appears twice, and each copy needs its own name", uk: "Та сама таблиця з'являється двічі, і кожна копія потребує власної назви" } },
            { id: "b", text: { en: "Aliases make the join faster", uk: "Псевдоніми прискорюють з'єднання" } },
            { id: "c", text: { en: "PostgreSQL requires aliases in every join", uk: "PostgreSQL вимагає псевдонімів у кожному з'єднанні" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
