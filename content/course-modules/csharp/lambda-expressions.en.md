A **lambda expression** is the shortest way to write a delegate. It has the form `parameters => body`:

```csharp
Func<int, int> square = x => x * x;            // one parameter, expression body
Func<int, int, int> add = (a, b) => a + b;     // two parameters
Action<string> say = s => Console.WriteLine(s);  // no result

Console.WriteLine(square(7));                  // 49
Console.WriteLine(add(2, 5));                  // 7
say("hi");                                     // hi
```

The arrow `=>` reads as "goes to". On the left are the parameters; on the right is the body. If the body is a single expression, its value is the result of the lambda, and no `return` is written.

## Parameter lists

```csharp
x => x * 2                  // one parameter: no parentheses needed
(x) => x * 2                // the same, with parentheses
(a, b) => a + b             // two parameters
() => 42                    // no parameters: the parentheses are required
(int a, int b) => a + b     // the types can be written, but usually they are not
```

The compiler knows the types from the delegate it is converted to, so the types are usually left out.

## Block bodies

When the body needs several statements, use braces and `return`:

```csharp
Func<int, bool> isEven = n =>
{
    int remainder = n % 2;
    return remainder == 0;
};
```

## Where lambdas appear

```csharp
var numbers = new List<int> { 5, 12, 7, 30 };
int firstBig = numbers.Find(n => n > 10);      // 12
numbers.RemoveAll(n => n < 10);                // removes 5 and 7
```

Wherever a method expects a delegate, you can pass a lambda directly. The next lecture shows more examples.
