Finish an **order that changes its state**.

The base class `OrderState` refuses every action by default: it prints `  Cannot <action> an order that is <state>` and returns `this` (the state doesn't change). Each state overrides only the actions it allows and **returns the next state**. `NewState`, `ShippedState` and `CancelledState` are ready. `Order` just asks its current state and stores whatever comes back.

Complete `PaidState`. A paid order:

- can be **shipped**: print `  Parcel handed to the courier` and move to `ShippedState`;
- can be **cancelled**: print `  Money refunded` and move to `CancelledState`;
- can't be paid again (the base class already handles that).

Do not change anything outside `PaidState`. Expected output:

```text
ship (New)
  Cannot ship an order that is New
pay (New)
  Payment received
pay (Paid)
  Cannot pay an order that is Paid
ship (Paid)
  Parcel handed to the courier
cancel (Shipped)
  Cannot cancel an order that is Shipped
First order: Shipped
pay (New)
  Payment received
cancel (Paid)
  Money refunded
ship (Cancelled)
  Cannot ship an order that is Cancelled
Second order: Cancelled
```

Notice that there isn't a single `if (status == ...)` in the program: every rule lives in the class of the state it belongs to.

Hint: `public override OrderState Ship() { ...; return new ShippedState(); }`, and the same for `Cancel`.
