import { SHOP, TRY_SQL } from "../databases-data";
import type { ModuleDef } from "../types";

const TAGS_CHECKS = `-- Checks (do not change)
SELECT check_name, try_sql(statement) AS result
FROM (VALUES
    (1, 'duplicate link',     $$INSERT INTO product_tags (product_id, tag_id) SELECT 1, id FROM tags WHERE name = 'bestseller'$$),
    (2, 'unknown product',    $$INSERT INTO product_tags (product_id, tag_id) SELECT 999, id FROM tags WHERE name = 'gift'$$),
    (3, 'unknown tag',        $$INSERT INTO product_tags (product_id, tag_id) VALUES (1, -1)$$),
    (4, 'duplicate tag name', $$INSERT INTO tags (name) VALUES ('gift')$$),
    (5, 'delete a used tag',  $$DELETE FROM tags WHERE name = 'new'$$)
) AS checks (n, check_name, statement)
ORDER BY n;

SELECT p.name AS product, string_agg(t.name, ', ' ORDER BY t.name) AS tags
FROM products AS p
JOIN product_tags AS pt ON pt.product_id = p.id
JOIN tags AS t ON t.id = pt.tag_id
GROUP BY p.name
ORDER BY p.name;
`;

export const designModule: ModuleDef = {
  slug: "schema-design",
  title: { en: "Schema design", uk: "Проєктування схеми" },
  slides: [
    { kind: "lecture", slug: "normalization", title: { en: "Normalization", uk: "Нормалізація" } },
    { kind: "lecture", slug: "modeling-relationships", title: { en: "Modeling relationships and keys", uk: "Моделювання зв'язків і ключів" } },
    {
      kind: "practice",
      slug: "product-tags",
      title: { en: "Practice: Product tags", uk: "Практика «Теги товарів»" },
      language: "sql",
      setup: `${SHOP}\n${TRY_SQL}`,
      starter: `-- 1. Create the tags and product_tags tables


-- 2. Add the tags: bestseller, gift, new


-- 3. Tag the products


${TAGS_CHECKS}`,
      solution: `-- 1. Create the tags and product_tags tables
CREATE TABLE tags (
    id   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE product_tags (
    product_id integer NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    tag_id     integer NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- 2. Add the tags: bestseller, gift, new
INSERT INTO tags (name) VALUES ('bestseller'), ('gift'), ('new');

-- 3. Tag the products
INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM (VALUES ('SQL Basics', 'bestseller'),
             ('Chess Set', 'bestseller'),
             ('Chess Set', 'gift'),
             ('Puzzle 1000', 'gift'),
             ('4K Monitor', 'new')) AS v (product, tag)
JOIN products AS p ON p.name = v.product
JOIN tags AS t ON t.name = v.tag;

${TAGS_CHECKS}`,
      expectedOutput: "     check_name     |        result\n--------------------+-----------------------\n duplicate link     | unique_violation\n unknown product    | foreign_key_violation\n unknown tag        | foreign_key_violation\n duplicate tag name | unique_violation\n delete a used tag  | ok\n(5 rows)\n\n   product   |       tags\n-------------+------------------\n Chess Set   | bestseller, gift\n Puzzle 1000 | gift\n SQL Basics  | bestseller\n(3 rows)\n",
      maxScore: 5,
    },
    {
      kind: "quiz",
      slug: "schema-design-quiz",
      title: { en: "Schema design check", uk: "Перевірка проєктування схеми" },
      questions: [
        {
          id: "1nf",
          mode: "single",
          prompt: { en: "A column `phones` holds `'050-111, 067-222'`. Which normal form is violated?", uk: "Стовпець `phones` містить `'050-111, 067-222'`. Яку нормальну форму порушено?" },
          options: [
            { id: "a", text: { en: "1NF: values must be atomic", uk: "1НФ: значення мають бути атомарними" } },
            { id: "b", text: { en: "3NF", uk: "3НФ" } },
            { id: "c", text: { en: "None", uk: "Жодну" } },
          ],
          correct: ["a"],
        },
        {
          id: "3nf",
          mode: "single",
          prompt: {
            en: "`orders(id, customer_id, customer_city, …)`: the city depends on the customer, not on the order. What is this?",
            uk: "`orders(id, customer_id, customer_city, …)`: місто залежить від клієнта, а не від замовлення. Що це?",
          },
          options: [
            { id: "a", text: { en: "A transitive dependency, a 3NF violation that causes update anomalies", uk: "Транзитивна залежність — порушення 3НФ, що спричиняє аномалії оновлення" } },
            { id: "b", text: { en: "A correct design in 3NF", uk: "Правильний дизайн у 3НФ" } },
            { id: "c", text: { en: "A 1NF violation", uk: "Порушення 1НФ" } },
          ],
          correct: ["a"],
        },
        {
          id: "many-to-many",
          mode: "single",
          prompt: { en: "How is a many-to-many relationship stored in a relational database?", uk: "Як у реляційній базі зберігають зв'язок «багато-до-багатьох»?" },
          options: [
            { id: "a", text: { en: "In a junction table with two foreign keys", uk: "У проміжній таблиці з двома зовнішніми ключами" } },
            { id: "b", text: { en: "In an array column on one side", uk: "У стовпці-масиві з одного боку" } },
            { id: "c", text: { en: "With a foreign key on each side pointing to the other", uk: "Зовнішнім ключем з кожного боку, що вказує на інший" } },
          ],
          correct: ["a"],
        },
        {
          id: "denormalize",
          mode: "multi",
          prompt: { en: "Which are good reasons to denormalize?", uk: "Які причини для денормалізації слушні?" },
          options: [
            { id: "a", text: { en: "A measured read hot path needs to avoid an expensive join or aggregate", uk: "Виміряний гарячий шлях читання має уникнути дорогого з'єднання чи агрегату" } },
            { id: "b", text: { en: "Keeping the price an order was paid at, even if the product price changes later", uk: "Збереження ціни, за якою оплачено замовлення, навіть якщо ціна товару потім зміниться" } },
            { id: "c", text: { en: "Joins are always slow, so every table should contain everything", uk: "З'єднання завжди повільні, тож кожна таблиця має містити все" } },
          ],
          correct: ["a", "b"],
        },
        {
          id: "surrogate",
          mode: "single",
          prompt: { en: "Why do most tables use a surrogate key (`id`) instead of a natural one such as an email?", uk: "Чому більшість таблиць використовує сурогатний ключ (`id`), а не природний, як-от email?" },
          options: [
            { id: "a", text: { en: "Natural values can change, and every foreign key would have to change with them", uk: "Природні значення можуть змінюватися, і разом із ними довелося б змінювати всі зовнішні ключі" } },
            { id: "b", text: { en: "Natural keys cannot be unique", uk: "Природні ключі не можуть бути унікальними" } },
            { id: "c", text: { en: "PostgreSQL requires a numeric primary key", uk: "PostgreSQL вимагає числового первинного ключа" } },
          ],
          correct: ["a"],
        },
        {
          id: "eav",
          mode: "single",
          prompt: {
            en: "Products have very different attributes (a book has pages, a monitor has a resolution). Which design is usually best in PostgreSQL?",
            uk: "Товари мають дуже різні атрибути (у книжки — сторінки, у монітора — роздільність). Який дизайн зазвичай найкращий у PostgreSQL?",
          },
          options: [
            { id: "a", text: { en: "Common columns plus a `jsonb` column for the varying attributes", uk: "Спільні стовпці плюс стовпець `jsonb` для змінних атрибутів" } },
            { id: "b", text: { en: "An entity-attribute-value table with one row per attribute", uk: "Таблиця сутність-атрибут-значення з рядком на кожен атрибут" } },
            { id: "c", text: { en: "One column for every attribute of every product type", uk: "По стовпцю на кожен атрибут кожного типу товару" } },
          ],
          correct: ["a"],
        },
      ],
    },
  ],
};
