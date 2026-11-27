Interviewers rarely accept textbook definitions alone: "Give an example, ideally from your experience" (Q2). This lecture shows each principle in a small piece of C# you can retell.

## Encapsulation: protect the invariant

```csharp
public class BankAccount
{
    private readonly List<string> _history = new();
    public decimal Balance { get; private set; }          // readable, not writable from outside
    public IReadOnlyList<string> History => _history;     // no one can Add() from outside

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        if (amount > Balance) throw new InvalidOperationException("Insufficient funds");
        Balance -= amount;
        _history.Add($"-{amount}");
    }
}
```

The rule "the balance never goes negative" lives in exactly one place. Without encapsulation every caller would have to remember it. Encapsulation is not "make fields private and add get/set for each" — a public setter for everything is encapsulation in name only.

## Inheritance: reuse an *is-a* relation

```csharp
public class Employee
{
    public string Name { get; init; } = "";
    public virtual decimal MonthlyCost() => 3000m;
}

public class Manager : Employee
{
    public List<Employee> Reports { get; } = new();
    public override decimal MonthlyCost() => base.MonthlyCost() + 500m * Reports.Count;
}
```

A manager *is* an employee and can be used anywhere an `Employee` is expected. Warning signs of bad inheritance: the subclass throws `NotSupportedException` for inherited members, or the hierarchy is deeper than 2–3 levels. **Favour composition** ("has-a") when the relation is not truly *is-a*: a `Car` has an `Engine`; an `OrderService` has an `IEmailSender`.

## Abstraction: depend on what, not how

```csharp
public interface IPaymentGateway
{
    Task<PaymentResult> ChargeAsync(decimal amount, string cardToken);
}

public class CheckoutService(IPaymentGateway gateway)
{
    public Task<PaymentResult> PayAsync(Order order) => gateway.ChargeAsync(order.Total, order.CardToken);
}
```

`CheckoutService` does not know whether Stripe, LiqPay or a test fake is behind the interface. Abstraction hides complexity; encapsulation hides data — interviewers like it when you can name the difference.

## Polymorphism: one call, many behaviours

```csharp
abstract class Shape { public abstract double Area(); }
class Circle(double r) : Shape { public override double Area() => Math.PI * r * r; }
class Rect(double w, double h) : Shape { public override double Area() => w * h; }

Shape[] shapes = { new Circle(1), new Rect(2, 3) };
double total = shapes.Sum(s => s.Area());   // the right Area() is chosen at run time
```

- **Subtype (runtime)** polymorphism: `virtual`/`override`, interfaces. The call goes through the method table of the actual object type.
- **Ad-hoc (compile-time)**: overloading — `Print(int)` vs `Print(string)` — and operator overloading.
- **Parametric**: generics — `List<T>` works for any `T`.

A real-life example to tell: "We had a `switch` over document types in five places. I replaced it with an `IDocumentExporter` per type; adding a format became one new class instead of five edits."

## Object and multiple inheritance

Every type derives from `System.Object` and inherits `ToString()`, `Equals()`, `GetHashCode()`, `GetType()`, plus protected `MemberwiseClone()` and `Finalize()`. C# allows **one base class** — this avoids the "diamond problem" of ambiguous inherited implementations — but **many interfaces**. Since C# 8, default interface methods give a limited form of implementation inheritance; when two interfaces provide the same default member, the class must implement it explicitly.
