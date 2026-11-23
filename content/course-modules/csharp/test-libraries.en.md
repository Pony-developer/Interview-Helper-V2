The `Check` helper from the first lecture works, but every project would need to write it again, and it cannot find the tests for you, run them in isolation, or report what failed in a form that tools understand. A **test framework** does all that. You write test methods, and the framework discovers, runs and reports them.

> **Note.** The online runner in this course cannot load NuGet packages, so the framework examples here are for your own computer. The practice tasks use a plain `Check` helper, built on the same ideas.

## The three main frameworks for .NET

| | xUnit | NUnit | MSTest |
| --- | --- | --- | --- |
| A test class | any public class | `[TestFixture]` | `[TestClass]` |
| A test | `[Fact]` | `[Test]` | `[TestMethod]` |
| A test with data | `[Theory]` + `[InlineData]` | `[TestCase]` | `[DataRow]` |
| Before each test | the constructor | `[SetUp]` | `[TestInitialize]` |
| Check equality | `Assert.Equal(expected, actual)` | `Assert.That(actual, Is.EqualTo(expected))` | `Assert.AreEqual(expected, actual)` |

All three are mature and widely used. They differ in style, not in power. xUnit is the default in the `dotnet new` templates and in many open-source projects, MSTest ships with Visual Studio, and NUnit has the longest history. Pick the one your team already uses.

## The same test three times

```csharp
// xUnit
using Xunit;

public class CalculatorTests
{
    [Fact]
    public void Add_TwoNumbers_ReturnsSum()
    {
        int result = Calculator.Add(2, 3);
        Assert.Equal(5, result);
    }
}
```

```csharp
// NUnit
using NUnit.Framework;

[TestFixture]
public class CalculatorTests
{
    [Test]
    public void Add_TwoNumbers_ReturnsSum()
    {
        int result = Calculator.Add(2, 3);
        Assert.That(result, Is.EqualTo(5));
    }
}
```

```csharp
// MSTest
using Microsoft.VisualStudio.TestTools.UnitTesting;

[TestClass]
public class CalculatorTests
{
    [TestMethod]
    public void Add_TwoNumbers_ReturnsSum()
    {
        int result = Calculator.Add(2, 3);
        Assert.AreEqual(5, result);
    }
}
```

The test is **a method with an attribute**. If the method finishes, the test passes. If an assertion fails or an exception escapes, the test fails.

## Assertions

An **assertion** compares what you got with what you expect, and fails the test when they differ. The most common ones in xUnit:

```csharp
Assert.Equal(5, result);                 // equality: the EXPECTED value goes first
Assert.NotEqual(0, result);
Assert.True(list.Contains(3));
Assert.False(string.IsNullOrEmpty(name));
Assert.Null(user);
Assert.Contains("ann", names);
Assert.Empty(items);
Assert.Equal(0.3, 0.1 + 0.2, 10);        // doubles: compare to 10 decimal places
Assert.Throws<DivideByZeroException>(() => Calculator.Divide(1, 0));
```

Mind the order of the arguments: **expected first, actual second**. If you swap them, the test still passes or fails correctly, but the failure message will mislead you ("expected 4, but was 5" for the opposite situation).

## Where the libraries come from: NuGet

Libraries in .NET are distributed as **packages** on **NuGet**. A project lists its packages in its `.csproj` file, and the tools download them:

```text
dotnet add package FluentAssertions
```

A test project normally contains:

- the test framework (xUnit and its runner, for example);
- `Microsoft.NET.Test.Sdk`, which lets `dotnet test` and Visual Studio run the tests;
- a **reference** to the project that is being tested.

## Helper libraries

| Library | Purpose |
| --- | --- |
| **FluentAssertions** (or Shouldly) | readable assertions: `result.Should().Be(5)` |
| **Moq**, **NSubstitute** | create fake objects (mocks) to stand in for a database, a web service or a clock |
| **AutoFixture**, **Bogus** | generate test data |
| **Coverlet** | measures code coverage |
| **Testcontainers** | start a real database in a container for integration tests |
| **Playwright**, **Selenium** | drive a browser for end-to-end tests |

You do not need any of them to begin. The framework alone is enough for most unit tests.

## Choosing a library

Before adding a dependency, ask:

- Is it maintained, and does it support your .NET version?
- Does the team know it, or can learn it quickly?
- Does it solve a real problem you have now, or is it "just in case"?

Every library is more code to learn, update and, one day, replace. Start with the framework, and add helpers when a real need appears.
