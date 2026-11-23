import type { ModuleDef } from "../types";

/** A "collection" of product documents, stored the way a document database would keep them. */
const PRODUCT_DOCS = `-- A MongoDB-style collection: one JSON document per product
CREATE TABLE products (
    id  text PRIMARY KEY,   -- plays the role of MongoDB's _id
    doc jsonb NOT NULL
);

INSERT INTO products (id, doc) VALUES
('p1', '{"name": "SQL Basics", "category": "books", "price": 25,
         "tags": ["sql", "bestseller"], "stock": {"warehouse": 30, "store": 10}}'),
('p2', '{"name": "Postgres Internals", "category": "books", "price": 48.5,
         "tags": ["sql", "postgres"], "stock": {"warehouse": 12, "store": 0}}'),
('p3', '{"name": "Mongo in Action", "category": "books", "price": 39.9,
         "tags": ["nosql", "mongodb"], "stock": {"warehouse": 0, "store": 0}}'),
('p4', '{"name": "Wireless Mouse", "category": "electronics", "price": 19.99,
         "tags": ["accessories"], "stock": {"warehouse": 100, "store": 50},
         "specs": {"color": "black", "wireless": true}}'),
('p5', '{"name": "4K Monitor", "category": "electronics", "price": 329,
         "tags": ["display", "bestseller"], "stock": {"warehouse": 5, "store": 3},
         "specs": {"color": "black", "size": 27}}'),
('p6', '{"name": "Chess Set", "category": "games", "price": 35,
         "tags": ["bestseller", "gift"], "stock": {"warehouse": 15, "store": 5}}');
`;

export const mongodbModule: ModuleDef = {
  slug: "nosql-mongodb",
  title: { en: "NoSQL with MongoDB", uk: "NoSQL на прикладі MongoDB" },
  slides: [
    { kind: "lecture", slug: "nosql-landscape", title: { en: "The NoSQL landscape", uk: "Світ NoSQL" } },
    { kind: "lecture", slug: "mongodb-documents", title: { en: "MongoDB: documents and CRUD", uk: "MongoDB: документи та CRUD" } },
    {
      kind: "quiz",
      slug: "mongodb-basics-quiz",
      title: { en: "MongoDB basics check", uk: "Перевірка основ MongoDB" },
      questions: [
        {
          id: "families",
          mode: "single",
          prompt: { en: "Which NoSQL family does Redis belong to?", uk: "До якого сімейства NoSQL належить Redis?" },
          options: [
            { id: "a", text: { en: "Key-value", uk: "Ключ-значення" } },
            { id: "b", text: { en: "Document", uk: "Документні" } },
            { id: "c", text: { en: "Graph", uk: "Графові" } },
          ],
          correct: ["a"],
        },
        {
          id: "id-field",
          mode: "single",
          prompt: { en: "What is `_id` in a MongoDB document?", uk: "Що таке `_id` у документі MongoDB?" },
          options: [
            { id: "a", text: { en: "The required unique primary key of the document; an ObjectId by default", uk: "Обов'язковий унікальний первинний ключ документа; типово ObjectId" } },
            { id: "b", text: { en: "An optional field for indexing", uk: "Необов'язкове поле для індексування" } },
            { id: "c", text: { en: "The id of the collection", uk: "Id колекції" } },
          ],
          correct: ["a"],
        },
        {
          id: "schema",
          mode: "single",
          prompt: { en: "Two documents in one collection have different fields. Is that allowed?", uk: "Два документи в одній колекції мають різні поля. Чи це дозволено?" },
          options: [
            { id: "a", text: { en: "Yes, unless the collection has schema validation that forbids it", uk: "Так, якщо колекція не має валідації схеми, що це забороняє" } },
            { id: "b", text: { en: "No, every document must have the same fields", uk: "Ні, кожен документ мусить мати ті самі поля" } },
          ],
          correct: ["a"],
        },
        {
          id: "dot-notation",
          mode: "single",
          prompt: { en: "How do you match documents whose nested `specs.color` is `\"black\"`?", uk: "Як знайти документи, де вкладене `specs.color` дорівнює `\"black\"`?" },
          options: [
            { id: "a", text: { en: "`find({ \"specs.color\": \"black\" })`", uk: "`find({ \"specs.color\": \"black\" })`" } },
            { id: "b", text: { en: "`find({ specs: \"black\" })`", uk: "`find({ specs: \"black\" })`" } },
            { id: "c", text: { en: "`find({ color: \"black\" })`", uk: "`find({ color: \"black\" })`" } },
          ],
          correct: ["a"],
        },
        {
          id: "set-operator",
          mode: "single",
          prompt: {
            en: "What does `updateOne({ _id: 1 }, { price: 10 })` do in modern drivers, compared to `{ $set: { price: 10 } }`?",
            uk: "Що робить `updateOne({ _id: 1 }, { price: 10 })` у сучасних драйверах порівняно з `{ $set: { price: 10 } }`?",
          },
          options: [
            { id: "a", text: { en: "It is rejected: updateOne needs update operators; replacing the whole document is `replaceOne`", uk: "Його відхилено: updateOne потребує операторів оновлення; заміна всього документа — це `replaceOne`" } },
            { id: "b", text: { en: "The same as `$set`", uk: "Те саме, що й `$set`" } },
            { id: "c", text: { en: "It deletes the document", uk: "Видаляє документ" } },
          ],
          correct: ["a"],
        },
        {
          id: "array-match",
          mode: "single",
          prompt: { en: "`tags` is `[\"sql\", \"bestseller\"]`. Does `find({ tags: \"sql\" })` match?", uk: "`tags` дорівнює `[\"sql\", \"bestseller\"]`. Чи знайде його `find({ tags: \"sql\" })`?" },
          options: [
            { id: "a", text: { en: "Yes: a scalar condition on an array field matches if any element matches", uk: "Так: скалярна умова на поле-масив спрацьовує, якщо збігається будь-який елемент" } },
            { id: "b", text: { en: "No, it needs `$in`", uk: "Ні, потрібен `$in`" } },
            { id: "c", text: { en: "Only if \"sql\" is the first element", uk: "Лише якщо \"sql\" — перший елемент" } },
          ],
          correct: ["a"],
        },
      ],
    },
    { kind: "lecture", slug: "mongodb-aggregation", title: { en: "The aggregation pipeline", uk: "Конвеєр агрегації" } },
    {
      kind: "practice",
      slug: "mongo-to-jsonb",
      title: { en: "Practice: From MongoDB to JSONB", uk: "Практика «З MongoDB у JSONB»" },
      language: "sql",
      setup: PRODUCT_DOCS,
      starter: `-- 1. db.products.find({ tags: "bestseller" }, { name: 1, price: 1 }).sort({ price: -1 })


-- 2. db.products.find({ "specs.color": "black", price: { $lt: 100 } }, { name: 1 })


-- 3. db.products.aggregate([
--      { $group: { _id: "$category", products: { $sum: 1 }, avg_price: { $avg: "$price" } } },
--      { $sort: { _id: 1 } } ])


-- 4. db.products.aggregate([
--      { $unwind: "$tags" },
--      { $group: { _id: "$tags", products: { $sum: 1 } } },
--      { $sort: { products: -1, _id: 1 } } ])
`,
      solution: `-- 1. db.products.find({ tags: "bestseller" }, { name: 1, price: 1 }).sort({ price: -1 })
SELECT doc ->> 'name' AS name,
       (doc ->> 'price')::numeric AS price
FROM products
WHERE doc -> 'tags' ? 'bestseller'
ORDER BY price DESC;

-- 2. db.products.find({ "specs.color": "black", price: { $lt: 100 } }, { name: 1 })
SELECT doc ->> 'name' AS name
FROM products
WHERE doc @> '{"specs": {"color": "black"}}'
  AND (doc ->> 'price')::numeric < 100;

-- 3. db.products.aggregate([
--      { $group: { _id: "$category", products: { $sum: 1 }, avg_price: { $avg: "$price" } } },
--      { $sort: { _id: 1 } } ])
SELECT doc ->> 'category' AS category,
       count(*) AS products,
       round(avg((doc ->> 'price')::numeric), 2) AS avg_price
FROM products
GROUP BY doc ->> 'category'
ORDER BY category;

-- 4. db.products.aggregate([
--      { $unwind: "$tags" },
--      { $group: { _id: "$tags", products: { $sum: 1 } } },
--      { $sort: { products: -1, _id: 1 } } ])
SELECT tag, count(*) AS products
FROM products, jsonb_array_elements_text(doc -> 'tags') AS tag
GROUP BY tag
ORDER BY products DESC, tag;
`,
      expectedOutput: "    name    | price\n------------+-------\n 4K Monitor |   329\n Chess Set  |    35\n SQL Basics |    25\n(3 rows)\n\n      name\n----------------\n Wireless Mouse\n(1 row)\n\n  category   | products | avg_price\n-------------+----------+-----------\n books       |        3 |     37.80\n electronics |        2 |    174.50\n games       |        1 |     35.00\n(3 rows)\n\n     tag     | products\n-------------+----------\n bestseller  |        3\n sql         |        2\n accessories |        1\n display     |        1\n gift        |        1\n mongodb     |        1\n nosql       |        1\n postgres    |        1\n(8 rows)\n",
      maxScore: 5,
    },
    { kind: "lecture", slug: "mongodb-modeling", title: { en: "Data modeling: embed or reference", uk: "Моделювання даних: вкладати чи посилатися" } },
    { kind: "lecture", slug: "mongodb-scaling", title: { en: "Indexes, replication and sharding", uk: "Індекси, реплікація та шардинг" } },
    {
      kind: "quiz",
      slug: "mongodb-quiz",
      title: { en: "MongoDB in depth check", uk: "Поглиблена перевірка MongoDB" },
      questions: [
        {
          id: "pipeline-order",
          mode: "single",
          prompt: { en: "Why should `$match` usually come first in an aggregation pipeline?", uk: "Чому `$match` зазвичай ставлять першим у конвеєрі агрегації?" },
          options: [
            { id: "a", text: { en: "It can use indexes and reduces the documents every later stage processes", uk: "Він може використати індекси й зменшує кількість документів для всіх наступних етапів" } },
            { id: "b", text: { en: "MongoDB requires it", uk: "Цього вимагає MongoDB" } },
            { id: "c", text: { en: "Order does not matter", uk: "Порядок не важливий" } },
          ],
          correct: ["a"],
        },
        {
          id: "lookup",
          mode: "single",
          prompt: { en: "Which stage does a left outer join with another collection?", uk: "Який етап робить ліве зовнішнє з'єднання з іншою колекцією?" },
          options: [
            { id: "a", text: { en: "`$lookup`", uk: "`$lookup`" } },
            { id: "b", text: { en: "`$unwind`", uk: "`$unwind`" } },
            { id: "c", text: { en: "`$project`", uk: "`$project`" } },
          ],
          correct: ["a"],
        },
        {
          id: "embed-when",
          mode: "multi",
          prompt: { en: "When is embedding a good choice?", uk: "Коли вкладення — добрий вибір?" },
          options: [
            { id: "a", text: { en: "The data is read together with the parent and belongs to it (order lines in an order)", uk: "Дані читають разом із батьком і вони йому належать (позиції в замовленні)" } },
            { id: "b", text: { en: "The embedded list is bounded and small", uk: "Вкладений список обмежений і невеликий" } },
            { id: "c", text: { en: "The embedded list grows without limit (all page views of a user)", uk: "Вкладений список росте без обмежень (усі перегляди сторінок користувача)" } },
            { id: "d", text: { en: "The same sub-document is shared and updated from many parents", uk: "Той самий піддокумент спільний і оновлюється з багатьох батьків" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "doc-limit",
          mode: "single",
          prompt: { en: "What is the maximum size of one MongoDB document?", uk: "Який максимальний розмір одного документа MongoDB?" },
          options: [
            { id: "a", text: { en: "16 MB", uk: "16 МБ" } },
            { id: "b", text: { en: "1 MB", uk: "1 МБ" } },
            { id: "c", text: { en: "Unlimited", uk: "Без обмежень" } },
          ],
          correct: ["a"],
        },
        {
          id: "shard-key",
          mode: "single",
          prompt: { en: "Why is a monotonically increasing field (like a timestamp) a poor ranged shard key?", uk: "Чому монотонно зростаюче поле (як-от час) — поганий ключ шардингу за діапазонами?" },
          options: [
            { id: "a", text: { en: "All new writes go to the one shard that owns the highest range: a hot shard", uk: "Усі нові записи йдуть на один шард із найвищим діапазоном: «гарячий» шард" } },
            { id: "b", text: { en: "Timestamps cannot be indexed", uk: "Час не можна індексувати" } },
            { id: "c", text: { en: "It is a fine choice", uk: "Це чудовий вибір" } },
          ],
          correct: ["a"],
        },
        {
          id: "write-concern",
          mode: "single",
          prompt: { en: "What does write concern `{ w: \"majority\" }` mean?", uk: "Що означає write concern `{ w: \"majority\" }`?" },
          options: [
            { id: "a", text: { en: "The write is acknowledged only after most replica set members have it, so it survives a failover", uk: "Запис підтверджується лише тоді, коли його має більшість членів набору реплік, тож він переживе перемикання" } },
            { id: "b", text: { en: "Most documents in the collection are updated", uk: "Оновлюється більшість документів колекції" } },
            { id: "c", text: { en: "The write goes to the majority of shards", uk: "Запис іде на більшість шардів" } },
          ],
          correct: ["a"],
        },
        {
          id: "transactions",
          mode: "single",
          prompt: { en: "Does MongoDB support multi-document ACID transactions?", uk: "Чи підтримує MongoDB ACID-транзакції на кілька документів?" },
          options: [
            { id: "a", text: { en: "Yes, since 4.0 (replica sets) and 4.2 (sharded clusters), but single-document operations remain the cheap default", uk: "Так, з 4.0 (набори реплік) і 4.2 (шардовані кластери), але операції з одним документом залишаються дешевим варіантом за замовчуванням" } },
            { id: "b", text: { en: "No, never", uk: "Ні, ніколи" } },
            { id: "c", text: { en: "Only for the `_id` field", uk: "Лише для поля `_id`" } },
          ],
          correct: ["a"],
        },
        {
          id: "esr",
          mode: "single",
          prompt: {
            en: "For `find({ status: \"A\", qty: { $gt: 5 } }).sort({ date: -1 })`, which compound index follows the ESR rule?",
            uk: "Який складений індекс для `find({ status: \"A\", qty: { $gt: 5 } }).sort({ date: -1 })` відповідає правилу ESR?",
          },
          options: [
            { id: "a", text: { en: "`{ status: 1, date: -1, qty: 1 }`: Equality, Sort, Range", uk: "`{ status: 1, date: -1, qty: 1 }`: Equality, Sort, Range" } },
            { id: "b", text: { en: "`{ qty: 1, status: 1, date: -1 }`", uk: "`{ qty: 1, status: 1, date: -1 }`" } },
            { id: "c", text: { en: "`{ date: -1, qty: 1, status: 1 }`", uk: "`{ date: -1, qty: 1, status: 1 }`" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
