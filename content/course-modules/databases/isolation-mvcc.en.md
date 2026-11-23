Isolation is about what a transaction sees while other transactions run at the same time. Perfect isolation (as if transactions ran one after another) is expensive, so SQL defines **levels** that allow some anomalies in exchange for speed.

## Read phenomena

| Phenomenon | What happens |
|---|---|
| **Dirty read** | T1 reads a change T2 has not committed yet; T2 rolls back, and T1 used data that never existed |
| **Non-repeatable read** | T1 reads a row twice and gets different values, because T2 updated and committed in between |
| **Phantom read** | T1 runs the same `WHERE` twice and gets a different set of rows, because T2 inserted a matching row |
| **Serialization anomaly** | The result of concurrent transactions is impossible in any one-at-a-time order |

Plus one that bites applications constantly: the **lost update**. Two transactions read `balance = 100`, both compute `100 + 10` in application code and write `110`. One deposit is lost.

## Isolation levels in PostgreSQL

| Level | Dirty read | Non-repeatable read | Phantom read | Serialization anomaly |
|---|---|---|---|---|
| Read Uncommitted | Not possible in PG* | Possible | Possible | Possible |
| **Read Committed** (default) | No | Possible | Possible | Possible |
| Repeatable Read | No | No | No in PG** | Possible |
| Serializable | No | No | No | No |

\* PostgreSQL treats Read Uncommitted as Read Committed.
\*\* The SQL standard allows phantoms at Repeatable Read; PostgreSQL's snapshot implementation prevents them.

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
…
COMMIT;
```

- **Read Committed**: each **statement** sees a snapshot taken when the statement starts. Two `SELECT`s in one transaction can see different data. Fine for most OLTP work, if updates are written carefully.
- **Repeatable Read**: the whole **transaction** sees one snapshot taken at its first statement. Great for consistent reports. If it tries to update a row that another transaction changed after the snapshot, it fails with "could not serialize access due to concurrent update".
- **Serializable**: PostgreSQL tracks read/write dependencies (Serializable Snapshot Isolation) and aborts a transaction if the outcome could differ from some serial order. Correct by construction, but the application **must retry** transactions that fail with SQLSTATE `40001`.

## MVCC: how PostgreSQL does it

PostgreSQL uses **multi-version concurrency control**. An `UPDATE` does not overwrite a row; it writes a **new version** and marks the old one as expired. Every row version carries the ids of the transactions that created (`xmin`) and expired (`xmax`) it, and every query has a **snapshot** that decides which versions it can see.

Consequences worth knowing for interviews:

- **Readers never block writers, and writers never block readers.** A long report does not stop checkouts. Only two writers of the **same row** wait for each other.
- An `UPDATE` is effectively insert + delete, so heavily updated tables accumulate **dead tuples**. **VACUUM** (run automatically by autovacuum) reclaims them; if it falls behind, tables and indexes **bloat**. A long-running transaction prevents cleanup of everything newer than its snapshot.
- Transaction ids are 32-bit, so VACUUM must also "freeze" old rows to prevent **transaction id wraparound**, a famous cause of outages when autovacuum is disabled or blocked.
- **HOT updates** (heap-only tuples): if no indexed column changes and the page has room, the new version stays on the same page and indexes need no update. This is one reason not to index columns that change often.

## Avoiding the lost update

At Read Committed, choose one:

```sql
-- 1. Let the database compute: one atomic statement
UPDATE accounts SET balance = balance + 10 WHERE id = 1;

-- 2. Pessimistic: lock the row while you think
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;   -- others wait here
UPDATE accounts SET balance = 110 WHERE id = 1;
COMMIT;

-- 3. Optimistic: detect a conflict with a version column (next lecture)
UPDATE accounts SET balance = 110, version = version + 1 WHERE id = 1 AND version = 7;

-- 4. Run the transaction at Repeatable Read or Serializable and retry on 40001
```
