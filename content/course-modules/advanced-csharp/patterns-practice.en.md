## Task

Implement **`Pricing.Price(Item item)`** with a `switch` statement over **type patterns with `when` guards** (C# 7.3 style):

| Item | Price |
| --- | --- |
| `Book` with `IsEbook` | 10% off |
| `Book` (paper) | full price |
| `Food` with `DaysToExpiry <= 0` | free |
| `Food` with 1–2 days left | half price |
| other `Food` | full price |
| `Gadget` of brand `"Acme"` | base price + 15 |
| anything else (other gadgets, gift cards) | full price |
| `null` | throw `ArgumentNullException` |

Order the `case` labels carefully: the first matching case wins, so the more specific `when` guards must come before the general ones. `case null:` handles the null input.

In modern C# you'd write the same thing as a switch expression with property patterns: `Food { DaysToExpiry: <= 0 } => 0m`. Here, practise the 7.3 form.

Expected output:

```
Book: 18.00
Book: 20.00
Food: 0.00
Food: 4.00
Food: 8.00
Gadget: 115.00
Gadget: 100.00
GiftCard: 50.00
null rejected
```
