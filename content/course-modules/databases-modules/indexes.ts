import type { ModuleDef } from "../types";

const EVENTS = `CREATE TABLE events (
    id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    integer NOT NULL,
    kind       text NOT NULL,
    created_at timestamptz NOT NULL
);

-- 50,000 events of 500 users, one per minute
INSERT INTO events (user_id, kind, created_at)
SELECT i % 500,
       (ARRAY['view', 'click', 'purchase'])[1 + i % 3],
       timestamptz '2024-01-01 00:00:00+00' + i * interval '1 minute'
FROM generate_series(1, 50000) AS i;

-- Fresh statistics for the planner
ANALYZE events;
`;

const QUERY = `SELECT id, kind, created_at
FROM events
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 3;`;

const BEFORE = `-- The plan before: a full scan and a sort (do not change)
EXPLAIN (COSTS OFF)
${QUERY}
`;

const CHECKS = `-- Checks (do not change)
SELECT indexdef FROM pg_indexes WHERE indexname = 'events_user_id_created_at_idx';

EXPLAIN (COSTS OFF)
${QUERY}

${QUERY}
`;

export const indexesModule: ModuleDef = {
  slug: "indexes-performance",
  title: { en: "Indexes and performance", uk: "Індекси та продуктивність" },
  slides: [
    { kind: "lecture", slug: "how-indexes-work", title: { en: "How B-tree indexes work", uk: "Як працюють B-tree індекси" } },
    { kind: "lecture", slug: "index-types", title: { en: "Composite, partial and other index types", uk: "Складені, часткові та інші типи індексів" } },
    { kind: "lecture", slug: "explain-analyze", title: { en: "Reading EXPLAIN", uk: "Читаємо EXPLAIN" } },
    {
      kind: "practice",
      slug: "index-the-feed",
      title: { en: "Practice: Index the activity feed", uk: "Практика «Індекс для стрічки активності»" },
      language: "sql",
      setup: EVENTS,
      starter: `${BEFORE}
-- Create the index here


${CHECKS}`,
      solution: `${BEFORE}
-- Create the index here
CREATE INDEX events_user_id_created_at_idx ON events (user_id, created_at);

${CHECKS}`,
      expectedOutput: "              QUERY PLAN\n--------------------------------------\n Limit\n   ->  Sort\n         Sort Key: created_at DESC\n         ->  Seq Scan on events\n               Filter: (user_id = 42)\n(5 rows)\n\n                                           indexdef\n-----------------------------------------------------------------------------------------------\n CREATE INDEX events_user_id_created_at_idx ON public.events USING btree (user_id, created_at)\n(1 row)\n\n                               QUERY PLAN\n-------------------------------------------------------------------------\n Limit\n   ->  Index Scan Backward using events_user_id_created_at_idx on events\n         Index Cond: (user_id = 42)\n(3 rows)\n\n  id   |   kind   |       created_at\n-------+----------+------------------------\n 49542 | view     | 2024-02-04 09:42:00+00\n 49042 | click    | 2024-02-04 01:22:00+00\n 48542 | purchase | 2024-02-03 17:02:00+00\n(3 rows)\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "indexes-quiz",
      title: { en: "Indexes check", uk: "Перевірка індексів" },
      questions: [
        {
          id: "leftmost",
          mode: "multi",
          prompt: { en: "Which conditions can use a B-tree index on `(last_name, first_name)` efficiently?", uk: "Які умови можуть ефективно використати B-tree індекс по `(last_name, first_name)`?" },
          options: [
            { id: "a", text: { en: "`WHERE last_name = 'Koval'`", uk: "`WHERE last_name = 'Koval'`" } },
            { id: "b", text: { en: "`WHERE last_name = 'Koval' AND first_name = 'Olena'`", uk: "`WHERE last_name = 'Koval' AND first_name = 'Olena'`" } },
            { id: "c", text: { en: "`WHERE last_name LIKE 'Kov%'` (with a C collation or `text_pattern_ops`)", uk: "`WHERE last_name LIKE 'Kov%'` (з колацією C або `text_pattern_ops`)" } },
            { id: "d", text: { en: "`WHERE first_name = 'Olena'` alone", uk: "Лише `WHERE first_name = 'Olena'`" } },
          ],
          correct: ["a", "b", "c"],
        },
        {
          id: "function-on-column",
          mode: "single",
          prompt: {
            en: "There is an index on `email`. Why might `WHERE lower(email) = 'ann@example.com'` not use it?",
            uk: "Є індекс по `email`. Чому `WHERE lower(email) = 'ann@example.com'` може його не використати?",
          },
          options: [
            { id: "a", text: { en: "The index stores `email`, not `lower(email)`; create an expression index on `lower(email)`", uk: "Індекс зберігає `email`, а не `lower(email)`; створіть індекс за виразом `lower(email)`" } },
            { id: "b", text: { en: "Indexes do not work with text", uk: "Індекси не працюють з текстом" } },
            { id: "c", text: { en: "`lower` is too slow", uk: "`lower` надто повільна" } },
          ],
          correct: ["a"],
        },
        {
          id: "cost-of-indexes",
          mode: "single",
          prompt: { en: "What is the main cost of adding many indexes to a table?", uk: "Яка головна ціна додавання багатьох індексів до таблиці?" },
          options: [
            { id: "a", text: { en: "Every INSERT, UPDATE and DELETE must update every index, and they use disk and memory", uk: "Кожен INSERT, UPDATE і DELETE мусить оновити кожен індекс, і вони займають диск і пам'ять" } },
            { id: "b", text: { en: "SELECTs become slower", uk: "SELECT стають повільнішими" } },
            { id: "c", text: { en: "There is no cost", uk: "Ціни немає" } },
          ],
          correct: ["a"],
        },
        {
          id: "seq-scan-ok",
          mode: "single",
          prompt: {
            en: "A query returns 60% of a table's rows and PostgreSQL ignores the index. Why?",
            uk: "Запит повертає 60% рядків таблиці, і PostgreSQL ігнорує індекс. Чому?",
          },
          options: [
            { id: "a", text: { en: "Reading most of the table sequentially is cheaper than jumping through the index for each row", uk: "Послідовно прочитати більшу частину таблиці дешевше, ніж стрибати через індекс до кожного рядка" } },
            { id: "b", text: { en: "The index is broken", uk: "Індекс зламаний" } },
            { id: "c", text: { en: "PostgreSQL never uses indexes for more than 100 rows", uk: "PostgreSQL ніколи не використовує індекси для понад 100 рядків" } },
          ],
          correct: ["a"],
        },
        {
          id: "explain-analyze",
          mode: "single",
          prompt: { en: "What does `EXPLAIN ANALYZE` do that `EXPLAIN` does not?", uk: "Що робить `EXPLAIN ANALYZE`, чого не робить `EXPLAIN`?" },
          options: [
            { id: "a", text: { en: "It actually runs the query and shows real row counts and times", uk: "Він справді виконує запит і показує справжню кількість рядків і час" } },
            { id: "b", text: { en: "It analyzes the table statistics", uk: "Він аналізує статистику таблиці" } },
            { id: "c", text: { en: "Nothing, they are synonyms", uk: "Нічого, це синоніми" } },
          ],
          correct: ["a"],
        },
        {
          id: "gin-jsonb",
          mode: "single",
          prompt: { en: "Which index type supports `tags @> ARRAY['sql']` and `doc @> '{\"color\": \"red\"}'`?", uk: "Який тип індексу підтримує `tags @> ARRAY['sql']` і `doc @> '{\"color\": \"red\"}'`?" },
          options: [
            { id: "a", text: { en: "GIN", uk: "GIN" } },
            { id: "b", text: { en: "B-tree", uk: "B-tree" } },
            { id: "c", text: { en: "Hash", uk: "Hash" } },
          ],
          correct: ["a"],
        },
        {
          id: "concurrently",
          mode: "single",
          prompt: { en: "Why use `CREATE INDEX CONCURRENTLY` in production?", uk: "Навіщо в продакшні `CREATE INDEX CONCURRENTLY`?" },
          options: [
            { id: "a", text: { en: "It builds the index without blocking writes to the table (it takes longer and cannot run in a transaction)", uk: "Він будує індекс, не блокуючи записів у таблицю (довше й не може виконуватися в транзакції)" } },
            { id: "b", text: { en: "It builds the index on several CPU cores", uk: "Він будує індекс на кількох ядрах" } },
            { id: "c", text: { en: "It makes the index smaller", uk: "Він робить індекс меншим" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
