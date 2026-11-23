## HAVING

`WHERE` filters **rows** before grouping. `HAVING` filters **groups** after the aggregates are computed:

```sql
-- categories with at least 3 products under 100
SELECT category_id, count(*) AS products
FROM products
WHERE price < 100          -- rows: only cheap products take part
GROUP BY category_id
HAVING count(*) >= 3       -- groups: keep the big ones
ORDER BY category_id;
```

You cannot use an aggregate in `WHERE` (`WHERE count(*) > 2` is an error), because `WHERE` runs before the groups exist. Conversely, a condition on a plain column belongs in `WHERE`, not `HAVING`: it filters earlier and lets the planner use indexes.

The full logical order is now: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`.

## FILTER: conditional aggregates

Often you need several counts with different conditions in one row. `FILTER` applies a condition to one aggregate only:

```sql
SELECT c.name,
       count(*)                                    AS all_orders,
       count(*) FILTER (WHERE o.status = 'shipped') AS shipped,
       count(*) FILTER (WHERE o.status = 'cancelled') AS cancelled
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;
```

`FILTER` is standard SQL supported by PostgreSQL. In other databases, the same is written with `CASE`: `sum(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END)`. This "pivot" technique turns values of a column into columns of a report.

## Ordered aggregates

`string_agg` and `array_agg` take their own `ORDER BY`:

```sql
SELECT cat.name, string_agg(p.name, ', ' ORDER BY p.price DESC) AS products
FROM categories cat
JOIN products p ON p.category_id = cat.id
GROUP BY cat.name;
```

## Grouping sets, ROLLUP and CUBE

Reports often need subtotals and a grand total. `ROLLUP` adds them in one query:

```sql
SELECT cat.name AS category, o.status, sum(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN orders o     ON o.id = oi.order_id
JOIN products p   ON p.id = oi.product_id
JOIN categories cat ON cat.id = p.category_id
GROUP BY ROLLUP (cat.name, o.status)
ORDER BY cat.name, o.status;
```

`ROLLUP (a, b)` produces groups `(a, b)`, `(a)` and `()`: per category and status, per category, and the grand total. The rolled-up columns show `NULL` in subtotal rows; `GROUPING(o.status)` returns 1 in those rows, so you can label them `'all'`. `CUBE (a, b)` adds every combination, including `(b)` alone, and `GROUPING SETS ((a), (b))` lists the groupings explicitly.

## Common patterns

```sql
-- duplicates: emails used by more than one customer
SELECT lower(email), count(*) FROM customers
WHERE email IS NOT NULL
GROUP BY lower(email)
HAVING count(*) > 1;

-- share of each status, in percent
SELECT status, round(100.0 * count(*) / sum(count(*)) OVER (), 1) AS pct
FROM orders
GROUP BY status;
```

The second query mixes an aggregate with a **window** function: `sum(count(*)) OVER ()` is the total over all groups. Window functions get their own module.
