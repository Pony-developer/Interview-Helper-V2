## Task

`Inventory` derives from `KeyedCollection<string, Product>`: it's a list (index access, insertion order) and a dictionary (lookup by key) at the same time. Its constructor already passes `StringComparer.OrdinalIgnoreCase`, so keys are case-insensitive.

1. **`GetKeyForItem(Product item)`** tells the collection where the key lives: return the product's `Sku`.
2. **`InsertItem(int index, Product item)`** is the hook every `Add`/`Insert` goes through. Reject a product with negative `Stock` by throwing `ArgumentException` with the message `Stock can't be negative: <SKU>`; otherwise call `base.InsertItem`. (Duplicate keys are already rejected by the base class with an `ArgumentException`.)

Expected output:

```
Pen Ink
True False
Pad
duplicate rejected
Stock can't be negative: XY-0
AB-1 EF-3 2
```
