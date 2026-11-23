One test is better than none, but a method with a dozen possible behaviours needs more than one. The question is **which** tests to add, because you cannot try every input.

## Equivalence classes and boundaries

Inputs fall into groups that the code treats **the same way**. One representative of each group is enough. The bugs, however, live on the **borders** between the groups, so test the values on both sides of each border.

Take a ticket price: children under 6 are free, up to and including 17 pay 5, adults pay 10, and from 65 pay 7.

```text
age:      ...  5 | 6 ...... 17 | 18 ...... 64 | 65 ...
price:         0     5            10            7
```

| Group | Representative | Borders |
| --- | --- | --- |
| free | 3 | 5 and 6 |
| child | 10 | 6 and 17 |
| adult | 30 | 17 and 18 |
| senior | 70 | 64 and 65 |

The border tests, `5, 6, 17, 18, 64, 65`, are the ones that catch `<` written instead of `<=`, which is the most common mistake in this kind of code.

Do not forget the **invalid** group: a negative age, or 200. What should happen? An error, or an answer? Write down the decision, and test it.

## Typical cases to remember

- **Empty**: `""`, an empty array, `0`.
- **One** element.
- **Many** elements, and the case when all of them are equal.
- **Negative** numbers and zero.
- The **largest** and **smallest** values (`int.MaxValue` can overflow).
- **Order**: already sorted, reversed, random.
- **Duplicates**, and the case when there is nothing to find.
- **Special characters**: spaces, tabs, line breaks, Unicode, upper and lower case.
- `null`, when the code accepts it.

## Positive and negative tests

A **positive** test checks that valid input produces the right result. A **negative** test checks that **invalid** input is handled properly: an exception, an error message, a default value. A suite with only positive tests says nothing about what happens when something goes wrong, and that is where production incidents come from.

## A table of cases

Collect the cases in a table, and the test itself stays short. A new bug then costs one new row:

```csharp
string[] inputs   = { "hello",  "a", "Already", "",  " x" };
string[] expected = { "Hello",  "A", "Already", "",  " x" };

for (int i = 0; i < inputs.Length; i++)
{
    string actual = Capitalize(inputs[i]);
    string status = actual == expected[i] ? "ok" : "FAIL";
    Console.WriteLine(status + ": \"" + inputs[i] + "\" -> \"" + actual + "\"");
}
```

In a framework the same table is `[InlineData(...)]` lines on a `[Theory]`.

## Properties instead of examples

Sometimes you cannot list the right answers, but you know something that must **always** be true:

- reversing a string twice returns the original;
- a sorted array has the same length and the same elements as the input, and each element is not greater than the next;
- `Encrypt` followed by `Decrypt` returns the original text;
- the discount never makes the price negative.

Such a rule can be checked on many inputs, even generated ones. With a **fixed** seed, so that a failure can be repeated:

```csharp
var random = new Random(42);
for (int i = 0; i < 1000; i++)
{
    int n = random.Next(0, 10000);
    if (ReverseNumber(ReverseNumber(n)) != n && n % 10 != 0)
    {
        Console.WriteLine("FAIL: " + n);
    }
}
```

## Tests that change the input

Check that a method does not damage the data it was given. A function that sorts a copy must leave the original untouched, and a test for it compares the array before and after:

```csharp
int[] data = { 3, 1, 2 };
int[] sorted = SortedCopy(data);
// data must still be { 3, 1, 2 }
```

## A bug is a test you did not have

Every time you fix a bug, first add the test that reproduces it. It will fail (red). Fix the code, and the test passes (green). The suite grows exactly where the code has proved weak, and the same mistake cannot return unnoticed.

## When is it enough?

There is no number. Ask:

- Does every **branch** (`if`, `else`, `case`) of the method run in some test?
- Is each **boundary** tested on both sides?
- Is there a test for each **kind of failure** that the method can report?
- If I changed `<` to `<=` or `+` to `-` somewhere in the code, would some test turn red?

The last question is the most honest one, and the next lectures come back to it.
