Find the loyal customers: those with **at least 2 orders that were not cancelled**. For each, show:

- `name`;
- `orders`, the number of their non-cancelled orders;
- `spent`, the total of `quantity * unit_price` over those orders;
- `shipped`, how many of those orders are `shipped`.

Sort by `spent`, highest first.

Expected output:

```text
     name     | orders | spent  | shipped
--------------+--------+--------+---------
 Olena Koval  |      3 | 508.97 |       2
 Taras Melnyk |      2 | 157.90 |       1
(2 rows)
```

Two traps are waiting:

- After joining `order_items`, every row is an **item**, so `count(*)` counts items. Count orders with `count(DISTINCT o.id)`.
- Iryna has two orders, but one is cancelled, so she has only one that counts.

Use `HAVING` for the "at least 2" condition and `FILTER` for the `shipped` column.
