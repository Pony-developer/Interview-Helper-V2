`OrderService` creates its own repository and notifier with `new`, so it always sends real e-mails (here, lines starting with `EMAIL:`), and a test cannot replace them. `Main` is already written the way the program should look: it **composes** the objects itself and passes them into the constructor. The program does not compile yet.

Refactor `OrderService`:

- it receives an `IOrderRepository` and an `INotifier` through its constructor, with the parameter names `repository` and `notifier`;
- its fields have the **interface** types, not the concrete classes;
- if a parameter is `null`, the constructor throws an `ArgumentNullException` with the name of that parameter (use `nameof`).

The logic of `Place` stays the same. Do not change `Main`, the interfaces, or the other classes. Expected output:

```text
EMAIL: Order placed: book
EMAIL: Order placed: pen
Saved: 2
Fake got: Order placed: lamp
Missing: repository
```

The first part of `Main` is the **composition root** of a real program. The second part is what a unit test does: it passes a `FakeNotifier`, which only remembers the messages, and checks them without sending anything.
