Таблиця `events` містить 50 000 подій користувачів (див. **База даних практики**). Стрічка активності показує **останні події** користувача:

```sql
SELECT id, kind, created_at
FROM events
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 3;
```

Перша інструкція в редакторі друкує поточний план: PostgreSQL читає всі 50 000 рядків (`Seq Scan`), залишає рядки користувача й сортує їх. Створіть **один індекс** із назвою точно `events_user_id_created_at_idx`, що дозволить PostgreSQL одразу перейти до користувача 42 і читати його події вже впорядкованими, від найновіших, зупинившись після трьох.

Очікуваний вивід:

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

Зверніть увагу: у новому плані немає вузла `Sort`. Індекс уже впорядкований за `created_at` у межах кожного користувача, а B-tree можна читати **у зворотному напрямку**, тож індекс за зростанням обслуговує й `ORDER BY … DESC`. Поекспериментуйте: який план вийде з індексом лише по `user_id`?
