Build an **expense approval chain**, the same shape as ASP.NET Core middleware or the Dynamics plug-in pipeline.

Each `Approver` either decides or calls `PassOn(expense)`, which hands the expense to the next handler. If there is no next handler, `PassOn` returns `Rejected: nobody can approve <amount>`. `SetNext` returns the handler it was given, so a chain can be built in one line: `a.SetNext(b).SetNext(c)`.

`ReceiptCheck` (rejects expenses without a receipt) and `TeamLead` (approves up to 1,000) are ready. Your tasks:

1. Write **`Manager`**: approves amounts up to 10,000 inclusive with `Approved by manager`, otherwise passes on.
2. Write **`Director`**: approves amounts up to 50,000 inclusive with `Approved by director`, otherwise passes on.
3. In **`Approval.BuildChain()`**, link them in this order and return the first handler: `ReceiptCheck` → `TeamLead` → `Manager` → `Director`.

Do not change `Main`. Expected output:

```text
Anna, 300: Approved by team lead
Bohdan, 5000: Approved by manager
Chen, 20000: Rejected: no receipt
Dana, 20000: Approved by director
Eva, 90000: Rejected: nobody can approve 90000
```

Look at Chen and Dana: the same amount, but Chen's expense stops at the very first handler. And Eva's falls off the end of the chain, which is why the end of a chain always needs a defined answer.

Hint: the handlers look just like `TeamLead`. Build the chain as `var first = new ReceiptCheck(); first.SetNext(new TeamLead()).SetNext(...)...; return first;`.
