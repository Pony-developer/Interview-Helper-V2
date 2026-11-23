A compile error means the compiler could not understand your code, so it produced no program at all. This is the best kind of mistake: you find out immediately, and the compiler tells you where.

## Reading a message

```text
prog.cs(7,19): error CS0103: The name 'Course' does not exist in the current context
```

- `prog.cs(7,19)`: file, line 7, column 19.
- `error`: it blocks the build. A **warning** does not (more on that below).
- `CS0103`: a stable error code. The wording of the message can differ between compilers, but the code stays the same, and searching for it leads to a documentation page.

The reported position is where the compiler **noticed** the problem, which is sometimes a line later than where you made it. For a missing semicolon, look at the end of the **previous** line.

## Fix the first error first

One mistake can make the compiler misread everything after it and report a dozen errors. Fix the **first** one, recompile, and look again. Often most of the others vanish.

## The errors you will meet most often

| Code | Typical message | Usual cause |
| --- | --- | --- |
| `CS1002` | `; expected` | a forgotten semicolon |
| `CS1026` | `) expected` | an unclosed parenthesis |
| `CS1513` | `} expected` | an unclosed brace |
| `CS0103` | the name does not exist in the current context | a typo in a variable name, different letter case, or use outside its scope |
| `CS0117`, `CS1061` | type does not contain a definition for `X` | a typo in a method name: `Console.Writeline` instead of `Console.WriteLine` |
| `CS0246` | type or namespace name could not be found | a typo in a type name, or a missing `using` |
| `CS0029` | cannot implicitly convert type | a value of the wrong type, such as a `string` assigned to an `int` |
| `CS0165` | use of unassigned local variable | the variable is read before it receives a value |
| `CS0161` | not all code paths return a value | a method with a return type that can end without `return` |
| `CS1501`, `CS7036` | wrong number of arguments | the call does not match the method's parameters |

Remember that C# is **case-sensitive**: `Console.writeline`, `console.WriteLine` and `Console.WriteLine` are three different names.

## Warnings

A warning means "this compiles, but it looks suspicious":

```csharp
int unused = 5;   // warning CS0219: assigned but its value is never used
```

Do not ignore warnings. They often point to a real mistake, such as a variable you meant to use. A clean build with zero warnings is a good habit.

## Habits that prevent compile errors

- Write a little, compile, repeat. A single new error is easy to locate; fifty new lines make it hard.
- Let the editor help: it underlines errors in red as you type and suggests names.
- Close every `(`, `{` and `"` as soon as you open it.
- Keep the formatting tidy. Correct indentation makes a missing brace visible.
