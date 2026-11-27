"How do you understand SOLID?" (Q56) is best answered with a before/after for each letter. Here is one running example: an order checkout.

## S — Single responsibility

```csharp
// Before: one class, four reasons to change (pricing rules, persistence, PDF layout, email provider)
public class OrderProcessor
{
    public void Process(Order o) { /* calculate totals, save to SQL, render a PDF, send an email */ }
}

// After: each class has one job; OrderProcessor only coordinates
public class OrderProcessor(IPricing pricing, IOrderRepository repo, IInvoiceRenderer invoices, INotifier notifier)
{
    public async Task ProcessAsync(Order o)
    {
        o.Total = pricing.Calculate(o);
        await repo.SaveAsync(o);
        await notifier.SendAsync(o.CustomerEmail, invoices.Render(o));
    }
}
```

## O — Open/closed

```csharp
// Before: every new discount edits this method
decimal Discount(Order o) => o.Type switch { "vip" => 0.1m, "student" => 0.05m, _ => 0 };

// After: add a rule by adding a class
public interface IDiscountRule { decimal For(Order o); }
public class VipDiscount : IDiscountRule { public decimal For(Order o) => o.IsVip ? 0.1m : 0; }
public class Pricing(IEnumerable<IDiscountRule> rules)
{
    public decimal Discount(Order o) => rules.Max(r => r.For(o));
}
```

## L — Liskov substitution

A subtype must honour the base contract: no stronger preconditions, no weaker postconditions, no new exceptions. Classic violations: `Square : Rectangle`; a `ReadOnlyCollection` that throws on `Add` while being used as an `ICollection<T>`; an override that ignores a cancellation token or returns null where the base never did. Test: could every unit test of the base class pass with the subclass?

## I — Interface segregation

```csharp
// Before: clients that only read depend on Delete and Save, and fakes must implement everything
public interface IRepository<T> { T Get(int id); IEnumerable<T> All(); void Save(T x); void Delete(int id); }

// After
public interface IReader<T> { T Get(int id); IEnumerable<T> All(); }
public interface IWriter<T> { void Save(T x); void Delete(int id); }
```

## D — Dependency inversion

```csharp
// Before: business logic depends on details
public class ReportService { private readonly SqlConnection _db = new(...); private readonly SmtpClient _smtp = new(); }

// After: depends on abstractions it owns; details are plugged in at the composition root
public class ReportService(IReportData data, IEmailSender email) { ... }

builder.Services.AddScoped<IReportData, SqlReportData>();
builder.Services.AddSingleton<IEmailSender, SendGridEmailSender>();
```

DIP is the principle; **DI** (passing dependencies in) is the technique; a **DI container** is a tool that automates it. You can do DI without a container ("pure DI").

## Pure functions (Q58)

```csharp
// Impure: reads the clock and a static, writes to a log
decimal Price(Order o) { Log.Write("pricing"); return DateTime.Now.Hour < 9 ? o.Total * 0.9m : o.Total; }

// Pure: everything it needs comes in, the answer goes out
static decimal Price(decimal total, TimeOnly at) => at.Hour < 9 ? total * 0.9m : total;
```

Pure code is trivial to test (no mocks), safe to cache and to run in parallel, and easy to reason about. A practical architecture is a **functional core, imperative shell**: pure decision logic inside, I/O at the edges.

## Cohesion and coupling (Q60)

- **High cohesion**: everything in `OrderPricing` is about pricing. Low cohesion: a `Utils` class with dates, strings and HTTP helpers.
- **Low coupling**: `OrderService` knows `IPaymentGateway`, not Stripe's SDK types; modules talk through small, stable contracts or events.
- Smells of tight coupling: a change in one class forces changes in many others; you can't test a class without spinning up a database; circular project references.
