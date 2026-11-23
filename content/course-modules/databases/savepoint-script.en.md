The `accounts` table has three accounts: Olena 500, Taras 200, Iryna 100. The script in the editor makes three changes:

1. Olena pays Taras 100: **keep it**;
2. a test bonus of 50 for everyone, followed by a `SELECT` that shows the balances with the bonus: **undo it**;
3. Taras pays Iryna 30: **keep it**.

Turn the script into **one transaction** that keeps steps 1 and 3 and undoes step 2, without deleting step 2 or reordering the steps. Use `BEGIN`, a `SAVEPOINT` right before step 2, `ROLLBACK TO SAVEPOINT` right after it, and `COMMIT` at the end.

Expected output:

```text
 owner | balance
-------+---------
 Iryna |  150.00
 Olena |  450.00
 Taras |  350.00
(3 rows)

 owner | balance
-------+---------
 Iryna |  130.00
 Olena |  400.00
 Taras |  270.00
(3 rows)
```

The first table is what step 2 saw inside the transaction: everybody got the bonus. The second is the final state: the bonus is gone, while both transfers before and after it remain.
