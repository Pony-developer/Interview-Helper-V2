Aggregate functions turn many rows into one value: how many, how much in total, on average, the smallest, the largest.

## Aggregates over the whole table

```sql
SELECT count(*)            AS products,
       count(category_id)  AS categorized,
       sum(stock)          AS units,
       avg(price)          AS avg_price,
       min(price)          AS cheapest,
       max(price)          AS most_expensive
FROM products;
```

| Function | Returns |
|---|---|
| `count(*)` | Number of rows |
| `count(expr)` | Number of rows where `expr` is not `NULL` |
| `count(DISTINCT expr)` | Number of different non-`NULL` values |
| `sum`, `avg` | Total and mean of non-`NULL` values |
| `min`, `max` | Smallest and largest (work on text and dates too) |
| `string_agg(expr, ', ' ORDER BY …)` | Values glued into one string |
| `array_agg(expr ORDER BY …)` | Values collected into an array |
| `bool_and`, `bool_or` | Whether all / any values are true |

Two rules about `NULL` that interviews love:

- Aggregates other than `count(*)` **skip** `NULL`s: `avg` of 10, 20 and `NULL` is 15, not 10.
- Over zero rows, `count` returns 0 but `sum`, `avg`, `min` and `max` return `NULL`. Write `coalesce(sum(x), 0)` when you need a number.

`avg` of integers returns `numeric` with many digits; round it for display: `round(avg(price), 2)`.

## GROUP BY

`GROUP BY` splits the rows into groups with equal values of the grouping columns and computes the aggregates per group:

```sql
SELECT category_id, count(*) AS products, round(avg(price), 2) AS avg_price
FROM products
GROUP BY category_id
ORDER BY category_id;
```

```text
 category_id | products | avg_price
-------------+----------+-----------
           1 |        3 |     37.80
           2 |        3 |    146.00
           3 |        2 |     24.75
           4 |        1 |     22.00
        NULL |        1 |      9.99
```

All rows with `NULL` in the grouping column form **one** group.

## The single-value rule

After grouping, each output row represents a whole group, so every column in `SELECT` must have **one value per group**: it must be in `GROUP BY` or inside an aggregate.

```sql
-- ERROR: column "products.name" must appear in the GROUP BY clause
-- or be used in an aggregate function
SELECT category_id, name, count(*) FROM products GROUP BY category_id;
```

Which `name` should a group of three books show? The database refuses to guess. (MySQL used to pick an arbitrary one; PostgreSQL never does.) One exception: if you group by a table's primary key, you may select any other column of that table, because it is determined by the key:

```sql
SELECT c.id, c.name, c.city, count(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id;          -- c.name and c.city are allowed
```

## Grouping by expressions

```sql
-- orders per month
SELECT date_trunc('month', ordered_at)::date AS month, count(*) AS orders
FROM orders
GROUP BY month          -- PostgreSQL accepts an output alias here
ORDER BY month;
```

## Aggregating joined data

Combining joins and aggregates is the bread and butter of reporting:

```sql
SELECT c.name, sum(oi.quantity * oi.unit_price) AS spent
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.id, c.name
ORDER BY spent DESC;
```

Watch the grain: after joining `order_items`, each row is one **item**, not one order, so `count(*)` counts items. Count orders with `count(DISTINCT o.id)`.
