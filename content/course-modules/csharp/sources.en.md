No developer remembers everything. What matters is knowing where to look and reading what you find carefully.

## The official documentation

- **[C# documentation](https://learn.microsoft.com/dotnet/csharp/)** on Microsoft Learn: tutorials, the language guide and the language reference.
- **[.NET API browser](https://learn.microsoft.com/dotnet/api/)**: every class and method in the standard library, with examples. Search for `Console.WriteLine` or `Math.Round` and read the overloads and remarks.

## Compiler messages

A compiler error has a code, a position and a message:

```text
prog.cs(7,19): error CS0029: Cannot implicitly convert type `string' to `int'
```

- `prog.cs(7,19)` is line 7, column 19.
- `CS0029` is the error code. Search for it: the documentation has a page for every code, with typical causes and fixes.
- Fix the **first** error first. One mistake, such as a missing semicolon, often causes several follow-up errors that disappear with it.

## Q&A sites and search

- **Stack Overflow** answers most beginner questions already. Check the date and the votes, and prefer answers that explain *why*.
- Search in English, with the exact error text or code and the word "C#".

## Asking for help

When you ask someone, include the code, the exact error and what you expected to happen. Writing that down often answers the question by itself.
