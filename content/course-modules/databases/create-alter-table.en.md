The part of SQL that defines structure is called **DDL** (data definition language): `CREATE`, `ALTER`, `DROP`. The part that changes data is **DML** (`INSERT`, `UPDATE`, `DELETE`), and `SELECT` is sometimes called **DQL**. `GRANT` and `REVOKE` form **DCL**.

## CREATE TABLE

```sql
CREATE TABLE products (
    id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        text NOT NULL,
    category_id integer REFERENCES categories (id),
    price       numeric(10, 2) NOT NULL CHECK (price >= 0),
    stock       integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
);
```

Each line is `column type [constraints]`. `DEFAULT` gives the value used when an `INSERT` does not mention the column.

Useful variants:

- `CREATE TABLE IF NOT EXISTS …` does nothing when the table exists (handy in scripts, dangerous in migrations, because it hides differences).
- `CREATE TABLE archive (LIKE orders INCLUDING ALL);` copies the structure.
- `CREATE TABLE top_products AS SELECT …;` creates a table from a query result (no constraints copied).
- `CREATE TEMP TABLE …` lives until the end of the session.

## Generated columns

A column can be computed from other columns of the same row:

```sql
CREATE TABLE order_items (
    quantity   integer NOT NULL,
    unit_price numeric(10, 2) NOT NULL,
    line_total numeric(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
```

`STORED` columns are computed on write; PostgreSQL 18 also supports `VIRTUAL` ones, computed on read.

## ALTER TABLE

```sql
ALTER TABLE products ADD COLUMN description text;
ALTER TABLE products ALTER COLUMN description SET NOT NULL;   -- fails if NULLs exist
ALTER TABLE products ALTER COLUMN price TYPE numeric(12, 2);
ALTER TABLE products RENAME COLUMN stock TO quantity_in_stock;
ALTER TABLE products DROP COLUMN description;
ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);
ALTER TABLE products RENAME TO items;
```

## Changing a live table safely

Many `ALTER TABLE` forms take an `ACCESS EXCLUSIVE` lock: no one can even read the table until the change finishes. On a big, busy table this is an outage. Rules of thumb that interviewers like:

- **Adding a nullable column**, or a column with a constant default, is instant (only the catalog changes).
- **Changing a column type** usually rewrites the whole table. Instead, add a new column, backfill it in batches, switch the code, then drop the old one.
- **Adding `NOT NULL` or a foreign key** has to check every row. For a foreign key or a `CHECK`, add the constraint as `NOT VALID` (instant) and run `ALTER TABLE … VALIDATE CONSTRAINT …` later, which does not block writes.
- **Creating an index** blocks writes; use `CREATE INDEX CONCURRENTLY` in production.
- Set a `lock_timeout` in migrations so a migration that cannot get its lock fails fast instead of queuing every other query behind it.

## DROP and TRUNCATE

```sql
DROP TABLE order_items;              -- removes the table and its data
DROP TABLE IF EXISTS order_items;
DROP TABLE categories CASCADE;       -- also drops the foreign keys that depend on it
TRUNCATE order_items;                -- deletes all rows instantly, keeps the table
TRUNCATE orders RESTART IDENTITY CASCADE;
```

`TRUNCATE` is much faster than `DELETE FROM t` on big tables because it does not visit rows one by one, but it does not fire `ON DELETE` triggers.

## DDL is transactional

In PostgreSQL, DDL takes part in transactions, so a migration can be all-or-nothing:

```sql
BEGIN;
ALTER TABLE products ADD COLUMN sku text;
UPDATE products SET sku = 'P-' || id;
ALTER TABLE products ALTER COLUMN sku SET NOT NULL;
COMMIT;   -- or ROLLBACK, and nothing happened
```

MySQL and Oracle commit implicitly on DDL, so this is a real PostgreSQL advantage.

## Schemas

Tables live in a **schema**; the default is `public`. `CREATE SCHEMA billing;` and `billing.invoices` separate parts of a large database. The `search_path` setting decides which schemas are searched for unqualified names.
