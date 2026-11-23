**Normalization** is the process of organising tables so that each fact is stored **once**. It prevents the data from contradicting itself.

## What goes wrong without it

Imagine one wide table for orders:

```text
 order_id | customer | customer_city | product        | category    | price
----------+----------+---------------+----------------+-------------+-------
        1 | Olena    | Kyiv          | SQL Basics     | Books       | 25.00
        1 | Olena    | Kyiv          | Wireless Mouse | Electronics | 19.99
        2 | Olena    | Kyiv          | 4K Monitor     | Electronics | 329.00
```

Three **anomalies** follow:

- **Update anomaly**: Olena moves to Lviv; you must change every row, and if you miss one, the data contradicts itself.
- **Insert anomaly**: you cannot record a new product until somebody orders it.
- **Delete anomaly**: delete order 2, and you lose the fact that the 4K Monitor exists and costs 329.

## Functional dependencies

`A → B` ("B depends on A") means that a value of A determines the value of B. In the table above: `customer → customer_city`, `product → category, price`. Normal forms are rules about which dependencies are allowed.

## The normal forms

**First normal form (1NF)**: every column holds one atomic value, and there are no repeating groups.

- Not 1NF: `phones = '050-111, 067-222'`, or columns `phone1`, `phone2`, `phone3`.
- Fix: a separate `customer_phones (customer_id, phone)` table.

**Second normal form (2NF)**: 1NF, and every non-key column depends on the **whole** primary key, not just part of it. This matters for composite keys. In `order_items (order_id, product_id, quantity, product_name)`, `product_name` depends only on `product_id`, so it belongs in `products`.

**Third normal form (3NF)**: 2NF, and non-key columns depend **only on the key**, not on other non-key columns (no transitive dependencies). In `orders (id, customer_id, customer_city)`, the city depends on the customer, so it belongs in `customers`.

A popular summary: every non-key column must depend on "the key, the whole key, and nothing but the key".

**Boyce–Codd normal form (BCNF)**: a stricter 3NF in which every determinant is a candidate key. The cases where 3NF and BCNF differ are rare in practice. 4NF and 5NF deal with independent multi-valued facts and are mostly of academic interest.

## The normalised shop

The shop database of this course is in 3NF: `customers`, `categories`, `products`, `orders` and `order_items` each store their own facts and refer to each other by keys. To answer "what did Olena buy", you join them back.

## Denormalization

Normalised schemas are great for writes and correctness. Sometimes reads need something else, and you **deliberately** store a derived or duplicated value:

- a cached counter, such as `posts.comment_count`, so a feed does not count comments for every post;
- a total stored on the order, so a list of orders does not sum the items;
- a materialized view or a separate reporting table for dashboards.

Every duplicated value needs a mechanism that keeps it correct: a transaction that updates both places, a trigger, or a periodic refresh, plus acceptance that it may briefly lag.

One duplication is **not** denormalization at all: `order_items.unit_price`. The price a customer paid is a different fact from the product's current price, and it must not change when the product gets more expensive. Copying "the value at the time of the event" is correct modelling.

## Interview framing

"Normalize until it hurts, denormalize until it works": start in 3NF, measure, and denormalize specific hot paths with a clear plan for keeping the copies consistent. Analytical warehouses go the other way on purpose, with wide **star schemas** (a fact table surrounded by dimension tables), because they are read-mostly.
