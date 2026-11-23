`SELECT` reads data. Its simplest form names the columns and the table:

```sql
SELECT name, price
FROM products;
```

`SELECT *` returns every column. It is handy in a console, but avoid it in application code: the result changes when someone adds a column, and you transfer data you do not need.

## Expressions and aliases

A column in `SELECT` can be any expression. `AS` gives the result column a name:

```sql
SELECT name,
       price,
       price * 0.8          AS sale_price,
       upper(name)          AS shouting,
       name || ' (' || stock || ' left)' AS label
FROM products;
```

- Arithmetic: `+ - * / %`. Careful: dividing two integers is integer division in PostgreSQL, so `7 / 2` is `3`. Write `7 / 2.0` or `7::numeric / 2` for `3.5`.
- `||` concatenates strings. `concat(a, b)` does the same but treats `NULL` as an empty string.
- Functions: `upper`, `lower`, `length`, `round(x, 2)`, `abs`, `now()`, `current_date`, `extract(year FROM created_at)`, and hundreds more.
- `::type` casts a value: `'42'::integer`, `price::text`, `created_at::date`.

An alias with spaces or capitals needs double quotes: `AS "Sale price"`. Without quotes, the name is folded to lower case.

## SELECT without FROM

PostgreSQL can evaluate expressions without a table, which is useful for quick checks:

```sql
SELECT 2 + 2 AS four, now()::date AS today, 7 / 2 AS int_div, 7 / 2.0 AS real_div;
```

## DISTINCT

`DISTINCT` removes duplicate rows from the result:

```sql
SELECT DISTINCT city FROM customers;           -- each city once (NULL counts as one value here)
SELECT DISTINCT city, created_at FROM customers; -- unique pairs
```

PostgreSQL also has `DISTINCT ON (expr)`, which keeps the first row for each value of `expr` according to `ORDER BY`. It is a PostgreSQL extension:

```sql
-- the cheapest product per category
SELECT DISTINCT ON (category_id) category_id, name, price
FROM products
ORDER BY category_id, price;
```

## CASE

`CASE` is SQL's `if`/`else` inside an expression:

```sql
SELECT name,
       CASE
           WHEN stock = 0   THEN 'sold out'
           WHEN stock < 20  THEN 'few left'
           ELSE 'in stock'
       END AS availability
FROM products;
```

Branches are checked top to bottom; the first true one wins. Without `ELSE`, the result is `NULL`.

## The logical order of a query

You write `SELECT … FROM … WHERE … ORDER BY`, but the database evaluates the clauses in a different, logical order:

1. `FROM` and `JOIN`: which rows exist;
2. `WHERE`: which rows are kept;
3. `GROUP BY`, then `HAVING`;
4. `SELECT`: which columns and expressions are computed (aliases are born here);
5. `DISTINCT`;
6. `ORDER BY`;
7. `LIMIT` / `OFFSET`.

This explains a classic error: an alias from `SELECT` cannot be used in `WHERE`, because `WHERE` runs first. It **can** be used in `ORDER BY`, which runs after `SELECT`.
