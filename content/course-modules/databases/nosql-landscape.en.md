**NoSQL** ("not only SQL") is an umbrella term for databases that do not use the relational table model. The movement grew in the late 2000s, when companies like Google (Bigtable), Amazon (Dynamo) and Facebook (Cassandra) needed to spread enormous amounts of data across many cheap machines, and single-server relational databases of the time could not keep up.

## Why NoSQL appeared

- **Horizontal scaling**: add machines instead of buying a bigger one. Spreading data (sharding) and keeping copies (replication) were built into these systems from day one.
- **Flexible data models**: JSON documents, wide rows, graphs. No `ALTER TABLE` for a new field.
- **Availability over strict consistency**: keep accepting writes even when parts of the cluster cannot talk to each other.
- **Specific workloads**: caching, event streams, time series, social graphs.

## The four main families

| Family | Model | Examples | Strengths | Weak at |
|---|---|---|---|---|
| **Key-value** | `key → opaque value` | Redis, Valkey, DynamoDB, etcd | Sub-millisecond lookups by key, simple scaling | Queries by anything other than the key |
| **Document** | `_id → JSON-like document` | MongoDB, Couchbase, Firestore | Nested records, flexible fields, rich queries on one collection | Joins across collections, multi-document invariants |
| **Wide-column** | Partition key → sorted rows with many columns | Cassandra, ScyllaDB, HBase, Bigtable | Massive write throughput, multi-datacenter | Ad-hoc queries: you model tables per query |
| **Graph** | Nodes and relationships with properties | Neo4j, Neptune, Memgraph | Traversals: friends of friends, shortest paths, recommendations | Bulk aggregations over everything |

Others you may hear about: **search engines** (Elasticsearch, OpenSearch), **time-series** databases (InfluxDB, TimescaleDB, which is a PostgreSQL extension), **vector** databases (Pinecone, Qdrant, or PostgreSQL with pgvector) and **NewSQL** systems (CockroachDB, YugabyteDB, Google Spanner), which offer SQL and ACID transactions on a horizontally scaled cluster.

## A closer look at Redis

Redis is the NoSQL database most backend developers meet first. It keeps data **in memory**, so operations take microseconds, and offers data structures rather than tables:

```text
SET session:abc123 "{\"userId\": 42}" EX 3600   # string with a 1-hour expiry
INCR page:/home:views                            # atomic counter
LPUSH jobs "send-email:42"                       # list as a queue
ZADD leaderboard 1500 "olena"                    # sorted set: rankings
HSET user:42 name "Olena" city "Kyiv"            # hash: a small object
```

Typical uses: caching database query results, sessions, rate limiting, leaderboards, distributed locks and pub/sub. Persistence (snapshots and an append-only file) exists, but Redis is usually a **companion** to a primary database rather than the system of record.

## BASE vs ACID

Many NoSQL systems describe their guarantees as **BASE**:

- **Basically Available**: the system answers, even during partial failures;
- **Soft state**: replicas may be temporarily out of sync;
- **Eventually consistent**: if writes stop, all replicas converge to the same value.

Compare ACID, where a committed write is immediately visible to everyone. The difference is a spectrum, not a binary: MongoDB, for example, supports ACID transactions and tunable consistency today.

## The CAP theorem

In a distributed system, when a **network partition** (P) happens, you must choose between:

- **Consistency** (C): every read sees the latest write, or gets an error;
- **Availability** (A): every request gets a non-error answer, possibly stale.

You cannot have both during a partition. A CP system (e.g. MongoDB with majority writes, etcd, HBase) refuses some requests to stay consistent; an AP system (e.g. Cassandra, DynamoDB with eventual reads) keeps answering and reconciles later.

**PACELC** extends it: if there is a Partition, choose A or C; **E**lse (normal operation), choose between **L**atency and **C**onsistency. Waiting for replicas makes writes consistent but slower. This is the trade-off you tune every day, since partitions are rare.

## The rest of this module

The following lectures focus on **MongoDB**, the most widely used document database: documents and CRUD, the aggregation pipeline, data modeling, and scaling. The last module of the course compares SQL and NoSQL head to head.
