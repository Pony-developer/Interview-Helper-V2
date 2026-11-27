## A complete example with xUnit and a fake (Q51–53)

```csharp
public interface IClock { DateTime UtcNow { get; } }

public class DiscountService(IClock clock)
{
    public decimal Apply(decimal price) =>
        clock.UtcNow.DayOfWeek == DayOfWeek.Friday ? price * 0.8m : price;
}

public class DiscountServiceTests
{
    private sealed class FakeClock(DateTime now) : IClock { public DateTime UtcNow => now; }

    [Fact]
    public void Friday_gives_20_percent_off()
    {
        // Arrange
        var service = new DiscountService(new FakeClock(new DateTime(2026, 11, 27)));   // a Friday
        // Act
        var result = service.Apply(100m);
        // Assert
        Assert.Equal(80m, result);
    }

    [Theory]
    [InlineData(2026, 11, 23)]   // Monday
    [InlineData(2026, 11, 29)]   // Sunday
    public void Other_days_keep_the_price(int y, int m, int d)
    {
        var service = new DiscountService(new FakeClock(new DateTime(y, m, d)));
        Assert.Equal(100m, service.Apply(100m));
    }
}
```

Notice why the test is possible at all: `DateTime.UtcNow` is hidden behind `IClock` (since .NET 8 you can use the built-in `TimeProvider`). Code that reads the clock, the network or a static directly is hard to test — testability is a design property.

## Mocks with Moq

```csharp
var repo = new Mock<IOrderRepository>();
repo.Setup(r => r.GetAsync(42)).ReturnsAsync(new Order(42, total: 100m));
var email = new Mock<IEmailSender>();

var service = new OrderService(repo.Object, email.Object);
await service.ConfirmAsync(42);

email.Verify(e => e.SendAsync(It.Is<string>(s => s.Contains("42"))), Times.Once);
```

- **Stub/fake**: returns canned data. **Mock**: you also verify how it was called. Prefer checking results and state; verify calls only when the call *is* the behaviour (an email must be sent).
- Don't mock what you don't own deeply (EF `DbContext`, `HttpClient`): use an in-memory/test database or a fake `HttpMessageHandler`, or test that layer with integration tests.

## What makes a good test

**FIRST**: Fast, Independent (no shared state, any order), Repeatable (no real time, network, random without a seed), Self-validating (asserts, not console output to read), Timely (written with the code).

- Name tests after behaviour: `Withdraw_more_than_balance_throws`, `MethodName_State_ExpectedResult`.
- One logical behaviour per test; several asserts are fine if they check one outcome.
- Test edge cases: empty, null, zero, negative, boundaries (`<` vs `<=`), large inputs, duplicates.
- Test behaviour through the public API, not private methods or implementation details — then refactoring doesn't break tests.

## Pros and cons recap (Q52)

| Pros | Cons |
|---|---|
| Catch regressions in seconds | Time to write and maintain |
| Safe refactoring | Don't prove the parts work together |
| Living documentation | Over-mocked tests break on every refactoring |
| Drive a decoupled design (TDD) | 100% coverage ≠ no bugs; coverage can become a vanity metric |

Tools: xUnit / NUnit / MSTest, Moq / NSubstitute / FakeItEasy, FluentAssertions or Shouldly, coverlet for coverage, `dotnet test` in CI.
