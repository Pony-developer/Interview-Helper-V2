The final challenge combines everything: joins, aggregation, CTEs and window functions. The owner wants a **monthly report** of the shop. For each month that has orders, show:

| Column | Meaning |
|---|---|
| `month` | The month as text `YYYY-MM` (use `to_char`) |
| `orders` | Number of orders that month |
| `revenue` | Total of `quantity * unit_price` |
| `top_product` | The product with the largest quantity sold that month; on a tie, the one whose name comes first alphabetically |
| `change` | Revenue minus the previous month's revenue (`NULL` for the first month) |

Count only orders that are **not cancelled**, and order the rows by month.

Expected output:

```text
  month  | orders | revenue | top_product | change
---------+--------+---------+-------------+---------
 2024-06 |      3 |  516.99 | Puzzle 1000 | NULL
 2024-07 |      2 |  139.50 | Garden Hose | -377.49
 2024-08 |      2 |  149.88 | Chess Set   |   10.38
(3 rows)
```

A plan that works well:

1. A CTE with one row per order item of a non-cancelled order, carrying the month (`date_trunc('month', ordered_at)`), the order id, the product name, the quantity and the line amount.
2. A CTE with orders and revenue per month (`count(DISTINCT …)`).
3. A CTE with the top product per month: sum the quantity per month and product, then keep the first row per month with `DISTINCT ON` (or `row_number()`).
4. Join them and add `lag(revenue) OVER (ORDER BY month)`.

In June, SQL Basics and Puzzle 1000 both sold 2 copies; the tie-break picks Puzzle 1000. This practice is worth 10 points.
