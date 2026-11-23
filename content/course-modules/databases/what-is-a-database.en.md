Almost every application keeps state that must outlive the process: users, orders, messages, payments. A **database** is an organised collection of that data, and a **database management system (DBMS)** is the program that stores it, answers questions about it and keeps it correct while many clients use it at once.

## Why not just files?

You could keep orders in a JSON or CSV file. It works until:

- two requests write the file at the same moment and one change is lost;
- the server crashes halfway through a write and the file is corrupted;
- you need "all orders from Kyiv over 100 UAH" and have to read the whole file every time;
- someone saves an order for a customer who does not exist.

A DBMS solves exactly these problems:

| Problem | What the DBMS gives |
|---|---|
| Concurrent writers | Locks and multi-version concurrency control (MVCC) |
| Crashes | Transactions and a write-ahead log: a change is either fully saved or not at all |
| Fast lookups | Indexes and a query planner |
| Invalid data | Types and constraints (`NOT NULL`, `UNIQUE`, foreign keys, `CHECK`) |
| Access control | Users, roles and permissions |
| Asking questions | A declarative query language (SQL) |

## Declarative, not imperative

With SQL you describe **what** you want, not **how** to get it:

```sql
SELECT name, price
FROM products
WHERE price < 30
ORDER BY price;
```

You never say "open the file, loop over the lines, compare, sort". The database's **planner** decides whether to scan the table or use an index, which join algorithm to use and in what order. The same query keeps working when the table grows from 10 rows to 10 million; only the plan changes.

## Families of databases

| Family | Data model | Examples | Typical use |
|---|---|---|---|
| Relational (SQL) | Tables with rows and columns, joined by keys | PostgreSQL, MySQL, SQL Server, Oracle, SQLite | Most business systems |
| Document | JSON-like documents grouped in collections | MongoDB, Couchbase, Firestore | Flexible, nested records |
| Key-value | A value looked up by a key | Redis, DynamoDB, etcd | Caches, sessions, counters |
| Wide-column | Rows with many dynamic columns, partitioned across nodes | Cassandra, ScyllaDB, HBase | Huge write volumes, time series |
| Graph | Nodes and edges | Neo4j, Amazon Neptune | Social graphs, recommendations |
| Search | Inverted indexes over text | Elasticsearch, OpenSearch | Full-text search, logs |

The non-relational families are together called **NoSQL**. This course spends most of its time on the relational model and PostgreSQL, because that is what most interviews and most systems need, and then covers MongoDB as the most popular document database. The last module compares the two worlds.

## OLTP and OLAP

- **OLTP** (online transaction processing): many small, fast reads and writes, such as "place an order" or "show my profile". PostgreSQL, MySQL and MongoDB live here.
- **OLAP** (online analytical processing): few huge queries over large history, such as "revenue per month per region for 5 years". Column stores such as ClickHouse, BigQuery and Snowflake live here.

Interviewers like to hear that you know the difference: an analytical report that scans the whole `orders` table should not run on the same database that serves checkout, or at least not at peak time.
