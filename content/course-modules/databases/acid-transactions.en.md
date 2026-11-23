A **transaction** is a group of statements that the database treats as one unit of work. The classic example is a money transfer: subtract from one account and add to another. Doing only half of it is worse than doing nothing.

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

- `BEGIN` (or `START TRANSACTION`) opens a transaction.
- `COMMIT` makes all its changes permanent and visible to others.
- `ROLLBACK` throws all its changes away.

If any statement fails inside a transaction, PostgreSQL puts the transaction into an **aborted** state: every further statement fails with "current transaction is aborted, commands ignored until end of transaction block", and the only way out is `ROLLBACK` (a `COMMIT` then also rolls back).

Without `BEGIN`, every statement runs in its own transaction (**autocommit**). Drivers and ORMs open transactions for you when you ask, e.g. `prisma.$transaction(…)` or `@Transactional`.

## ACID

| Letter | Property | Meaning | How PostgreSQL provides it |
|---|---|---|---|
| **A** | Atomicity | All of the transaction or nothing | Row versions of an aborted transaction are simply never visible |
| **C** | Consistency | A transaction moves the database from one valid state to another | Constraints, foreign keys and triggers are checked; a violation aborts the transaction |
| **I** | Isolation | Concurrent transactions do not see each other's partial work | MVCC snapshots and locks; the level is configurable (next lecture) |
| **D** | Durability | A committed transaction survives a crash | The write-ahead log (WAL) is flushed to disk before `COMMIT` returns |

## The write-ahead log

PostgreSQL does not write changed table pages to disk on every commit; that would be slow and random. It appends a compact description of every change to the **WAL**, a sequential log, and `COMMIT` waits only for that log record to reach the disk. Table pages are written later, in bulk, by checkpoints. After a crash, PostgreSQL replays the WAL from the last checkpoint.

The same WAL powers **replication** (replicas replay the primary's WAL) and **point-in-time recovery** (a base backup plus archived WAL can restore the database to any moment).

`synchronous_commit = off` lets `COMMIT` return before the flush: much faster, but a crash can lose the last few hundred milliseconds of commits. That is a trade-off some systems accept for non-critical data such as analytics events.

## Savepoints

A savepoint is a named point inside a transaction that you can roll back to without abandoning the whole transaction:

```sql
BEGIN;
INSERT INTO orders (id, customer_id, status, ordered_at) VALUES (9, 1, 'new', current_date);

SAVEPOINT before_items;
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (9, 6, 1, 329.00);
-- something went wrong with the items
ROLLBACK TO SAVEPOINT before_items;

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (9, 4, 1, 19.99);
COMMIT;   -- the order and the mouse are saved, the monitor is not
```

`ROLLBACK TO SAVEPOINT` also clears the aborted state, so it is how you recover from an expected error inside a longer transaction. ORMs use savepoints to implement nested transactions.

## Keep transactions short

An open transaction holds its locks and keeps old row versions alive (they cannot be vacuumed). A transaction that waits for a user, an HTTP call to a payment provider or a message queue can block other work and bloat tables. Do the slow external work outside, then open a short transaction to record the result. The state "idle in transaction" in `pg_stat_activity` is a classic production alarm.
