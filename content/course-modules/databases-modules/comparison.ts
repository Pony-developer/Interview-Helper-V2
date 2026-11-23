import type { ModuleDef } from "../types";

export const comparisonModule: ModuleDef = {
  slug: "sql-vs-nosql",
  title: { en: "SQL vs NoSQL", uk: "SQL проти NoSQL" },
  slides: [
    { kind: "lecture", slug: "sql-vs-nosql", title: { en: "SQL vs NoSQL: side by side", uk: "SQL проти NoSQL: порівняння" } },
    { kind: "lecture", slug: "choosing-a-database", title: { en: "Choosing a database", uk: "Як обрати базу даних" } },
    {
      kind: "quiz",
      slug: "sql-vs-nosql-quiz",
      title: { en: "Which database fits?", uk: "Яка база підходить?" },
      questions: [
        {
          id: "banking",
          mode: "single",
          prompt: {
            en: "A payments ledger: money moves between accounts, every transfer must be atomic, and auditors run ad-hoc reports. The best default?",
            uk: "Платіжний реєстр: гроші рухаються між рахунками, кожен переказ має бути атомарним, а аудитори запускають довільні звіти. Найкращий вибір за замовчуванням?",
          },
          options: [
            { id: "a", text: { en: "A relational database such as PostgreSQL", uk: "Реляційна база, як-от PostgreSQL" } },
            { id: "b", text: { en: "Redis as the only store", uk: "Redis як єдине сховище" } },
            { id: "c", text: { en: "A graph database", uk: "Графова база" } },
          ],
          correct: ["a"],
        },
        {
          id: "cache",
          mode: "single",
          prompt: { en: "You need a cache for rendered pages and sessions with expiry, read millions of times per minute.", uk: "Потрібен кеш для згенерованих сторінок і сесій зі строком дії, який читають мільйони разів на хвилину." },
          options: [
            { id: "a", text: { en: "A key-value store such as Redis", uk: "Сховище ключ-значення, як-от Redis" } },
            { id: "b", text: { en: "A materialized view in PostgreSQL", uk: "Матеріалізоване представлення в PostgreSQL" } },
            { id: "c", text: { en: "A wide-column database", uk: "Широкостовпцева база" } },
          ],
          correct: ["a"],
        },
        {
          id: "catalog",
          mode: "single",
          prompt: {
            en: "A product catalog where each product type has very different attributes, read mostly as whole products. Which designs fit well?",
            uk: "Каталог товарів, де кожен тип товару має дуже різні атрибути, а читають переважно цілі товари. Які рішення добре підходять?",
          },
          options: [
            { id: "a", text: { en: "Either a document database, or PostgreSQL with typed core columns plus `jsonb`", uk: "Або документна база, або PostgreSQL з типізованими основними стовпцями плюс `jsonb`" } },
            { id: "b", text: { en: "Only an entity-attribute-value table", uk: "Лише таблиця сутність-атрибут-значення" } },
            { id: "c", text: { en: "Only a graph database", uk: "Лише графова база" } },
          ],
          correct: ["a"],
        },
        {
          id: "iot",
          mode: "single",
          prompt: {
            en: "Hundreds of thousands of sensor writes per second across several data centres, queried by sensor and time range.",
            uk: "Сотні тисяч записів від датчиків за секунду в кількох дата-центрах, запити — за датчиком і діапазоном часу.",
          },
          options: [
            { id: "a", text: { en: "A wide-column store such as Cassandra/ScyllaDB (or a dedicated time-series database)", uk: "Широкостовпцеве сховище, як-от Cassandra/ScyllaDB (або спеціалізована база часових рядів)" } },
            { id: "b", text: { en: "A single SQLite file", uk: "Один файл SQLite" } },
            { id: "c", text: { en: "A graph database", uk: "Графова база" } },
          ],
          correct: ["a"],
        },
        {
          id: "social",
          mode: "single",
          prompt: { en: "\"People you may know\": friends of friends up to 3 hops, with mutual connections.", uk: "«Люди, яких ви можете знати»: друзі друзів до 3 кроків, зі спільними знайомими." },
          options: [
            { id: "a", text: { en: "A graph database (or recursive queries, if the graph is small)", uk: "Графова база (або рекурсивні запити, якщо граф невеликий)" } },
            { id: "b", text: { en: "A key-value store", uk: "Сховище ключ-значення" } },
            { id: "c", text: { en: "A full-text search engine", uk: "Повнотекстовий пошуковий рушій" } },
          ],
          correct: ["a"],
        },
        {
          id: "myths",
          mode: "multi",
          prompt: { en: "Which statements are myths?", uk: "Які твердження є міфами?" },
          options: [
            { id: "a", text: { en: "\"NoSQL databases cannot do transactions\"", uk: "«NoSQL-бази не вміють у транзакції»" } },
            { id: "b", text: { en: "\"SQL databases cannot scale\"", uk: "«SQL-бази не масштабуються»" } },
            { id: "c", text: { en: "\"A document database still has a schema; it is enforced by the application or by validation\"", uk: "«Документна база все одно має схему; її забезпечує застосунок або валідація»" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "polyglot",
          mode: "single",
          prompt: { en: "What is polyglot persistence?", uk: "Що таке polyglot persistence?" },
          options: [
            { id: "a", text: { en: "Using several databases in one system, each for the workload it fits best", uk: "Використання кількох баз в одній системі, кожна для навантаження, якому вона найкраще підходить" } },
            { id: "b", text: { en: "Storing text in several languages", uk: "Зберігання тексту кількома мовами" } },
            { id: "c", text: { en: "Writing every record to every database", uk: "Запис кожного запису в кожну базу" } },
          ],
          correct: ["a"],
        },
        {
          id: "joins",
          mode: "single",
          prompt: {
            en: "Your MongoDB service needs `$lookup` across four collections in almost every request, plus multi-document transactions. What does it suggest?",
            uk: "Ваш сервіс на MongoDB майже в кожному запиті потребує `$lookup` по чотирьох колекціях, а ще транзакцій на кілька документів. Що це підказує?",
          },
          options: [
            { id: "a", text: { en: "The data is highly relational: remodel around access patterns or consider a relational database", uk: "Дані сильно реляційні: перемоделюйте під шаблони доступу або розгляньте реляційну базу" } },
            { id: "b", text: { en: "Add more shards", uk: "Додати більше шардів" } },
            { id: "c", text: { en: "Nothing, this is the intended use of MongoDB", uk: "Нічого, саме так MongoDB і задумано використовувати" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
