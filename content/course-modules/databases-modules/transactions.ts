import type { ModuleDef } from "../types";

const ACCOUNTS = `CREATE TABLE accounts (
    id      integer PRIMARY KEY,
    owner   text NOT NULL UNIQUE,
    balance numeric(10, 2) NOT NULL CHECK (balance >= 0)
);

INSERT INTO accounts (id, owner, balance) VALUES
    (1, 'Olena', 500.00),
    (2, 'Taras', 200.00),
    (3, 'Iryna', 100.00);
`;

const STEP1 = `-- Step 1: Olena pays Taras 100 (keep it)
UPDATE accounts SET balance = balance - 100 WHERE owner = 'Olena';
UPDATE accounts SET balance = balance + 100 WHERE owner = 'Taras';`;

const STEP2 = `-- Step 2: a test bonus of 50 for everyone (undo it)
UPDATE accounts SET balance = balance + 50;
SELECT owner, balance FROM accounts ORDER BY owner;`;

const STEP3 = `-- Step 3: Taras pays Iryna 30 (keep it)
UPDATE accounts SET balance = balance - 30 WHERE owner = 'Taras';
UPDATE accounts SET balance = balance + 30 WHERE owner = 'Iryna';`;

const ACCOUNTS_CHECK = `-- Check (do not change)
SELECT owner, balance FROM accounts ORDER BY owner;
`;

const DOCUMENTS = `CREATE TABLE documents (
    id      integer PRIMARY KEY,
    title   text NOT NULL,
    body    text NOT NULL,
    version integer NOT NULL DEFAULT 1
);

INSERT INTO documents (id, title, body, version) VALUES
    (1, 'Release notes', 'Draft', 1);
`;

const DOCUMENTS_CHECK = `-- Check (do not change)
SELECT id, title, body, version FROM documents;
`;

export const transactionsModule: ModuleDef = {
  slug: "transactions",
  title: { en: "Transactions and concurrency", uk: "Транзакції та паралельність" },
  slides: [
    { kind: "lecture", slug: "acid-transactions", title: { en: "ACID and transactions", uk: "ACID і транзакції" } },
    {
      kind: "practice",
      slug: "savepoint-script",
      title: { en: "Practice: Undo one step", uk: "Практика «Скасувати один крок»" },
      language: "sql",
      setup: ACCOUNTS,
      starter: `${STEP1}

${STEP2}

${STEP3}

${ACCOUNTS_CHECK}`,
      solution: `BEGIN;

${STEP1}

SAVEPOINT before_bonus;

${STEP2}

ROLLBACK TO SAVEPOINT before_bonus;

${STEP3}

COMMIT;

${ACCOUNTS_CHECK}`,
      expectedOutput: " owner | balance\n-------+---------\n Iryna |  150.00\n Olena |  450.00\n Taras |  350.00\n(3 rows)\n\n owner | balance\n-------+---------\n Iryna |  130.00\n Olena |  400.00\n Taras |  270.00\n(3 rows)\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "isolation-mvcc", title: { en: "Isolation levels and MVCC", uk: "Рівні ізоляції та MVCC" } },
    { kind: "lecture", slug: "locking-concurrency", title: { en: "Locks, deadlocks and optimistic locking", uk: "Блокування, взаємоблокування та оптимістичне блокування" } },
    {
      kind: "practice",
      slug: "optimistic-locking",
      title: { en: "Practice: Optimistic locking", uk: "Практика «Оптимістичне блокування»" },
      language: "sql",
      setup: DOCUMENTS,
      starter: `-- Ann saves (she loaded version 1)
UPDATE documents SET body = 'Draft + Ann''s changes' WHERE id = 1;

-- Bob saves (he also loaded version 1)
UPDATE documents SET body = 'Draft + Bob''s changes' WHERE id = 1;

-- Bob reloads the document


-- Bob saves the merged text


${DOCUMENTS_CHECK}`,
      solution: `-- Ann saves (she loaded version 1)
UPDATE documents
SET body = 'Draft + Ann''s changes', version = version + 1
WHERE id = 1 AND version = 1
RETURNING id, version;

-- Bob saves (he also loaded version 1)
UPDATE documents
SET body = 'Draft + Bob''s changes', version = version + 1
WHERE id = 1 AND version = 1
RETURNING id, version;

-- Bob reloads the document
SELECT body, version FROM documents WHERE id = 1;

-- Bob saves the merged text
UPDATE documents
SET body = 'Draft + Ann''s and Bob''s changes', version = version + 1
WHERE id = 1 AND version = 2
RETURNING id, version;

${DOCUMENTS_CHECK}`,
      expectedOutput: " id | version\n----+---------\n  1 |       2\n(1 row)\n\n id | version\n----+---------\n(0 rows)\n\n         body          | version\n-----------------------+---------\n Draft + Ann's changes |       2\n(1 row)\n\n id | version\n----+---------\n  1 |       3\n(1 row)\n\n id |     title     |              body               | version\n----+---------------+---------------------------------+---------\n  1 | Release notes | Draft + Ann's and Bob's changes |       3\n(1 row)\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "transactions-quiz",
      title: { en: "Transactions check", uk: "Перевірка транзакцій" },
      questions: [
        {
          id: "acid",
          mode: "single",
          prompt: { en: "What does the \"A\" in ACID guarantee?", uk: "Що гарантує «A» в ACID?" },
          options: [
            { id: "a", text: { en: "Atomicity: either all changes of a transaction happen or none", uk: "Атомарність: або всі зміни транзакції відбуваються, або жодна" } },
            { id: "b", text: { en: "Availability: the database is always up", uk: "Доступність: база завжди працює" } },
            { id: "c", text: { en: "Asynchrony: commits return immediately", uk: "Асинхронність: коміти повертаються миттєво" } },
          ],
          correct: ["a"],
        },
        {
          id: "durability",
          mode: "single",
          prompt: { en: "How does PostgreSQL make a committed transaction survive a power failure?", uk: "Як PostgreSQL забезпечує, що зафіксована транзакція переживе вимкнення живлення?" },
          options: [
            { id: "a", text: { en: "COMMIT waits until the write-ahead log (WAL) record is flushed to disk", uk: "COMMIT чекає, доки запис журналу попереднього запису (WAL) не скинуто на диск" } },
            { id: "b", text: { en: "It writes every changed table page to disk on COMMIT", uk: "Під час COMMIT записує на диск кожну змінену сторінку таблиці" } },
            { id: "c", text: { en: "It keeps everything in memory until a backup runs", uk: "Тримає все в пам'яті до запуску резервного копіювання" } },
          ],
          correct: ["a"],
        },
        {
          id: "default-isolation",
          mode: "single",
          prompt: { en: "What is PostgreSQL's default isolation level?", uk: "Який рівень ізоляції в PostgreSQL за замовчуванням?" },
          options: [
            { id: "a", text: { en: "Read Committed", uk: "Read Committed" } },
            { id: "b", text: { en: "Serializable", uk: "Serializable" } },
            { id: "c", text: { en: "Read Uncommitted", uk: "Read Uncommitted" } },
          ],
          correct: ["a"],
        },
        {
          id: "lost-update",
          mode: "single",
          prompt: {
            en: "Two requests both run `SELECT balance` (100), add 10 in the application and write `UPDATE … SET balance = 110`. What is this, and a fix?",
            uk: "Два запити обидва виконують `SELECT balance` (100), додають 10 у застосунку й записують `UPDATE … SET balance = 110`. Що це і як виправити?",
          },
          options: [
            { id: "a", text: { en: "A lost update; use `SET balance = balance + 10`, `SELECT … FOR UPDATE` or a version check", uk: "Втрачене оновлення; використайте `SET balance = balance + 10`, `SELECT … FOR UPDATE` або перевірку версії" } },
            { id: "b", text: { en: "A dirty read; switch to Read Uncommitted", uk: "Брудне читання; перейдіть на Read Uncommitted" } },
            { id: "c", text: { en: "Nothing is wrong, the result is 120", uk: "Усе гаразд, результат буде 120" } },
          ],
          correct: ["a"],
        },
        {
          id: "mvcc",
          mode: "single",
          prompt: { en: "With MVCC, do readers block writers in PostgreSQL?", uk: "Чи блокують читачі записувачів у PostgreSQL з MVCC?" },
          options: [
            { id: "a", text: { en: "No: readers see a snapshot of row versions, so plain SELECTs and writes do not block each other", uk: "Ні: читачі бачать знімок версій рядків, тож звичайні SELECT і записи не блокують одне одного" } },
            { id: "b", text: { en: "Yes, every SELECT locks the rows it reads", uk: "Так, кожен SELECT блокує рядки, які читає" } },
          ],
          correct: ["a"],
        },
        {
          id: "serialization-failure",
          mode: "single",
          prompt: {
            en: "A transaction at Serializable fails with `could not serialize access`. What should the application do?",
            uk: "Транзакція на рівні Serializable падає з `could not serialize access`. Що має зробити застосунок?",
          },
          options: [
            { id: "a", text: { en: "Retry the whole transaction", uk: "Повторити всю транзакцію" } },
            { id: "b", text: { en: "Ignore it: the data was saved anyway", uk: "Ігнорувати: дані однаково збережено" } },
            { id: "c", text: { en: "Switch the database to Read Uncommitted", uk: "Перевести базу на Read Uncommitted" } },
          ],
          correct: ["a"],
        },
        {
          id: "deadlock",
          mode: "multi",
          prompt: { en: "Which help to avoid deadlocks?", uk: "Що допомагає уникати взаємоблокувань?" },
          options: [
            { id: "a", text: { en: "Locking rows in a consistent order (e.g. by id) in every transaction", uk: "Блокувати рядки в однаковому порядку (напр. за id) в кожній транзакції" } },
            { id: "b", text: { en: "Keeping transactions short", uk: "Робити транзакції короткими" } },
            { id: "c", text: { en: "Doing slow network calls while holding row locks", uk: "Робити повільні мережеві виклики, тримаючи блокування рядків" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "skip-locked",
          mode: "single",
          prompt: { en: "What is `SELECT … FOR UPDATE SKIP LOCKED` typically used for?", uk: "Для чого зазвичай використовують `SELECT … FOR UPDATE SKIP LOCKED`?" },
          options: [
            { id: "a", text: { en: "A job queue where several workers each take different rows without waiting for each other", uk: "Черга завдань, де кілька обробників беруть різні рядки, не чекаючи одне на одного" } },
            { id: "b", text: { en: "Reading rows without any locks", uk: "Читання рядків взагалі без блокувань" } },
            { id: "c", text: { en: "Skipping rows that fail a CHECK constraint", uk: "Пропуск рядків, що порушують обмеження CHECK" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
