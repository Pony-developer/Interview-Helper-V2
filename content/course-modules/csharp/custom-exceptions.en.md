The standard exceptions cover most cases. Create your own class only when it gives the caller something new:

- the caller needs to **catch this problem separately** from others (a declined card versus a network failure);
- the exception must **carry data** that the caller uses (the balance and the requested amount).

If neither is true, throw a standard exception with a good message.

## How to write one

```csharp
public class InsufficientFundsException : InvalidOperationException
{
    public decimal Balance { get; }
    public decimal Requested { get; }

    public InsufficientFundsException(decimal balance, decimal requested)
        : base("Requested " + requested + ", but the balance is " + balance)
    {
        Balance = balance;
        Requested = requested;
    }

    public InsufficientFundsException(string message, Exception inner)
        : base(message, inner)
    {
    }
}
```

The conventions:

- the name ends with `Exception`;
- the class derives from `Exception` or from a more specific standard exception that fits the meaning (here, `InvalidOperationException`), so that old `catch` blocks still work;
- the message goes to the **base constructor** through `: base(message)`. Without it, `Message` stays a generic "Exception of type ... was thrown";
- the extra data are read-only properties, set in the constructor;
- there is a constructor that accepts an `inner` exception, so the class can be used for wrapping.

The old "serialization constructor" and the `[Serializable]` attribute are not needed in modern .NET.

## A family of exceptions

A library often defines one base class and several specific ones:

```csharp
public class PaymentException : Exception { /* constructors */ }
public class CardDeclinedException : PaymentException { /* ... */ }
public class FraudSuspectedException : PaymentException { /* ... */ }
```

The caller chooses the level of detail: `catch (CardDeclinedException)` for one case, or `catch (PaymentException)` for all payment problems at once.

## What not to put in the message

Messages end up in logs and sometimes on screen. Do not put passwords, tokens, or full card numbers there.

## The rule

A custom exception is part of your API. Create it when the caller will catch it or read its data, derive it from the closest standard class, pass the message to `base`, and keep the data in read-only properties.
