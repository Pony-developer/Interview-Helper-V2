A delegate lets the program choose the behaviour **while it runs**. A common form is a table that maps a name to a delegate, for example the commands of a calculator:

```csharp
delegate int Operation(int a, int b);

static int Add(int a, int b) { return a + b; }
static int Subtract(int a, int b) { return a - b; }
static int Multiply(int a, int b) { return a * b; }

var commands = new Dictionary<string, Operation>
{
    { "add", Add },
    { "sub", Subtract },
    { "mul", Multiply }
};

string input = "mul";                       // could come from the user
if (commands.ContainsKey(input))
{
    Console.WriteLine(commands[input](6, 7));   // 42
}
```

There is no `if` or `switch` on the command name. Adding a new command means adding one line to the table. The rest of the program does not change.

## Instance methods too

A delegate can hold a method of an object, not only a static one. The object is remembered together with the method:

```csharp
class Counter
{
    private int total;

    public int Add(int x)
    {
        total += x;
        return total;
    }
}

var counter = new Counter();
Operation1 f = counter.Add;              // the object "counter" is remembered
Console.WriteLine(f(5));                 // 5
Console.WriteLine(f(5));                 // 10: the same object is used
```

For a delegate type with one `int` parameter and an `int` result, we would write `delegate int Operation1(int x);`. The delegate remembers the object, so each call works on the same counter.

## Where it is used

- commands and menu actions;
- plug-in systems, where the program loads behaviour from outside;
- callbacks: "call me when the work is done";
- event handlers, which the later lectures touch on.
