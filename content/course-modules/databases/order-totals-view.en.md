Several reports need the total of each order. Instead of repeating the join and the `GROUP BY` everywhere, create a view named `order_totals` with one row per order and these columns, in this order:

| Column | Meaning |
|---|---|
| `order_id` | The order's id |
| `customer` | The customer's name |
| `status` | The order's status |
| `items` | Total quantity of items in the order |
| `total` | Total of `quantity * unit_price` |

Include every order, whatever its status. The checks then query the view twice: non-cancelled orders by total, and spending per customer. Expected output:

```text
 order_id |     customer      | status  | items | total
----------+-------------------+---------+-------+--------
        2 | Olena Koval       | paid    |     1 | 329.00
        3 | Taras Melnyk      | shipped |     3 | 118.00
        7 | Olena Koval       | shipped |     4 | 109.98
        5 | Iryna Bondar      | shipped |     2 |  73.50
        1 | Olena Koval       | shipped |     3 |  69.99
        6 | Andrii Shevchenko | new     |     3 |  66.00
        8 | Taras Melnyk      | paid    |     1 |  39.90
(7 rows)

     customer      | orders | spent
-------------------+--------+--------
 Olena Koval       |      3 | 508.97
 Taras Melnyk      |      2 | 157.90
 Iryna Bondar      |      2 | 108.50
 Andrii Shevchenko |      1 |  66.00
(4 rows)
```

Notice how simple the second query is: the view hides the joins, and you aggregate its rows like a normal table.
