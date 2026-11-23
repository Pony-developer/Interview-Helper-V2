## RETURNING

`INSERT`, `UPDATE` and `DELETE` can return the rows they touched, which saves a round trip:

```sql
INSERT INTO users (email, name) VALUES ('ann@example.com', 'Ann')
RETURNING id, created_at;               -- the generated values

UPDATE products SET stock = stock - 1 WHERE id = 4 AND stock > 0
RETURNING stock;                        -- no row returned = nothing was in stock

DELETE FROM sessions WHERE expires_at < now()
RETURNING user_id;                      -- who was logged out
```

`RETURNING` is a PostgreSQL feature (SQL Server has `OUTPUT`, MySQL has nothing equivalent for `UPDATE`). ORMs use it to fill in ids after an insert.

The `UPDATE … WHERE stock > 0 RETURNING` pattern above is also an **atomic** "decrement if possible": the check and the change happen in one statement, so two buyers cannot both take the last item.

## Upsert: INSERT … ON CONFLICT

"Insert the row, or update it if it already exists" is called an **upsert**. Doing it in the application as "SELECT, then INSERT or UPDATE" is a race condition. PostgreSQL does it atomically:

```sql
INSERT INTO products (id, name, category_id, price, stock)
VALUES (4, 'Wireless Mouse', 2, 17.99, 0)
ON CONFLICT (id) DO UPDATE
SET price = EXCLUDED.price;
```

- The **conflict target** `(id)` must match a unique index or constraint (a primary key counts).
- `EXCLUDED` is the row you tried to insert; the table name (`products.price`) refers to the existing row.
- You can add a condition: `DO UPDATE SET price = EXCLUDED.price WHERE products.price <> EXCLUDED.price`.
- `ON CONFLICT DO NOTHING` silently skips duplicates, which is perfect for idempotent event processing:

```sql
INSERT INTO processed_events (event_id) VALUES ('evt_123')
ON CONFLICT DO NOTHING
RETURNING event_id;     -- a row: first time; no row: already processed
```

Counting things atomically, such as page views per day:

```sql
INSERT INTO page_views (page, day, views) VALUES ('/home', current_date, 1)
ON CONFLICT (page, day) DO UPDATE SET views = page_views.views + 1;
```

A single upsert statement cannot touch the same row twice: `VALUES (1, …), (1, …)` with `DO UPDATE` fails with "command cannot affect row a second time". Deduplicate the input first.

MySQL's equivalent is `INSERT … ON DUPLICATE KEY UPDATE`; SQLite copied PostgreSQL's syntax.

## MERGE

`MERGE` (standard SQL, in PostgreSQL since version 15) synchronises a table with a source in one statement, with different actions for matching and non-matching rows:

```sql
MERGE INTO products AS p
USING supplier_prices AS s ON s.product_id = p.id
WHEN MATCHED AND s.discontinued THEN
    DELETE
WHEN MATCHED THEN
    UPDATE SET price = s.price
WHEN NOT MATCHED THEN
    INSERT (id, name, price) VALUES (s.product_id, s.name, s.price);
```

`MERGE` is more flexible (it can delete, and it handles several conditions), while `ON CONFLICT` is built on the unique index and is the safer choice under concurrency: `MERGE` can still fail with a unique violation if another transaction inserts the same key at the same moment. For a plain upsert, prefer `ON CONFLICT`.
