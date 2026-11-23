A busy morning in the warehouse. Write four statements in the marked places of the editor:

1. **A new book arrived.** Insert product `11`, `'Redis in Depth'`, category `1`, price `42.00`, stock `5`, and use `RETURNING` to show its `id` and `name`.
2. **Games get 10% more expensive.** Increase the price of every product in category `3` by 10%, rounded to cents (`round(…, 2)`).
3. **Load the supplier's price list** with a single upsert. It contains two rows: product `4` (`'Wireless Mouse'`, category `2`, price `17.99`, stock `0`) and product `12` (`'Pruning Shears'`, category `4`, price `15.00`, stock `30`). A product that already exists only gets the **new price**: its name and stock stay as they are. A new product is inserted as given.
4. **Remove the uncategorized product** (its `category_id` is `NULL`).

The check at the end lists all products. Expected output:

```text
 id |      name
----+----------------
 11 | Redis in Depth
(1 row)

 id |        name         | category_id | price  | stock
----+---------------------+-------------+--------+-------
  1 | SQL Basics          |           1 |  25.00 |    40
  2 | Postgres Internals  |           1 |  48.50 |    12
  3 | Mongo in Action     |           1 |  39.90 |     0
  4 | Wireless Mouse      |           2 |  17.99 |   150
  5 | Mechanical Keyboard |           2 |  89.00 |    35
  6 | 4K Monitor          |           2 | 329.00 |     8
  7 | Chess Set           |           3 |  38.50 |    20
  8 | Puzzle 1000         |           3 |  15.95 |    60
  9 | Garden Hose         |           4 |  22.00 |     0
 11 | Redis in Depth      |           1 |  42.00 |     5
 12 | Pruning Shears      |           4 |  15.00 |    30
(11 rows)
```

The mouse kept its stock of 150 even though the price list said 0: only the price is updated on conflict. Hint: `ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price`.
