The warehouse prints packing lists for **shipped** orders. For every item of every order with status `shipped`, show:

- `order_id`, the order's id;
- `customer`, the customer's name;
- `product`, the product's name;
- `quantity`.

Order the rows by order id, then by product name. You will need four tables: `orders`, `customers`, `order_items` and `products`.

Expected output:

```text
 order_id |   customer   |       product       | quantity
----------+--------------+---------------------+----------
        1 | Olena Koval  | SQL Basics          |        2
        1 | Olena Koval  | Wireless Mouse      |        1
        3 | Taras Melnyk | Mechanical Keyboard |        1
        3 | Taras Melnyk | Puzzle 1000         |        2
        5 | Iryna Bondar | Postgres Internals  |        1
        5 | Iryna Bondar | SQL Basics          |        1
        7 | Olena Koval  | Chess Set           |        2
        7 | Olena Koval  | Wireless Mouse      |        2
(8 rows)
```
