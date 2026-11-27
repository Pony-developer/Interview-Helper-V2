## Task

Four threads transfer money between accounts at the same time: two move money A → B, two move it B → A, and all of them occasionally pay into C. Implement **`Bank.Transfer(from, to, amount)`** so that it is:

- **atomic**: the check and both balance changes happen together, under locks;
- **safe**: if `from` doesn't have enough money, return `false` and change nothing;
- **deadlock-free**: locking `from` then `to` deadlocks when one thread does A → B while another does B → A. Always lock the two accounts in the **same global order**, by `Id` (lower id first), whichever direction the money moves;
- **counted**: increment `Bank.Transfers` with `Interlocked.Increment` after a successful transfer.

If your locking is wrong, the program hangs (deadlock) or the total stops being 2,000,000 (lost updates).

Expected output:

```
total: 2000000
c: 400
transfers: 40400
overdraft refused: True
```
