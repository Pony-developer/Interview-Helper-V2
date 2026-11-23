Writing the type twice gets tedious: `Dictionary<string, int> ages = new Dictionary<string, int>();`. With `var` you let the compiler work the type out from the value on the right:

```csharp
var count = 4;          // int
var price = 12.5;       // double
var name = "Ann";       // string
var isReady = true;     // bool
var big = 5L;           // long
var money = 9.99m;      // decimal
```

## var is still static typing

`var` is **not** a "any type" variable and it is not resolved at run time. The compiler picks the type once, at compile time, and from then on the variable behaves exactly as if you had written the type yourself. You can check what it picked:

```csharp
var x = 7;
var y = 7.0;
Console.WriteLine(x.GetType());   // System.Int32
Console.WriteLine(y.GetType());   // System.Double
```

The type comes from the **whole** right-hand side, so `var share = 7 / 2;` is an `int` holding `3`, and `var average = 7 / 2.0;` is a `double` holding `3.5`.

## The rules

1. The variable must be **initialized** in the same statement, otherwise there is nothing to infer from:

   ```csharp
   var a;          // error CS0818: Implicitly-typed variables must be initialized
   ```

2. The value cannot be a bare `null`, because `null` has no type:

   ```csharp
   var b = null;   // error CS0815: Cannot assign <null> to an implicitly-typed variable
   ```

3. The type never changes afterwards:

   ```csharp
   var c = 5;
   c = "five";     // error CS0029: Cannot implicitly convert type 'string' to 'int'
   ```

4. `var` works only for **local variables**. Method parameters, return types and fields still need an explicit type.

## When to use it

Use `var` when the type is obvious from the right side, or is long and noisy:

```csharp
var cities = new List<string>();   // the type is written right there
var total = 0;                     // clearly an int
```

Write the type explicitly when the right side does not reveal it, or when you want a type different from the default one:

```csharp
var result = Calculate();    // what does Calculate return? Hard to tell
double ratio = 1;            // var would give an int here; you want a double
long big = 5;                // var would give an int
```

Both styles compile to identical code, so this is purely about readability. Pick the one that makes the next reader's life easier.
