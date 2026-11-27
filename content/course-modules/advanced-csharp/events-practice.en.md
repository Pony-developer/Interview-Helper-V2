## Task

`Stock` declares a `PriceChanged` event that follows the standard event pattern. Finish it:

1. **`OnPriceChanged(e)`** raises the event with `this` as the sender. Copy the delegate into a local variable (or use `?.Invoke`) so that a concurrent unsubscribe can't cause a `NullReferenceException`, and do nothing if there are no subscribers.
2. The **`Price` setter** updates the price and raises the event only when the price **actually changes**, passing the old and the new price.

`Main` subscribes a logger and an alarm handler, changes the price several times, then unsubscribes the logger.

Expected output:

```
MSFT: 310 -> 320
MSFT: 320 -> 280
ALARM: drop over 10%
ALARM: drop over 10%
Final: 250
```
