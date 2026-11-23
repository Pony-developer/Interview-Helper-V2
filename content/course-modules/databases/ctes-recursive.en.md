## WITH: common table expressions

A **CTE** (common table expression) names a subquery up front, so a complex query reads top to bottom like a series of steps:

```sql
WITH order_totals AS (
    SELECT order_id, sum(quantity * unit_price) AS total
    FROM order_items
    GROUP BY order_id
),
big_orders AS (
    SELECT order_id FROM order_totals WHERE total > 100
)
SELECT o.id, c.name, t.total
FROM big_orders b
JOIN order_totals t ON t.order_id = b.order_id
JOIN orders o       ON o.id = b.order_id
JOIN customers c    ON c.id = o.customer_id
ORDER BY t.total DESC;
```

- Each CTE can use the ones defined before it.
- A CTE can be referenced several times, unlike a derived table, which you would have to repeat.
- It exists only for this statement.

## Are CTEs an optimisation fence?

Before PostgreSQL 12, every CTE was computed separately and stored, which blocked optimisations (an outer `WHERE` could not be pushed into it). Since version 12, a CTE that is referenced once and has no side effects is **inlined** like a subquery. You can force either behaviour with `WITH x AS MATERIALIZED (…)` or `AS NOT MATERIALIZED`. Interviewers sometimes ask about this, because old blog posts still say "CTEs are slow in Postgres".

## Data-modifying CTEs

A CTE can contain `INSERT`, `UPDATE` or `DELETE … RETURNING`, so several changes happen in one statement:

```sql
-- move old cancelled orders to an archive, atomically
WITH moved AS (
    DELETE FROM orders
    WHERE status = 'cancelled' AND ordered_at < '2024-01-01'
    RETURNING *
)
INSERT INTO orders_archive
SELECT * FROM moved;
```

## Recursive CTEs

`WITH RECURSIVE` lets a query refer to its own result, which is how SQL walks trees and graphs of any depth:

```sql
WITH RECURSIVE subordinates AS (
    -- anchor: where to start
    SELECT id, name, manager_id, 1 AS depth
    FROM employees
    WHERE name = 'Bohdan'

    UNION ALL

    -- recursive part: the direct reports of the rows found so far
    SELECT e.id, e.name, e.manager_id, s.depth + 1
    FROM employees e
    JOIN subordinates s ON e.manager_id = s.id
)
SELECT name, depth FROM subordinates;
```

How it runs:

1. Run the **anchor** query; its rows are the first "working set".
2. Run the **recursive** part with the working set in place of `subordinates`; the new rows become the next working set.
3. Repeat until an iteration produces **no rows**.
4. The result is all the rows from all iterations.

Typical uses: org charts, category trees, threaded comments, bill of materials, shortest routes in a small graph, and generating series.

## Ordering a tree

To print a tree in "depth-first" order, collect the path from the root and sort by it:

```sql
WITH RECURSIVE tree AS (
    SELECT id, name, ARRAY[name] AS path FROM employees WHERE manager_id IS NULL
    UNION ALL
    SELECT e.id, e.name, t.path || e.name
    FROM employees e JOIN tree t ON e.manager_id = t.id
)
SELECT array_to_string(path, ' > ') FROM tree ORDER BY path;
```

Arrays compare element by element, so every manager sorts right before their own reports.

## Infinite loops

If the data has a cycle (A manages B, B manages A), the recursion never stops. Defences:

- `UNION` instead of `UNION ALL` discards rows already seen (only if the rows are fully identical, so not with a growing `depth`);
- stop at a depth: `WHERE s.depth < 20`;
- track the path and skip visited ids: `WHERE NOT e.id = ANY(s.visited)`;
- PostgreSQL 14+ has a built-in `CYCLE id SET is_cycle USING path` clause.

The practice editor stops a query after 10 seconds, so a runaway recursion is safe to try.
