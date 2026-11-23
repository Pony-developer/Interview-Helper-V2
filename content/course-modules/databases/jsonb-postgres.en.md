PostgreSQL stores JSON natively. With `jsonb` you can keep flexible, nested data next to ordinary columns, query inside it and index it. It is the bridge between the relational world and the document databases in the next module.

## json vs jsonb

| | `json` | `jsonb` |
|---|---|---|
| Storage | The original text | A parsed binary form |
| Key order, whitespace, duplicate keys | Kept | Normalised (last duplicate wins) |
| Query speed | Re-parsed on every access | Fast |
| Indexes, containment `@>` | No | Yes |

Use `jsonb` unless you must preserve the exact input text.

## Reading values

```sql
CREATE TABLE product_docs (id integer PRIMARY KEY, doc jsonb NOT NULL);
INSERT INTO product_docs VALUES
  (1, '{"name": "4K Monitor", "price": 329, "tags": ["display", "4k"],
        "specs": {"size": 27, "color": "black"}}');

SELECT doc -> 'specs'                AS specs_json,   -- jsonb: {"size": 27, "color": "black"}
       doc -> 'specs' ->> 'color'    AS color,        -- text: black
       doc #>> '{specs,size}'        AS size_text,    -- text by path: 27
       (doc ->> 'price')::numeric    AS price,        -- cast text to a number
       doc -> 'tags' -> 0            AS first_tag     -- arrays are 0-based in JSON
FROM product_docs;
```

- `->` returns `jsonb`, `->>` returns `text`. Use `->` to go deeper, `->>` at the last step.
- A missing key gives `NULL`, not an error.
- PostgreSQL also supports SQL/JSON path: `jsonb_path_query(doc, '$.tags[*]')`, and `JSON_VALUE(doc, '$.specs.color')`.

## Filtering

```sql
-- containment: does doc contain this JSON?
SELECT id FROM product_docs WHERE doc @> '{"specs": {"color": "black"}}';

-- key exists
SELECT id FROM product_docs WHERE doc ? 'discount';

-- an array contains a value
SELECT id FROM product_docs WHERE doc -> 'tags' ? '4k';

-- compare a value
SELECT id FROM product_docs WHERE (doc ->> 'price')::numeric < 400;
```

## Indexing

```sql
-- GIN index for @>, ?, ?| and ?& on the whole document
CREATE INDEX product_docs_doc_idx ON product_docs USING gin (doc);

-- smaller GIN index that supports only @> (jsonb_path_ops)
CREATE INDEX product_docs_doc_path_idx ON product_docs USING gin (doc jsonb_path_ops);

-- B-tree expression index for one frequently filtered or sorted field
CREATE INDEX product_docs_price_idx ON product_docs (((doc ->> 'price')::numeric));
```

## Changing documents

```sql
UPDATE product_docs SET doc = jsonb_set(doc, '{specs,color}', '"white"') WHERE id = 1;
UPDATE product_docs SET doc = doc || '{"discount": 10}' WHERE id = 1;   -- merge keys
UPDATE product_docs SET doc = doc - 'discount' WHERE id = 1;            -- remove a key
```

Note that any change rewrites the **whole** document value (and large values are compressed and stored out of line), so frequent small updates of a big document are expensive.

## Building JSON from rows

The other direction is just as useful, for example to return API responses straight from SQL:

```sql
SELECT c.name,
       jsonb_agg(jsonb_build_object('order', o.id, 'status', o.status) ORDER BY o.id) AS orders
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;
```

`jsonb_build_object`, `jsonb_agg`, `to_jsonb(row)` and `jsonb_array_elements` / `jsonb_each` (which turn JSON back into rows) cover most needs.

## When to use jsonb

Good fits: attributes that vary by product type, user settings, raw payloads from webhooks, sparse optional fields. Poor fits: anything you join on, enforce relationships for, or update field by field all the time. A healthy design keeps **core fields as typed columns** with constraints, and the long tail in `jsonb`. You can even add `CHECK (jsonb_typeof(doc -> 'tags') = 'array')` constraints for minimal validation.
