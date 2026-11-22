A test is code that runs your code with a known input and checks the result. Tests turn "I think it works" into "it works for these cases", and they keep it working when you change things later.

## The simplest test

```csharp
static void Check(int actual, int expected, string name)
{
    Console.WriteLine((actual == expected ? "ok" : "FAIL") + ": " + name);
}

Check(Add(2, 3), 5, "small numbers");
Check(Add(-2, 2), 0, "opposite numbers");
```

Real projects use a test framework instead, such as **xUnit**, **NUnit** or **MSTest**. The idea is the same:

```csharp
[Fact]
public void Add_ReturnsSum()
{
    Assert.Equal(5, Calculator.Add(2, 3));
}
```

The framework finds every test, runs it and reports the ones that fail.

## What to test

Ordinary inputs are the easy part. Bugs hide at the edges:

- **empty** input: `""`, an empty array, an empty list;
- **one** element, the smallest case that isn't empty;
- **boundaries**: 0, negative numbers, `int.MaxValue`, the first and last index;
- **repeated** values, already-sorted and reverse-sorted data.

## Red, then green

When you find a bug, first write a test that fails because of it (**red**), then fix the code until the test passes (**green**). The test stays in the project and makes sure the bug never comes back.
