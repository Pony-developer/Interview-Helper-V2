## Running totals

Add `ORDER BY` inside `OVER`, and an aggregate becomes cumulative:

```sql
SELECT store, day, amount,
       sum(amount) OVER (PARTITION BY store ORDER BY day) AS running_total
FROM daily_sales;
```

```text
 store |    day     | amount | running_total
-------+------------+--------+---------------
 Kyiv  | 2024-09-01 | 120.00 |        120.00
 Kyiv  | 2024-09-02 |  80.00 |        200.00
 Kyiv  | 2024-09-03 | 150.00 |        350.00
 …
```

Why does `ORDER BY` change the meaning? Because it changes the default **frame**.

## Frames

The frame is the subset of the partition that the function sees for the current row:

```sql
sum(amount) OVER (
    PARTITION BY store
    ORDER BY day
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW     -- the frame
)
```

| Window | Default frame |
|---|---|
| No `ORDER BY` | The whole partition |
| With `ORDER BY` | `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`: from the start up to the current row **and its peers** (rows with the same sort value) |

Frame units:

- `ROWS`: counts physical rows. `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` is the current row and the two before it: a **3-day moving average** with `avg`.
- `RANGE`: works with values. `RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW` is "the last 7 calendar days", which stays correct when some days have no rows.
- `GROUPS`: counts groups of peers.

Bounds: `UNBOUNDED PRECEDING`, `n PRECEDING`, `CURRENT ROW`, `n FOLLOWING`, `UNBOUNDED FOLLOWING`.

The "peers" detail matters: if two rows have the same `day`, the default `RANGE` frame includes both, so they get the same running total. Use `ROWS` (or a unique sort key) when you want a strictly row-by-row total.

## LAG and LEAD

`lag(x)` returns `x` from the previous row of the partition, `lead(x)` from the next one:

```sql
SELECT store, day, amount,
       lag(amount)  OVER w AS prev_day,
       amount - lag(amount) OVER w AS change,
       round(100.0 * (amount - lag(amount) OVER w) / lag(amount) OVER w, 1) AS change_pct,
       lead(day)    OVER w AS next_day
FROM daily_sales
WINDOW w AS (PARTITION BY store ORDER BY day);
```

- On the first row there is no previous one, so `lag` returns `NULL` (and so does anything computed from it).
- `lag(x, 7)` looks 7 rows back (week-over-week), and `lag(x, 1, 0)` uses `0` instead of `NULL`.

Classic interview tasks with `lag`/`lead`: day-over-day growth, time between a user's consecutive logins, detecting gaps in a sequence of ids, finding sessions (a new session starts when the gap to the previous event is over 30 minutes).

## first_value, last_value, nth_value

```sql
SELECT name, department, salary,
       first_value(name) OVER (PARTITION BY department ORDER BY salary DESC) AS top_earner
FROM employees;
```

`last_value` has a trap: with the default frame, the frame ends at the current row, so `last_value` returns the current row's value. Extend the frame:

```sql
last_value(name) OVER (
    PARTITION BY department ORDER BY salary DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
)
```

## Performance notes

Each distinct `OVER (…)` may need its own sort of the data. Reuse one named `WINDOW` where possible, and an index that matches `PARTITION BY … ORDER BY …` lets PostgreSQL skip the sort.
