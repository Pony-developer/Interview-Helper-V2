A step-by-step tutorial for creating a project with tests and running them on your own computer. You need the **.NET SDK** (version 6 or later); check it with `dotnet --version`.

> The online runner of this course cannot run these steps, so do them on your computer, in a terminal.

## 1. Create the projects

```text
dotnet new sln -n Shop
dotnet new classlib -n Shop.Core
dotnet new xunit -n Shop.Tests
dotnet sln add Shop.Core Shop.Tests
dotnet add Shop.Tests reference Shop.Core
```

What each line does:

1. creates a solution file `Shop.sln`, a container for the projects;
2. creates a class library `Shop.Core`, which is the code to be tested;
3. creates a test project `Shop.Tests` with xUnit already configured;
4. adds both projects to the solution;
5. lets the tests see the code: it adds a **reference** from `Shop.Tests` to `Shop.Core`.

## 2. Write some code

Delete the generated `Class1.cs` in `Shop.Core` and add `Calculator.cs`:

```csharp
namespace Shop.Core;

public static class Calculator
{
    public static int Add(int a, int b) => a + b;

    public static int Divide(int a, int b) => a / b;
}
```

Note `public`: the test project is another assembly, and it sees only what is public.

## 3. Write the tests

Rename `UnitTest1.cs` in `Shop.Tests` to `CalculatorTests.cs`:

```csharp
using Shop.Core;
using Xunit;

namespace Shop.Tests;

public class CalculatorTests
{
    [Fact]
    public void Add_TwoNumbers_ReturnsSum()
    {
        Assert.Equal(5, Calculator.Add(2, 3));
    }

    [Theory]
    [InlineData(1, 1, 2)]
    [InlineData(-1, 1, 0)]
    [InlineData(0, 0, 0)]
    public void Add_Various_ReturnsExpected(int a, int b, int expected)
    {
        Assert.Equal(expected, Calculator.Add(a, b));
    }

    [Fact]
    public void Divide_ByZero_Throws()
    {
        Assert.Throws<DivideByZeroException>(() => Calculator.Divide(1, 0));
    }
}
```

## 4. Run them

From the folder with `Shop.sln`:

```text
dotnet test
```

The tool builds the solution, finds the tests and runs them. A successful run ends with a summary such as:

```text
Passed!  - Failed:     0, Passed:     5, Skipped:     0, Total:     5
```

Five tests: one `[Fact]`, three `[InlineData]` cases, and one more `[Fact]`.

## 5. Read a failure

Change `Add` to `a - b`, and run again:

```text
  Failed Shop.Tests.CalculatorTests.Add_TwoNumbers_ReturnsSum [12 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: 5
Actual:   -1
  Stack Trace:
     at Shop.Tests.CalculatorTests.Add_TwoNumbers_ReturnsSum() in ...CalculatorTests.cs:line 12
```

Read from the top:

1. **Which test** failed: the full name tells you the class and the scenario.
2. **Expected and actual**: what you wanted, and what the code gave.
3. **The line** in the test where the assertion failed. From there, go to the code under test.

Then fix the code (not the test, unless the test was wrong) and run again.

## 6. Useful options

```text
dotnet test --filter "FullyQualifiedName~Divide"     # only the tests whose name contains Divide
dotnet test --filter "DisplayName~ByZero"            # by display name
dotnet test --no-build                               # skip the build step
dotnet test --logger "console;verbosity=detailed"    # the name of every test
dotnet test --collect:"XPlat Code Coverage"          # collect coverage data
dotnet watch test                                    # rerun on every file change
```

`dotnet watch test` is great for the red-green loop: save the file, and the result appears in the terminal.

## 7. Running tests in an editor

**Visual Studio**: open the solution and choose **Test > Test Explorer**. You can run all the tests (`Ctrl+R, A`), run the tests in one class, run only the failed ones, and **debug** a single test: right-click it and choose *Debug*, with a breakpoint set as you learned in the lecture on debugging.

**Visual Studio Code**: install **C# Dev Kit**. The **Testing** view (a flask icon) lists the tests, and small run and debug icons appear next to each test method in the editor.

**JetBrains Rider**: green icons in the gutter next to each test and class, and a *Unit Tests* window.

## 8. Common problems

| Symptom | Likely cause |
| --- | --- |
| "No test is available" | the method is not public, has no `[Fact]`/`[Test]`, or the test SDK package is missing |
| `The type or namespace name 'Calculator' could not be found` | no project reference to `Shop.Core`, a missing `using`, or the class is not `public` |
| the test passes alone and fails with the others | the tests share some state: make them independent |
| fails only on another computer or in CI | a hidden input: the time, the culture, a path, an environment variable |
| the build fails with "target framework" errors | the projects use incompatible versions of .NET: check `TargetFramework` in the `.csproj` files |
| old results after a change | the build is stale: run `dotnet clean`, then `dotnet test` |

## 9. A good loop

1. Write a failing test. Run it and see the **red**.
2. Write the simplest code that makes it pass. Run it and see the **green**.
3. Clean up, and run all the tests again.
4. Commit.

Short cycles, run often: that is what makes tests a help instead of a chore.
