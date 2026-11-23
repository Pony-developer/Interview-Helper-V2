Starting a new project with tests is easy. The hard case is the project that already exists, with thousands of lines and no tests, and a team that is busy. This lecture is about introducing tests step by step.

## Start small, and start where it hurts

Do not stop everything to "write tests for the whole system". That will never be finished. Instead:

1. **A new feature**: write tests for it as you go.
2. **A bug fix**: write the test that reproduces the bug first, then fix it.
3. **A risky change**: before touching an old piece of code, add tests that describe what it does now.

After a few months, the parts of the code that change most, which are exactly the parts that need tests, are covered, without any "big testing project".

## Characterization tests for old code

For legacy code nobody understands, the first goal is not to decide what is **right**, but to record what the code **does**. This is called a **characterization test**:

1. Call the code with an input.
2. Look at what it returns.
3. Write a test that asserts exactly that.

The test does not say "this is correct", only "this is how it behaves today". You can now refactor safely: if a test turns red, you changed the behaviour, and you can decide whether that was intended.

## Making the code testable

Old code is often hard to test because it does everything in one place: it reads a file, calculates and prints at once. A few small steps help:

- **Separate** the calculation from the input and output: a method that takes values and returns a result can be tested, and a method that reads the console cannot.
- Pass **dependencies** (the time, a file, a service) in as parameters or interfaces.
- Break a huge method into smaller ones, and test the small ones.
- Avoid global (static) state that one test leaves for the next.

```csharp
// hard to test: reads the console and prints
static void Main()
{
    int age = int.Parse(Console.ReadLine());
    Console.WriteLine(age >= 18 ? "adult" : "minor");
}

// easy to test: a pure function
static string Classify(int age) => age >= 18 ? "adult" : "minor";
```

## Where the tests live

In .NET the usual layout is a **separate test project** next to the main one:

```text
Shop/
  Shop.Core/             the code
  Shop.Core.Tests/       the tests for it (references Shop.Core)
  Shop.sln
```

The tests are **not** shipped with the product. Inside the test project, mirror the structure of the code: `Calculator` is tested in `CalculatorTests`.

## Run them automatically

A test that nobody runs is useless. Make running tests automatic:

- **Locally**: before every commit, run the tests that are relevant to your change. Keep the whole suite fast enough to run often.
- **In continuous integration (CI)**: on every push or pull request, a server builds the project and runs all the tests. A change with red tests is not merged. A minimal GitHub Actions step is:

```yaml
- name: Test
  run: dotnet test --configuration Release
```

CI is where the "it works on my machine" problem ends.

## Healthy habits

- **Treat a red build as urgent.** The one broken test that everyone ignores turns the suite into noise.
- **Fix or delete flaky tests.** A flaky test passes and fails with the same code, because of timing, order, randomness or the network. It teaches people to rerun until green, and that destroys trust.
- **Keep tests fast.** A suite that runs in seconds gets run. One that runs in half an hour does not.
- **Review the tests** in code review, as carefully as the code.
- **Give tests clear names** and one reason to fail.
- **Delete tests that no longer make sense**, for instance when the requirement itself has changed.

## What to measure

Do not measure "the number of tests". Better questions are:

- How often do bugs reach production, and was there a test that could have caught them?
- How long does it take to learn that a change broke something?
- Does the team dare to refactor?
- How many tests are red, ignored or flaky right now?

## A first-week plan

1. Create a test project and run **one** trivial test through the whole chain: locally and in CI.
2. Add tests for the next bug that you fix.
3. Pick the most critical or the most complicated method, and cover it with the table of cases, including the borders.
4. Make the tests part of the definition of done: "the change is finished when there are tests, and they pass".

The goal is not a perfect suite in a week, but a habit that stays.
