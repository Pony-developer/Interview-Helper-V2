## Composite indexes and column order

An index can cover several columns. A B-tree on `(user_id, created_at)` sorts by `user_id` first and, within one user, by `created_at`, like a phone book sorted by last name, then first name.

The **leftmost prefix** rule follows:

| Query | Uses `(user_id, created_at)` well? |
|---|---|
| `WHERE user_id = 42` | Yes |
| `WHERE user_id = 42 AND created_at > '2024-06-01'` | Yes: one contiguous range |
| `WHERE user_id = 42 ORDER BY created_at DESC LIMIT 10` | Yes, perfectly: read the user's range backwards, stop after 10 |
| `WHERE created_at > '2024-06-01'` | Poorly: the dates are scattered across all users |

Guidelines for ordering columns:

1. Columns compared with `=` first, then the column used for a range or `ORDER BY`.
2. Among equality columns, it matters less; put the one shared with other queries first, so the index serves them too.

An index on `(a, b)` also serves queries on `a` alone, so a separate index on `a` is usually redundant.

(PostgreSQL 18 added **skip scan**, which can use a composite index even without a condition on its first column when that column has few distinct values. It helps, but designing indexes around the leftmost prefix is still the rule.)

## Covering indexes

If the index contains every column the query needs, PostgreSQL can answer from the index alone (**Index Only Scan**). `INCLUDE` adds payload columns that are stored but not part of the key:

```sql
CREATE INDEX orders_customer_idx ON orders (customer_id) INCLUDE (status, ordered_at);
```

## Partial indexes

An index can cover only the rows you query:

```sql
-- only unprocessed jobs are ever looked up
CREATE INDEX jobs_pending_idx ON jobs (created_at) WHERE status = 'pending';

-- uniqueness among active rows only (with soft delete)
CREATE UNIQUE INDEX users_email_active_key ON users (email) WHERE deleted_at IS NULL;
```

Partial indexes are smaller and cheaper to maintain. The query's `WHERE` must imply the index's condition for it to be used.

## Expression indexes

Index the result of an expression, and queries using the same expression can use it:

```sql
CREATE INDEX customers_email_lower_idx ON customers (lower(email));
SELECT * FROM customers WHERE lower(email) = 'olena@example.com';   -- uses it

CREATE INDEX orders_day_idx ON orders ((ordered_at::date));         -- note the double parentheses
```

## Other index types

| Type | Good for | Example |
|---|---|---|
| **B-tree** | Equality, ranges, sorting: the default | `WHERE price < 100 ORDER BY price` |
| **Hash** | Equality only | Rarely better than B-tree |
| **GIN** (generalized inverted index) | Values that contain many elements: arrays, `jsonb`, full-text search | `tags @> ARRAY['sql']`, `doc @> '{"color":"red"}'`, `tsv @@ to_tsquery('postgres')` |
| **GiST** | Geometric data, ranges, nearest-neighbour search; exclusion constraints | PostGIS, `during && tstzrange(…)` |
| **SP-GiST** | Non-balanced partitioned data: quadtrees, prefixes | IP ranges, phone prefixes |
| **BRIN** (block range index) | Huge tables whose values follow the physical order (append-only logs, time series) | `created_at` on a 1-billion-row log: tiny index |

Extensions add more: `pg_trgm` with GIN gives fast `LIKE '%abc%'` and fuzzy search, and `pgvector` adds HNSW and IVFFlat indexes for AI embedding similarity search.

## Choosing indexes in an interview

A good answer goes from the query to the index, not the other way round:

1. Which queries are slow or frequent? (`pg_stat_statements` shows the top ones.)
2. What do they filter on, join on and sort by?
3. Equality columns first, then range/sort column; consider `INCLUDE` for an index-only scan and a partial index for a hot subset.
4. Check the plan with `EXPLAIN ANALYZE`, and remember the write cost.
