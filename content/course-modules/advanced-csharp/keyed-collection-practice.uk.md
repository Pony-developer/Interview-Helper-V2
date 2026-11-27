## Завдання

`Inventory` походить від `KeyedCollection<string, Product>`: це одночасно список (доступ за індексом, порядок вставки) і словник (пошук за ключем). Його конструктор уже передає `StringComparer.OrdinalIgnoreCase`, тож ключі не чутливі до регістру.

1. **`GetKeyForItem(Product item)`** каже колекції, де лежить ключ: поверніть `Sku` продукту.
2. **`InsertItem(int index, Product item)`** — гачок, через який проходить кожен `Add`/`Insert`. Відхиліть продукт з від'ємним `Stock`, кинувши `ArgumentException` з повідомленням `Stock can't be negative: <SKU>`; інакше викличте `base.InsertItem`. (Дублікати ключів базовий клас уже відхиляє з `ArgumentException`.)

Очікуваний результат:

```
Pen Ink
True False
Pad
duplicate rejected
Stock can't be negative: XY-0
AB-1 EF-3 2
```
