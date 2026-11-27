## The billion-dollar mistake, mitigated

`NullReferenceException` is the most common runtime error in C#. **Nullable reference types** (C# 8) let the compiler track which references may be null and warn you before the program runs.

Enable them per project or per file:

```xml
<Nullable>enable</Nullable>
```

```csharp
#nullable enable
```

New .NET 6 projects have it on by default.

## The two annotations

```csharp
string name = "Ann";      // non-nullable: should never be null
string? nickname = null;  // nullable: may be null

Console.WriteLine(name.Length);       // fine
Console.WriteLine(nickname.Length);   // warning CS8602: possible null dereference
if (nickname != null)
    Console.WriteLine(nickname.Length);   // fine: the compiler knows it isn't null here
```

The compiler performs **flow analysis**: after a null check, an `is not null` pattern, `??=`, or an assignment from a non-null value, it knows the variable is safe.

```csharp
string name = null;   // warning CS8600: converting null to a non-nullable type
```

## It's only compile time

`string` and `string?` are the **same type** at run time. Nothing is checked or enforced when the program runs. A non-nullable parameter can still receive `null` from code compiled without the feature, from reflection or from deserialization, so public APIs should keep their argument checks (`ArgumentNullException.ThrowIfNull`).

## The null-forgiving operator

```csharp
string s = FindName()!;   // "I know better: it isn't null here"
```

`!` only silences the warning. Use it rarely, where the compiler can't see what you know (after a check in another method, for example). Overusing it throws the feature away.

## Helping the analysis with attributes

When a method's null behavior depends on its result, tell the compiler:

```csharp
public static bool TryFind(int id, [NotNullWhen(true)] out Customer? customer) { ... }

if (TryFind(5, out var c))
    Console.WriteLine(c.Name);   // no warning: c is non-null when the method returns true

[return: NotNullIfNotNull("input")]
public static string? Normalize(string? input) => input?.Trim();

public static void ThrowIfNull([NotNull] object? value) { ... }   // after the call, value isn't null
```

Others: `[MaybeNull]`, `[AllowNull]`, `[DisallowNull]`, `[MemberNotNull]`, `[DoesNotReturn]`.

## Generics and nullability

```csharp
T? FirstOrNothing<T>(IEnumerable<T> items) where T : class => ...;   // T? is a nullable reference
T? Find<T>(...)                                                     // C# 9: unconstrained T? means "default may be returned"
where T : notnull                                                    // T must not be nullable
```

## Migrating a codebase

1. Turn the feature on file by file (`#nullable enable`) or project-wide with warnings, not errors.
2. Annotate public APIs first: parameters and return values are the contract.
3. Fix warnings by real checks, by making things nullable, or by initializing fields in constructors. Use `!` as a last resort.
4. Consider `<WarningsAsErrors>nullable</WarningsAsErrors>` once the code is clean.

## Interview takeaways

- `string?` vs `string` is a compile-time contract; nothing changes at run time.
- Flow analysis tracks null checks; attributes like `[NotNullWhen]` teach it about your APIs.
- `!` suppresses a warning; it doesn't make a value non-null.
