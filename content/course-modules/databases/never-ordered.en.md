Marketing wants to reach people and products that never made it into an order. Write two queries:

1. The `name` of every customer who has **no orders at all**, ordered by name.
2. The `name` of every product that **does not appear in any order item**, ordered by name.

Expected output:

```text
      name
-----------------
 Maksym Kravets
 Sofia Tkachenko
(2 rows)

   name
----------
 Seed Kit
(1 row)
```

Use the anti-join from the lecture (`LEFT JOIN … WHERE … IS NULL`) or `NOT EXISTS`. Both are fine; try both and compare.
