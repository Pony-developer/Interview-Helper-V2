`NullReferenceException` is the most common exception in C#. Its root cause is that any variable of a reference type may hold `null`, and the type does not say whether it is expected. **Nullable reference types** (C# 8) let the type say it.

## Turning it on

In the project file (new projects have it by default):

```xml
<Nullable>enable</Nullable>
```

or in one file: `#nullable enable`. After that:

- `string` means "never null";
- `string?` means "may be null".

```csharp
string name = null;          // warning CS8600: null into a non-nullable variable
string? nickname = null;     // fine

Console.WriteLine(nickname.Length);   // warning CS8602: possible null dereference

if (nickname != null)
    Console.WriteLine(nickname.Length);   // fine: the compiler knows it is not null here
```

The compiler follows the flow of the code: after a check for `null`, after `is not null`, after an assignment, it knows which variables are safe.

For a class, a non-nullable property must get a value in the constructor, or you get warning CS8618. `required` or a default value solve it.

## Only a compile-time check

Unlike `int?`, which is a real different type (`Nullable<int>`), `string?` and `string` are **the same type** at run time. The feature only produces **warnings**. Code that ignores them, code without the feature, or data from JSON and databases can still put `null` where `string` is declared. So public methods still validate their arguments.

Many teams turn the warnings into errors: `<WarningsAsErrors>nullable</WarningsAsErrors>`.

## Operators that help

```csharp
int? length = user?.Address?.City?.Length;   // ?. stops at the first null and gives null
string city = user?.Address?.City ?? "unknown";   // ?? gives a fallback for null
cache ??= new Dictionary<string, int>();          // ??= assigns only if it is null
string sure = FindName()!;                        // ! "I know it is not null": silences the warning
```

The `!` operator (null-forgiving) does nothing at run time: it only turns off the warning. Each `!` is a promise you have to keep, so use it rarely.

## Attributes for the analysis

Sometimes the compiler cannot see the logic, and attributes from `System.Diagnostics.CodeAnalysis` tell it:

```csharp
public bool TryFind(int id, [NotNullWhen(true)] out User? user) { ... }

if (TryFind(5, out var user))
    Console.WriteLine(user.Name);   // no warning: true means user is not null
```

Others: `[MaybeNull]`, `[NotNull]`, `[MemberNotNull(nameof(field))]`.

## Turning it on in an old project

Enable it file by file with `#nullable enable`, starting from the code with the fewest dependencies, and fix the warnings as you go.

## The rule

Write `?` where `null` is a valid value and nowhere else; let the compiler find the places where you forgot a check; still validate arguments of public methods, because the check exists only at compile time.
