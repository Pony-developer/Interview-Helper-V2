import { TRY_SQL } from "../databases-data";
import type { ModuleDef } from "../types";

const USERS_CHECKS = `-- Checks (do not change)
SELECT check_name, try_sql(statement) AS result
FROM (VALUES
    (1, 'valid user',      $$INSERT INTO users (email, name, age) VALUES ('ann@example.com', 'Ann', 30)$$),
    (2, 'duplicate email', $$INSERT INTO users (email, name, age) VALUES ('ann@example.com', 'Anna', 25)$$),
    (3, 'no email',        $$INSERT INTO users (email, name, age) VALUES (NULL, 'Bob', 40)$$),
    (4, 'no name',         $$INSERT INTO users (email, age) VALUES ('nameless@example.com', 22)$$),
    (5, 'too young',       $$INSERT INTO users (email, name, age) VALUES ('kid@example.com', 'Kid', 16)$$),
    (6, 'age unknown',     $$INSERT INTO users (email, name) VALUES ('ira@example.com', 'Ira')$$)
) AS checks (n, check_name, statement)
ORDER BY n;

SELECT id, email, name, age, created_at IS NOT NULL AS has_created_at
FROM users
ORDER BY id;
`;

export const ddlModule: ModuleDef = {
  slug: "ddl-types",
  title: { en: "Tables, types and constraints", uk: "Таблиці, типи та обмеження" },
  slides: [
    { kind: "lecture", slug: "postgres-data-types", title: { en: "PostgreSQL data types", uk: "Типи даних PostgreSQL" } },
    { kind: "lecture", slug: "create-alter-table", title: { en: "CREATE, ALTER and DROP", uk: "CREATE, ALTER і DROP" } },
    { kind: "lecture", slug: "constraints", title: { en: "Constraints", uk: "Обмеження" } },
    {
      kind: "practice",
      slug: "users-table",
      title: { en: "Practice: The users table", uk: "Практика «Таблиця користувачів»" },
      language: "sql",
      setup: TRY_SQL,
      starter: `-- Create the users table here
CREATE TABLE users (
    id integer
);

${USERS_CHECKS}`,
      solution: `CREATE TABLE users (
    id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email      text NOT NULL UNIQUE,
    name       text NOT NULL,
    age        integer CHECK (age >= 18),
    created_at timestamptz NOT NULL DEFAULT now()
);

${USERS_CHECKS}`,
      expectedOutput: "   check_name    |       result\n-----------------+--------------------\n valid user      | ok\n duplicate email | unique_violation\n no email        | not_null_violation\n no name         | not_null_violation\n too young       | check_violation\n age unknown     | ok\n(6 rows)\n\n id |      email      | name | age  | has_created_at\n----+-----------------+------+------+----------------\n  1 | ann@example.com | Ann  |   30 | t\n  6 | ira@example.com | Ira  | NULL | t\n(2 rows)\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "ddl-quiz",
      title: { en: "Types and constraints check", uk: "Перевірка типів і обмежень" },
      questions: [
        {
          id: "money-type",
          mode: "single",
          prompt: { en: "Which type should store prices?", uk: "Який тип варто використати для цін?" },
          options: [
            { id: "a", text: { en: "`numeric(10, 2)`: exact decimal arithmetic", uk: "`numeric(10, 2)`: точна десяткова арифметика" } },
            { id: "b", text: { en: "`double precision`: it is faster", uk: "`double precision`: він швидший" } },
            { id: "c", text: { en: "`text`, formatted as needed", uk: "`text` у потрібному форматі" } },
          ],
          correct: ["a"],
        },
        {
          id: "timestamptz",
          mode: "single",
          prompt: { en: "What does `timestamptz` store?", uk: "Що зберігає `timestamptz`?" },
          options: [
            { id: "a", text: { en: "An absolute moment (in UTC), shown in the session's time zone", uk: "Абсолютний момент часу (в UTC), який показують у часовому поясі сесії" } },
            { id: "b", text: { en: "The local time together with the name of its time zone", uk: "Місцевий час разом із назвою часового поясу" } },
            { id: "c", text: { en: "A date without a time", uk: "Дату без часу" } },
          ],
          correct: ["a"],
        },
        {
          id: "identity",
          mode: "single",
          prompt: {
            en: "Two inserts into a table with an identity `id` fail, then one succeeds. Can the ids have gaps?",
            uk: "Дві вставки в таблицю з identity-`id` завершилися помилкою, потім одна вдалася. Чи можуть в id бути пропуски?",
          },
          options: [
            { id: "a", text: { en: "Yes: sequence values used by failed or rolled-back inserts are not returned", uk: "Так: значення послідовності, взяті невдалими чи відкоченими вставками, не повертаються" } },
            { id: "b", text: { en: "No: identity columns never have gaps", uk: "Ні: identity-стовпці ніколи не мають пропусків" } },
            { id: "c", text: { en: "Only after a server restart", uk: "Лише після перезапуску сервера" } },
          ],
          correct: ["a"],
        },
        {
          id: "unique-null",
          mode: "single",
          prompt: { en: "A `UNIQUE` column already has one `NULL`. Can you insert a second `NULL`?", uk: "У `UNIQUE`-стовпці вже є один `NULL`. Чи можна вставити ще один `NULL`?" },
          options: [
            { id: "a", text: { en: "Yes, by default NULLs are not equal to each other (unless `NULLS NOT DISTINCT`)", uk: "Так, типово NULL не дорівнюють один одному (якщо не вказано `NULLS NOT DISTINCT`)" } },
            { id: "b", text: { en: "No, it violates the constraint", uk: "Ні, це порушує обмеження" } },
            { id: "c", text: { en: "Only in a transaction", uk: "Лише в транзакції" } },
          ],
          correct: ["a"],
        },
        {
          id: "check-null",
          mode: "single",
          prompt: { en: "Does `CHECK (age >= 18)` reject a row with `age = NULL`?", uk: "Чи відхилить `CHECK (age >= 18)` рядок з `age = NULL`?" },
          options: [
            { id: "a", text: { en: "No: a CHECK fails only when the condition is false, and NULL is unknown", uk: "Ні: CHECK спрацьовує лише тоді, коли умова false, а NULL — невідомо" } },
            { id: "b", text: { en: "Yes, NULL is less than 18", uk: "Так, NULL менший за 18" } },
          ],
          correct: ["a"],
        },
        {
          id: "on-delete",
          mode: "single",
          prompt: {
            en: "`order_items.order_id` references `orders(id) ON DELETE CASCADE`. What happens when an order is deleted?",
            uk: "`order_items.order_id` посилається на `orders(id) ON DELETE CASCADE`. Що станеться при видаленні замовлення?",
          },
          options: [
            { id: "a", text: { en: "Its order items are deleted too", uk: "Його позиції теж буде видалено" } },
            { id: "b", text: { en: "The delete fails while items exist", uk: "Видалення не вдасться, поки існують позиції" } },
            { id: "c", text: { en: "The items' `order_id` becomes NULL", uk: "`order_id` позицій стане NULL" } },
          ],
          correct: ["a"],
        },
        {
          id: "varchar",
          mode: "single",
          prompt: { en: "In PostgreSQL, how do `text` and `varchar(255)` compare in performance?", uk: "Як у PostgreSQL порівнюються `text` і `varchar(255)` за продуктивністю?" },
          options: [
            { id: "a", text: { en: "The same; `varchar(n)` only adds a length check", uk: "Однаково; `varchar(n)` лише додає перевірку довжини" } },
            { id: "b", text: { en: "`varchar(255)` is much faster", uk: "`varchar(255)` значно швидший" } },
            { id: "c", text: { en: "`text` is limited to 255 characters", uk: "`text` обмежений 255 символами" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
