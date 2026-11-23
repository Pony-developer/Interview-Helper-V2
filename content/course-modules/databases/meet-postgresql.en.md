**PostgreSQL** (often just "Postgres") is an open-source relational database with more than 35 years of history. It is the default choice for new backends: Supabase, Neon, AWS RDS and Aurora, Google Cloud SQL and Azure all offer it as a managed service.

## Why teams pick PostgreSQL

- **Correctness first**: strict types, real transactions for DDL too (`CREATE TABLE` can be rolled back), all standard isolation levels.
- **Rich types**: `numeric`, `timestamptz`, `uuid`, arrays, ranges, `jsonb`, enums, geometric types, and your own types.
- **Powerful SQL**: CTEs, recursive queries, window functions, `LATERAL`, `ON CONFLICT` upserts, `MERGE`, `RETURNING`.
- **Many index types**: B-tree, hash, GIN, GiST, SP-GiST, BRIN.
- **Extensions**: PostGIS (maps), pgvector (AI embeddings), TimescaleDB (time series), pg_trgm (fuzzy search).
- **JSON**: `jsonb` makes Postgres a decent document store too, which matters for the SQL vs NoSQL discussion at the end of the course.

## How it runs

A Postgres **server** (cluster) holds several **databases**; a database holds **schemas** (namespaces, `public` by default); a schema holds tables, views, functions and other objects. Clients connect over TCP (port 5432) and each connection gets its own server process, which is why production apps use a **connection pool** (PgBouncer, or the pool in your driver).

The classic command-line client is `psql`:

```text
$ psql -h localhost -U app shop
shop=> \dt            -- list tables
shop=> \d products    -- describe a table
shop=> SELECT count(*) FROM products;
 count
-------
    10
(1 row)
```

## The practice editor in this course

Practices run on **PGlite**, a build of real PostgreSQL 18 compiled to WebAssembly, **inside your browser**. Nothing is installed and your code is not sent to a server. Every run:

1. creates a **fresh, empty database**;
2. runs the practice's setup script (you can read it in "Practice database" above the editor);
3. runs your code statement by statement.

Each statement that returns rows (`SELECT`, or `INSERT … RETURNING`) prints a table in the same layout as `psql`, and the tables are separated by blank lines. Statements without rows (`CREATE`, `INSERT`, `UPDATE`) print nothing. `NULL` is printed as `NULL`, so you can tell it from an empty string. The run stops at the first error and shows PostgreSQL's message.

The answer is accepted when your output matches the expected one exactly, so pay attention to the **columns**, their **order**, their **names** (use `AS` aliases when the task asks for one) and the **order of rows**. If the task says "ordered by name", add `ORDER BY name`: without it, the order is not guaranteed.

Press **Ctrl + Enter** to run. The first run downloads PostgreSQL (about 10 MB), so it takes a few seconds; later runs are quick. A query that runs longer than 10 seconds is stopped.

## SQL style

SQL keywords are case-insensitive: `select` and `SELECT` are the same. This course writes keywords in upper case and names in lower case `snake_case`, which is the common convention. Unquoted names are folded to lower case, so `Products` and `products` are the same table, but `"Products"` in double quotes is a different one: avoid quoted names. String literals use **single** quotes: `'Kyiv'`.
