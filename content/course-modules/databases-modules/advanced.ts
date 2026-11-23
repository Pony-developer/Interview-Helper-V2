import { SHOP } from "../databases-data";
import type { ModuleDef } from "../types";

const VIEW_CHECKS = `-- Checks (do not change)
SELECT * FROM order_totals WHERE status <> 'cancelled' ORDER BY total DESC;

SELECT customer, count(*) AS orders, sum(total) AS spent
FROM order_totals
GROUP BY customer
ORDER BY spent DESC;
`;

const PRICE_HISTORY = `CREATE TABLE price_history (
    id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id integer NOT NULL REFERENCES products (id),
    old_price  numeric(10, 2) NOT NULL,
    new_price  numeric(10, 2) NOT NULL
);
`;

const TRIGGER_CHECKS = `-- Checks (do not change)
UPDATE products SET price = 27.00 WHERE id = 1;
UPDATE products SET stock = stock - 1 WHERE id = 1;          -- the price does not change
UPDATE products SET price = price * 0.5 WHERE id = 7;
UPDATE products SET price = 25.00 WHERE id = 1;
UPDATE products SET name = 'Chess Set Deluxe' WHERE id = 7;  -- the price does not change

SELECT h.id, p.name, h.old_price, h.new_price
FROM price_history AS h
JOIN products AS p ON p.id = h.product_id
ORDER BY h.id;
`;

export const advancedModule: ModuleDef = {
  slug: "postgres-advanced",
  title: { en: "Beyond tables: views, functions, JSON", uk: "Більше ніж таблиці: представлення, функції, JSON" },
  slides: [
    { kind: "lecture", slug: "views-materialized", title: { en: "Views and materialized views", uk: "Представлення та матеріалізовані представлення" } },
    {
      kind: "practice",
      slug: "order-totals-view",
      title: { en: "Practice: The order totals view", uk: "Практика «Представлення сум замовлень»" },
      language: "sql",
      setup: SHOP,
      starter: `-- Create the order_totals view here


${VIEW_CHECKS}`,
      solution: `-- Create the order_totals view here
CREATE VIEW order_totals AS
SELECT o.id AS order_id,
       c.name AS customer,
       o.status,
       sum(oi.quantity) AS items,
       sum(oi.quantity * oi.unit_price) AS total
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id
JOIN order_items AS oi ON oi.order_id = o.id
GROUP BY o.id, c.name, o.status;

${VIEW_CHECKS}`,
      expectedOutput: " order_id |     customer      | status  | items | total\n----------+-------------------+---------+-------+--------\n        2 | Olena Koval       | paid    |     1 | 329.00\n        3 | Taras Melnyk      | shipped |     3 | 118.00\n        7 | Olena Koval       | shipped |     4 | 109.98\n        5 | Iryna Bondar      | shipped |     2 |  73.50\n        1 | Olena Koval       | shipped |     3 |  69.99\n        6 | Andrii Shevchenko | new     |     3 |  66.00\n        8 | Taras Melnyk      | paid    |     1 |  39.90\n(7 rows)\n\n     customer      | orders | spent\n-------------------+--------+--------\n Olena Koval       |      3 | 508.97\n Taras Melnyk      |      2 | 157.90\n Iryna Bondar      |      2 | 108.50\n Andrii Shevchenko |      1 |  66.00\n(4 rows)\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "functions-triggers", title: { en: "Functions and triggers", uk: "Функції та тригери" } },
    {
      kind: "practice",
      slug: "price-history-trigger",
      title: { en: "Practice: Price history trigger", uk: "Практика «Тригер історії цін»" },
      language: "sql",
      setup: `${SHOP}\n${PRICE_HISTORY}`,
      starter: `-- 1. The trigger function


-- 2. The trigger on products


${TRIGGER_CHECKS}`,
      solution: `-- 1. The trigger function
CREATE FUNCTION log_price_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO price_history (product_id, old_price, new_price)
    VALUES (NEW.id, OLD.price, NEW.price);
    RETURN NEW;
END;
$$;

-- 2. The trigger on products
CREATE TRIGGER products_price_history
AFTER UPDATE OF price ON products
FOR EACH ROW
WHEN (OLD.price IS DISTINCT FROM NEW.price)
EXECUTE FUNCTION log_price_change();

${TRIGGER_CHECKS}`,
      expectedOutput: " id |       name       | old_price | new_price\n----+------------------+-----------+-----------\n  1 | SQL Basics       |     25.00 |     27.00\n  2 | Chess Set Deluxe |     35.00 |     17.50\n  3 | SQL Basics       |     27.00 |     25.00\n(3 rows)\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "jsonb-postgres", title: { en: "JSON in PostgreSQL", uk: "JSON у PostgreSQL" } },
    {
      kind: "quiz",
      slug: "advanced-quiz",
      title: { en: "Views, functions and JSON check", uk: "Перевірка представлень, функцій і JSON" },
      questions: [
        {
          id: "view-storage",
          mode: "single",
          prompt: { en: "Does a regular view store data?", uk: "Чи зберігає дані звичайне представлення?" },
          options: [
            { id: "a", text: { en: "No: it is a saved query, run every time the view is used", uk: "Ні: це збережений запит, що виконується щоразу, коли використовують представлення" } },
            { id: "b", text: { en: "Yes, a copy of the rows, refreshed every minute", uk: "Так, копію рядків, що оновлюється щохвилини" } },
          ],
          correct: ["a"],
        },
        {
          id: "matview-refresh",
          mode: "single",
          prompt: { en: "When is the data of a materialized view updated?", uk: "Коли оновлюються дані матеріалізованого представлення?" },
          options: [
            { id: "a", text: { en: "Only when you run `REFRESH MATERIALIZED VIEW`", uk: "Лише коли ви виконуєте `REFRESH MATERIALIZED VIEW`" } },
            { id: "b", text: { en: "Automatically on every change of the base tables", uk: "Автоматично після кожної зміни базових таблиць" } },
            { id: "c", text: { en: "Every time it is queried", uk: "Щоразу, коли до нього звертаються" } },
          ],
          correct: ["a"],
        },
        {
          id: "refresh-concurrently",
          mode: "single",
          prompt: { en: "What does `REFRESH MATERIALIZED VIEW CONCURRENTLY` require?", uk: "Чого потребує `REFRESH MATERIALIZED VIEW CONCURRENTLY`?" },
          options: [
            { id: "a", text: { en: "A unique index on the materialized view; readers are then not blocked during the refresh", uk: "Унікального індексу на матеріалізованому представленні; тоді читачі не блокуються під час оновлення" } },
            { id: "b", text: { en: "Serializable isolation", uk: "Ізоляції Serializable" } },
            { id: "c", text: { en: "Nothing special", uk: "Нічого особливого" } },
          ],
          correct: ["a"],
        },
        {
          id: "old-new",
          mode: "single",
          prompt: { en: "In a row-level `UPDATE` trigger, what are `OLD` and `NEW`?", uk: "Що таке `OLD` і `NEW` у рядковому тригері на `UPDATE`?" },
          options: [
            { id: "a", text: { en: "The row before and after the update", uk: "Рядок до й після оновлення" } },
            { id: "b", text: { en: "The oldest and the newest row of the table", uk: "Найстаріший і найновіший рядок таблиці" } },
            { id: "c", text: { en: "The previous and the current transaction", uk: "Попередня й поточна транзакції" } },
          ],
          correct: ["a"],
        },
        {
          id: "before-trigger",
          mode: "single",
          prompt: { en: "Which trigger is right for setting `updated_at = now()` on every update?", uk: "Який тригер підходить, щоб ставити `updated_at = now()` при кожному оновленні?" },
          options: [
            { id: "a", text: { en: "BEFORE UPDATE … FOR EACH ROW, changing `NEW.updated_at` and returning `NEW`", uk: "BEFORE UPDATE … FOR EACH ROW, що змінює `NEW.updated_at` і повертає `NEW`" } },
            { id: "b", text: { en: "AFTER UPDATE … FOR EACH STATEMENT", uk: "AFTER UPDATE … FOR EACH STATEMENT" } },
            { id: "c", text: { en: "An AFTER trigger that runs another UPDATE on the same row", uk: "AFTER-тригер, що виконує ще один UPDATE того самого рядка" } },
          ],
          correct: ["a"],
        },
        {
          id: "jsonb-operators",
          mode: "single",
          prompt: { en: "`doc` is `{\"specs\": {\"color\": \"red\"}}`. What does `doc -> 'specs' ->> 'color'` return?", uk: "`doc` дорівнює `{\"specs\": {\"color\": \"red\"}}`. Що поверне `doc -> 'specs' ->> 'color'`?" },
          options: [
            { id: "a", text: { en: "The text `red`", uk: "Текст `red`" } },
            { id: "b", text: { en: "The JSON string `\"red\"`", uk: "JSON-рядок `\"red\"`" } },
            { id: "c", text: { en: "NULL", uk: "NULL" } },
          ],
          correct: ["a"],
        },
        {
          id: "jsonb-vs-json",
          mode: "single",
          prompt: { en: "Why prefer `jsonb` over `json`?", uk: "Чому варто обирати `jsonb`, а не `json`?" },
          options: [
            { id: "a", text: { en: "It is stored parsed, so it is faster to query and supports GIN indexes and containment (`@>`)", uk: "Він зберігається розібраним, тож його швидше запитувати, і він підтримує GIN-індекси та перевірку вкладеності (`@>`)" } },
            { id: "b", text: { en: "It keeps the original formatting and key order", uk: "Він зберігає вихідне форматування й порядок ключів" } },
            { id: "c", text: { en: "It is the only JSON type that allows arrays", uk: "Це єдиний JSON-тип, що дозволяє масиви" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
