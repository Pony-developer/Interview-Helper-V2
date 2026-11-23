Suppose that a bad value gets into an object, and the program continues as if nothing happened. This is a **deferred error**: the mistake is made now, and it is noticed later.

```csharp
class Order
{
    public int Quantity;                           // public: no check
    public decimal PricePerItem;

    public decimal Total() { return Quantity * PricePerItem; }
}

var order = new Order { Quantity = -3, PricePerItem = 9.99m };     // typo: a minus
// ...a hundred lines, other methods, another file...
Console.WriteLine(order.Total());                  // -29.97: the customer gets a "refund"
```

The error was made in the line with `Quantity = -3`. It is **found** in the report, in the invoice, or by a customer, and the stack trace (if there is any) points to the **wrong** place. Now you need to answer "who wrote the negative number?", and the program has thousands of lines.

## The cost grows with the distance

The farther the symptom is from the cause, the more expensive the search:

- a bad value is caught **at the moment of writing**: the stack trace shows the exact line with the mistake;
- the value is stored, used in the next calculation, saved to a file: the error shows up **somewhere else**;
- the bad data is **saved to a database**, and it lives for years.

## Fail fast

The principle of defensive programming is **fail fast**: when something is wrong, **stop at once**, loudly, **at the place where it went wrong**. Do not "fix" the data silently, and do not hope that somebody will check later.

```csharp
public void SetQuantity(int quantity)
{
    if (quantity < 0)
    {
        throw new ArgumentOutOfRangeException("quantity", "The quantity cannot be negative");
    }
    this.quantity = quantity;
}
```

Now `SetQuantity(-3)` **throws an exception right there**. The stack trace shows the caller who passed the bad number. The order is untouched (it still has the old, correct quantity), because the check comes **before** the assignment.

## Which exception to throw

| Situation | Exception |
|---|---|
| An argument is bad in general (empty text, `null`) | `ArgumentException`, `ArgumentNullException` |
| A number is out of the allowed range | `ArgumentOutOfRangeException` |
| The object is in the wrong state for this call (an empty list, a closed file) | `InvalidOperationException` |
| Not supported at all | `NotSupportedException` |

The first parameter of the argument exceptions is the **name of the parameter** (`nameof(quantity)` is the safe way to write it). The message tells the programmer **what is wrong and what is allowed**.

## Validate, then change

A method that changes an object must **check everything first**, and only then change anything. Otherwise an exception can leave the object **half changed**:

```csharp
public void Transfer(Account to, decimal amount)
{
    if (amount <= 0 || amount > balance) throw new ArgumentException("Bad amount");
    balance -= amount;                      // changes start only after all the checks
    to.balance += amount;
}
```

## A silent "fix" is also a deferred error

```csharp
if (quantity < 0) quantity = 0;             // hides the mistake of the caller
```

It looks friendly, but now the program works with a number that nobody asked for, and the real bug lives on. Prefer an **exception** for a **programmer's mistake**. For an error that a **user** can make (a wrong text in a field), return a result such as `false` from `TryParse`, and let the interface explain the problem.
