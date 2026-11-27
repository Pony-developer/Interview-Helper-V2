## Starting point: one flat table (Q110)

```text
order_rows
order_id | order_date | customer_email    | customer_name | customer_city | product_sku | product_name | unit_price | quantity
---------+------------+-------------------+---------------+---------------+-------------+--------------+------------+---------
1        | 2026-03-01 | olena@example.com | Olena Koval   | Lviv          | KB-01       | Keyboard     | 49.90      | 1
1        | 2026-03-01 | olena@example.com | Olena Koval   | Lviv          | MS-02       | Mouse        | 19.90      | 2
2        | 2026-03-02 | taras@example.com | Taras Melnyk  | Kyiv          | MS-02       | Mouse        | 19.90      | 1
```

Anomalies:
- **Update anomaly**: Olena moves to Kyiv — you must update every one of her rows, and missing one leaves contradicting data.
- **Insert anomaly**: you can't store a new product until someone orders it.
- **Delete anomaly**: deleting Taras's only order deletes everything you know about Taras.

## Step by step

- **1NF** — atomic values, a key. Already true here; the key is `(order_id, product_sku)`.
- **2NF** — no partial dependency on part of the composite key: `order_date` and `customer_*` depend only on `order_id`; `product_name` and `unit_price` depend only on `product_sku`. Split out `orders(order_id, order_date, customer_…)` and `products(sku, name, price)`; `order_items(order_id, product_sku, quantity)` remains.
- **3NF** — no transitive dependency: in `orders`, `customer_name` and `customer_city` depend on `customer_email`, not on `order_id`. Move them to `customers(id, email, name, city)` and keep `orders(id, order_date, customer_id)`.

```sql
INSERT INTO customers (email, name, city)
SELECT DISTINCT customer_email, customer_name, customer_city FROM order_rows;

INSERT INTO orders (id, order_date, customer_id)
SELECT DISTINCT r.order_id, r.order_date, c.id
FROM order_rows r JOIN customers c ON c.email = r.customer_email;
```

A real-world nuance: if a product's price changes, old orders must keep the price they were sold at. So `order_items` usually stores its own `unit_price` — that's not a normalization error, it's a different fact ("price at the time of sale"). Interviewers like it when you notice that.

You will do this migration yourself in the SQL practice of this module.

## Index types side by side (Q113)

```sql
CREATE CLUSTERED INDEX cx_orders ON orders (id);                 -- SQL Server: the table's physical order
CREATE INDEX ix_orders_customer ON orders (customer_id) INCLUDE (order_date, total);   -- covering
CREATE UNIQUE INDEX ux_customers_email ON customers (email);    -- uniqueness + fast lookup
CREATE INDEX ix_orders_open ON orders (created_at) WHERE status = 'open';   -- filtered / partial
CREATE NONCLUSTERED COLUMNSTORE INDEX cs_sales ON sales (product_id, qty, amount);   -- analytics
CREATE INDEX ix_docs_body ON docs USING GIN (to_tsvector('english', body));   -- PostgreSQL full-text
```

## Reading an execution plan (Q116)

```text
Nested Loops (Inner Join)                    cost 38%
├── Index Seek  ix_orders_customer           Actual rows 12 / Estimated 10
└── Key Lookup  cx_orders                    Executions 12   ← fetching columns not in the index
```

What to look for: **Scan** vs **Seek** (a scan over a big table for a selective filter means a missing or unusable index); **Key Lookup / RID Lookup** repeated many times (make the index covering); **estimated vs actual rows** far apart (stale statistics or parameter sniffing — the plan was built for different values); **Sort** and **Hash Match** spilling to tempdb (memory grant warnings); thick arrows (many rows flowing between operators); implicit conversion warnings. In PostgreSQL: `EXPLAIN (ANALYZE, BUFFERS)` shows `Seq Scan`, `Index Scan`, `Index Only Scan`, `rows=` estimates vs `actual rows`, and buffer hits/reads.
