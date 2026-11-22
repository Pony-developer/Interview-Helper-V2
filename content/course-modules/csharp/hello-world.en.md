Here is the smallest useful C# program:

```csharp
using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, world!");
    }
}
```

Line by line:

- `using System;` lets you write `Console` instead of the full name `System.Console`. Namespaces group related types, and `using` imports one.
- `class Program { ... }` declares a class. In C# all code lives inside types, even when a program is a single method.
- `static void Main()` is the **entry point**: the runtime calls `Main` when the program starts. `void` means it returns nothing.
- `Console.WriteLine("Hello, world!");` prints the text and moves to a new line. Every statement ends with a semicolon.

## Write and WriteLine

```csharp
Console.Write("Hello, ");
Console.Write("world");
Console.WriteLine("!");
Console.WriteLine("Next line");
```

prints

```text
Hello, world!
Next line
```

`Write` stays on the same line; `WriteLine` adds a line break after the text.

## Things that trip people up

- C# is **case-sensitive**: `console.writeline` is not the same as `Console.WriteLine` and will not compile.
- Text goes in double quotes. Single quotes are for one character: `'a'`.
- `//` starts a comment that runs to the end of the line. `/* ... */` can span lines.

## From source code to a running program

The **compiler** reads your source code, checks it and turns it into an intermediate language (IL). The **runtime** (.NET or Mono) then executes that IL. If the compiler finds an error, it reports it with a line number and nothing runs at all.
