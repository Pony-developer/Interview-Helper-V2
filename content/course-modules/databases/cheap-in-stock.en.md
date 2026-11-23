The shop wants a "budget picks" shelf. Show the products that cost **less than 30** and are **in stock** (stock greater than 0): their `name`, `price` and `stock`, from the most expensive to the cheapest.

Expected output:

```text
      name      | price | stock
----------------+-------+-------
 SQL Basics     | 25.00 |    40
 Wireless Mouse | 19.99 |   150
 Puzzle 1000    | 14.50 |    60
 Seed Kit       |  9.99 |   100
(4 rows)
```

The Garden Hose also costs less than 30, but it is sold out, so it must not appear.
