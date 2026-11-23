import { SHOP, WRITE_QUERY } from "../databases-data";
import type { ModuleDef } from "../types";

export const aggregationModule: ModuleDef = {
  slug: "aggregation",
  title: { en: "Aggregation and grouping", uk: "Агрегація та групування" },
  slides: [
    { kind: "lecture", slug: "aggregate-functions", title: { en: "Aggregate functions and GROUP BY", uk: "Агрегатні функції та GROUP BY" } },
    {
      kind: "practice",
      slug: "revenue-by-category",
      title: { en: "Practice: Revenue by category", uk: "Практика «Виторг за категоріями»" },
      language: "sql",
      setup: SHOP,
      starter: WRITE_QUERY,
      solution: `SELECT cat.name AS category,
       sum(oi.quantity) AS items_sold,
       sum(oi.quantity * oi.unit_price) AS revenue
FROM order_items AS oi
JOIN orders AS o ON o.id = oi.order_id
JOIN products AS p ON p.id = oi.product_id
JOIN categories AS cat ON cat.id = p.category_id
WHERE o.status <> 'cancelled'
GROUP BY cat.name
ORDER BY revenue DESC;
`,
      expectedOutput: "  category   | items_sold | revenue\n-------------+------------+---------\n Electronics |          5 |  477.97\n Books       |          5 |  163.40\n Games       |          4 |   99.00\n Garden      |          3 |   66.00\n(4 rows)\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "having-filter", title: { en: "HAVING, FILTER and grouping sets", uk: "HAVING, FILTER і набори групування" } },
    {
      kind: "practice",
      slug: "loyal-customers",
      title: { en: "Practice: Loyal customers", uk: "Практика «Постійні клієнти»" },
      language: "sql",
      setup: SHOP,
      starter: WRITE_QUERY,
      solution: `SELECT c.name,
       count(DISTINCT o.id) AS orders,
       sum(oi.quantity * oi.unit_price) AS spent,
       count(DISTINCT o.id) FILTER (WHERE o.status = 'shipped') AS shipped
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
JOIN order_items AS oi ON oi.order_id = o.id
WHERE o.status <> 'cancelled'
GROUP BY c.id, c.name
HAVING count(DISTINCT o.id) >= 2
ORDER BY spent DESC;
`,
      expectedOutput: "     name     | orders | spent  | shipped\n--------------+--------+--------+---------\n Olena Koval  |      3 | 508.97 |       2\n Taras Melnyk |      2 | 157.90 |       1\n(2 rows)\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "aggregation-quiz",
      title: { en: "Aggregation check", uk: "Перевірка агрегації" },
      questions: [
        {
          id: "count-variants",
          mode: "single",
          prompt: {
            en: "The `customers` table has 6 rows; one has `email = NULL`. What do `count(*)` and `count(email)` return?",
            uk: "Таблиця `customers` має 6 рядків; в одного `email = NULL`. Що повернуть `count(*)` і `count(email)`?",
          },
          options: [
            { id: "a", text: { en: "6 and 5", uk: "6 і 5" } },
            { id: "b", text: { en: "6 and 6", uk: "6 і 6" } },
            { id: "c", text: { en: "5 and 5", uk: "5 і 5" } },
          ],
          correct: ["a"],
        },
        {
          id: "where-vs-having",
          mode: "single",
          prompt: { en: "What is the difference between WHERE and HAVING?", uk: "Яка різниця між WHERE і HAVING?" },
          options: [
            { id: "a", text: { en: "WHERE filters rows before grouping; HAVING filters groups after aggregation", uk: "WHERE фільтрує рядки до групування; HAVING фільтрує групи після агрегації" } },
            { id: "b", text: { en: "They are synonyms", uk: "Це синоніми" } },
            { id: "c", text: { en: "HAVING is faster", uk: "HAVING швидший" } },
          ],
          correct: ["a"],
        },
        {
          id: "group-by-error",
          mode: "single",
          prompt: {
            en: "Why does `SELECT category_id, name, count(*) FROM products GROUP BY category_id` fail?",
            uk: "Чому падає `SELECT category_id, name, count(*) FROM products GROUP BY category_id`?",
          },
          options: [
            { id: "a", text: { en: "`name` is neither grouped nor aggregated: a group has many names", uk: "`name` ні згруповано, ні агреговано: у групі багато назв" } },
            { id: "b", text: { en: "`count(*)` cannot be combined with GROUP BY", uk: "`count(*)` не можна поєднувати з GROUP BY" } },
            { id: "c", text: { en: "`category_id` contains a NULL", uk: "`category_id` містить NULL" } },
          ],
          correct: ["a"],
        },
        {
          id: "avg-null",
          mode: "single",
          prompt: { en: "What is `avg(x)` over the values 10, 20 and NULL?", uk: "Чому дорівнює `avg(x)` для значень 10, 20 і NULL?" },
          options: [
            { id: "a", text: { en: "15: aggregates skip NULLs", uk: "15: агрегати пропускають NULL" } },
            { id: "b", text: { en: "10: NULL counts as 0", uk: "10: NULL рахується як 0" } },
            { id: "c", text: { en: "NULL", uk: "NULL" } },
          ],
          correct: ["a"],
        },
        {
          id: "sum-empty",
          mode: "single",
          prompt: { en: "What does `SELECT sum(price) FROM products WHERE false` return?", uk: "Що поверне `SELECT sum(price) FROM products WHERE false`?" },
          options: [
            { id: "a", text: { en: "One row with NULL; use `coalesce(sum(price), 0)` for 0", uk: "Один рядок із NULL; для 0 використайте `coalesce(sum(price), 0)`" } },
            { id: "b", text: { en: "One row with 0", uk: "Один рядок із 0" } },
            { id: "c", text: { en: "No rows", uk: "Жодного рядка" } },
          ],
          correct: ["a"],
        },
        {
          id: "filter-clause",
          mode: "single",
          prompt: {
            en: "What does `count(*) FILTER (WHERE status = 'paid')` compute in a grouped query?",
            uk: "Що обчислює `count(*) FILTER (WHERE status = 'paid')` у запиті з групуванням?",
          },
          options: [
            { id: "a", text: { en: "The number of paid rows in each group, while other columns still see every row", uk: "Кількість оплачених рядків у кожній групі, тоді як інші стовпці бачать усі рядки" } },
            { id: "b", text: { en: "It removes unpaid rows from the whole query", uk: "Він прибирає неоплачені рядки з усього запиту" } },
            { id: "c", text: { en: "It is a syntax error", uk: "Це синтаксична помилка" } },
          ],
          correct: ["a"],
        },
        {
          id: "join-inflation",
          mode: "single",
          prompt: {
            en: "You join `orders` to `order_items` and then `count(*)` per customer. What do you get?",
            uk: "Ви з'єднуєте `orders` з `order_items`, а потім рахуєте `count(*)` на клієнта. Що ви отримаєте?",
          },
          options: [
            { id: "a", text: { en: "The number of order items, not orders; use `count(DISTINCT o.id)` for orders", uk: "Кількість позицій, а не замовлень; для замовлень — `count(DISTINCT o.id)`" } },
            { id: "b", text: { en: "The number of orders", uk: "Кількість замовлень" } },
            { id: "c", text: { en: "An error", uk: "Помилку" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
