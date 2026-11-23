A stack is the natural tool for **matching brackets**. Each opening bracket waits on the stack. A closing bracket must match the **most recent** open one, which is exactly what LIFO gives.

The text `(a + [b * {c}])` is correct, and `(a + [b)]` is not:

```csharp
static bool IsBalanced(string text)
{
    var open = new Stack<char>();
    foreach (char c in text)
    {
        if (c == '(' || c == '[' || c == '{')
        {
            open.Push(c);                         // wait for the closing bracket
        }
        else if (c == ')' || c == ']' || c == '}')
        {
            if (open.Count == 0)
            {
                return false;                     // a closing bracket with nothing open
            }
            char last = open.Pop();
            if (!Matches(last, c))
            {
                return false;                     // closed the wrong kind
            }
        }
    }
    return open.Count == 0;                       // anything still open is an error
}

static bool Matches(char open, char close)
{
    return (open == '(' && close == ')')
        || (open == '[' && close == ']')
        || (open == '{' && close == '}');
}
```

Trace `([)]`: `(` and `[` are pushed. `)` arrives, but the top is `[`, so `Matches` fails and the answer is `false`. A counter alone cannot catch this, because it would see two opening and two closing brackets.

## Why a stack and not a counter

A counter tells you **how many** brackets are open, but not **which** ones. The stack keeps the order, and the order decides whether the brackets are nested correctly. This pattern appears in compilers (checking the code), in editors (highlighting) and in parsers of formulas.
