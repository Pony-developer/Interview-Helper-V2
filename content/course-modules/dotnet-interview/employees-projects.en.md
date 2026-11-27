## Task

Question 50 asks which JOIN types exist. The follow-up is usually a query where the choice of JOIN changes the answer.

The setup script creates `employees`, `projects` and the link table `assignments` (many-to-many). Write a query that returns **every** employee with the number of projects they are assigned to:

- columns `name`, `department`, `projects`;
- employees without any project must appear with `0` (Ivan has none) — so an `INNER JOIN` is not enough;
- sorted by `projects` from most to fewest, then by `name`.

Hint: `LEFT JOIN` + `GROUP BY` + `count(a.project_id)`. Remember that `count(*)` would count the NULL row of an employee without projects as 1.

Expected result:

```
   name   | department  | projects
----------+-------------+----------
 Anna     | Development |        3
 Daria    | QA          |        2
 Bohdan   | Development |        1
 Kateryna | Management  |        1
 Ivan     | Operations  |        0
(5 rows)
```
