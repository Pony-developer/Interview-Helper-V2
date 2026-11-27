## Task

Questions 68–69: "Why can duplicates appear in queues?" and "How do you build idempotent services?" Here the broker delivers deposit messages **at least once**, so `m1` and `m2` arrive twice. A deposit is a *relative* operation (`balance += amount`) — applying it twice would credit the money twice.

Complete `AccountService`:

1. **`Handle(message)`**:
   - a non-positive amount → return `"rejected"` (don't record it as processed: a corrected message with the same id may come later);
   - a message id that was already applied → return `"duplicate"` and change nothing;
   - otherwise add the amount to the account's balance, remember the id and return `"applied"`.
   Tip: `HashSet<string>.Add` returns `false` if the id is already there — one call both checks and records.
2. **`Balance(account)`** — the current balance, `0` for an unknown account.

In a real service the set of processed ids is an **inbox table** with a unique key, written in the **same database transaction** as the balance change — otherwise a crash between the two steps breaks idempotency.

Expected output:

```
m1: applied
m2: applied
m1: duplicate
m3: applied
m2: duplicate
m4: rejected
A = 150
B = 70
C = 0
processed: 3
```
