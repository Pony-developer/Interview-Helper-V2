This practice uses a different database: a small company with an `employees` table, where `manager_id` points to another employee. Look at it under **Practice database**.

List every employee with the name of their manager, ordered by employee `id`. The columns are `employee` and `manager`. The director, Oksana, has no manager, but she must still be in the list.

Expected output:

```text
 employee | manager
----------+---------
 Oksana   | NULL
 Bohdan   | Oksana
 Dmytro   | Bohdan
 Kateryna | Bohdan
 Yulia    | Bohdan
 Roman    | Oksana
 Natalia  | Roman
 Petro    | Roman
 Halyna   | Oksana
 Vasyl    | Halyna
 Lesia    | Dmytro
(11 rows)
```

Hint: join `employees` to itself with two aliases. Which kind of join keeps Oksana?
