The catalog shows products from the most expensive to the cheapest, **3 per page**. Write the query for **page 2**: the `id`, `name` and `price` of the 4th, 5th and 6th most expensive products.

Expected output:

```text
 id |      name       | price
----+-----------------+-------
  3 | Mongo in Action | 39.90
  7 | Chess Set       | 35.00
  1 | SQL Basics      | 25.00
(3 rows)
```

Make the order unique by adding `id` as a tiebreaker after the price, as the lecture recommends for pagination. Bonus question to think about: how would you fetch page 3 with keyset pagination instead of `OFFSET`?
