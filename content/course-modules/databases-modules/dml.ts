import { SHOP } from "../databases-data";
import type { ModuleDef } from "../types";

const RESTOCK_CHECK = `-- Check (do not change)
SELECT id, name, category_id, price, stock
FROM products
ORDER BY id;
`;

export const dmlModule: ModuleDef = {
  slug: "dml",
  title: { en: "Changing data", uk: "Зміна даних" },
  slides: [
    { kind: "lecture", slug: "insert-update-delete", title: { en: "INSERT, UPDATE and DELETE", uk: "INSERT, UPDATE і DELETE" } },
    { kind: "lecture", slug: "upsert-returning", title: { en: "Upserts, RETURNING and MERGE", uk: "Upsert, RETURNING і MERGE" } },
    {
      kind: "practice",
      slug: "restock",
      title: { en: "Practice: Restock", uk: "Практика «Поповнення складу»" },
      language: "sql",
      setup: SHOP,
      starter: `-- 1. A new book arrived: add it with RETURNING


-- 2. Games get 10% more expensive


-- 3. Load the supplier's price list (an upsert)


-- 4. Remove the uncategorized product


${RESTOCK_CHECK}`,
      solution: `-- 1. A new book arrived: add it with RETURNING
INSERT INTO products (id, name, category_id, price, stock)
VALUES (11, 'Redis in Depth', 1, 42.00, 5)
RETURNING id, name;

-- 2. Games get 10% more expensive
UPDATE products
SET price = round(price * 1.10, 2)
WHERE category_id = 3;

-- 3. Load the supplier's price list (an upsert)
INSERT INTO products (id, name, category_id, price, stock)
VALUES (4, 'Wireless Mouse', 2, 17.99, 0),
       (12, 'Pruning Shears', 4, 15.00, 30)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;

-- 4. Remove the uncategorized product
DELETE FROM products
WHERE category_id IS NULL;

${RESTOCK_CHECK}`,
      expectedOutput: " id |      name\n----+----------------\n 11 | Redis in Depth\n(1 row)\n\n id |        name         | category_id | price  | stock\n----+---------------------+-------------+--------+-------\n  1 | SQL Basics          |           1 |  25.00 |    40\n  2 | Postgres Internals  |           1 |  48.50 |    12\n  3 | Mongo in Action     |           1 |  39.90 |     0\n  4 | Wireless Mouse      |           2 |  17.99 |   150\n  5 | Mechanical Keyboard |           2 |  89.00 |    35\n  6 | 4K Monitor          |           2 | 329.00 |     8\n  7 | Chess Set           |           3 |  38.50 |    20\n  8 | Puzzle 1000         |           3 |  15.95 |    60\n  9 | Garden Hose         |           4 |  22.00 |     0\n 11 | Redis in Depth      |           1 |  42.00 |     5\n 12 | Pruning Shears      |           4 |  15.00 |    30\n(11 rows)\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "dml-quiz",
      title: { en: "Changing data check", uk: "Перевірка зміни даних" },
      questions: [
        {
          id: "update-no-where",
          mode: "single",
          prompt: { en: "What does `UPDATE products SET price = 0;` do?", uk: "Що зробить `UPDATE products SET price = 0;`?" },
          options: [
            { id: "a", text: { en: "Sets the price of every product to 0", uk: "Встановить ціну 0 для всіх товарів" } },
            { id: "b", text: { en: "Fails because there is no WHERE", uk: "Впаде, бо немає WHERE" } },
            { id: "c", text: { en: "Updates only the first row", uk: "Оновить лише перший рядок" } },
          ],
          correct: ["a"],
        },
        {
          id: "returning",
          mode: "single",
          prompt: { en: "What is `RETURNING` for?", uk: "Для чого `RETURNING`?" },
          options: [
            { id: "a", text: { en: "To get the inserted, updated or deleted rows (e.g. a generated id) without a second query", uk: "Щоб отримати вставлені, оновлені чи видалені рядки (напр. згенерований id) без другого запиту" } },
            { id: "b", text: { en: "To undo the statement", uk: "Щоб скасувати інструкцію" } },
            { id: "c", text: { en: "To return control to the application before the write finishes", uk: "Щоб повернути керування застосунку до завершення запису" } },
          ],
          correct: ["a"],
        },
        {
          id: "excluded",
          mode: "single",
          prompt: { en: "In `ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price`, what is `EXCLUDED`?", uk: "Що таке `EXCLUDED` в `ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price`?" },
          options: [
            { id: "a", text: { en: "The row that was proposed for insertion and hit the conflict", uk: "Рядок, який намагалися вставити і який натрапив на конфлікт" } },
            { id: "b", text: { en: "The row that already exists in the table", uk: "Рядок, що вже є в таблиці" } },
            { id: "c", text: { en: "A table of deleted rows", uk: "Таблиця видалених рядків" } },
          ],
          correct: ["a"],
        },
        {
          id: "conflict-target",
          mode: "single",
          prompt: { en: "What must the conflict target `ON CONFLICT (email)` correspond to?", uk: "Чому має відповідати ціль конфлікту `ON CONFLICT (email)`?" },
          options: [
            { id: "a", text: { en: "A unique index or constraint on `email`", uk: "Унікальному індексу чи обмеженню по `email`" } },
            { id: "b", text: { en: "Any column, indexed or not", uk: "Будь-якому стовпцю, з індексом чи без" } },
            { id: "c", text: { en: "The primary key only", uk: "Лише первинному ключу" } },
          ],
          correct: ["a"],
        },
        {
          id: "check-then-insert",
          mode: "single",
          prompt: {
            en: "Why is \"SELECT to check the row exists, then INSERT or UPDATE\" in application code unsafe?",
            uk: "Чому «SELECT для перевірки наявності, потім INSERT або UPDATE» у коді застосунку небезпечне?",
          },
          options: [
            { id: "a", text: { en: "Two concurrent requests can both see \"no row\" and both insert", uk: "Два одночасні запити можуть обидва побачити «рядка немає» й обидва вставити" } },
            { id: "b", text: { en: "SELECT cannot see rows inserted by other sessions", uk: "SELECT не бачить рядків, вставлених іншими сесіями" } },
            { id: "c", text: { en: "It is safe", uk: "Це безпечно" } },
          ],
          correct: ["a"],
        },
        {
          id: "delete-vs-truncate",
          mode: "multi",
          prompt: { en: "Which are true about `TRUNCATE` compared with `DELETE FROM t`?", uk: "Що правда про `TRUNCATE` порівняно з `DELETE FROM t`?" },
          options: [
            { id: "a", text: { en: "It is much faster on big tables", uk: "Він значно швидший на великих таблицях" } },
            { id: "b", text: { en: "It cannot have a WHERE clause", uk: "Він не може мати WHERE" } },
            { id: "c", text: { en: "It does not fire row-level ON DELETE triggers", uk: "Він не запускає рядкових тригерів ON DELETE" } },
            { id: "d", text: { en: "It cannot be rolled back in PostgreSQL", uk: "Його не можна відкотити в PostgreSQL" } },
          ],
          correct: ["a", "b", "c"],
        },
      ],
    },
  ],
};
