## Task

Question 110: "Describe the normal forms." Now apply them. The setup script creates one flat table `order_rows` where customers and products are repeated on every row. Write a script that migrates it to **3NF**:

1. Create the tables:
   - `customers (id serial PRIMARY KEY, email text NOT NULL UNIQUE, name text NOT NULL, city text NOT NULL)`
   - `products (sku text PRIMARY KEY, name text NOT NULL, price numeric(10, 2) NOT NULL)`
   - `orders (id integer PRIMARY KEY, order_date date NOT NULL, customer_id integer NOT NULL REFERENCES customers (id))`
   - `order_items (order_id integer REFERENCES orders (id), product_sku text REFERENCES products (sku), quantity integer NOT NULL, PRIMARY KEY (order_id, product_sku))`
2. Fill them from `order_rows` with `INSERT … SELECT DISTINCT …`. Insert customers ordered by email so that their ids are predictable. To fill `orders.customer_id`, join `order_rows` to `customers` by email.
3. Finish with two check queries:

```sql
SELECT (SELECT count(*) FROM customers) AS customers,
       (SELECT count(*) FROM products) AS products,
       (SELECT count(*) FROM orders) AS orders,
       (SELECT count(*) FROM order_items) AS items;

SELECT c.name, count(DISTINCT o.id) AS orders, sum(i.quantity * p.price) AS spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items i ON i.order_id = o.id
JOIN products p ON p.sku = i.product_sku
GROUP BY c.id, c.name
ORDER BY spent DESC;
```

Only statements that return rows print output, so the result is the two tables below.

Expected result:

```
 customers | products | orders | items
-----------+----------+--------+-------
         3 |        3 |      4 |     6
(1 row)

     name     | orders | spent
--------------+--------+--------
 Iryna Bondar |      1 | 438.70
 Olena Koval  |      2 | 378.70
 Taras Melnyk |      1 |  19.90
(3 rows)
```
