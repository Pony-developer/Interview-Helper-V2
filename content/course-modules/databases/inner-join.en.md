Normalised data is spread over tables: an order keeps only `customer_id`, an order item only `product_id`. A **join** combines rows from several tables into one result.

## INNER JOIN

```sql
SELECT o.id, o.status, c.name
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id;
```

`JOIN` is short for `INNER JOIN`. Conceptually, the database pairs every order with every customer and keeps the pairs for which the `ON` condition is true. (It does not really build all pairs: the planner picks an efficient algorithm, covered later.)

```text
orders                     customers                  result
 id | customer_id           id | name                  id | name
----+-------------         ----+--------------        ----+--------------
  1 |           1    ──►     1 | Olena Koval            1 | Olena Koval
  3 |           2    ──►     2 | Taras Melnyk           3 | Taras Melnyk
  6 |           4    ──►     4 | Andrii Shevchenko      6 | Andrii Shevchenko
                             5 | Sofia Tkachenko        (no order: not in the result)
```

An inner join keeps **only matching rows**: Sofia has no orders, so she disappears, and an order pointing to a missing customer would disappear too.

## Aliases

`AS o` and `AS c` are table aliases (the `AS` is optional). Use them in every multi-table query and prefix every column with its alias: `o.id` vs `c.id` must be unambiguous, and the reader should not have to guess which table `status` comes from.

## Joining many tables

Joins chain. To list what each order contains:

```sql
SELECT o.id   AS order_id,
       c.name AS customer,
       p.name AS product,
       oi.quantity,
       oi.quantity * oi.unit_price AS line_total
FROM orders AS o
JOIN customers   AS c  ON c.id = o.customer_id
JOIN order_items AS oi ON oi.order_id = o.id
JOIN products    AS p  ON p.id = oi.product_id
ORDER BY o.id, p.name;
```

The written order of inner joins does not matter for the result; the planner reorders them for speed.

## Joins multiply rows

The result has one row per **matching pair**. An order with 2 items appears twice once you join `order_items`. That is correct, but it is the source of a common bug:

```sql
-- WRONG: the total of order 1 is counted once per item
SELECT sum(o.total) FROM orders o JOIN order_items oi ON oi.order_id = o.id;
```

Joining two independent "many" sides (orders **and** addresses of a customer) multiplies them: 3 orders × 2 addresses = 6 rows. Aggregate each side separately, or use `EXISTS` when you only need to know whether a match exists.

## ON vs WHERE

For inner joins, a condition can go into `ON` or `WHERE` with the same result:

```sql
SELECT o.id, c.name
FROM orders o
JOIN customers c ON c.id = o.customer_id AND c.city = 'Kyiv';
-- same as … ON c.id = o.customer_id WHERE c.city = 'Kyiv'
```

By convention, `ON` holds how tables relate and `WHERE` holds the filter. The difference becomes real for outer joins, which is the next lecture.

## Old-style joins

You may meet the pre-1992 syntax:

```sql
SELECT o.id, c.name FROM orders o, customers c WHERE c.id = o.customer_id;
```

It is an inner join written as a cross join plus a filter. It works, but forgetting the condition silently produces every combination, so prefer explicit `JOIN … ON`.
