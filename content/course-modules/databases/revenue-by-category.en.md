The owner asks: "Which categories make us money?" For each category, show:

- `category`, the category name;
- `items_sold`, the total quantity sold;
- `revenue`, the total of `quantity * unit_price`.

Count only orders that were **not cancelled**, use the price stored in `order_items` (the price the customer paid, not today's price), and sort by revenue, highest first.

Expected output:

```text
  category   | items_sold | revenue
-------------+------------+---------
 Electronics |          5 |  477.97
 Books       |          5 |  163.40
 Games       |          4 |   99.00
 Garden      |          3 |   66.00
(4 rows)
```

Hint: join `order_items` → `orders` (for the status) → `products` → `categories`, filter in `WHERE`, then `GROUP BY` the category name.
