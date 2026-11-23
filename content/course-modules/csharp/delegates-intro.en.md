A **delegate** is a type that represents a method with a specific signature. A variable of a delegate type can hold any method that has the same parameters and return type.

## Declaring a delegate type

```csharp
delegate int Operation(int a, int b);     // a type: "a method that takes two ints and returns an int"

static int Add(int a, int b) { return a + b; }
static int Multiply(int a, int b) { return a * b; }

Operation op = Add;                       // the method is assigned, not called
Console.WriteLine(op(2, 3));              // 5: calling the delegate calls Add
op = Multiply;                            // the same variable now holds another method
Console.WriteLine(op(2, 3));              // 6
```

The declaration `delegate int Operation(int a, int b);` looks like a method without a body, with the keyword `delegate` in front. It defines a new type, and it can be declared inside or outside a class.

## Passing a delegate to a method

Now the earlier problem is solved. A method receives the rule as a parameter:

```csharp
static int Apply(Operation op, int x, int y)
{
    return op(x, y);                      // the method does not know which operation it runs
}

Console.WriteLine(Apply(Add, 10, 4));       // 14
Console.WriteLine(Apply(Multiply, 10, 4));  // 40
```

`Add` and `Multiply` are passed by name, without parentheses. The name of a method used as a value is converted to the delegate type. This conversion is called a **method group conversion**.

## Delegates are type-safe

The compiler checks that the method has the right signature. Passing a method that takes three parameters, or returns a `string`, is a compile error. Compare this with the string flag from the previous lecture, where a typo was found only at run time.

## Calling a delegate

`op(2, 3)` and `op.Invoke(2, 3)` do the same thing. The short form is the usual one.
