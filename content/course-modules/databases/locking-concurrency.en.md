MVCC removes most conflicts between readers and writers, but two transactions that change the **same** data still need coordination. PostgreSQL does that with locks.

## Row locks

Every `UPDATE` and `DELETE` locks the rows it changes until the transaction ends. A second transaction that tries to change the same row **waits**; when the first commits, the second re-checks the row (at Read Committed) and continues.

You can lock rows explicitly while reading:

| Clause | Use |
|---|---|
| `FOR UPDATE` | "I am going to change this row": blocks other `FOR UPDATE`, `UPDATE` and `DELETE` |
| `FOR NO KEY UPDATE` | Like `FOR UPDATE`, but allows others to insert rows referencing it (what a plain `UPDATE` takes) |
| `FOR SHARE` | "Nobody change this while I work": blocks writers, allows other `FOR SHARE` |
| `NOWAIT` | Fail immediately instead of waiting |
| `SKIP LOCKED` | Skip rows that are already locked |

## A job queue with SKIP LOCKED

Several workers take jobs from one table; each must get a different job, and none should wait:

```sql
BEGIN;
SELECT id, payload FROM jobs
WHERE status = 'pending'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;          -- other workers skip this row instead of waiting

UPDATE jobs SET status = 'running' WHERE id = $1;
COMMIT;
```

This pattern turns PostgreSQL into a reliable queue and is behind libraries such as Graphile Worker, Oban and pg-boss.

## Table locks

DDL takes table-level locks. `ALTER TABLE` usually takes `ACCESS EXCLUSIVE`, which conflicts with everything, even `SELECT`. The danger is the queue: if a long transaction is reading the table, the `ALTER` waits, and every new query waits behind the `ALTER`. Use `SET lock_timeout = '5s'` in migrations and retry.

## Deadlocks

```text
T1: UPDATE accounts … WHERE id = 1;    -- locks row 1
T2: UPDATE accounts … WHERE id = 2;    -- locks row 2
T1: UPDATE accounts … WHERE id = 2;    -- waits for T2
T2: UPDATE accounts … WHERE id = 1;    -- waits for T1: a cycle!
```

PostgreSQL detects the cycle (after `deadlock_timeout`, 1 second by default) and aborts one transaction with "deadlock detected" (SQLSTATE `40P01`). The application should retry it. To make deadlocks rare:

- lock rows in a **consistent order**, e.g. always the smaller account id first in a transfer;
- keep transactions short;
- lock everything you need up front (`SELECT … WHERE id IN (1, 2) ORDER BY id FOR UPDATE`).

## Optimistic locking

Pessimistic locking holds a lock while the user thinks, which does not work for a web form open for ten minutes. **Optimistic** locking assumes conflicts are rare and detects them at write time with a version column:

```sql
-- the user loaded the document at version 3
UPDATE documents
SET body = 'new text', version = version + 1
WHERE id = 1 AND version = 3
RETURNING version;
```

- One row returned: the save succeeded, the new version is 4.
- **No rows**: someone saved in between. Show "the document was changed by someone else", reload, merge and try again.

The check and the write are one atomic statement, so two concurrent saves cannot both succeed. HTTP has the same idea built in: an `ETag` header and `If-Match`, answering `412 Precondition Failed` on conflict. ORMs support it too (`@Version` in JPA, `[ConcurrencyCheck]`/row versions in Entity Framework).

## Advisory locks

`pg_advisory_lock(key)` locks an arbitrary number that means something to your application, not to the database: "only one instance runs the nightly report", "only one worker processes customer 42". `pg_try_advisory_lock` returns `false` instead of waiting, and `pg_advisory_xact_lock` releases automatically at the end of the transaction.

## Choosing

| Situation | Approach |
|---|---|
| Increment a counter, decrease stock | One atomic `UPDATE … SET x = x + 1` (with a `WHERE` guard) |
| Read-modify-write within one request | `SELECT … FOR UPDATE` |
| User edits over minutes | Optimistic locking with a version |
| Many workers, one queue | `FOR UPDATE SKIP LOCKED` |
| Complex invariants across rows | Serializable isolation with retries |
