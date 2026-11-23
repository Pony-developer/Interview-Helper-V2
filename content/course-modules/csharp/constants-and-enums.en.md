Numbers and strings with a hidden meaning make code fragile. Is `2` a status, a month, a number of retries? Constants and enums give those values a name that the compiler checks.

## Constants

You met `const` in the lecture on variables. A constant is fixed at compile time and can never be assigned to again:

```csharp
const int MaxAttempts = 3;
const double Pi = 3.14159;
const string AppName = "Assay";
```

- The value must be known at compile time: a literal, or an expression of constants.
- Constants are named in **PascalCase**.
- A constant can be declared inside a method, or on the class, where every method can use it:

```csharp
class Program
{
    const int VatPercent = 20;

    static int WithVat(int price)
    {
        return price + price * VatPercent / 100;
    }
    // ...
}
```

Changing the value is a one-line edit, and the compiler rejects any attempt to assign to it.

## Enums

An **enum** (enumeration) is a type with a fixed set of named values:

```csharp
enum Level
{
    Low,
    Medium,
    High
}
```

Use it as a type:

```csharp
Level level = Level.High;
Console.WriteLine(level);   // High
```

Compare this with using the numbers `0`, `1` and `2` or the strings `"low"`, `"medium"` and `"high"`: with an enum a typo does not compile, the editor suggests the possible values, and the meaning is in the name.

## Numbers behind the names

Each name has an underlying `int`. By default the first is `0` and every next one is larger by one. You can set the numbers yourself:

```csharp
enum Weekday
{
    Monday = 1,
    Tuesday,      // 2
    Wednesday,    // 3
    Thursday,     // 4
    Friday,       // 5
    Saturday,     // 6
    Sunday        // 7
}
```

A **cast** converts between the enum and the number:

```csharp
Console.WriteLine((int)Weekday.Friday);   // 5
Weekday day = (Weekday)3;
Console.WriteLine(day);                   // Wednesday
```

A cast does not check that the number is valid: `(Weekday)42` compiles and gives a value without a name, which prints as `42`.

## Where to declare

Put an enum on the class level, next to the methods (as a nested type), or outside any class. It cannot be declared inside a method. Enum names are singular **PascalCase** nouns, such as `Level` or `OrderStatus`, and so are their members.

## When to use which

- **`const`** for a single value that must not change: a rate, a limit, a title.
- **`enum`** when a value must be one of a small, known set: a day, a level, a state of an order.

You will use enums with the `switch` statement in the module on branching, which makes it easy to handle every case.
