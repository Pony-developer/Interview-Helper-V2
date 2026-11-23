A logic error is the sneakiest kind: the program compiles, runs to the end and prints a result, only the result is wrong. Nobody reports it for you. You notice it only because you know what the answer **should** have been.

## Start from an expected result

Before you debug, you need a case where you know the right answer. Work it out by hand:

- the average of `4`, `8` and `9` should be `7`;
- a 5 × 8 rectangle has the perimeter `26`.

If the program prints something else, you have a reproducible bug and a way to know when it is fixed. Also try the **edge cases**: zero, negative numbers, the smallest and the largest value, an empty string.

## The usual suspects

**Integer division**

```csharp
double half = 1 / 2;          // 0, not 0.5
double percent = 1 / 4 * 100; // 0, the division loses the fraction first
```

**Operator precedence**

```csharp
double average = a + b + c / 3;     // divides only c
double correct = (a + b + c) / 3.0;
```

**Off-by-one**: counting from 0 means the last position is `Length - 1`, not `Length`.

```csharp
string s = "abc";
char last = s[s.Length - 1];   // 'c'; s[s.Length] would throw an exception
```

**The wrong variable or operator**: a copy-pasted line where one name was not changed, or `-` where you meant `+`.

**Floating-point surprises**: `double` stores most decimal fractions approximately, so `0.1 + 0.2 == 0.3` is `False`. Do not compare doubles for exact equality, and use `decimal` for money.

**Using `=` where you meant `==`**: `=` assigns, `==` compares.

## How to hunt a logic error

1. **Reproduce it** with the smallest input that still shows the problem.
2. **Say what you expected and what you got**, and for which value the difference first appears.
3. **Print the intermediate values.** The simplest debugger is `Console.WriteLine`:

   ```csharp
   int sum = a + b + c;
   Console.WriteLine("sum = " + sum);          // 21
   double average = sum / 3;
   Console.WriteLine("average = " + average);  // 7
   ```

   Find the first line whose value differs from what you worked out by hand. The bug is on it, or just before it.
4. **Divide and conquer.** Split the work into smaller methods and check each one on its own.
5. **Explain the code aloud**, line by line, to a colleague or a rubber duck. Putting it into words often exposes the wrong assumption.
6. **Change one thing at a time**, and rerun after each change.

When the bug is fixed, keep the case that exposed it as a test. That is how you stop it from coming back.
