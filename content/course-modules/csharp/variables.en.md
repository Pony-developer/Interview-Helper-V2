A **variable** is a named place in memory that holds a value. Every C# variable has a **type** (what it can hold) and a **name** (how you refer to it).

```csharp
int age = 25;          // declare and initialize
string city = "Kyiv";
double height;         // declare only
height = 1.68;         // assign later
```

## Declaring, assigning, reading

The pattern is `type name = value;`. The `=` sign is **assignment**, not mathematical equality: C# evaluates the right side first and stores the result in the variable on the left.

```csharp
int score = 10;
score = score + 5;          // read 10, add 5, store 15
Console.WriteLine(score);   // 15
```

Assigning one variable to another **copies** the value. The two variables stay independent:

```csharp
int a = 5;
int b = a;
a = 10;
Console.WriteLine(b);   // 5
```

You can declare several variables of one type in one statement, but one per line is easier to read:

```csharp
int x = 1, y = 2;
```

## Choosing a name

- Use letters, digits and `_`; the name cannot start with a digit and cannot contain spaces or `-`.
- Names are **case-sensitive**: `score` and `Score` are different variables.
- A keyword such as `class`, `int` or `static` cannot be a name.
- By convention local variables use **camelCase** (`totalPrice`), while types and methods use **PascalCase** (`Program`, `Main`).
- A good name says what the value means: `price` tells more than `x`.

## Use before assignment

C# refuses to read a local variable that might never have received a value:

```csharp
int total;
Console.WriteLine(total);   // error CS0165: Use of unassigned local variable 'total'
```

## Constants

A **constant** is a named value that can never change. Use it instead of a "magic number" repeated through the code:

```csharp
const double Vat = 0.2;
double price = 100;
Console.WriteLine(price * Vat);   // 20
Vat = 0.3;                        // error: a constant cannot be changed
```

## Scope

A variable exists from its declaration to the closing `}` of the block it was declared in:

```csharp
static void Main()
{
    int a = 1;
    {
        int b = 2;
        Console.WriteLine(a + b);   // 3
    }
    Console.WriteLine(b);   // error CS0103: The name 'b' does not exist in the current context
}
```

Inside the inner block you also cannot declare a second variable named `a` while the outer `a` is still in scope.
