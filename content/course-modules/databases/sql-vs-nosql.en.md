You now know both worlds: PostgreSQL as the relational (SQL) database and MongoDB as the document (NoSQL) database. This slide puts them side by side. Keep in mind that "NoSQL" covers very different systems; where the table says NoSQL, it mostly describes document stores like MongoDB.

## The big comparison

| Aspect | SQL (PostgreSQL) | NoSQL (MongoDB) |
|---|---|---|
| **Data model** | Tables of rows and columns; relationships through keys | Collections of JSON-like documents with nested objects and arrays |
| **Schema** | Declared up front (**schema-on-write**); changes go through migrations | Flexible (**schema-on-read**); optional validation with `$jsonSchema` |
| **Relationships** | Normalised; foreign keys guarantee integrity; joins are cheap and central | Embedding or references; `$lookup` exists but is not the main tool; no foreign keys |
| **Query language** | SQL: a declarative, standard language for ad-hoc questions | Query API and aggregation pipeline (JSON); MongoDB-specific |
| **Transactions** | Full ACID across any rows and tables, the default way of working | Atomic per document; multi-document ACID since 4.0, used sparingly |
| **Consistency** | Strong by default | Tunable (write and read concern); strong with majority settings |
| **Scaling** | Vertical first; read replicas; write scale-out needs partitioning tools (Citus) or NewSQL | Horizontal by design: replica sets and built-in sharding |
| **Integrity rules** | `NOT NULL`, `UNIQUE`, `CHECK`, foreign keys, triggers | Unique indexes and schema validation; the rest is in the application |
| **Typical strengths** | Complex queries, reporting, money, inventory, anything with many relationships and invariants | Records read and written as a whole, rapidly evolving or varied structures, large scale-out workloads |
| **Typical pain points** | Schema migrations on huge tables; scaling writes beyond one primary | Data that is naturally relational; cross-document invariants; ad-hoc analytics |

## The same data, two shapes

```sql
-- SQL: three normalised tables, joined at read time
SELECT o.id, c.name, p.name, oi.quantity
FROM orders o
JOIN customers c    ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
WHERE o.id = 1;
```

```js
// MongoDB: one document shaped like the screen that shows it
db.orders.findOne({ _id: 1 })
// { _id: 1, customer: { _id: 1, name: "Olena Koval" },
//   items: [ { productId: 1, name: "SQL Basics", quantity: 2 }, … ] }
```

The SQL version answers **any** question about orders, customers and products, including ones nobody thought of yet. The MongoDB version answers **this** question with one read and no joins, and is easy to spread across shards by order id. That is the core trade-off: **flexibility of queries** versus **fit to one access pattern**.

## Schema: who enforces it?

Both systems have a schema. The question is where it lives:

- In PostgreSQL, the database enforces it. Bad data cannot get in, and every service and script sees the same rules. The price is migrations.
- In MongoDB, the application enforces it (plus optional validation). Adding a field needs no migration, and documents of different "versions" can coexist. The price is that every reader must handle every shape that was ever written.

## Consistency and scale

PostgreSQL gives strong consistency and ACID everywhere and scales **up** very far: a single modern server handles tens of thousands of transactions per second and many terabytes, and read replicas add read capacity. MongoDB was built to scale **out**: sharding is a built-in feature, and you tune consistency per operation.

The gap has narrowed from both sides. MongoDB added multi-document transactions, schema validation, `$lookup` and majority write concern by default. PostgreSQL added `jsonb` with GIN indexes, so it can store documents well, and distributed SQL systems (CockroachDB, YugabyteDB, Spanner, Citus) offer SQL with horizontal scaling.

## Myths to avoid in an interview

- "NoSQL has no schema": it has an implicit one.
- "NoSQL cannot do transactions": MongoDB, DynamoDB and others can.
- "SQL databases do not scale": they scale vertically very far, and horizontally with the right tools; most products never outgrow one well-tuned PostgreSQL.
- "NoSQL is faster": it is faster **for the access pattern it was modeled for**; for ad-hoc and relational queries it is often slower.
- "JSON means MongoDB": PostgreSQL's `jsonb` covers many document use cases while keeping SQL and transactions.

The next lecture turns this comparison into a decision process.
