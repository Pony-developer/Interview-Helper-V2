Some code is hard to test not because it is complex, but because it reads something the test does not control: the current time, a random number, the network, the file system. The cure is always the same: **make the hidden input an explicit dependency**, and give the test a double that it controls.

## Time

```csharp
public bool IsExpired(Subscription s)
{
    return s.EndsAt < DateTime.UtcNow;       // hidden input
}
```

A test of this method gives a different answer depending on when it runs, and it cannot check "what happens tomorrow" without waiting until tomorrow. Since .NET 8 the BCL has an abstraction for exactly this, the abstract class **`TimeProvider`**:

```csharp
public class SubscriptionChecker
{
    private readonly TimeProvider time;
    public SubscriptionChecker(TimeProvider time) { this.time = time; }

    public bool IsExpired(Subscription s) => s.EndsAt < time.GetUtcNow();
}

// Production: services.AddSingleton(TimeProvider.System);
```

The package `Microsoft.Extensions.TimeProvider.Testing` has **`FakeTimeProvider`**, a clock that stands still until the test moves it:

```csharp
var time = new FakeTimeProvider(new DateTimeOffset(2025, 3, 1, 12, 0, 0, TimeSpan.Zero));
var checker = new SubscriptionChecker(time);
var sub = new Subscription { EndsAt = time.GetUtcNow().AddDays(1) };

Assert.False(checker.IsExpired(sub));
time.Advance(TimeSpan.FromDays(2));
Assert.True(checker.IsExpired(sub));
```

`TimeProvider` also creates timers, and `Task.Delay` has an overload that takes one, so code with delays and timeouts becomes testable: `FakeTimeProvider.Advance` fires the timers that are due, and a test of "retry after 30 seconds" runs in a millisecond. On older .NET, the classic solution is your own `IClock` interface with one property, exactly what you build in the next practice.

The same idea applies to **random numbers** (inject a `Random` with a fixed seed, or an `IRandom`) and **ids** (an `IIdGenerator` instead of `Guid.NewGuid()` in the middle of logic).

## Asynchronous code

```csharp
[Fact]
public async Task Import_BadFile_Throws()
{
    var ex = await Assert.ThrowsAsync<FormatException>(() => importer.ImportAsync("bad.csv"));
    Assert.Equal("Line 3: missing price", ex.Message);
}
```

The rules:

- The test is `async Task`. Not `async void`: the framework cannot await it.
- `await` every call and every `Assert.ThrowsAsync`. A forgotten `await` makes a test that never checks anything.
- No `.Result` or `.Wait()`: they block a thread and can deadlock.
- Do not wait for background work with `Thread.Sleep(500)` or `Task.Delay`. Half a second is too long on your laptop, and not long enough on a busy build server. That is the most common source of **flaky tests**. Wait for a signal instead: a `TaskCompletionSource` that a fake completes, a `SemaphoreSlim`, or a loop that polls a condition with a generous timeout.
- Test cancellation explicitly: pass a cancelled token and expect `OperationCanceledException` (`Assert.ThrowsAnyAsync`, because `TaskCanceledException` is a subclass).

## HttpClient

`HttpClient` is not an interface, and mocking its methods is fragile. But every request goes through an **`HttpMessageHandler`**, and that you can replace:

```csharp
class StubHandler : HttpMessageHandler
{
    private readonly Func<HttpRequestMessage, HttpResponseMessage> respond;
    public readonly List<HttpRequestMessage> Requests = new List<HttpRequestMessage>();

    public StubHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) { this.respond = respond; }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        Requests.Add(request);
        return Task.FromResult(respond(request));
    }
}

[Fact]
public async Task GetRate_ReadsTheJson()
{
    var handler = new StubHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
    {
        Content = new StringContent("{\"rate\":0.92}")
    });
    var client = new HttpClient(handler) { BaseAddress = new Uri("https://rates.test/") };
    var rates = new RatesClient(client);

    decimal rate = await rates.GetRateAsync("USD", "EUR");

    Assert.Equal(0.92m, rate);
    Assert.Equal("/rates?from=USD&to=EUR", handler.Requests[0].RequestUri.PathAndQuery);
}
```

The test checks the real code of `RatesClient`: URL building, JSON parsing, and what happens on a 500 or a timeout (make the stub return or throw that). Libraries such as RichardSzalay.MockHttp and WireMock.Net give a fluent API for the same thing; WireMock.Net runs a real local HTTP server, useful for integration tests.

## Files, logs and configuration

- **Files.** Code that takes a `Stream` or a `TextReader` instead of a path is easy to test: pass a `MemoryStream` or a `StringReader`. For code that really works with directories, the `System.IO.Abstractions` package offers `IFileSystem` and an in-memory `MockFileSystem`.
- **Logging.** Pass `NullLogger<T>.Instance` when the test does not care. When a log entry *is* the behaviour (an audit warning), use `FakeLogger<T>` from `Microsoft.Extensions.Diagnostics.Testing` and check its collected records.
- **Options.** `Options.Create(new SmtpOptions { Host = "localhost" })` gives an `IOptions<T>` without any configuration files.

## Where the line is

Making everything injectable has a cost too. Do not wrap `Math.Max` or `string.Join` in interfaces: they are fast and deterministic. Inject what is **non-deterministic, slow or external**. If a class needs a clock, a random generator, three repositories and an HTTP client, the tests are telling you it does too many things.
