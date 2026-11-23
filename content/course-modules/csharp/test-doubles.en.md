A unit test should check one piece of code, quickly and repeatably. Real code, though, talks to databases, web APIs, e-mail servers and the clock. A **test double** is an object that stands in for such a dependency during a test, the way a stunt double stands in for an actor. The name and the classification come from Gerard Meszaros's book *xUnit Test Patterns*, and interviewers often ask about them.

> **Note.** The online runner in this course cannot load NuGet packages, so the library examples in this module are for your own computer. The practice tasks build the same ideas by hand.

## The five kinds of doubles

The examples use this service: it charges a customer and e-mails a receipt.

```csharp
public interface IPaymentGateway { bool Charge(string card, decimal amount); }
public interface IMailer { void Send(string to, string text); }
public interface IAuditLog { void Write(string entry); }

public class CheckoutService
{
    public CheckoutService(IPaymentGateway gateway, IMailer mailer, IAuditLog audit) { /* ... */ }
    public bool Pay(string email, string card, decimal amount) { /* ... */ }
}
```

| Double | What it does | Example |
| --- | --- | --- |
| **Dummy** | Is passed only to fill a parameter; never really used | `null` or an empty `IAuditLog` in a test that does not care about auditing |
| **Stub** | Returns prepared answers to the code under test | a gateway whose `Charge` always returns `false` |
| **Spy** | A stub that also records how it was called; the test checks the records afterwards | a mailer that adds every message to a `List<string>` |
| **Mock** | Is told in advance which calls to expect, and the test verifies them | "`Send` must be called once with `ann@example.com`" |
| **Fake** | A working, simplified implementation | an in-memory repository, a fake clock |

A hand-written stub and spy are often just a few lines:

```csharp
class DecliningGateway : IPaymentGateway          // stub
{
    public bool Charge(string card, decimal amount) { return false; }
}

class SpyMailer : IMailer                         // spy
{
    public readonly List<string> Sent = new List<string>();
    public void Send(string to, string text) { Sent.Add(to + ": " + text); }
}

[Fact]
public void Pay_DeclinedCard_SendsNoReceipt()
{
    var mailer = new SpyMailer();
    var service = new CheckoutService(new DecliningGateway(), mailer, new NullAuditLog());

    bool paid = service.Pay("ann@example.com", "4111", 10m);

    Assert.False(paid);
    Assert.Empty(mailer.Sent);
}
```

In everyday speech people call all of these "mocks", and libraries such as Moq create every kind with one class. In an interview, show that you know the difference: **a stub feeds data in, a mock (or spy) checks what came out as calls.**

## State verification and behaviour verification

There are two ways to check the result:

- **State verification**: run the code, then look at the result or the state: the returned value, what the fake repository now contains.
- **Behaviour verification**: check that the code made the right calls to its dependencies: `Send` was called once with these arguments.

Prefer state where you can. A test that checks the result survives refactoring: you can rename private methods, merge two calls into one, add caching, and the test still passes as long as the behaviour is right. Check calls when **the call is the result**: sending an e-mail, publishing a message, charging a card. Nothing else shows that it happened.

## Two schools

- The **classical** (Detroit) school uses real objects wherever they are fast and deterministic, and replaces only what is slow, shared or out of the process: the database, the network, the file system, the clock. A "unit" is a unit of behaviour, which may span several classes.
- The **mockist** (London) school isolates each class: every collaborator is replaced with a mock, and tests mostly verify interactions.

Mockist tests point exactly at the broken class, but they know a lot about how the code is wired, so they break when the wiring changes. Most teams today lean classical: mock at the edges of the system, not between your own classes.

## What to replace and what not to

Replace:

- **Out-of-process dependencies you do not control**: payment providers, e-mail and SMS services, third-party APIs, message buses.
- **Non-deterministic inputs**: the clock, random numbers, `Guid.NewGuid()`.
- **Slow things**, when the test is about something else.

Do not replace:

- **Values and pure logic**: `Money`, `DateRange`, a price calculator. Use the real thing.
- **Your own database**, in the tests of data access code. A mocked `DbContext` proves nothing about your SQL; use an integration test (see the last lecture of the module).
- **Types you do not own**, by mocking their methods one by one. A mock of `HttpClient` or of an SDK client encodes your guess of how the library behaves. Wrap the library in your own small interface (`IExchangeRates`) and mock that, or use the library's own test helpers.

## Warning signs

- The test sets up more mocks than it has lines of real assertions.
- A mock returns a mock that returns a mock (`repo.GetUnitOfWork().GetSession().Query()`): the code under test knows too much about its neighbours.
- Verifying calls that are not part of the result, such as "the logger was called twice".
- Each refactoring breaks dozens of tests while the program works.

A test that needs many doubles is usually telling you something about the design: the class does too much or depends on too many things.
