"Which database would you use for this?" is a standard system design question. A strong answer is not a favourite product; it is a short reasoning from requirements to a choice, including what you give up.

## Questions to ask first

1. **What is the shape of the data?** Many entities with relationships and rules (relational), self-contained aggregates (documents), pure lookups by key (key-value), connections that matter more than entities (graph), append-only measurements (time series).
2. **How will it be read and written?** Known, stable access patterns favour a model shaped around them; ad-hoc questions and reporting favour SQL.
3. **What must never go wrong?** Money, stock, bookings, permissions: you want ACID transactions and constraints.
4. **How much and how fast?** Thousands of writes per second fit one PostgreSQL easily; millions per second across regions are a different problem.
5. **Consistency vs availability**: may a user briefly see stale data? Must writes continue during a network split?
6. **The team and operations**: what does the team know, what is available as a managed service, what can you back up, monitor and restore at 3 a.m.?

## Default choices by use case

| Use case | Good default | Why |
|---|---|---|
| Typical web/mobile backend, SaaS, e-commerce | **PostgreSQL** (or MySQL) | Relational data, transactions, flexible queries; `jsonb` for the varied parts |
| Money, ledgers, inventory, bookings | **Relational** | ACID, constraints, auditing |
| Content with varied structure, catalogs, CMS, user profiles | **MongoDB** or PostgreSQL + `jsonb` | Whole-document reads, evolving shapes |
| Cache, sessions, rate limits, leaderboards, queues | **Redis** | In-memory speed, TTLs, data structures |
| Massive write-heavy workloads, multi-region, known queries | **Cassandra / ScyllaDB**, DynamoDB | Linear horizontal scaling, high availability |
| Full-text search, log exploration | **Elasticsearch / OpenSearch** (or PostgreSQL full-text for small cases) | Inverted indexes, relevance ranking |
| Metrics and IoT | **Time-series** DB (TimescaleDB, InfluxDB, ClickHouse) | Compression, time-based partitioning, downsampling |
| Analytics over large history | **Column store / warehouse** (ClickHouse, BigQuery, Snowflake) | Scans billions of rows fast |
| Social graphs, fraud rings, recommendations | **Graph DB** (Neo4j) | Multi-hop traversals |
| AI semantic search | **pgvector** in PostgreSQL, or a vector DB | Nearest-neighbour search over embeddings |

"Start with PostgreSQL unless you have a specific reason not to" is a defensible default for a new product: it covers relational data, documents (`jsonb`), full-text search, geodata (PostGIS), queues (`SKIP LOCKED`) and vectors (pgvector) well enough to delay adding more systems until the need is real.

## Polyglot persistence

Real systems often combine several stores, each for what it does best:

```text
                 ┌──────────────┐
  API ──────────►│  PostgreSQL  │  orders, payments, users (source of truth)
   │             └──────┬───────┘
   │                    │ change data capture / outbox
   │      ┌─────────────┼──────────────┬───────────────┐
   ▼      ▼             ▼              ▼               ▼
 Redis  Elasticsearch  ClickHouse    MongoDB        S3
 cache  product search  analytics    activity feed   files
```

Every extra database adds operations work, another failure mode and the question of **keeping copies in sync**. Use one system as the **source of truth** and propagate changes reliably: the transactional **outbox pattern** (write the event to an outbox table in the same transaction, a worker publishes it) or **change data capture** (Debezium reading the WAL). Avoid "dual writes" from application code to two databases without a transaction between them.

## An interview-style answer

> "For the order service I would use PostgreSQL: orders, payments and stock need transactions and constraints, and the business will want ad-hoc reports. Product attributes vary by category, so the catalog keeps core columns typed and puts the rest in a `jsonb` column with a GIN index. Hot product pages and sessions go through Redis with a short TTL. If search needs relevance and facets, I would add OpenSearch fed by change data capture. I would only consider sharding or a NoSQL store for a specific component, such as an activity feed with very high write volume, once measurements show one PostgreSQL primary is not enough."

It names the requirements, picks defaults, explains the trade-offs and says when the decision would change. That is what interviewers listen for.
