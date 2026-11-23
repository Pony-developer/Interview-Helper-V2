**Code coverage** answers the question "how much of my code did the tests run?" A tool watches the program while the tests execute, and then reports which lines, branches and methods were reached and which never were.

## Reading a coverage number

```csharp
static string Describe(int n)
{
    if (n < 0)
    {
        return "negative";     // line A
    }
    if (n == 0)
    {
        return "zero";         // line B
    }
    return "positive";         // line C
}
```

With only one test, `Describe(5)`, the lines **A** and **B** never run. The line coverage is about 60%, and the report shows them in red. Add `Describe(-1)` and `Describe(0)`, and all the lines run.

The red lines tell you **what is certainly not tested**. This is the most useful thing a coverage report does.

## Kinds of coverage

| Kind | What it counts |
| --- | --- |
| **Line** (statement) | the lines of code that ran |
| **Branch** | the outcomes of the conditions: both `true` and `false` of each `if` |
| **Method** | the methods that were called at least once |

**Branch** coverage is stricter. Consider:

```csharp
static int Abs(int n)
{
    if (n < 0) n = -n;
    return n;
}
```

A test with `Abs(-5)` runs **every line**: 100% line coverage. But the case when the condition is false (`n >= 0`) never ran, so branch coverage is only 50%. A bug in that case would stay unnoticed.

## Getting the numbers in .NET

The xUnit template includes **Coverlet**. This command collects the data:

```text
dotnet test --collect:"XPlat Code Coverage"
```

It writes an XML file in the `TestResults` folder. Tools such as **ReportGenerator** turn it into a readable HTML report, and Visual Studio (Enterprise) and Rider can show the covered lines in the editor.

## Coverage is not quality

100% coverage means that every line **ran**. It does not mean that anything was **checked**:

```csharp
[Fact]
public void Add_Runs()
{
    Calculator.Add(2, 3);     // no assertion: the line is covered, nothing is verified
}
```

The test passes, the coverage is 100%, and `Add` could return anything. Coverage can prove that code is **not** tested, but it cannot prove that it **is**.

That is why a goal such as "80% coverage" is a poor target in itself. When a number becomes the target, people write tests that raise the number, not tests that find bugs.

## A sensible way to use it

- Look at the **uncovered** code, not at the percentage. Is it code that matters, such as logic with decisions, calculations and error handling? Test it.
- Do not chase 100%. Simple property getters, generated code and a plain `Main` are not worth the effort.
- Watch the **trend**: a sudden drop after a change is a good question for the code review.
- Focus on **branch** coverage of the important logic.

## Mutation testing: do the tests notice changes?

A more honest question is "if the code were wrong, would a test fail?" **Mutation testing** answers it automatically. A tool makes small deliberate changes to the code (**mutants**): `<` becomes `<=`, `+` becomes `-`, `true` becomes `false`, a statement is deleted. Then it runs the tests for each mutant.

- If some test fails, the mutant is **killed**: good.
- If all the tests still pass, the mutant **survived**: the tests do not notice this kind of bug.

The tool for .NET is **Stryker.NET**. The share of killed mutants (the mutation score) says more about the quality of your tests than line coverage does. It is slow, so it is used on the important parts of the code.

You can do a mutation test by hand: change `<` to `<=` in your code, and run the tests. If they stay green, a boundary test is missing. The practice task "Testing" in this module is built on exactly this idea: your tests must reject the buggy versions.
