## Task

`Data` holds four customers and four orders, each with order lines. Write the five report methods with LINQ, without loops:

1. **`TotalRevenue()`**: the sum of `Qty * Price` over every line of every order (`SelectMany` + `Sum`).
2. **`RevenueByCity()`**: revenue per customer city, highest first, as `"City: amount"`. Cities with no orders don't appear. (`Join` orders with customers, `GroupBy` city, `Sum`, `OrderByDescending`.)
3. **`UnitsPerProduct()`**: total quantity per product, ordered by product name, as `"Product x Qty"`.
4. **`OrdersPerCustomer()`**: **every** customer with their order count, including customers with no orders (that's a left outer join: `GroupJoin`), ordered by name, as `"Name: N"`.
5. **`KyivMonths()`**: the distinct months (`yyyy-MM`) in which a customer from Kyiv placed an order, ascending.

Expected output:

```
Total: 94.5
Kyiv: 82.5
Lviv: 12
Ink x 8, Pad x 4, Pen x 15
Ann: 2, Bob: 1, Cid: 1, Dee: 0
2024-01, 2024-02
```
