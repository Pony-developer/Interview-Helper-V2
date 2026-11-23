## Self join

A table can be joined to itself. The classic case is a hierarchy stored in one table, where `manager_id` points to another row of `employees`:

```sql
SELECT e.name AS employee, m.name AS manager
FROM employees AS e
JOIN employees AS m ON m.id = e.manager_id;
```

The two aliases are two "copies" of the same table: `e` plays the employee, `m` plays the manager. Without aliases the query would be ambiguous. An inner self join drops the CEO, who has no manager; a `LEFT JOIN` keeps them with `NULL`.

Self joins also compare rows of the same table with each other:

```sql
-- pairs of employees in the same department (each pair once)
SELECT a.name, b.name, a.department
FROM employees a
JOIN employees b ON b.department = a.department AND b.id > a.id;
```

`b.id > a.id` avoids pairing an employee with themselves and listing both (Ann, Bob) and (Bob, Ann).

A self join walks **one** level of a hierarchy. For any depth ("everyone under Bohdan"), you need a recursive CTE, covered in the subqueries module.

## CROSS JOIN

`CROSS JOIN` returns every combination of rows, the Cartesian product: 3 sizes × 4 colors = 12 rows.

```sql
SELECT s.size, c.color
FROM sizes AS s
CROSS JOIN colors AS c;
```

It is useful for generating combinations, such as every day × every store for a report, so that days without sales still appear:

```sql
SELECT d.day::date, s.store
FROM generate_series('2024-09-01'::date, '2024-09-07', interval '1 day') AS d(day)
CROSS JOIN (VALUES ('Kyiv'), ('Lviv')) AS s(store);
```

Then `LEFT JOIN` the real sales onto that grid. By accident, a cross join is a disaster: two tables of 100,000 rows produce 10 billion.

## USING and NATURAL

When the join columns have the same name in both tables, `USING` shortens the condition and outputs the column once:

```sql
SELECT order_id, product_id, quantity, shipped_at
FROM order_items
JOIN shipments USING (order_id);   -- both tables have order_id
```

`NATURAL JOIN` joins on **all** columns with equal names automatically. Avoid it: adding a column such as `created_at` to both tables silently changes the join condition.

## Join algorithms

You do not choose them, but you will see them in `EXPLAIN` (the indexes module covers reading plans):

| Algorithm | How it works | Good when |
|---|---|---|
| Nested loop | For each row of the outer side, look up matches in the inner side (ideally through an index) | The outer side is small |
| Hash join | Build a hash table from the smaller side, probe it with the other | Big unsorted inputs, equality conditions |
| Merge join | Walk two inputs sorted by the join key side by side | Both inputs are already sorted (e.g. by an index) |

## LATERAL

A `LATERAL` subquery in `FROM` can refer to columns of the tables before it, like a `for each` loop:

```sql
-- the two most recent orders of every customer
SELECT c.name, o.id, o.ordered_at
FROM customers c
CROSS JOIN LATERAL (
    SELECT id, ordered_at FROM orders
    WHERE customer_id = c.id
    ORDER BY ordered_at DESC
    LIMIT 2
) AS o;
```

Use `LEFT JOIN LATERAL (…) ON true` to keep customers with no orders. "Top N per group" is a very common interview task; window functions offer another solution later in the course.
