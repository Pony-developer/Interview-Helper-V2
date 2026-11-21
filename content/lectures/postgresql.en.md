---
skill: postgresql
title: "PostgreSQL: indexes, transactions and query plans"
summary: "How PostgreSQL stores and finds rows, B-tree indexes and when they help, reading EXPLAIN ANALYZE, transactions and isolation levels, MVCC, constraints that protect data, and the common performance traps."
readingMinutes: 10
---

PostgreSQL is a relational database that stores rows in tables, enforces types and constraints, and runs transactions with strong guarantees. Most backend performance and correctness problems come from three things: missing or unused indexes, transactions that don't isolate what they should, and queries that read far more rows than they return.

## Indexes

Without an index, a query on a column scans the whole table (a **sequential scan**). A **B-tree index** keeps values sorted in a balanced tree, so a lookup takes a few page reads even on millions of rows:

```sql
CREATE INDEX orders_customer_idx ON orders (customer_id);
```

- Indexes speed up `WHERE`, `JOIN` and `ORDER BY` on the indexed columns, but every insert and update must maintain them, so unused indexes are pure cost.
- A **composite index** `(customer_id, created_at)` serves queries that filter on `customer_id` alone, or on both columns. It does not serve a query on `created_at` alone.
- Functions and expressions need matching indexes: `WHERE lower(email) = …` needs an index on `lower(email)`.
- `CREATE INDEX CONCURRENTLY` builds an index without blocking writes.

## Reading query plans

`EXPLAIN` shows the planned execution; `EXPLAIN ANALYZE` runs the query and shows actual row counts and timings. Look for:

- **Seq Scan** on a large table where you expected an index scan.
- A large gap between **estimated and actual rows**, which usually means stale statistics (run `ANALYZE`).
- Nested loops over large inputs, or sorts that spill to disk.

Read plans from the inside out, and compare the actual row counts at each step with what you expect.

## Transactions and isolation

A transaction groups statements so they succeed or fail together (`BEGIN … COMMIT` or `ROLLBACK`). The default isolation level is **READ COMMITTED**: each statement sees only data committed before it started. Two transactions can still interfere:

- **Non-repeatable reads**: a row read twice in one transaction can change in between.
- **Lost updates**: two read-modify-write cycles overwrite each other. Fix it with `SELECT … FOR UPDATE`, an atomic `UPDATE balance = balance + 10`, or a higher isolation level.
- **Write skew**: two transactions each check a condition that the other one changes. Only `SERIALIZABLE` (or explicit locks) prevents it.

PostgreSQL uses **MVCC**: writers create new row versions instead of blocking readers, so reads rarely wait on writes. Long-running transactions hold old versions alive and make `VACUUM` fall behind, so keep them short.

## Constraints

Put the rules in the database, not only in application code: `NOT NULL`, `UNIQUE`, `CHECK`, and foreign keys with explicit `ON DELETE` behaviour. Application checks are bypassed by every other writer, script and migration; constraints are not.

## Common performance traps

- **N+1 queries**: one query for a list, then one per row. Fetch related data with a `JOIN` or `IN (…)`.
- `SELECT *` on wide tables, which reads and transfers columns nobody uses.
- Offset pagination (`OFFSET 100000`) gets slower as the offset grows; keyset pagination (`WHERE id > $last`) stays fast.
- Too many connections: each one is a process. Use a connection pool (PgBouncer or the driver's pool) and keep transactions short.

## Interview checklist

- Explain when a B-tree index helps, how composite index column order matters, and what indexes cost.
- Read an `EXPLAIN ANALYZE` plan and name the problem in it.
- Describe READ COMMITTED and one anomaly it allows, and how to prevent a lost update.
- Explain MVCC and why long transactions are harmful.
- Name the constraints that belong in the schema, and the N+1 pattern with its fix.
