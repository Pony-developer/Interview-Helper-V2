You already know `[Fact]`, `[Theory]` and `Assert.Equal`. This lecture is about the questions that come next, in real projects and in interviews: when the test class is created, how to share expensive setup, how to feed data into tests, and what runs in parallel.

## A new instance for every test

xUnit creates **a new instance of the test class for every test**: for every `[Fact]`, and for every data row of a `[Theory]`. So:

- the **constructor** is the "before each test" setup;
- **`IDisposable.Dispose`** is the "after each test" cleanup;
- instance fields can never leak from one test into another.

```csharp
public class CartTests : IDisposable
{
    private readonly Cart cart = new Cart();     // fresh for every test

    public CartTests() { /* setup for each test */ }

    [Fact]
    public void NewCart_IsEmpty() { Assert.Empty(cart.Items); }

    public void Dispose() { /* cleanup after each test */ }
}
```

For asynchronous setup, implement `IAsyncLifetime`: `InitializeAsync` runs after the constructor, `DisposeAsync` after the test.

How the others do it:

- **NUnit** by default creates **one instance per fixture** and runs all its tests on it. Fields keep their values between tests, so state is reset in a `[SetUp]` method. (`[FixtureLifeCycle(LifeCycle.InstancePerTestCase)]` switches to the xUnit behaviour.)
- **MSTest** creates a new instance per test, like xUnit, and has `[TestInitialize]` / `[TestCleanup]`.

Static fields are shared by everything in the process in every framework. Avoid static mutable state in tests.

## Sharing expensive setup: fixtures

Starting a database container or building a large object graph for each test is too slow. xUnit shares such things through **fixtures**: plain classes that xUnit creates once and passes into the test class constructor.

```csharp
public class DatabaseFixture : IAsyncLifetime
{
    public string ConnectionString { get; private set; }
    public async Task InitializeAsync() { /* start the database, apply migrations */ }
    public async Task DisposeAsync() { /* stop it */ }
}

// One fixture for all the tests of this class
public class OrderRepositoryTests : IClassFixture<DatabaseFixture>
{
    private readonly DatabaseFixture db;
    public OrderRepositoryTests(DatabaseFixture db) { this.db = db; }
}
```

To share one fixture among **several classes**, define a collection:

```csharp
[CollectionDefinition("Database")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture> { }

[Collection("Database")]
public class OrderRepositoryTests { public OrderRepositoryTests(DatabaseFixture db) { } }

[Collection("Database")]
public class CustomerRepositoryTests { public CustomerRepositoryTests(DatabaseFixture db) { } }
```

| Scope | Created | Mechanism |
| --- | --- | --- |
| One test | before each test | constructor / `Dispose` |
| One class | before the first test of the class | `IClassFixture<T>` |
| Several classes | before the first test of the collection | `[Collection]` + `ICollectionFixture<T>` |
| The whole assembly (xUnit v3) | once per test run | `[assembly: AssemblyFixture(typeof(T))]` |

A shared fixture is shared state. Tests that use it must not depend on what other tests left behind: give each test its own data (unique ids, a fresh customer), or reset the state between tests.

## Data-driven tests

```csharp
[Theory]
[InlineData("", false)]
[InlineData("ann@example.com", true)]
[InlineData("ann@", false)]
public void IsValidEmail(string input, bool expected)
{
    Assert.Equal(expected, EmailValidator.IsValid(input));
}
```

`[InlineData]` accepts only compile-time constants. For anything else (objects, dates, `decimal`) use `[MemberData]`, which reads a static member:

```csharp
public static TheoryData<decimal, decimal, decimal> Discounts => new TheoryData<decimal, decimal, decimal>
{
    { 100m, 0.1m, 90m },
    { 50m, 0m, 50m },
};

[Theory]
[MemberData(nameof(Discounts))]
public void ApplyDiscount(decimal price, decimal rate, decimal expected) { /* ... */ }
```

`TheoryData<...>` is type-safe; a plain `IEnumerable<object[]>` works too. `[ClassData(typeof(MyCases))]` takes the rows from a separate class.

Every row is a **separate test** with its own result, so one bad row does not hide the others, unlike a loop inside a single test.

## Parallel runs

xUnit groups tests into **collections**. By default every test class is its own collection.

- Collections run **in parallel** with each other.
- Tests inside one collection run **one after another**.

So tests of different classes can run at the same time. Tests that touch the same shared resource (one database, one file, a static field) must either not interfere or be put into the same `[Collection]`. Parallelism can be switched off for an assembly with `[assembly: CollectionBehavior(DisableTestParallelization = true)]`, but slow, serial test runs are the price.

The **order** of tests is not defined either. A test that passes only after another test has run is a bug.

## Other everyday tools

```csharp
public class ImportTests
{
    private readonly ITestOutputHelper output;
    public ImportTests(ITestOutputHelper output) { this.output = output; }   // Console output is not captured

    [Fact(Skip = "Waiting for the new file format")]
    public void ImportsXml() { }

    [Fact]
    [Trait("Category", "Slow")]
    public async Task ImportsLargeFile()
    {
        output.WriteLine("Starting import");
        var ex = await Assert.ThrowsAsync<FormatException>(() => importer.ImportAsync("bad.csv"));
        Assert.Contains("line 3", ex.Message);
    }
}
```

- `Assert.Throws<T>` passes only for exactly `T`; `Assert.ThrowsAny<T>` accepts subclasses too. For async code use `await Assert.ThrowsAsync<T>(...)`: without `await` the check never happens.
- Traits let you choose what to run: `dotnet test --filter "Category!=Slow"`.
- Async tests return `Task`, never `async void`.

## xUnit v3

xUnit v3 (2024) keeps the same attributes, so most tests move over unchanged. Notable differences: a test project is built as an executable that you can run directly; `TestContext.Current` gives the current test's `CancellationToken` and output helper; `Assert.Skip(...)` skips a test at run time; `IAsyncLifetime` returns `ValueTask`; `async void` tests are rejected. Ask which version a project uses before you copy examples from the internet.

## What a runner does

Under the hood a test framework is a small program:

1. Load the test assembly and find public methods marked with test attributes (reflection).
2. For each test, create a new instance of its class (supplying fixtures to the constructor).
3. Call the method; for a theory, once for each data row.
4. An assertion that fails **throws an exception**. The runner catches it and records a failure; a method that returns normally has passed.
5. Dispose the instance, and report the results.

In the practice task you build exactly this runner.
