## Task

Question 155: "What problems can concurrent database queries cause?" A classic one: several workers take jobs from a table. With a naive "`SELECT` the first queued job, then `UPDATE` it", two workers can pick the same job. The fix is to claim a job in **one statement** that locks the row and makes other workers **skip** locked rows instead of waiting.

The setup creates a `jobs` table. Write four statements:

1. Worker **`w1`** claims the queued job with the highest `priority` (ties: the smaller `id`): set `status = 'running'`, `worker = 'w1'`, and return `id, name, worker`. Use a subquery with `ORDER BY priority DESC, id LIMIT 1 FOR UPDATE SKIP LOCKED` inside the `UPDATE … WHERE id = (…)` and `RETURNING`.
2. Worker **`w2`** claims the next job the same way.
3. `w1` finishes: set `status = 'done'` for its running job and return `id, status`.
4. Show the final state: `SELECT id, name, status, worker FROM jobs ORDER BY id`.

Note that job 3 is already running (another worker) and job 5 is done — they must not be claimed.

Expected result:

```
 id |     name     | worker
----+--------------+--------
  4 | charge-cards | w1
(1 row)

 id |     name      | worker
----+---------------+--------
  2 | resize-images | w2
(1 row)

 id | status
----+--------
  4 | done
(1 row)

 id |      name       | status  | worker
----+-----------------+---------+--------
  1 | send-newsletter | queued  | NULL
  2 | resize-images   | running | w2
  3 | rebuild-search  | running | w9
  4 | charge-cards    | done    | w1
  5 | cleanup-temp    | done    | w1
(5 rows)
```
