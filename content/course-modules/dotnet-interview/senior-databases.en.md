## How a database stores data (Q148)

Take SQL Server (PostgreSQL is similar in spirit):
- Data files are divided into **8 KB pages**, grouped into **64 KB extents**. A page has a header, rows, and a slot array pointing to the rows.
- A table with a clustered index is a **B+-tree**: root and intermediate pages hold keys and pointers, **leaf pages hold the rows** in key order. Without a clustered index it is a **heap** (unordered pages, rows found by RID). Non-clustered indexes are separate B+-trees whose leaves point to the clustered key.
- Large values (`varchar(max)`, `varbinary(max)`) go to overflow / LOB pages. Columnstore indexes store data by column in compressed segments.
- Pages are read into the **buffer pool** (RAM); changes are made in memory and recorded in the **transaction log** (write-ahead logging); dirty pages are written to disk later by checkpoints and the lazy writer.
- PostgreSQL stores tables as heaps of 8 KB pages; MVCC keeps multiple **row versions** in the table itself (cleaned up by `VACUUM`), with the WAL for durability.

## Kinds of databases and when to use which (Q149–150)

| Kind | Examples | Good for |
|---|---|---|
| Relational (OLTP) | SQL Server, PostgreSQL, MySQL | business data, transactions, integrity, ad-hoc queries — the default choice |
| Document | MongoDB, Cosmos DB | aggregates read/written as a whole, flexible schema, catalogs, user profiles |
| Key-value / cache | Redis, Memcached | caching, sessions, rate limiting, distributed locks, leaderboards |
| Wide-column | Cassandra, ScyllaDB | huge write volumes, time series, known query patterns, multi-region |
| Search | Elasticsearch, OpenSearch, Azure AI Search | full-text search, faceting, log analytics |
| Graph | Neo4j, Cosmos DB Gremlin | relationship-heavy queries: social graphs, recommendations, fraud |
| Time-series | InfluxDB, TimescaleDB | metrics, IoT |
| Columnar / OLAP | ClickHouse, Snowflake, Synapse | analytics over large datasets |

Pick from the **access patterns**, consistency needs, scale and team expertise. "Polyglot persistence": a relational system of record plus Redis for caching and a search index is common. Start with PostgreSQL/SQL Server unless you have a concrete reason not to.

## Denormalization and isolation levels in practice (Q151–152)

**Denormalization** deliberately adds redundancy to speed up reads: storing a `CustomerName` in orders for reporting, precomputed totals and counters, materialized/indexed views, read models in CQRS, embedding documents in NoSQL. The cost: more storage and keeping copies in sync (triggers, application code, events) — so do it on measured read hot spots.

Choosing isolation levels:
- **Read Committed** (default): most OLTP work. With **RCSI/Snapshot** in SQL Server readers don't block writers.
- **Repeatable Read / Serializable**: when a transaction reads data and then decides based on it (check-then-act, e.g. "book the seat if free"), or financial invariants across rows. Expect more blocking or serialization failures — retry them.
- **Snapshot**: consistent reports over a point-in-time view without blocking writers; watch out for **write skew** and update conflicts.
- **Read Uncommitted / NOLOCK**: only for rough monitoring queries where wrong or duplicated rows are acceptable.

Often a better fix than raising the level: atomic conditional updates, `UPDLOCK`/`SELECT … FOR UPDATE` on the rows you'll change, or optimistic concurrency with a `rowversion` column (EF Core `[Timestamp]` → `DbUpdateConcurrencyException`).

## How RDBMSs implement ACID (Q153)

- **Atomicity & durability**: the **write-ahead log**. Every change is logged before the data page is written; on `COMMIT` the log records are flushed to disk (that's the durability point). After a crash, recovery **redoes** committed changes not yet in data files and **undoes** uncommitted ones (ARIES-style in SQL Server; WAL replay in PostgreSQL).
- **Isolation**: **locking** (shared/exclusive/update locks, intent locks, key-range locks for Serializable) and/or **MVCC** — readers see a snapshot of committed row versions (PostgreSQL always; SQL Server via the version store in tempdb with RCSI/Snapshot).
- **Consistency**: constraints (PK, FK, UNIQUE, CHECK), triggers and the above guarantees; the rest is the application's responsibility.

## Optimizing queries (Q154)

Have a real story: what was slow (p95, how it was found — Query Store, APM, slow log), what the plan showed, what you changed, and the measured result. Typical fixes: a composite/covering index matching `WHERE` + `ORDER BY`; rewriting non-sargable predicates; removing N+1 queries (EF `Include`, projections with `Select`, split queries); keyset pagination instead of `OFFSET` on large tables; batching writes; fixing parameter sniffing; updating statistics; archiving or partitioning big tables; caching results; moving reporting to a read replica.

## Concurrency problems and distributed locks (Q155–156)

Problems with concurrent queries: **lost updates** (two read-modify-write cycles overwrite each other), **dirty / non-repeatable / phantom reads**, **write skew**, **deadlocks** (two transactions lock resources in opposite order — the DB kills one; fix with consistent ordering, shorter transactions, proper indexes), **blocking chains** and **lock escalation**, connection-pool exhaustion, hot rows (one counter row everybody updates).

**Distributed lock** (only one instance runs a job / processes an entity at a time):
- **Redis**: `SET lock:invoice:42 <unique-token> NX PX 30000` — set only if absent, with an expiry so a crashed owner doesn't hold it forever. Release with a Lua script that deletes the key **only if the value still equals your token**. Extend the TTL while working (a watchdog). For multi-node Redis, Redlock is debated; for correctness also use a **fencing token** (a monotonically increasing number checked by the resource on write), because a paused process may wake up after its lock expired.
- **SQL Server**: `sp_getapplock @Resource = 'invoice:42', @LockMode = 'Exclusive', @LockOwner = 'Session'`; **PostgreSQL**: `pg_try_advisory_lock(42)`. Simple and correct if you already have the database, tied to the connection/transaction lifetime.
- **ZooKeeper / etcd / Consul**: consensus-based locks with sessions and ephemeral nodes — strongest guarantees.
- Azure: a **blob lease** (`BlobLeaseClient`, 15–60 s or infinite).

Libraries: `DistributedLock` (Medallion) supports SQL Server, Postgres, Redis, Azure blobs.
