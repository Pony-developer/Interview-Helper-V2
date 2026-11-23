Support wants to complete the customer records. Find the customers who have **no email or no city**, ordered by name. Show three columns:

- `name`;
- `email`, with `no email` instead of a missing email;
- `city`, with `unknown` instead of a missing city.

Expected output:

```text
       name        |       email       |  city
-------------------+-------------------+---------
 Andrii Shevchenko | no email          | Odesa
 Sofia Tkachenko   | sofia@example.com | unknown
(2 rows)
```

Hint: a missing value is `NULL`, and `email = NULL` never matches. Use `IS NULL` to filter and `COALESCE` to replace. Keep the column names `email` and `city` with `AS`.
