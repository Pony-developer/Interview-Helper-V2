Print the company's org chart as a tree, using the `employees` table. Every employee appears right under their manager, indented by **4 spaces per level**, and colleagues with the same manager are sorted by name. Show two columns:

- `org_chart`, the name with the indentation;
- `level`, where the director is level 1.

Expected output:

```text
     org_chart     | level
-------------------+-------
 Oksana            |     1
     Bohdan        |     2
         Dmytro    |     3
             Lesia |     4
         Kateryna  |     3
         Yulia     |     3
     Halyna        |     2
         Vasyl     |     3
     Roman         |     2
         Natalia   |     3
         Petro     |     3
(11 rows)
```

Hints:

- Start a `WITH RECURSIVE` query at the employee whose `manager_id IS NULL`.
- Carry the path of names from the root as an array (`ARRAY[name]`, then `path || e.name`) and `ORDER BY path` at the end.
- `repeat('    ', level - 1) || name` builds the indented label.
