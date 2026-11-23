An inner join drops rows without a match. An **outer join** keeps them and fills the missing side with `NULL`.

## LEFT JOIN

```sql
SELECT c.name, o.id AS order_id, o.status
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
ORDER BY c.name, o.id;
```

```text
       name        | order_id |  status
-------------------+----------+-----------
 Andrii Shevchenko |        6 | new
 Iryna Bondar      |        4 | cancelled
 …
 Maksym Kravets    |     NULL | NULL        ← no orders, but still listed
 Sofia Tkachenko   |     NULL | NULL
```

`LEFT JOIN` (or `LEFT OUTER JOIN`) keeps **every row of the left table**. `RIGHT JOIN` keeps every row of the right one; it is rarely used, because you can swap the tables and write a `LEFT JOIN`, which reads more naturally.

## FULL JOIN

`FULL JOIN` keeps unmatched rows from **both** sides. It is useful for comparing two data sets:

```sql
-- products in the catalog vs products in the warehouse feed
SELECT coalesce(c.sku, w.sku) AS sku, c.price, w.quantity
FROM catalog AS c
FULL JOIN warehouse AS w ON w.sku = c.sku
WHERE c.sku IS NULL OR w.sku IS NULL;   -- present on only one side
```

## The anti-join: rows without a match

"Customers who never ordered" is a `LEFT JOIN` plus a check that the right side is missing:

```sql
SELECT c.name
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

Test a column that can never be `NULL` in a real match, such as the primary key or the join column. The same query with `NOT EXISTS` is often clearer, and the planner executes both the same way (an "anti join"):

```sql
SELECT c.name
FROM customers AS c
WHERE NOT EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id);
```

Avoid `NOT IN (SELECT customer_id FROM orders)`: if the subquery returns even one `NULL`, the result is empty (see the lecture on `NULL`).

## Where to put the condition

With outer joins, `ON` and `WHERE` mean different things:

```sql
-- every customer, with their PAID orders if any
SELECT c.name, o.id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid';

-- only customers who HAVE paid orders: WHERE removes the NULL rows,
-- so this is silently an inner join
SELECT c.name, o.id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid';
```

The rule: a condition on the **optional** (right) table belongs in `ON` if you want to keep the unmatched rows. A condition in `WHERE` on that table, other than `IS NULL`, turns the left join into an inner one. This is one of the most common SQL bugs, and a favourite interview question.

## Counting with outer joins

```sql
SELECT c.name, count(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;
```

`count(o.id)` counts non-`NULL` values, so customers without orders get `0`. `count(*)` would count the row itself and give them `1`.
