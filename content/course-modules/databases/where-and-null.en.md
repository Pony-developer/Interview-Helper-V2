`WHERE` keeps only the rows for which the condition is **true**:

```sql
SELECT name, price FROM products WHERE price < 30;
```

## Comparison operators

| Operator | Meaning | Example |
|---|---|---|
| `=`, `<>` (or `!=`) | equal, not equal | `status = 'paid'` |
| `<`, `<=`, `>`, `>=` | ordering | `price >= 100` |
| `BETWEEN a AND b` | `>= a AND <= b`, both ends included | `price BETWEEN 10 AND 20` |
| `IN (…)` | equal to one of the values | `city IN ('Kyiv', 'Lviv')` |
| `LIKE` | pattern: `%` any text, `_` one character | `name LIKE 'Post%'` |
| `ILIKE` | `LIKE` ignoring case (PostgreSQL) | `name ILIKE '%mouse%'` |
| `~`, `~*` | regular expression (case-sensitive / not) | `email ~ '@example\.com$'` |
| `IS NULL`, `IS NOT NULL` | missing / present value | `email IS NULL` |

Combine conditions with `AND`, `OR` and `NOT`. `AND` binds tighter than `OR`, so add parentheses when you mix them:

```sql
-- products from Books or Games that cost under 40
SELECT name FROM products
WHERE (category_id = 1 OR category_id = 3) AND price < 40;
```

Without the parentheses, the query would mean "all Books, plus Games under 40".

`BETWEEN` with timestamps is a trap: `created_at BETWEEN '2024-01-01' AND '2024-01-31'` misses everything after midnight of the 31st. Prefer a half-open range: `created_at >= '2024-01-01' AND created_at < '2024-02-01'`.

## NULL and three-valued logic

SQL logic has three values: **true**, **false** and **unknown** (`NULL`). Any comparison with `NULL` gives `NULL`:

```sql
SELECT NULL = NULL,   -- NULL, not true!
       NULL <> 1,     -- NULL
       NULL + 1,      -- NULL
       'a' || NULL;   -- NULL
```

`WHERE` keeps a row only when the condition is **true**, so both `city = NULL` and `city <> NULL` find nothing. Use `IS NULL` / `IS NOT NULL`, or `IS DISTINCT FROM`, which treats `NULL` as an ordinary value:

```sql
SELECT name FROM customers WHERE city IS NULL;
SELECT name FROM customers WHERE city IS DISTINCT FROM 'Kyiv';  -- includes the NULL city
```

How `AND`, `OR` and `NOT` treat unknown:

| a | b | a AND b | a OR b |
|---|---|---|---|
| true | NULL | NULL | true |
| false | NULL | false | NULL |
| NULL | NULL | NULL | NULL |

and `NOT NULL` is `NULL`. A consequence that often comes up in interviews:

```sql
SELECT name FROM customers WHERE city <> 'Kyiv';
```

does **not** return Sofia, whose city is `NULL`: `NULL <> 'Kyiv'` is unknown, not true.

## The NOT IN trap

`x NOT IN (1, 2, NULL)` means `x <> 1 AND x <> 2 AND x <> NULL`. The last part is always unknown, so the whole condition is never true and the query returns nothing. This bites when the list comes from a subquery that contains a `NULL`. Use `NOT EXISTS` instead (covered in the subqueries module).

## COALESCE and NULLIF

- `COALESCE(a, b, c)` returns the first argument that is not `NULL`: `COALESCE(city, 'unknown')`.
- `NULLIF(a, b)` returns `NULL` when `a = b`, otherwise `a`. A common use is avoiding division by zero: `total / NULLIF(count, 0)`.

## Filtering with functions

```sql
SELECT name FROM customers WHERE extract(month FROM created_at) = 3;
SELECT name FROM customers WHERE lower(email) = 'olena@example.com';
```

These work, but a function around a column usually prevents an ordinary index on that column from being used. The indexes module shows how to fix that with an expression index.
