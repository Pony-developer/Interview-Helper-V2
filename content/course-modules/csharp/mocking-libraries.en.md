Writing a stub class for every test gets tedious when an interface has ten methods. A **mocking library** creates a double for you at run time. The two most popular in .NET are **Moq** and **NSubstitute**. They do the same job with different syntax.

## Moq

```csharp
using Moq;

[Fact]
public void Pay_SuccessfulCharge_SendsReceipt()
{
    // Arrange
    var gateway = new Mock<IPaymentGateway>();
    gateway.Setup(g => g.Charge("4111", 10m)).Returns(true);
    var mailer = new Mock<IMailer>();
    var service = new CheckoutService(gateway.Object, mailer.Object, Mock.Of<IAuditLog>());

    // Act
    bool paid = service.Pay("ann@example.com", "4111", 10m);

    // Assert
    Assert.True(paid);
    mailer.Verify(m => m.Send("ann@example.com", It.Is<string>(t => t.Contains("10"))), Times.Once());
}
```

- `new Mock<T>()` creates the double; `.Object` is the instance you pass to the code.
- `Setup(...).Returns(...)` makes it a stub. A call that was not set up returns a default value (`false`, `0`, `null`, an empty collection).
- `Verify(..., Times.Once())` makes it a mock: the test fails if the call did not happen exactly once.
- `Mock.Of<T>()` is a quick dummy.

Other things you will meet:

```csharp
gateway.Setup(g => g.Charge(It.IsAny<string>(), It.Is<decimal>(a => a > 1000m))).Returns(false);
gateway.Setup(g => g.Charge("0000", It.IsAny<decimal>())).Throws<TimeoutException>();
rates.Setup(r => r.GetAsync("USD", "EUR")).ReturnsAsync(0.92m);
queue.SetupSequence(q => q.Next()).Returns("a").Returns("b").Throws<InvalidOperationException>();
mailer.Setup(m => m.Send(It.IsAny<string>(), It.IsAny<string>()))
      .Callback<string, string>((to, text) => sent.Add(to));
mailer.Verify(m => m.Send(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
```

By default a mock is **loose**: unexpected calls just return defaults. `new Mock<T>(MockBehavior.Strict)` throws on any call that was not set up. Strict mocks catch surprises, but they also break on harmless changes, so loose is the usual choice.

## NSubstitute

The same test with NSubstitute reads closer to plain C#:

```csharp
using NSubstitute;

var gateway = Substitute.For<IPaymentGateway>();
gateway.Charge("4111", 10m).Returns(true);
var mailer = Substitute.For<IMailer>();
var service = new CheckoutService(gateway, mailer, Substitute.For<IAuditLog>());

bool paid = service.Pay("ann@example.com", "4111", 10m);

Assert.True(paid);
mailer.Received(1).Send("ann@example.com", Arg.Is<string>(t => t.Contains("10")));
```

| | Moq | NSubstitute |
| --- | --- | --- |
| Create | `new Mock<T>()`, then `.Object` | `Substitute.For<T>()` |
| Return a value | `.Setup(x => x.M()).Returns(5)` | `x.M().Returns(5)` |
| Any argument | `It.IsAny<int>()` | `Arg.Any<int>()` |
| Argument by condition | `It.Is<int>(n => n > 0)` | `Arg.Is<int>(n => n > 0)` |
| Check a call | `.Verify(x => x.M(), Times.Once())` | `x.Received(1).M()` |
| Check no call | `Times.Never()` | `x.DidNotReceive().M()` |
| Throw | `.Throws<E>()` | `.Throws<E>()` (from `NSubstitute.ExceptionExtensions`) |

Which one to pick is a matter of team taste. Moq is the most widespread. In 2023 one Moq release shipped a controversial telemetry dependency (SponsorLink); it was removed in the next patch, but some teams moved to NSubstitute after that. Either way, know how to read both.

## How they work, and what they cannot do

Both libraries generate a **subclass at run time** (a dynamic proxy, built with Castle DynamicProxy) that overrides the members of your type. A subclass can override only what is overridable, so the libraries can mock:

- interfaces (the normal case);
- `virtual` and `abstract` members of classes.

They **cannot** mock `sealed` classes, `static` methods, non-virtual methods, constructors or extension methods. If the code calls `File.ReadAllText`, `DateTime.Now` or a static helper directly, no mocking library can replace it. The fix is in the design: put the dependency behind an interface (or an abstract class such as `TimeProvider`) and inject it. Tools that rewrite IL at run time (Microsoft Fakes, Pose) can replace statics, but they are slow and exotic; needing them is a design smell.

> A common pitfall: setting up a non-virtual method of a class with Moq compiles, but throws `NotSupportedException` at run time ("Non-overridable members may not be used in setup").

## Fakes beat mocks for state

For a dependency with real behaviour, such as a repository, a small hand-written fake is often clearer than a mock:

```csharp
class InMemoryOrders : IOrderRepository
{
    private readonly Dictionary<int, Order> orders = new Dictionary<int, Order>();
    public void Save(Order order) { orders[order.Id] = order; }
    public Order Find(int id) { Order o; return orders.TryGetValue(id, out o) ? o : null; }
}
```

You write it once and reuse it in a hundred tests, and those tests check state ("the order is saved as Paid") instead of calls ("`Save` was called with an order whose `Status` was `Paid`"). Keep mocking libraries for the edges: notifications, gateways, things whose only effect is the call.

## Arrange, Act, Assert with doubles

A test with doubles still has three parts:

1. **Arrange**: create the doubles and set up the stubbed answers.
2. **Act**: one call to the code under test.
3. **Assert**: check the result, and verify only the calls that matter.

If the Arrange part grows to twenty lines, extract a helper (`CreateService(gateway: ...)`) or a test data builder, so that each test shows only what is special about it.
