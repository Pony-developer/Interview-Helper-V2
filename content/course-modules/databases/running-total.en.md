This practice uses the `daily_sales` table: the revenue of two stores over five days. For every row, show:

- `store`, `day`, `amount`;
- `running_total`, the store's revenue from its first day up to and including this day;
- `change`, the difference from the store's previous day (`NULL` on the first day).

Sort by store, then by day.

Expected output:

```text
 store |    day     | amount | running_total | change
-------+------------+--------+---------------+--------
 Kyiv  | 2024-09-01 | 120.00 |        120.00 | NULL
 Kyiv  | 2024-09-02 |  80.00 |        200.00 | -40.00
 Kyiv  | 2024-09-03 | 150.00 |        350.00 |  70.00
 Kyiv  | 2024-09-04 |  60.00 |        410.00 | -90.00
 Kyiv  | 2024-09-05 | 200.00 |        610.00 | 140.00
 Lviv  | 2024-09-01 |  90.00 |         90.00 | NULL
 Lviv  | 2024-09-02 | 110.00 |        200.00 |  20.00
 Lviv  | 2024-09-03 |  70.00 |        270.00 | -40.00
 Lviv  | 2024-09-04 | 130.00 |        400.00 |  60.00
 Lviv  | 2024-09-05 | 100.00 |        500.00 | -30.00
(10 rows)
```

Both columns need a window `PARTITION BY store ORDER BY day`: `sum(amount)` over it for the total and `lag(amount)` for the previous day.
