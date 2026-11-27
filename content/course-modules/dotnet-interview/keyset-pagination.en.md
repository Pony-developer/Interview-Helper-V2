## Task

Keyset (seek) pagination from the lecture. The `events` table has an index on `(created_at DESC, id DESC)`; several events share the same `created_at`, so `id` is the tie-breaker. Write **three queries**, each returning `id, created_at, title`, sorted by `created_at DESC, id DESC`, with `LIMIT 3`:

1. The first page.
2. The page after the last row of page 1 — that row is `(created_at '2026-03-03 07:45', id 8)`. Use a row-value comparison: `WHERE (created_at, id) < ('2026-03-03 07:45', 8)`.
3. The page after the last row of page 2 — `('2026-03-02 08:00', 5)`.

Notice that page 2 stops in the middle of the three events at `08:00` — thanks to the `id` tie-breaker, page 3 continues exactly where page 2 stopped (with id 4), without skipping or repeating a row. No `OFFSET` anywhere.

Expected result:

```
 id |     created_at      |      title
----+---------------------+-----------------
 10 | 2026-03-03 11:00:00 | incident closed
  9 | 2026-03-03 07:45:00 | rollback v1.2
  8 | 2026-03-03 07:45:00 | deploy v1.2
(3 rows)

 id |     created_at      |       title
----+---------------------+--------------------
  7 | 2026-03-02 12:30:00 | alert: memory
  6 | 2026-03-02 08:00:00 | smoke tests passed
  5 | 2026-03-02 08:00:00 | migration run
(3 rows)

 id |     created_at      |    title
----+---------------------+--------------
  4 | 2026-03-02 08:00:00 | deploy v1.1
  3 | 2026-03-01 10:15:00 | alert: CPU
  2 | 2026-03-01 09:00:00 | cache warmed
(3 rows)
```
