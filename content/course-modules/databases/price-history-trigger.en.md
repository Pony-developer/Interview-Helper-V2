The shop must keep a history of price changes for accounting. The setup has added an empty table:

```sql
CREATE TABLE price_history (
    id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id integer NOT NULL REFERENCES products (id),
    old_price  numeric(10, 2) NOT NULL,
    new_price  numeric(10, 2) NOT NULL
);
```

Write a trigger so that **every update that changes a product's price** adds a row with the product id, the old price and the new price. Updates that do not change the price (stock, name, or setting the same price) must add **nothing**.

1. Create a PL/pgSQL trigger function (`RETURNS trigger`) that inserts into `price_history` using `OLD` and `NEW`.
2. Create an `AFTER UPDATE` row-level trigger on `products` that calls it. Filter with a `WHEN` condition, or with an `IF` inside the function.

The checks run five updates and list the history. Expected output:

```text
 id |       name       | old_price | new_price
----+------------------+-----------+-----------
  1 | SQL Basics       |     25.00 |     27.00
  2 | Chess Set Deluxe |     35.00 |     17.50
  3 | SQL Basics       |     27.00 |     25.00
(3 rows)
```

Hint: compare prices with `OLD.price IS DISTINCT FROM NEW.price`, which also behaves correctly if one side is `NULL`.
