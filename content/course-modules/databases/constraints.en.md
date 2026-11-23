Constraints are rules the database enforces on every write, no matter which application, script or person makes it. Application validation is for friendly error messages; constraints are the guarantee.

## The six kinds

```sql
CREATE TABLE orders (
    id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,       -- PRIMARY KEY
    customer_id integer NOT NULL                                         -- NOT NULL
                REFERENCES customers (id) ON DELETE RESTRICT,            -- FOREIGN KEY
    number      text NOT NULL UNIQUE,                                    -- UNIQUE
    status      text NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'paid', 'shipped', 'cancelled')), -- CHECK
    total       numeric(10, 2) NOT NULL CHECK (total >= 0)
);
```

| Constraint | Guarantees | Notes |
|---|---|---|
| `NOT NULL` | A value is present | Make columns `NOT NULL` unless "unknown" is a real state |
| `UNIQUE` | No two rows share the value | Creates a unique index; NULLs do not conflict with each other (unless `UNIQUE NULLS NOT DISTINCT`) |
| `PRIMARY KEY` | `UNIQUE` + `NOT NULL`, one per table | The row's identity |
| `FOREIGN KEY` | The value exists in the referenced table | The referenced columns must be unique |
| `CHECK` | A boolean condition holds | Fails only when the condition is **false**; `NULL` passes |
| `EXCLUDE` | No two rows "overlap" by a given operator | PostgreSQL only, e.g. bookings with overlapping ranges |

## Column and table constraints

A constraint on one column can be written next to it. A constraint over several columns must be written separately:

```sql
CREATE TABLE order_items (
    order_id   integer REFERENCES orders (id) ON DELETE CASCADE,
    product_id integer REFERENCES products (id),
    quantity   integer NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (order_id, product_id),                     -- composite key
    CONSTRAINT reasonable_quantity CHECK (quantity <= 1000) -- a named constraint
);
```

Unnamed constraints get generated names such as `products_price_check` or `orders_customer_id_fkey`. Naming important constraints yourself makes error messages and migrations clearer.

## Foreign key actions

What happens to `order_items` when an order is deleted (or its id changes)?

| Action | Effect |
|---|---|
| `NO ACTION` (default) / `RESTRICT` | The delete fails while referencing rows exist |
| `CASCADE` | The referencing rows are deleted too (or updated, for `ON UPDATE`) |
| `SET NULL` | The foreign key column becomes `NULL` |
| `SET DEFAULT` | The column gets its default value |

`CASCADE` is convenient for parts that cannot live without their parent (order items), but dangerous for independent data: you do not want deleting a category to silently delete its products. Also, PostgreSQL does **not** create an index on the referencing column automatically. Without an index on `order_items.order_id`, deleting an order scans the whole `order_items` table to check references. Index your foreign keys.

## Deferrable constraints

Normally a constraint is checked after each statement. `DEFERRABLE INITIALLY DEFERRED` postpones the check to `COMMIT`, which helps when two rows temporarily violate a rule, such as swapping the positions of two items under a `UNIQUE (list_id, position)` constraint.

## Errors you will see

```text
ERROR:  duplicate key value violates unique constraint "users_email_key"
ERROR:  null value in column "name" of relation "users" violates not-null constraint
ERROR:  new row for relation "users" violates check constraint "users_age_check"
ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
```

Each has a SQLSTATE code (`23505` unique, `23502` not null, `23514` check, `23503` foreign key) that application code can catch, for example to answer "this email is already registered" with HTTP 409 instead of 500.

## Constraints vs application checks

"Check if the email exists, then insert" in application code has a race: two requests can both see "not taken" and both insert. Only a `UNIQUE` constraint closes that race. The same goes for "stock must not go negative" (`CHECK (stock >= 0)`) and "an order must belong to a customer" (a foreign key).

## About the practice

The practice uses a helper function `try_sql(statement)` from the setup script. It runs a statement and returns `ok` or the kind of error (`unique_violation`, `check_violation`, `not_null_violation`), so one run can test several constraints without stopping at the first rejected row.
