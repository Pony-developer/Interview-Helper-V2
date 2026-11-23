`GROUP BY` collapses each group into one row. A **window function** computes over a group of related rows too, but **keeps every row**. It answers questions like "each employee with their department's average salary" or "the rank of each product within its category", which are awkward or impossible with plain aggregates.

## OVER

A window function is followed by `OVER (…)`, which describes the window:

```sql
SELECT name,
       department,
       salary,
       avg(salary) OVER (PARTITION BY department) AS dept_avg,
       salary - avg(salary) OVER (PARTITION BY department) AS diff,
       sum(salary) OVER () AS payroll
FROM employees;
```

- `OVER ()` with nothing inside: the window is the whole result.
- `PARTITION BY department`: the window is the rows with the same department, like a group that does not collapse.
- Any aggregate (`sum`, `avg`, `count`, `min`, `max`…) can be used as a window function.

## Ranking functions

Ranking needs an order inside the partition:

```sql
SELECT department, name, salary,
       row_number() OVER w AS row_number,
       rank()       OVER w AS rank,
       dense_rank() OVER w AS dense_rank
FROM employees
WINDOW w AS (PARTITION BY department ORDER BY salary DESC);
```

`WINDOW w AS (…)` names a window definition so several functions can share it.

For the Engineering salaries 6000, 5200, 4500, 4500, 3600:

| salary | `row_number()` | `rank()` | `dense_rank()` |
|---|---|---|---|
| 6000 | 1 | 1 | 1 |
| 5200 | 2 | 2 | 2 |
| 4500 | 3 | 3 | 3 |
| 4500 | 4 | 3 | 3 |
| 3600 | 5 | **5** | **4** |

- `row_number()` numbers the rows 1, 2, 3… and breaks ties arbitrarily (add a tiebreaker column to `ORDER BY` to make it stable).
- `rank()` gives ties the same rank and leaves a gap after them, like sports results.
- `dense_rank()` gives ties the same rank without gaps.

Other useful ones: `ntile(4)` splits rows into 4 roughly equal buckets (quartiles), `percent_rank()` and `cume_dist()` give relative positions.

## Top N per group

The most famous window-function interview task: "the two highest-paid employees in each department". Window functions are evaluated **after** `WHERE`, so you cannot filter on them directly. Wrap the query:

```sql
SELECT department, name, salary
FROM (
    SELECT department, name, salary,
           row_number() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
    FROM employees
) AS ranked
WHERE rn <= 2;
```

Choose the function by what "top 2" should mean when salaries tie: `row_number` gives exactly two rows, `rank`/`dense_rank` include everyone who ties.

Deduplication uses the same trick: keep `rn = 1` per key to keep one row per duplicate group, or delete the rows with `rn > 1`.

## Where window functions run

The logical order with windows is: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → **window functions** → `SELECT` list → `DISTINCT` → `ORDER BY` → `LIMIT`. So:

- window functions see the rows **after** grouping, which allows `rank() OVER (ORDER BY sum(amount) DESC)` in a grouped query;
- they can appear in `SELECT` and `ORDER BY`, but not in `WHERE`, `GROUP BY` or `HAVING`.
