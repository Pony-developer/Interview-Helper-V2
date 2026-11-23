## Indexes

MongoDB indexes are B-trees, just like PostgreSQL's, and the same intuition applies: without an index, a query is a **collection scan** (`COLLSCAN`).

```js
db.products.createIndex({ category: 1, price: -1 })          // compound
db.users.createIndex({ email: 1 }, { unique: true })         // unique
db.products.createIndex({ tags: 1 })                         // multikey: one entry per array element
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })   // TTL: auto-delete
db.orders.createIndex({ status: 1 }, { partialFilterExpression: { status: "new" } })
db.articles.createIndex({ title: "text", body: "text" })     // full-text
db.places.createIndex({ location: "2dsphere" })              // geo queries
```

The **ESR rule** for compound indexes: put **E**quality fields first, then **S**ort fields, then **R**ange fields. For `find({ status: "A", qty: { $gt: 5 } }).sort({ date: -1 })`, the index is `{ status: 1, date: -1, qty: 1 }`. It is the same leftmost-prefix logic as in SQL.

`explain("executionStats")` shows the winning plan, `totalKeysExamined`, `totalDocsExamined` and `nReturned`. A healthy query examines about as many documents as it returns.

## Replica sets: availability

A **replica set** is a group of `mongod` servers holding the same data: one **primary** accepts writes, the **secondaries** replicate its operation log (the oplog). If the primary fails, the remaining members **elect** a new primary within seconds, and drivers reconnect automatically. Three members (or two plus an arbiter) is the minimum for automatic failover, because an election needs a majority.

Two settings control the consistency/latency trade-off from the CAP lecture:

- **Write concern**: when is a write acknowledged? `w: 1` after the primary has it (fast, but a failover can roll it back); `w: "majority"` after most members have it (survives failover, the default since MongoDB 5.0). `j: true` waits for the journal on disk.
- **Read preference and read concern**: read from the `primary` (current data) or from `secondary` nodes (spreads load, may be slightly stale); `readConcern: "majority"` returns only data that cannot be rolled back.

With majority writes, majority reads and reads from the primary, you get strong consistency for single documents. Add **causal consistency** sessions to "read your own writes" from secondaries.

## Sharding: scaling out

When one replica set cannot hold the data or the write load, **sharding** splits a collection across several replica sets (shards). Clients talk to `mongos` routers, which use a **shard key** to send each query to the right shard(s). Config servers store which range of keys lives where; a balancer moves chunks between shards to even out the load.

The **shard key** is the most important (and in older versions, irreversible) decision:

| Property | Why |
|---|---|
| **High cardinality** | Enough distinct values to split into many chunks |
| **Even distribution** | No single value holds most of the data |
| **Not monotonically increasing** for ranged sharding | Otherwise all inserts go to the last chunk: a **hot shard** |
| **Matches the main queries** | Queries with the shard key go to one shard; queries without it are **scatter-gather** across all shards |

Options: **ranged** keys (good for range queries), **hashed** keys (even writes, but range queries hit every shard), or **compound** keys such as `{ customerId: 1, orderDate: 1 }`, which keep one customer's data together and spread customers across shards.

## Transactions

Single-document operations are always atomic. Since MongoDB 4.0 (replica sets) and 4.2 (sharded clusters), **multi-document ACID transactions** exist:

```js
const session = client.startSession();
await session.withTransaction(async () => {
  await accounts.updateOne({ _id: 1 }, { $inc: { balance: -100 } }, { session });
  await accounts.updateOne({ _id: 2 }, { $inc: { balance: 100 } }, { session });
});
```

They work, but they cost more than in a relational database (especially across shards), have time limits (60 seconds by default) and should be the exception. If most operations need a transaction, either the model should embed more, or a relational database fits the problem better.

## Change streams

`collection.watch()` streams inserts, updates and deletes in real time (built on the oplog). It powers cache invalidation, search index syncing and event-driven integrations, similar to logical replication / CDC (Debezium) in PostgreSQL.

## PostgreSQL equivalents

| MongoDB | PostgreSQL |
|---|---|
| Replica set with automatic failover | Streaming replication + a failover manager (Patroni) or a managed service |
| Write concern `majority` | `synchronous_commit` with synchronous standbys |
| Sharding | Partitioning on one node; Citus extension or a NewSQL system for scale-out |
| TTL index | A scheduled `DELETE` or dropping time partitions |
| Change streams | Logical replication, `LISTEN/NOTIFY`, CDC tools |

Native, built-in horizontal scaling remains one of MongoDB's strongest arguments; PostgreSQL scales up very far on one machine and needs extra tools to scale out writes.
