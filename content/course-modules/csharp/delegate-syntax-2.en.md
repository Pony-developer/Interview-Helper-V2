A delegate can hold **several** methods at once. Combining them with `+=` creates a delegate that calls each method in order; removing with `-=` takes one out. This is called **multicast**. Write the delegate type and the two methods that Main uses.

- Declare the delegate type `Notify`: it takes one `string` parameter and returns nothing (`void`). Put the declaration above `Program`.
- Write the static method `ConsoleNotify(string message)`: it prints `console: ` followed by the message.
- Write the static method `LogNotify(string message)`: it prints `log: ` followed by the message.

Do not change `Main`. Expected output:

```text
console: saved
log: saved
log: loaded
no handlers
```

The lines in order: `n` calls both methods, so the message is printed twice; after `n -= ConsoleNotify`, only the log method is called; and a delegate variable that was never assigned is `null`, so `Main` reports that there are no handlers.

Hint: `Notify n = ConsoleNotify;` then `n += LogNotify;` makes a delegate with two methods. Calling `n("saved")` calls them in the order they were added.
