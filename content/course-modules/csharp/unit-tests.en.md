A **unit test** checks one small piece of code, usually a method, in isolation, quickly, and without any human judgement. A good set of them is a safety net: you change the code with confidence, because a broken behaviour is caught in seconds.

## Arrange, Act, Assert

Almost every test has three parts:

```csharp
[Fact]
public void Discount_TenPercentOff_ReducesPrice()
{
    // Arrange: prepare the input
    decimal price = 200m;

    // Act: call the code under test
    decimal result = Shop.ApplyDiscount(price, 10);

    // Assert: check the outcome
    Assert.Equal(180m, result);
}
```

Keep the parts visible, and keep the **act** to a single call. A test with several unrelated acts and assertions fails for confusing reasons.

## Naming

A test name should tell what broke before anyone opens the code. A popular pattern is **Method_Scenario_ExpectedResult**:

```text
Capitalize_EmptyString_ReturnsEmptyString
Divide_ByZero_ThrowsDivideByZeroException
IsLeapYear_Year1900_ReturnsFalse
```

When `IsLeapYear_Year1900_ReturnsFalse` is red on the build server, you already know a lot.

## What makes a good unit test

Remember the word **FIRST**:

- **Fast**: milliseconds, so that you run all of them often.
- **Isolated** (independent): a test does not depend on another test, and does not care about the order of execution.
- **Repeatable**: the same result every time, on every machine.
- **Self-validating**: passes or fails by itself, with no one reading the output.
- **Timely**: written together with the code, or even before it.

## Repeatable means no hidden inputs

A test must not depend on things that change:

- the **current time** (`DateTime.Now`);
- **random** numbers (use a fixed seed: `new Random(42)`);
- the **network**, a database, the file system, environment variables;
- the **culture** of the computer (pass `CultureInfo.InvariantCulture` when it matters).

When the code needs such a thing, give it a parameter or an interface so that a test can supply a fixed value:

```csharp
// hard to test: the result depends on today's date
static bool IsWeekend() => DateTime.Now.DayOfWeek >= DayOfWeek.Saturday;

// easy to test: the date is an argument
static bool IsWeekend(DateTime date) =>
    date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;
```

Code that is easy to test is usually also well designed: small methods, with explicit inputs and outputs.

## Testing for exceptions

A failure is a behaviour too, and it deserves a test:

```csharp
[Fact]
public void Divide_ByZero_Throws()
{
    Assert.Throws<DivideByZeroException>(() => Calculator.Divide(1, 0));
}
```

The `() => ...` is a **lambda**: a tiny method without a name. `Assert.Throws` runs it, and passes only if the expected exception occurs. A test that does not throw when it should has found a bug.

## Tests with data

When the same logic must be checked for many inputs, do not copy the test. Make it take parameters:

```csharp
[Theory]
[InlineData(2000, true)]
[InlineData(1900, false)]
[InlineData(2024, true)]
[InlineData(2023, false)]
public void IsLeapYear_ReturnsExpected(int year, bool expected)
{
    Assert.Equal(expected, Calendar.IsLeapYear(year));
}
```

The framework runs the method **once for each `InlineData`** and reports each case separately. Adding a case costs one line.

## The same idea in plain C#

Without a framework, a table of cases and a loop does the job. This is what the practice tasks do:

```csharp
int[] years =       { 2000, 1900, 2024, 2023 };
bool[] expected =   { true, false, true, false };

for (int i = 0; i < years.Length; i++)
{
    bool actual = IsLeapYear(years[i]);
    Console.WriteLine((actual == expected[i] ? "ok" : "FAIL") + ": " + years[i]);
}
```

## Fakes instead of the real world

A unit test should not send a real email or charge a real card. The code under test talks to an **interface**, and the test gives it a **fake** (a stub or a mock) that returns prepared answers and records what it was asked:

```csharp
interface IClock { DateTime Now { get; } }

class FixedClock : IClock
{
    public DateTime Now => new DateTime(2026, 1, 1);
}
```

Libraries such as Moq create such fakes for you.

## Things to avoid

- **Logic in tests**: loops and `if`s make a test hard to trust. The test must be simpler than the code it checks.
- **Testing private details**: test the public behaviour, so that refactoring does not break tests.
- **Tests that depend on each other**: a shared state that one test leaves for the next.
- **Assertions on everything**: check what matters for this scenario, and no more.
- **Ignoring a failing test** instead of fixing it. A suite with "known failures" teaches everyone to ignore red.
