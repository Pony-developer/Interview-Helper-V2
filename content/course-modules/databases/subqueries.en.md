A **subquery** is a `SELECT` inside another statement. Where it appears decides what it must return.

## Scalar subqueries: one value

A subquery in parentheses that returns one row with one column can be used anywhere a value can:

```sql
-- products more expensive than the average product
SELECT name, price
FROM products
WHERE price > (SELECT avg(price) FROM products);

-- the average as a column, for comparison
SELECT name, price, (SELECT round(avg(price), 2) FROM products) AS avg_price
FROM products;
```

If it returns no rows, the value is `NULL`; if it returns more than one row, the query fails with "more than one row returned by a subquery used as an expression".

## IN and EXISTS: membership

```sql
-- customers who have at least one shipped order
SELECT name FROM customers
WHERE id IN (SELECT customer_id FROM orders WHERE status = 'shipped');

-- the same with EXISTS
SELECT c.name FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id AND o.status = 'shipped'
);
```

Both are **semi-joins**: unlike a `JOIN`, they never duplicate a customer who has three shipped orders. `EXISTS` only cares whether a row exists, so `SELECT 1` is the convention. Modern PostgreSQL plans `IN` and `EXISTS` equally well; the old advice "EXISTS is always faster" is outdated.

The negative forms are **not** equivalent: `NOT IN` returns nothing as soon as the subquery yields a `NULL`, while `NOT EXISTS` behaves as expected. Prefer `NOT EXISTS`.

`ANY` and `ALL` compare with every value of a subquery: `price > ALL (SELECT price FROM products WHERE category_id = 3)` means "more expensive than every game".

## Correlated subqueries

A subquery that refers to the outer query is **correlated**. Conceptually it runs once per outer row:

```sql
-- products more expensive than the average of THEIR OWN category
SELECT p.name, p.price
FROM products p
WHERE p.price > (
    SELECT avg(p2.price)
    FROM products p2
    WHERE p2.category_id = p.category_id    -- refers to the outer p
);
```

The inner query needs its own alias (`p2`) so that `p.category_id` clearly means the outer row. Correlated subqueries are easy to read; on big tables, check the plan, because "once per row" can be slow if the planner cannot turn it into a join. The same result with a join to a pre-aggregated table:

```sql
SELECT p.name, p.price
FROM products p
JOIN (SELECT category_id, avg(price) AS avg_price
      FROM products GROUP BY category_id) AS a
  ON a.category_id = p.category_id
WHERE p.price > a.avg_price;
```

## Subqueries in FROM

A subquery in `FROM` (a **derived table**) is a temporary result you can join and filter. It must have an alias, as in the query above. Use it to aggregate first and join later, which avoids the row multiplication you saw with joins:

```sql
SELECT c.name, t.orders, t.spent
FROM customers c
JOIN (
    SELECT o.customer_id, count(DISTINCT o.id) AS orders, sum(oi.quantity * oi.unit_price) AS spent
    FROM orders o JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.customer_id
) AS t ON t.customer_id = c.id;
```

## Subqueries in data changes

```sql
DELETE FROM products
WHERE id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL)
  AND stock = 0;

UPDATE products SET price = price * 0.9
WHERE category_id = (SELECT id FROM categories WHERE name = 'Books');
```

(The `IS NOT NULL` makes `NOT IN` safe; `NOT EXISTS` would be cleaner still.)
