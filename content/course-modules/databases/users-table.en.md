Design the `users` table of a new service. Replace the placeholder `CREATE TABLE` in the editor with a real one:

| Column | Rules |
|---|---|
| `id` | Integer primary key, generated automatically (identity) |
| `email` | Text, required, unique |
| `name` | Text, required |
| `age` | Integer, optional; when given, at least 18 |
| `created_at` | `timestamptz`, required, defaults to the current time |

Below your table, the starter code tries six inserts with the `try_sql` helper and shows the rows that made it in. Do not change that part. Expected output:

```text
   check_name    |       result
-----------------+--------------------
 valid user      | ok
 duplicate email | unique_violation
 no email        | not_null_violation
 no name         | not_null_violation
 too young       | check_violation
 age unknown     | ok
(6 rows)

 id |      email      | name | age  | has_created_at
----+-----------------+------+------+----------------
  1 | ann@example.com | Ann  |   30 | t
  6 | ira@example.com | Ira  | NULL | t
(2 rows)
```

Notice Ira's id: **6**, not 2. Each failed insert still took a number from the identity sequence, and sequences never give numbers back. This is why you must never assume ids are consecutive.
