Branches are where programs most often misbehave: they compile, they run, and they sometimes take the wrong road. Here are the mistakes that appear again and again.

## 1. `=` instead of `==`

```csharp
int x = 5;
if (x = 10) { }    // error CS0029: cannot convert int to bool
```

With an `int`, the compiler catches it. With a `bool`, it does not, because an assignment has the value that was assigned:

```csharp
bool done = false;
if (done = true)   // compiles (with a warning): assigns true, then the condition is always true
{
    Console.WriteLine("always runs");
}
```

## 2. A semicolon after the condition

```csharp
if (x > 0);
    Console.WriteLine("positive");   // runs for every x
```

The `;` is an empty statement, so the `if` governs nothing, and the next line is just an ordinary statement. The compiler warns about a "possible mistaken empty statement". Read your warnings.

## 3. Missing braces

```csharp
if (x > 0)
    Console.WriteLine("positive");
    Console.WriteLine("and I checked");   // NOT part of the if
```

Indentation misleads you, but the compiler ignores it. Without braces, the `if` governs only **one** statement. Use braces always, even for a single statement.

## 4. The dangling else

```csharp
if (a > 0)
    if (b > 0)
        Console.WriteLine("both");
else
    Console.WriteLine("???");
```

An `else` belongs to the **nearest** `if` before it, so this `else` is paired with `b > 0`, not with `a > 0`, whatever the indentation suggests. Braces remove the doubt.

## 5. Conditions in the wrong order

Branches are checked from top to bottom, and the first match wins:

```csharp
if (score >= 50) grade = "pass";
else if (score >= 90) grade = "excellent";   // unreachable: 95 is caught by the first branch
```

Start with the most specific condition (`>= 90`), then the broader ones.

## 6. Off-by-one at the boundary

`>` or `>=`? `<` or `<=`? Decide what must happen **at** the boundary value. Is a 18-year-old an adult (`age >= 18`)? Is a 1000-point score enough for a bonus (`> 1000` or `>= 1000`)? Always test the boundary itself and the values on both sides of it.

## 7. Chained comparisons and half-conditions

```csharp
if (1 < x < 10) { }        // does not compile
if (x == 1 || 2) { }       // does not compile
if (x == 1 || x == 2) { }  // correct
if (x > 1 || x < 10) { }   // compiles, but is true for every x
```

The last one is the most dangerous, because it is valid and wrong. For "between", use `&&`.

## 8. Comparing strings carelessly

```csharp
if (answer == "yes") { }   // "Yes" and "YES" do not match
if (answer.ToLower() == "yes") { }
```

Normalize the input (`Trim`, `ToLower`) before comparing it. Check for `null` before calling methods on it.

## 9. Comparing doubles with `==`

`0.1 + 0.2 == 0.3` is `False`. Use a tolerance, as described in the lecture on floating-point numbers.

## 10. A path without a result

```csharp
static string Sign(int x)
{
    if (x > 0) return "positive";
    if (x < 0) return "negative";
    // error CS0161: not all code paths return a value
}
```

The compiler cannot be sure that one of the conditions is true, so it asks for a final `return` for the remaining case.

## 11. Duplicated code in the branches

```csharp
if (isMember)
{
    Console.WriteLine("Total: " + price * 0.9);
    Console.WriteLine("Thank you!");
}
else
{
    Console.WriteLine("Total: " + price);
    Console.WriteLine("Thank you!");
}
```

Anything that is the same in every branch belongs **outside**. Compute only what differs inside the `if`.

## A checklist for every `if`

- Does each branch have a case I have actually tested?
- Did I test each boundary value, and the values on both sides?
- Do the branches cover **all** the possibilities, including the unexpected one (`else` or `default`)?
- Are the conditions in the right order?
- Could an early `return` make it simpler?
