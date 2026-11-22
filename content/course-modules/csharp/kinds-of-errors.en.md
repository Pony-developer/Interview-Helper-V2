Every program has bugs at some point. They come in three kinds, and each is found differently.

## Compile errors

The compiler refuses to build the program. Nothing runs.

```csharp
int count = 4      // error CS1002: ; expected
string name = 42;  // error CS0029: Cannot implicitly convert type `int' to `string'
```

These are the friendliest errors: the compiler tells you the line, the column and what is wrong.

## Runtime errors (exceptions)

The program compiles but fails while running, and the runtime throws an **exception**:

```csharp
int zero = 0;
Console.WriteLine(10 / zero);        // DivideByZeroException
int n = int.Parse("forty-two");      // FormatException
int[] a = new int[3];
Console.WriteLine(a[3]);             // IndexOutOfRangeException
```

The message names the exception type and the **stack trace**, the chain of method calls that led to it. Read it from the top: the first line of your own code is usually where to look.

## Logic errors

The program runs and finishes, but the answer is wrong:

```csharp
double average = a + b + c / 3;   // divides only c by 3
```

No tool reports these for you. You find them by knowing what the result should be and checking it, by hand or with tests. Operator precedence and integer division are the usual suspects: `*`, `/` and `%` bind tighter than `+` and `-`, so add parentheses when in doubt.
