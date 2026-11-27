## Normal forms (Q110)

- **1NF**: atomic values, no repeating groups (no `Phones = "067…, 050…"` column; no `Phone1, Phone2, Phone3`).
- **2NF**: 1NF, and every non-key column depends on the **whole** composite key (in `OrderItems(OrderId, ProductId, ProductName)`, `ProductName` depends only on `ProductId` → move it to `Products`).
- **3NF**: 2NF, and no **transitive** dependencies: non-key columns depend only on the key (`Orders(Id, CustomerId, CustomerName)` → `CustomerName` belongs in `Customers`).
- **BCNF**: every determinant is a candidate key. 4NF/5NF deal with multi-valued and join dependencies and rarely come up.

Normalization removes redundancy and update anomalies; denormalization (deliberate duplication) trades that for read speed.

## Indexes (Q111–113)

An index is a separate, sorted structure (a **B+-tree**) over one or more columns that lets the engine **seek** instead of **scan**.

Use them on columns in `WHERE`, `JOIN` (foreign keys!), `ORDER BY` and `GROUP BY` with good selectivity. Cons: storage, slower writes (every insert/update/delete maintains each index), more work for the optimizer, possible fragmentation.

Types:
- **Clustered**: the leaf level *is* the table data, sorted by the key; one per table (usually the primary key).
- **Non-clustered**: leaves hold the key plus a pointer to the row (the clustered key or a RID); a lookup may need an extra **key lookup**.
- **Composite** (several columns; column order matters — leftmost prefix), **covering** / with `INCLUDE` columns (no key lookup needed), **unique**, **filtered / partial** (`WHERE IsDeleted = 0`), **columnstore** (analytics), **full-text**, plus hash, GIN/GiST (PostgreSQL: JSONB, arrays, geo).

## ACID and isolation (Q114–115)

- **Atomicity**: all or nothing. **Consistency**: constraints hold before and after. **Isolation**: concurrent transactions don't see each other's intermediate state. **Durability**: once committed, data survives a crash (write-ahead log).

| Level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| Read Uncommitted | possible | possible | possible |
| Read Committed (SQL Server/PostgreSQL default) | — | possible | possible |
| Repeatable Read | — | — | possible (not in PostgreSQL) |
| Serializable | — | — | — |
| Snapshot (SQL Server, row versioning) | — | — | — (but write-skew possible) |

Higher isolation means more locking or more aborts. SQL Server's `READ_COMMITTED_SNAPSHOT` makes readers use row versions instead of shared locks.

## Execution plans and slow queries (Q116–117)

An **execution plan** is the optimizer's chosen strategy for a query: which indexes, join algorithms (nested loops, hash match, merge join), order of operations, estimated row counts and costs. In SSMS: *Display Estimated Execution Plan* (Ctrl+L) or *Include Actual Execution Plan* (Ctrl+M); in PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)`.

Diagnosing a slow query:
1. Reproduce and measure (`SET STATISTICS IO, TIME ON`, Query Store, the EF Core log).
2. Read the actual plan: table/index **scans** where you expected **seeks**, expensive key lookups, big gaps between estimated and actual rows (stale statistics), spills to tempdb, implicit conversions (`nvarchar` vs `varchar`) that kill index use.
3. Fix: add or adjust indexes (composite, covering), update statistics, rewrite non-sargable predicates (`WHERE YEAR(Date) = 2026` → a date range), select only needed columns, paginate, avoid N+1 queries from the ORM, address **parameter sniffing** (`OPTION (RECOMPILE)`, `OPTIMIZE FOR`), and check **blocking** and deadlocks (`sys.dm_exec_requests`, `sp_whoisactive`).

## How EF Core makes SQL (Q118)

`db.Users.Where(u => u.Age > 18)` uses `Queryable.Where`, which takes an `Expression<Func<User, bool>>`: the compiler turns the lambda into an **expression tree** (data describing the code) instead of IL. The `IQueryable` accumulates a tree of method calls. When you enumerate (`ToListAsync`), EF Core's query pipeline **visits** the tree (`ExpressionVisitor`), translates it to a relational model and the provider (SQL Server, Npgsql) generates parameterized SQL; results are then materialized into entities and tracked. Methods with no translation throw, or (for the final `Select`) run on the client.

## ConfigureAwait, 16 threads, the ThreadPool (Q119–121)

`await task.ConfigureAwait(false)` tells the awaiter **not** to resume on the captured `SynchronizationContext` (the UI thread in WPF/WinForms, the request context in classic ASP.NET). Use it in **library** code: it avoids needless context switches and the classic `.Result` deadlock. ASP.NET Core has no `SynchronizationContext`, so there it changes nothing.

**16 threads, blocking DB calls**: each request holds a thread while it waits, so at most 16 requests are in flight and the rest queue up (thread-pool starvation). The fix is **async all the way**: `await db.Orders.ToListAsync()`. While the query runs, no thread is held; the thread returns to the pool and serves other requests; when the result arrives, an I/O completion schedules the continuation on any free pool thread. The same 16 threads can then handle hundreds or thousands of concurrent requests. `Task.Run` around a blocking call does **not** help: it just blocks a different pool thread.

**ThreadPool**: a process-wide set of worker threads (plus I/O completion threads on Windows) that reuse threads instead of creating one per work item (thread creation costs ~1 MB of stack and time). `Task.Run`, `ThreadPool.QueueUserWorkItem`, timers and async continuations queue work items. Each worker has a **local queue** (LIFO for its own items) and there is a **global queue** (FIFO); idle workers **steal** work from others. A thread picks an item, runs it to completion and goes back for the next one — it "returns" to the pool simply by finishing the delegate. The pool starts with `MinThreads` (= CPU cores) and adds threads slowly (the **hill-climbing** algorithm, roughly one or two per second beyond the minimum) when work is queued and threads are blocked — which is why blocking code in async apps causes starvation.
