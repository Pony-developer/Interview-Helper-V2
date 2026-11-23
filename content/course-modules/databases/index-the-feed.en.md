The `events` table holds 50,000 user events (see **Practice database**). The activity feed shows a user's **latest events**:

```sql
SELECT id, kind, created_at
FROM events
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 3;
```

The first statement in the editor prints the current plan: PostgreSQL reads all 50,000 rows (`Seq Scan`), keeps the user's rows and sorts them. Create **one index** named exactly `events_user_id_created_at_idx` that lets PostgreSQL jump straight to user 42 and read their events already in order, newest first, stopping after three.

Expected output:

```text
              QUERY PLAN
--------------------------------------
 Limit
   ->  Sort
         Sort Key: created_at DESC
         ->  Seq Scan on events
               Filter: (user_id = 42)
(5 rows)

                                           indexdef
-----------------------------------------------------------------------------------------------
 CREATE INDEX events_user_id_created_at_idx ON public.events USING btree (user_id, created_at)
(1 row)

                               QUERY PLAN
-------------------------------------------------------------------------
 Limit
   ->  Index Scan Backward using events_user_id_created_at_idx on events
         Index Cond: (user_id = 42)
(3 rows)

  id   |   kind   |       created_at
-------+----------+------------------------
 49542 | view     | 2024-02-04 09:42:00+00
 49042 | click    | 2024-02-04 01:22:00+00
 48542 | purchase | 2024-02-03 17:02:00+00
(3 rows)
```

Notice: no `Sort` node in the new plan. The index is already ordered by `created_at` within each user, and a B-tree can be read **backwards**, so an ascending index serves `ORDER BY … DESC` too. Experiment: what plan do you get with an index on `user_id` alone?
