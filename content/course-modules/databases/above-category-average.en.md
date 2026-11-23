Find the products that cost **more than the average price of their own category**. Show:

- `name`, the product;
- `category`, the category name;
- `price`;
- `category_avg`, the average price of that category, rounded to 2 decimals.

Sort by category name, then by price from the highest. Products without a category are left out.

Expected output:

```text
        name        |  category   | price  | category_avg
--------------------+-------------+--------+--------------
 Postgres Internals | Books       |  48.50 |        37.80
 Mongo in Action    | Books       |  39.90 |        37.80
 4K Monitor         | Electronics | 329.00 |       146.00
 Chess Set          | Games       |  35.00 |        24.75
(4 rows)
```

Solve it with a **correlated subquery** (the inner query refers to the outer product's `category_id`). If you have time, solve it a second way: with a derived table of averages per category, or with `avg(price) OVER (PARTITION BY category_id)` from the window functions module.
