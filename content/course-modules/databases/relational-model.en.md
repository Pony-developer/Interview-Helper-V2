The relational model, proposed by Edgar Codd in 1970, describes all data as **relations**, which SQL calls **tables**.

## Tables, rows and columns

```text
customers
 id | name         | email              | city
----+--------------+--------------------+------
  1 | Olena Koval  | olena@example.com  | Kyiv
  2 | Taras Melnyk | taras@example.com  | Lviv
```

- A **column** (attribute) has a name and a **type**: `integer`, `text`, `date`…
- A **row** (tuple) is one record: one customer.
- The **schema** is the set of tables, their columns, types and constraints. It is declared up front: you cannot put text into an `integer` column.

A table is a **set** of rows: rows have no built-in order, and you get a specific order only by asking for it with `ORDER BY`.

## Keys

- A **primary key** uniquely identifies a row. It is unique and never `NULL`. Usually it is a surrogate number (`id`) or a UUID; sometimes a natural value, such as an ISO country code.
- A **foreign key** is a column that points to the primary key of another (or the same) table. The database refuses rows that point nowhere.

```text
orders
 id | customer_id | status
----+-------------+--------
  1 |           1 | shipped     -- customer_id → customers.id
  2 |           1 | paid
  3 |           2 | shipped
```

The data is split into tables with no duplication: the customer's name lives once in `customers`, and orders only keep the customer's id. A **join** puts the pieces back together at query time:

```sql
SELECT orders.id, customers.name
FROM orders
JOIN customers ON customers.id = orders.customer_id;
```

## Relationships

| Kind | Example | How it is stored |
|---|---|---|
| One-to-many | A customer has many orders | Foreign key on the "many" side: `orders.customer_id` |
| Many-to-many | An order has many products, a product is in many orders | A junction table: `order_items (order_id, product_id)` |
| One-to-one | A user has one profile | A foreign key that is also unique (or the same primary key) |

## NULL

`NULL` means "unknown" or "missing". It is not zero and not an empty string. Any comparison with `NULL` gives `NULL` (unknown), not `true` or `false`, so `email = NULL` never matches anything. You test it with `IS NULL`. Later lectures come back to this, because it is a favourite interview trap.

## The shop database

Most practices in this course use the same small online shop:

| Table | What it holds |
|---|---|
| `categories` | Books, Electronics, Games, Garden |
| `products` | 10 products with a price, a stock count and a category (one has none) |
| `customers` | 6 customers; one has no email, one has no city |
| `orders` | 8 orders with a status: `new`, `paid`, `shipped` or `cancelled` |
| `order_items` | Which products each order contains, how many and at what price |

You can read the full script that creates it above the editor of every practice.
