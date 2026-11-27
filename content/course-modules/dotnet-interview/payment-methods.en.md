## Task

One small model that touches most of questions 36–42: an abstract class with a template method, an interface, `const` and `readonly`, `override` and `new`.

Complete four method bodies:

1. **`PaymentMethod.Pay(amount)`** — if `amount <= 0` or `amount > MaxAmount`, return `"<Describe()>: rejected"`. Otherwise return `"<Describe()>: <total>"`, where `total = amount + Fee(amount)` formatted with `"0.00"` and `CultureInfo.InvariantCulture`. This is a **template method**: the algorithm is fixed in the base class, the fee is the step derived classes supply.
2. **`Card.Fee`** — 2% of the amount.
3. **`Card.Refund`** — the amount minus a 1.00 processing charge, never below 0.
4. **`Transfer.Fee`** — a flat 5.00.

Then look at the output and explain it: `Transfer.Describe()` is declared with **`new`**, so it *hides* the base method instead of overriding it. Inside `Pay` (and through a `PaymentMethod` variable) the base `Describe()` runs — `"payment by Bob"`; only a variable of type `Transfer` sees `"bank transfer of Bob"`. `Card` overrides, so it is `"card of Ann"` everywhere. Only `Card` implements `IRefundable`, which the `as` check reveals.

Expected output:

```
card of Ann: 102.00
card of Ann: rejected
card of Ann: rejected
payment by Bob: 105.00
payment by Bob: rejected
payment by Bob: rejected
card of Ann refunds 99.00
payment by Bob cannot refund
bank transfer of Bob
1000
```
