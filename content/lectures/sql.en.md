---
skill: sql
title: "SQL essentials for application developers"
summary: "SELECT and the logical order of a query, joins (and the LEFT JOIN + WHERE trap), NULL and three-valued logic, aggregates with GROUP BY and HAVING, indexes, transactions, and parameterised queries against SQL injection."
readingMinutes: 9
---

SQL describes **what** data you want, and the database decides **how** to get it. Even frontend-leaning developers meet it in full-stack work, in Supabase or Prisma, and in interviews. This lecture uses PostgreSQL syntax; the ideas apply to every relational database.

## The logical order of a query

A query is written in one order and evaluated in another:

```sql
SELECT   c.name, count(*) AS orders   -- 5. pick and compute columns
FROM     customers c                  -- 1. take the rows
JOIN     orders o ON o.customer_id = c.id
WHERE    o.status = 'paid'            -- 2. filter rows
GROUP BY c.name                       -- 3. group them
HAVING   count(*) >= 3                -- 4. filter groups
ORDER BY orders DESC                  -- 6. sort
LIMIT    10;                          -- 7. cut
```

That order explains common errors: `WHERE` can't use a `SELECT` alias or an aggregate (it runs before both), so filters on aggregates go in `HAVING`. `ORDER BY` runs last, so it may use aliases.

## Joins

- `INNER JOIN` keeps only rows with a match on both sides.
- `LEFT JOIN` keeps every row from the left table, with `NULL`s where nothing matched. A customer with three orders appears three times; one with none appears once.
- A condition on the right table in `WHERE` (`WHERE o.status = 'paid'`) throws away those `NULL` rows and silently turns a left join into an inner join. Put it in the `ON` clause instead.
- Joining one-to-many relations multiplies rows, so aggregate carefully (`count(DISTINCT …)`) or aggregate in a subquery first.

## NULL means "unknown"

Comparisons with `NULL` return `NULL` ("unknown"), not true or false, and `WHERE` keeps only rows where the condition is true. So `WHERE deleted_at = NULL` matches nothing; use `IS NULL` / `IS NOT NULL`. `count(*)` counts rows, `count(column)` counts non-null values, and other aggregates skip `NULL`s. The classic trap: `WHERE id NOT IN (SELECT manager_id …)` returns **no rows** if the subquery contains a `NULL`; use `NOT EXISTS`.

## Indexes

An index (usually a B-tree) lets the database find rows without scanning the whole table, at the cost of slower writes and extra storage.

- Index columns used in `WHERE`, `JOIN` and `ORDER BY`, and every foreign key.
- A composite index `(org_id, created_at)` serves filters on `org_id` alone or both, but not `created_at` alone.
- Wrapping a column in a function (`WHERE lower(email) = …`) can't use a plain index on `email`; create an expression index on `lower(email)`.
- Use `EXPLAIN ANALYZE` to see whether a query does an index scan or a sequential scan.

## Transactions

A transaction groups statements so they all succeed or all fail (**ACID**: atomic, consistent, isolated, durable). Read-modify-write code in the application can still lose updates when two requests interleave. Prefer an atomic statement (`UPDATE accounts SET balance = balance - 10 WHERE id = $1 AND balance >= 10`), or lock the row with `SELECT … FOR UPDATE` inside the transaction.

## SQL injection

Never build SQL by concatenating user input:

```ts
db.query(`SELECT * FROM users WHERE email = '${email}'`); // ✗ injectable
db.query("SELECT * FROM users WHERE email = $1", [email]); // ✓ parameterised
```

With parameters, the database receives the query text and the values separately, so a value can never change the query's structure. Identifiers such as column names for sorting can't be parameters: map them through an allow-list. ORMs and query builders parameterise for you, but raw-SQL escape hatches don't.

## Interview checklist

- Explain the logical query order and `WHERE` vs `HAVING`.
- Predict row counts for inner and left joins, and spot the `LEFT JOIN … WHERE` trap.
- Explain `NULL` comparisons, `count(*)` vs `count(col)`, and the `NOT IN` + `NULL` trap.
- Say when an index helps, when it can't be used, and how to check.
- Show a parameterised query and explain why it prevents injection.
