Rows in a table have no order. If the order of the result matters, and it almost always does for anything a user sees, say it with `ORDER BY`.

## ORDER BY

```sql
SELECT name, price FROM products ORDER BY price;          -- ascending (ASC is the default)
SELECT name, price FROM products ORDER BY price DESC;     -- descending
SELECT name, city  FROM customers ORDER BY city, name;    -- by city, then by name inside a city
```

- Each key has its own direction: `ORDER BY category_id ASC, price DESC`.
- You can sort by an expression or an alias from `SELECT`: `ORDER BY price * stock DESC`, `ORDER BY sale_price`.
- `ORDER BY 2` sorts by the second column of `SELECT`. It works, but breaks silently when someone reorders the columns.

## Where do NULLs go?

In PostgreSQL, `NULL` is treated as **larger** than any value: it comes last in `ASC` and first in `DESC`. Override it with `NULLS FIRST` / `NULLS LAST`:

```sql
SELECT name, city FROM customers ORDER BY city NULLS FIRST;
SELECT name, city FROM customers ORDER BY city DESC NULLS LAST;
```

Other databases differ (MySQL and SQL Server put `NULL` first in `ASC`), so being explicit makes a query portable.

## Make the order unique

If two rows have the same sort key, their relative order is **not defined** and may change between runs, especially after the table is updated. That is fine for a report, but it breaks pagination: a row can appear on two pages or on none. Add a unique column as the last key:

```sql
SELECT id, name, price FROM products ORDER BY price DESC, id;
```

## LIMIT and OFFSET

```sql
SELECT name, price FROM products ORDER BY price DESC LIMIT 3;            -- top 3
SELECT name, price FROM products ORDER BY price DESC LIMIT 3 OFFSET 3;   -- rows 4–6
```

The standard spelling, which PostgreSQL supports too, is `OFFSET 3 ROWS FETCH FIRST 3 ROWS ONLY`. `FETCH FIRST 3 ROWS WITH TIES` also returns the rows that tie with the last one.

`LIMIT` without `ORDER BY` returns "some" rows, which is rarely what you want.

## Page numbers: OFFSET pagination

Page `n` (from 1) with page size `size` is `LIMIT size OFFSET (n - 1) * size`. It is simple and lets users jump to any page, but:

- **it gets slower with every page**: `OFFSET 100000` makes the database produce and throw away 100,000 rows;
- **it is unstable**: if a row is inserted or deleted while the user is reading, the following pages shift, and a row is shown twice or skipped.

## Keyset (cursor) pagination

Instead of "skip N rows", remember the last row the user saw and ask for the rows after it:

```sql
-- first page
SELECT id, name, price FROM products ORDER BY price DESC, id DESC LIMIT 3;

-- next page: the last row of the previous page had price 48.50 and id 2
SELECT id, name, price FROM products
WHERE (price, id) < (48.50, 2)
ORDER BY price DESC, id DESC
LIMIT 3;
```

The row comparison `(price, id) < (48.50, 2)` means "price is lower, or the price is equal and id is lower", which matches the sort order when both keys go in the same direction. With an index on `(price, id)`, every page costs the same no matter how deep the user scrolls. The price is that users cannot jump to page 57, which is why feeds and infinite scroll (and most public APIs, as a `cursor` parameter) use keyset pagination, and admin tables with page numbers use `OFFSET`.
