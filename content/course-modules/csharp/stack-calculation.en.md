Writing `2 + 3 * 4` the way people do requires precedence rules. A much simpler notation, **reverse Polish notation** (RPN), puts the operator **after** its operands: `3 4 + 2 *` means `(3 + 4) * 2`. There are no brackets and no precedence to remember, and a stack evaluates it directly:

- a number is pushed onto the stack;
- an operator pops two numbers, applies itself, and pushes the result back.

```csharp
static int EvaluateRpn(string expression)
{
    var stack = new Stack<int>();
    foreach (string token in expression.Split(' '))
    {
        if (token == "+" || token == "-" || token == "*")
        {
            int right = stack.Pop();          // the second operand is on top
            int left = stack.Pop();
            if (token == "+") stack.Push(left + right);
            else if (token == "-") stack.Push(left - right);
            else stack.Push(left * right);
        }
        else
        {
            stack.Push(int.Parse(token));
        }
    }
    return stack.Pop();
}

Console.WriteLine(EvaluateRpn("3 4 + 2 *"));    // 14
Console.WriteLine(EvaluateRpn("10 2 8 * + 3 -")); // 23
```

Trace `3 4 + 2 *`:

| Token | Stack after |
|---|---|
| `3` | `3` |
| `4` | `3 4` |
| `+` | `7` (pops 4 and 3, pushes 7) |
| `2` | `7 2` |
| `*` | `14` |

## The order of the two pops

`right` is popped **first**, because it was pushed last. For subtraction this matters: in `10 4 -`, the left operand is `10`, so `left - right` is `10 - 4 = 6`. Swapping the pops gives the wrong answer.

## Why this matters

Compilers and calculators turn ordinary notation into RPN (the shunting-yard algorithm) and then evaluate it with a stack. Stacks are the core of expression evaluation.
