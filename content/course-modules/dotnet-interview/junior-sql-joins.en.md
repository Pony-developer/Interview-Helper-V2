## The example tables

```text
employees                     assignments                projects
id | name     | department    employee_id | project_id  id | title
---+----------+-----------    ------------+-----------  ---+-----------
 1 | Anna     | Development             1 | 1            1 | Portal
 2 | Bohdan   | Development             1 | 2            2 | Mobile app
 3 | Daria    | QA                      2 | 1            3 | CRM
 4 | Ivan     | Operations              3 | 1            4 | Archive
```

## The JOIN types (Q50)

```sql
-- INNER JOIN: only employees that have assignments (Anna ×2, Bohdan, Daria)
SELECT e.name, p.title
FROM employees e
JOIN assignments a ON a.employee_id = e.id
JOIN projects p    ON p.id = a.project_id;

-- LEFT JOIN: every employee; NULLs where there is no match (Ivan → NULL)
SELECT e.name, a.project_id
FROM employees e
LEFT JOIN assignments a ON a.employee_id = e.id;

-- "Anti-join": employees without any project
SELECT e.name
FROM employees e
LEFT JOIN assignments a ON a.employee_id = e.id
WHERE a.employee_id IS NULL;          -- or: WHERE NOT EXISTS (...)

-- RIGHT JOIN: every project, even with nobody assigned (Archive)
SELECT p.title, a.employee_id
FROM assignments a
RIGHT JOIN projects p ON p.id = a.project_id;

-- FULL OUTER JOIN: unmatched rows from both sides
-- CROSS JOIN: every combination (4 employees × 4 projects = 16 rows)
-- SELF JOIN: employees e JOIN employees m ON m.id = e.manager_id
```

Common pitfalls:
- Putting a condition on the right table into `WHERE` turns a `LEFT JOIN` back into an inner join (`WHERE a.role = 'lead'` removes the NULL rows). Put it into `ON` instead.
- Counting after a `LEFT JOIN`: `count(*)` counts the NULL row as 1; `count(a.project_id)` gives 0.
- Joining two one-to-many tables at once multiplies rows (each order line × each payment): aggregate in subqueries first.

## Indexes by example (Q49)

```sql
-- searching by email scans the whole table without an index
CREATE UNIQUE INDEX ix_users_email ON users (email);

-- orders of one customer, newest first: one index serves the filter AND the sort
CREATE INDEX ix_orders_customer_date ON orders (customer_id, created_at DESC);

-- foreign keys are not indexed automatically in SQL Server or PostgreSQL:
CREATE INDEX ix_assignments_project ON assignments (project_id);
```

An index helps when the query filters, joins or sorts on its **leading** columns and returns a small share of the rows. It does not help (or is ignored) for `WHERE lower(email) = ...` (a function on the column — create an expression index instead), `LIKE '%text'` (leading wildcard), or columns with only a few distinct values. Each index slows every `INSERT/UPDATE/DELETE` a little and takes disk space, so index for the queries you actually run — `EXPLAIN` (PostgreSQL) or the execution plan (SQL Server) shows whether it's used.
