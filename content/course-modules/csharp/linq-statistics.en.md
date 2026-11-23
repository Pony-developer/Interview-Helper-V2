A small sales report. The lines below are sales in the format `product,quantity,price`, with a header line. Read them and answer questions about the data:

- `ReadSales(string[] lines)`: returns a `List<Sale>` with the valid rows. Skip the rows that do not have exactly three comma-separated fields, and rows where the quantity is not a whole number or the price is not a decimal number. Read the price with `CultureInfo.InvariantCulture`, so that `1.5` is always read as one and a half. The header line is skipped this way, because `quantity` is not a number;
- `Revenue(List<Sale> sales)`: the total money: the sum of `Quantity * Price`, as a `decimal`;
- `TopProduct(List<Sale> sales)`: the product with the highest revenue (the total of `Quantity * Price` for that product). For a tie, the alphabetically first product wins;
- `ProductsBySales(List<Sale> sales)`: the distinct products, ordered by the total quantity sold, from the most to the least; for equal quantities, alphabetically.

The class `Sale` is ready. Do not change `Main`. Expected output:

```text
5
15.75
pear
apple kiwi pear
```

The lines in order: the number of valid rows (`apple`, `pear`, `apple`, `kiwi`, `pear`); the revenue (`4.5 + 4.5 + 1.5 + 3.0 + 2.25`); the best product, `pear` (6.75, against `apple` with 6.0); and the products by quantity: `apple` and `kiwi` sold 4 each, and `pear` sold 3.

Hint: `decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out price)` reads the price. For `TopProduct` and `ProductsBySales`, use `GroupBy(s => s.Product)`, then compute each group's total with `Sum(...)` and sort the groups.
