Without an index, `WHERE email = 'ann@example.com'` makes PostgreSQL read **every row** of the table: a **sequential scan**. That is fine for 1,000 rows and fatal for 100 million. An **index** is a separate data structure that finds rows by a key without reading everything, like the index at the back of a book.

## How a table is stored

A PostgreSQL table (a **heap**) is a file of 8 KB **pages**, and rows sit in pages in no particular order. Each row has a physical address, the `ctid` (page number, slot). An index maps key values to these addresses.

## The B-tree

The default index type is a **B-tree** (balanced tree):

```text
                      [ 40 | 80 ]                     ← root
             ┌────────────┼────────────┐
       [ 10 | 25 ]   [ 50 | 65 ]   [ 90 | 120 ]       ← inner pages
        ┌──┼──┐       ┌──┼──┐        ┌──┼──┐
      leaves: sorted keys with row addresses, linked left ↔ right
```

- Keys are kept **sorted**. Every leaf is at the same depth, so every lookup costs the same.
- Pages are wide (hundreds of keys each), so the tree is shallow: about 3–4 levels for millions of rows. Finding one key reads a handful of pages instead of the whole table: **O(log n)**.
- Leaves are linked, so after finding the start of a range, the index can be read in order.

Because the keys are sorted, a B-tree serves:

- equality: `=`, `IN`;
- ranges: `<`, `<=`, `>`, `>=`, `BETWEEN`;
- prefix search: `LIKE 'abc%'` (needs the C collation or the `text_pattern_ops` operator class);
- `ORDER BY` on the indexed columns (in either direction), which avoids a sort, and makes `ORDER BY … LIMIT n` very cheap;
- `IS NULL`, and `min()` / `max()`.

It does **not** help with `LIKE '%abc'` (no fixed prefix) or with a function applied to the column.

## Creating indexes

```sql
CREATE INDEX products_category_id_idx ON products (category_id);
CREATE UNIQUE INDEX customers_email_key ON customers (email);
DROP INDEX products_category_id_idx;
```

`PRIMARY KEY` and `UNIQUE` constraints create unique B-tree indexes automatically. Foreign keys do **not**: index the referencing column yourself when you join on it or delete parent rows.

On a live production table, `CREATE INDEX` blocks writes until it finishes. `CREATE INDEX CONCURRENTLY` does not, at the cost of taking longer and not being allowed inside a transaction.

## Index scans in practice

- **Index Scan**: walk the index, then fetch each matching row from the heap. Great for a few rows.
- **Index Only Scan**: all needed columns are in the index, so the heap is skipped (if the visibility map says the pages are all-visible, which `VACUUM` maintains).
- **Bitmap Index Scan + Bitmap Heap Scan**: collect the addresses of all matches first, sort them by page, then read each page once. Used for a moderate number of rows, and to combine several indexes with `AND` / `OR`.
- **Seq Scan**: read the whole table. For a query that returns a large part of a table, this is **faster** than an index: sequential reads are cheap, and fetching most rows through the index means random jumps all over the heap.

The planner chooses between them using **statistics** (row counts, value distributions) that `ANALYZE` collects; autovacuum runs it automatically. Outdated statistics are a classic reason for a bad plan.

## The cost of an index

Indexes are not free:

- every `INSERT` and `DELETE`, and every `UPDATE` of an indexed column, must update every index;
- they take disk space and compete for memory (the buffer cache);
- unused indexes are pure overhead. `pg_stat_user_indexes.idx_scan` shows how often each index is used.

A table with 15 indexes "just in case" writes slowly. Index for the queries you actually run.
