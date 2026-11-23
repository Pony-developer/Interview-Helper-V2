Time to meet the shop database. Open **Practice database** above the editor and look at the `customers` table.

Write a query that shows the `name` and the `city` of **every** customer, ordered by name (A to Z). Expected output:

```text
       name        | city
-------------------+-------
 Andrii Shevchenko | Odesa
 Iryna Bondar      | Kyiv
 Maksym Kravets    | Lviv
 Olena Koval       | Kyiv
 Sofia Tkachenko   | NULL
 Taras Melnyk      | Lviv
(6 rows)
```

Sofia has no city: the database stores `NULL` there, and the editor prints it as `NULL`.

Hint: `SELECT <columns> FROM <table> ORDER BY <column>;`
