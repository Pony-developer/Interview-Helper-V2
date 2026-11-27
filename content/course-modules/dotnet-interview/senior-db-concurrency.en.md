## The lost update and its four fixes (Q155)

```text
T1: SELECT stock FROM products WHERE id = 7;   -- 5
T2: SELECT stock FROM products WHERE id = 7;   -- 5
T1: UPDATE products SET stock = 4 WHERE id = 7;   -- 5 - 1
T2: UPDATE products SET stock = 4 WHERE id = 7;   -- 5 - 1   → one sale is lost
```

1. **Atomic update** — let the database do the read-modify-write:
   ```sql
   UPDATE products SET stock = stock - 1 WHERE id = 7 AND stock >= 1 RETURNING stock;   -- 0 rows = sold out
   ```
2. **Pessimistic lock** — lock the row you're about to change:
   ```sql
   BEGIN; SELECT stock FROM products WHERE id = 7 FOR UPDATE; … UPDATE …; COMMIT;
   -- SQL Server: SELECT … FROM products WITH (UPDLOCK, ROWLOCK) WHERE id = 7
   ```
3. **Optimistic concurrency** — detect the conflict and retry:
   ```sql
   UPDATE products SET stock = 4, version = version + 1 WHERE id = 7 AND version = 12;   -- 0 rows → reload, retry
   ```
   EF Core: `[Timestamp] public byte[] RowVersion` (SQL Server `rowversion`) or `[ConcurrencyCheck]` → `DbUpdateConcurrencyException`.
4. **A stricter isolation level** (Repeatable Read / Serializable) — the database aborts one transaction with a serialization error; the application must retry.

Pick 1 when the change can be expressed in one statement, 3 for user edits with low conflict rates (forms, admin screens), 2 for short critical sections with high contention, 4 for complex invariants spanning many rows.

## A job queue in a relational database

```sql
-- each worker claims a different job; locked rows are skipped instead of waited on
UPDATE jobs SET status = 'running', worker = @worker, started_at = now()
WHERE id = (
    SELECT id FROM jobs
    WHERE status = 'queued'
    ORDER BY priority DESC, id
    LIMIT 1
    FOR UPDATE SKIP LOCKED
)
RETURNING id, payload;
```

SQL Server equivalent: `WITH cte AS (SELECT TOP 1 * FROM jobs WITH (ROWLOCK, UPDLOCK, READPAST) WHERE status = 'queued' ORDER BY priority DESC) UPDATE cte SET … OUTPUT inserted.*`. Add a timeout/heartbeat so jobs of crashed workers return to the queue. Libraries: Hangfire, Quartz.NET (with a DB store). You'll write this query in the practice.

## Deadlocks

```text
T1: UPDATE accounts … WHERE id = 1;   -- locks row 1
T2: UPDATE accounts … WHERE id = 2;   -- locks row 2
T1: UPDATE accounts … WHERE id = 2;   -- waits for T2
T2: UPDATE accounts … WHERE id = 1;   -- waits for T1 → deadlock; the engine kills one (error 1205 / 40P01)
```

Prevent with a consistent access order (always lower id first), short transactions with no user interaction or HTTP calls inside, indexes so that updates lock few rows (no scans), and `UPDLOCK` when reading rows you'll update. Handle the rest with retries (Polly, EF Core `EnableRetryOnFailure`). Capture deadlock graphs via Extended Events (`xml_deadlock_report`) or `log_lock_waits` in PostgreSQL.

## Distributed locks in practice (Q156)

```csharp
// SQL Server application lock, owned by the transaction
await using var tx = await conn.BeginTransactionAsync();
var result = await conn.ExecuteScalarAsync<int>(
    "DECLARE @r int; EXEC @r = sp_getapplock @Resource = @res, @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 0; SELECT @r;",
    new { res = "invoice:42" }, tx);
if (result < 0) return;            // someone else holds it
// … do the work …
await tx.CommitAsync();            // releases the lock

// PostgreSQL: SELECT pg_try_advisory_xact_lock(hashtext('invoice:42'));

// Redis (with the DistributedLock library)
var @lock = new RedisDistributedLock("invoice:42", redis.GetDatabase());
await using var handle = await @lock.TryAcquireAsync(TimeSpan.Zero);
if (handle is null) return;
```

What to discuss: lease time vs work time (renew the lease or keep the work short); what happens when the lock store fails over (Redis replication is asynchronous — a new primary may not know about your lock); **fencing tokens** for correctness; and whether you need a lock at all — often an idempotent operation, a unique constraint or a single-consumer queue partition removes the need.
