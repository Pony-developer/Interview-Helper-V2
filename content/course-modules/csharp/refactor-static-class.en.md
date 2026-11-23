The static class `BankMath` below passes the balance from one call to another: every method takes it as a parameter, and returns the new one. The caller has to carry the number around, and nothing stops it from going wrong.

`Main` has already been written for the **refactored** design: it uses an object of a class `Account`, which does not exist yet, so the program does not compile. Write the class `Account` (above `Program`), and move the logic of `BankMath` into it, in the form of **instance methods**.

An `Account` has:

- a constructor `Account(owner, balance)`;
- the property `Balance`, which can be read from outside, but **changed only by the class itself**;
- `Deposit(amount)`: adds the amount, if it is **positive**, and returns `true`; otherwise it does nothing and returns `false`;
- `Withdraw(amount)`: subtracts the amount, and returns `true`, if the amount is **positive** and **not larger than the balance**; otherwise it does nothing and returns `false`;
- `ToString()`: the text `Owner: Balance`, such as `Ann: 120`.

Do not change `Main`. Expected output:

```text
True
120
False
False
Ann: 120
Bo: 10 / Ann: 120
```

The lines in order: the result of the first withdrawal (after the deposit, the account has 150, and 30 is taken); the balance, 120; the result of an attempt to withdraw 500; the result of an attempt to deposit −5; the account as text; and two accounts in one line, which shows that every object has **its own** balance.

Hint: the values are `decimal`, so the literals have the suffix `m` (`100m`). `Console.WriteLine(account)` calls `ToString()`, if you **override** it with `public override string ToString()`.
