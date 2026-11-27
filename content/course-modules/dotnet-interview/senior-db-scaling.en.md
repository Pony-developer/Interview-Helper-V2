Questions 149–150 ("which databases, and when?") at Senior level turn into "and how do you scale it?". Here are the standard moves, in the order you usually make them.

## 0. Make one database faster first

Indexes that match the queries, fixing N+1 queries, caching hot reads (Redis), connection pooling, moving reports off the primary, archiving old data, bigger hardware (vertical scaling — boring but cheap compared to distributed complexity).

## 1. Replication

```text
           writes
client ──────────────► primary ── WAL / log shipping ──► replica 1 (reads)
       ◄── reads ───────────────────────────────────────► replica 2 (reads)
```

- **Asynchronous** replication: fast writes, but replicas lag (milliseconds to seconds) → stale reads, and a failover can lose the last writes.
- **Synchronous**: a commit waits for a replica → no data loss on failover, slower writes.
- Read-your-writes problems: after a user saves, route their reads to the primary for a while, or return the saved data directly, or wait for the replica's log position.
- In .NET: separate connection strings / `DbContext`s for reads and writes; Azure SQL "ApplicationIntent=ReadOnly"; PostgreSQL with a read replica endpoint.

## 2. Partitioning (inside one server)

```sql
CREATE TABLE events (id bigint, created_at timestamptz, payload jsonb) PARTITION BY RANGE (created_at);
CREATE TABLE events_2026_03 PARTITION OF events FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

Queries that filter on the partition key touch only the relevant partitions (partition pruning); dropping a month is `DROP TABLE events_2025_01` instead of a slow `DELETE`. Great for time-series and logs.

## 3. Sharding (across servers)

Split rows by a **shard key** across several databases: tenant id for a SaaS app, user id for a social network.

- **Hash-based** (even spread; consistent hashing so adding a shard moves only part of the data), **range-based** (easy range scans, risk of hot shards), **directory-based** (a lookup table: tenant → shard; flexible, one more component).
- Costs: cross-shard queries and joins become application work; transactions across shards need sagas; rebalancing is an operation; unique ids need a global scheme (GUID v7, Snowflake ids).
- Managed options: Azure Cosmos DB (partition key), Citus for PostgreSQL, Azure SQL Elastic Database tools, Vitess for MySQL.

## 4. CAP and PACELC

- **CAP**: during a network **partition**, a distributed store must choose **consistency** (refuse some requests) or **availability** (answer, possibly with stale data).
- **PACELC**: *else*, in normal operation, it trades **latency** against **consistency** — e.g. synchronous replication = consistent but slower.
- Examples: a single PostgreSQL primary is CP-ish; Cassandra/DynamoDB are tunable (quorum reads/writes); Cosmos DB offers five levels from Strong to Eventual (default **Session**).

## 5. Pagination at scale

`OFFSET 100000` makes the database read and discard 100,000 rows; results also shift when rows are inserted. **Keyset (seek) pagination** uses the last row of the previous page as a cursor:

```sql
SELECT id, created_at, title
FROM events
WHERE (created_at, id) < (@lastCreatedAt, @lastId)      -- row-value comparison (PostgreSQL, MySQL; emulate in SQL Server)
ORDER BY created_at DESC, id DESC
LIMIT 20;
-- needs an index on (created_at DESC, id DESC); id breaks ties so no row is skipped or repeated
```

In SQL Server write it as `WHERE created_at < @c OR (created_at = @c AND id < @id)`. The API returns an opaque cursor (Base64 of the two values) instead of page numbers. You'll write these queries in the practice.

## 6. Operational topics to mention

Backups and point-in-time restore (know your **RPO** — how much data you can lose — and **RTO** — how long recovery may take), testing restores, online schema changes (expand/contract migrations), connection limits (pooling, PgBouncer), monitoring slow queries (Query Store, `pg_stat_statements`), and capacity planning.
