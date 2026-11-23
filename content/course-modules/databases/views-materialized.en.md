## Views

A **view** is a named, saved query that you can use like a table:

```sql
CREATE VIEW order_totals AS
SELECT o.id AS order_id, c.name AS customer, o.status,
       sum(oi.quantity * oi.unit_price) AS total
FROM orders o
JOIN customers c    ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, c.name, o.status;

SELECT * FROM order_totals WHERE total > 100;
```

A view stores **no data**. Each time it is used, PostgreSQL substitutes its query into yours and plans the whole thing together, so a filter on the view can still use indexes on the base tables.

Why use views:

- **Reuse**: the join-and-aggregate logic lives in one place.
- **A stable interface**: the application reads `order_totals`; you can restructure the tables underneath and keep the view's columns.
- **Security**: grant access to a view that exposes some columns or rows, not to the tables. (Combine with `security_barrier`, or use row-level security policies.)

`CREATE OR REPLACE VIEW` changes a view, as long as you only add columns at the end. Simple views (one table, no aggregates) are even **updatable**: `UPDATE active_customers SET …` writes to the base table.

## Materialized views

A **materialized view** runs the query once and **stores the result**, like a table:

```sql
CREATE MATERIALIZED VIEW daily_revenue AS
SELECT o.ordered_at AS day, sum(oi.quantity * oi.unit_price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status <> 'cancelled'
GROUP BY o.ordered_at;

CREATE UNIQUE INDEX ON daily_revenue (day);

REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue;
```

- Reads are as fast as reading a small table, and you can index it.
- The data is a **snapshot**: it does not change when the base tables change. You must `REFRESH` it, typically on a schedule (cron, `pg_cron`) or after a batch load.
- A plain `REFRESH` locks out readers while it runs; `REFRESH … CONCURRENTLY` does not, but needs a unique index and is slower.

Typical use: dashboards and reports over large data where "up to 5 minutes old" is acceptable. This is denormalization with a built-in way to rebuild the copy.

| | View | Materialized view |
|---|---|---|
| Stores data | No | Yes |
| Always current | Yes | Only after `REFRESH` |
| Read speed | Same as the underlying query | Like a table |
| Indexes | On base tables only | On the view itself |

## Temporary tables and CTEs

For a result you need several times **within one session**, `CREATE TEMP TABLE … AS SELECT …` is another option; it disappears when the session ends. Within one statement, a CTE does the job.

## Other objects worth knowing

- **Sequences**: the number generators behind identity columns. `nextval('seq')`, `currval`, `setval`.
- **Schemas**: namespaces for organising objects and permissions.
- **Roles and grants**: `CREATE ROLE reporting; GRANT SELECT ON order_totals TO reporting;`. Applications should connect as a role with only the privileges they need, never as a superuser.
- **Row-level security**: `ALTER TABLE orders ENABLE ROW LEVEL SECURITY; CREATE POLICY own_orders ON orders USING (customer_id = current_setting('app.customer_id')::int);`. Each query automatically sees only the rows the policy allows. Supabase is built on this.
