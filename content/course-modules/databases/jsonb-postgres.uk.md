PostgreSQL зберігає JSON нативно. З `jsonb` можна тримати гнучкі вкладені дані поруч зі звичайними стовпцями, запитувати всередину них та індексувати їх. Це міст між реляційним світом і документними базами з наступного модуля.

## json проти jsonb

| | `json` | `jsonb` |
|---|---|---|
| Зберігання | Вихідний текст | Розібрана двійкова форма |
| Порядок ключів, пробіли, ключі-дублікати | Зберігаються | Нормалізуються (перемагає останній дублікат) |
| Швидкість запитів | Розбирається при кожному доступі | Швидко |
| Індекси, вкладеність `@>` | Ні | Так |

Використовуйте `jsonb`, якщо не мусите зберегти точний вхідний текст.

## Читання значень

```sql
CREATE TABLE product_docs (id integer PRIMARY KEY, doc jsonb NOT NULL);
INSERT INTO product_docs VALUES
  (1, '{"name": "4K Monitor", "price": 329, "tags": ["display", "4k"],
        "specs": {"size": 27, "color": "black"}}');

SELECT doc -> 'specs'                AS specs_json,   -- jsonb: {"size": 27, "color": "black"}
       doc -> 'specs' ->> 'color'    AS color,        -- text: black
       doc #>> '{specs,size}'        AS size_text,    -- text за шляхом: 27
       (doc ->> 'price')::numeric    AS price,        -- перетворення тексту на число
       doc -> 'tags' -> 0            AS first_tag     -- у JSON масиви нумеруються з 0
FROM product_docs;
```

- `->` повертає `jsonb`, `->>` повертає `text`. Використовуйте `->`, щоб іти глибше, а `->>` — на останньому кроці.
- Відсутній ключ дає `NULL`, а не помилку.
- PostgreSQL підтримує й SQL/JSON path: `jsonb_path_query(doc, '$.tags[*]')`, а також `JSON_VALUE(doc, '$.specs.color')`.

## Фільтрування

```sql
-- вкладеність: чи містить doc цей JSON?
SELECT id FROM product_docs WHERE doc @> '{"specs": {"color": "black"}}';

-- чи є ключ
SELECT id FROM product_docs WHERE doc ? 'discount';

-- чи містить масив значення
SELECT id FROM product_docs WHERE doc -> 'tags' ? '4k';

-- порівняння значення
SELECT id FROM product_docs WHERE (doc ->> 'price')::numeric < 400;
```

## Індексування

```sql
-- GIN-індекс для @>, ?, ?| і ?& по всьому документу
CREATE INDEX product_docs_doc_idx ON product_docs USING gin (doc);

-- менший GIN-індекс, що підтримує лише @> (jsonb_path_ops)
CREATE INDEX product_docs_doc_path_idx ON product_docs USING gin (doc jsonb_path_ops);

-- B-tree індекс за виразом для одного поля, за яким часто фільтрують чи сортують
CREATE INDEX product_docs_price_idx ON product_docs (((doc ->> 'price')::numeric));
```

## Зміна документів

```sql
UPDATE product_docs SET doc = jsonb_set(doc, '{specs,color}', '"white"') WHERE id = 1;
UPDATE product_docs SET doc = doc || '{"discount": 10}' WHERE id = 1;   -- злиття ключів
UPDATE product_docs SET doc = doc - 'discount' WHERE id = 1;            -- видалити ключ
```

Зверніть увагу: будь-яка зміна переписує **весь** документ (а великі значення стискаються й зберігаються окремо), тож часті дрібні оновлення великого документа дорогі.

## Побудова JSON з рядків

Протилежний напрямок так само корисний, наприклад щоб повертати відповіді API просто з SQL:

```sql
SELECT c.name,
       jsonb_agg(jsonb_build_object('order', o.id, 'status', o.status) ORDER BY o.id) AS orders
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;
```

`jsonb_build_object`, `jsonb_agg`, `to_jsonb(row)` і `jsonb_array_elements` / `jsonb_each` (що перетворюють JSON назад на рядки) покривають більшість потреб.

## Коли використовувати jsonb

Добре підходить: атрибути, що залежать від типу товару, налаштування користувача, сирі дані з вебхуків, розріджені необов'язкові поля. Погано підходить: усе, за чим ви з'єднуєте, для чого потрібні гарантії зв'язків або що весь час оновлюють поле за полем. Здоровий дизайн тримає **основні поля як типізовані стовпці** з обмеженнями, а довгий хвіст — у `jsonb`. Можна навіть додати обмеження `CHECK (jsonb_typeof(doc -> 'tags') = 'array')` для мінімальної валідації.
