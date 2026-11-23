`EXPLAIN` shows the **plan** PostgreSQL chose for a query: which tables it reads, how, in what order and with which join algorithms. It is the first tool for any "this query is slow" problem.

## EXPLAIN

```sql
EXPLAIN
SELECT c.name, o.id
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE c.city = 'Kyiv';
```

```text
Hash Join  (cost=1.09..2.24 rows=2 width=36)
  Hash Cond: (o.customer_id = c.id)
  ->  Seq Scan on orders o  (cost=0.00..1.08 rows=8 width=8)
  ->  Hash  (cost=1.07..1.07 rows=2 width=36)
        ->  Seq Scan on customers c  (cost=0.00..1.07 rows=2 width=36)
              Filter: (city = 'Kyiv'::text)
```

How to read it:

- It is a **tree**. Read from the most indented nodes up: each node gets rows from its children and passes rows to its parent. Here, customers from Kyiv are scanned and hashed, orders are scanned and probed against the hash.
- `cost=1.09..2.24`: the estimated cost to produce the first row and all rows, in abstract units (roughly "page reads"). Only useful for comparing plans.
- `rows=2`: the **estimated** number of rows. `width`: average row size in bytes.
- `Filter`: a condition checked row by row after reading. `Index Cond`: a condition used to search an index.

## EXPLAIN ANALYZE

`EXPLAIN ANALYZE` **runs** the query and adds what really happened:

```text
Index Scan using orders_customer_id_idx on orders  (cost=0.29..8.31 rows=1 width=16)
                                                   (actual time=0.020..0.025 rows=3 loops=1)
  Index Cond: (customer_id = 42)
Planning Time: 0.110 ms
Execution Time: 0.050 ms
```

- `actual time=0.020..0.025`: milliseconds to the first and the last row, **per loop**.
- `rows=3 loops=1`: real rows per loop. In a nested loop, multiply by `loops`.
- Add `BUFFERS` to see how many pages came from memory (`shared hit`) and from disk (`read`). Since PostgreSQL 18, `EXPLAIN ANALYZE` shows buffers by default.

Careful: `EXPLAIN ANALYZE` of an `UPDATE` or `DELETE` really changes data. Wrap it in `BEGIN; … ROLLBACK;`.

## What to look for

1. **Estimated vs actual rows.** If the planner expected 10 rows and got 100,000, every decision above that node may be wrong (a nested loop chosen for "10 rows"). Fix the statistics: `ANALYZE`, a higher statistics target, or extended statistics for correlated columns.
2. **Seq Scan on a big table with a selective Filter**, with `Rows Removed by Filter` in the millions: a missing index.
3. **Sort** with `Sort Method: external merge  Disk: …`: the sort spilled to disk; an index matching `ORDER BY`, or more `work_mem`, may help.
4. **Nested Loop with a big `loops` count** over a Seq Scan: an index on the inner side's join column is missing.
5. Where the **time** goes: find the node whose actual time is the largest share of the total.

## Node types you will meet

| Node | Meaning |
|---|---|
| `Seq Scan` | Read the whole table |
| `Index Scan` / `Index Only Scan` | Look up through an index (and the heap / not the heap) |
| `Bitmap Index Scan` → `Bitmap Heap Scan` | Collect matches from an index, then read pages in order |
| `Nested Loop`, `Hash Join`, `Merge Join` | Join algorithms |
| `Sort`, `Incremental Sort` | Sorting |
| `HashAggregate`, `GroupAggregate` | `GROUP BY` |
| `Limit` | Stop after n rows; with an index matching `ORDER BY`, the scan below stops early |

## Options

- `EXPLAIN (COSTS OFF)` hides the numbers: handy for comparing plan shapes, and used in this module's practice.
- `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` produces JSON for visualisers such as explain.dalibo.com.

## Beyond one query

- `pg_stat_statements` (an extension) aggregates statistics for every query shape: total time, calls, mean time. Start optimisation from its top entries, not from guesses.
- `auto_explain` logs the plans of slow queries automatically.
- Often the fix is not an index but the query: fetching fewer columns, avoiding N+1 queries from an ORM, or paginating with keysets instead of `OFFSET`.
