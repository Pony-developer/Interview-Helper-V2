## Task

Implement **`Pricing.Price(Item item)`** with a `switch` statement over **type patterns** (`case Book b:`), as in C# 7.0:

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

Inside each `case`, decide the price from the matched variable (`b.IsEbook`, `f.DaysToExpiry`, `g.Brand`). `case null:` handles the null input, and `default:` covers everything else. (The practice compiler is C# 7.0, which has no `when` guards on `case` labels; from C# 7.1 on you could write `case Food f when f.DaysToExpiry <= 0:`.)

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
