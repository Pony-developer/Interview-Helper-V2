HR wants the **two highest salary levels in each department**. If two people in a department earn the same, they share the level, and the next salary is the next level (so use `dense_rank`, not `row_number`). Show:

- `department`, `name`, `salary`;
- `salary_rank`, the salary level within the department (1 = highest).

Keep only levels 1 and 2. Sort by department, then by `salary_rank`, then by name.

Expected output:

```text
 department  |   name   | salary | salary_rank
-------------+----------+--------+-------------
 Engineering | Bohdan   |   6000 |           1
 Engineering | Kateryna |   5200 |           2
 Management  | Oksana   |   9000 |           1
 Marketing   | Halyna   |   4700 |           1
 Marketing   | Vasyl    |   3900 |           2
 Sales       | Roman    |   5000 |           1
 Sales       | Petro    |   4100 |           2
(7 rows)
```

Remember that a window function cannot be used in `WHERE` of the same query: compute it in a subquery or a CTE and filter outside.
