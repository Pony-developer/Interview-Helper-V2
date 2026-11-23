A lot of code moves **data**: requests, responses, messages, coordinates. For such types you want value equality, a readable `ToString`, and immutability. Writing all of that by hand for a class takes dozens of lines. A **record** (C# 9) gets it in one:

```csharp
public record Person(string Name, int Age);
```

The compiler generates:

- a constructor `Person(string Name, int Age)`;
- `init`-only properties `Name` and `Age`;
- **value equality**: `Equals`, `GetHashCode`, `==` and `!=` compare all the fields;
- `ToString()`: `Person { Name = Ann, Age = 30 }`;
- `Deconstruct`: `var (name, age) = person;`;
- support for the `with` expression.

```csharp
var ann = new Person("Ann", 30);
var same = new Person("Ann", 30);
Console.WriteLine(ann == same);          // True: the values are equal
Console.WriteLine(ReferenceEquals(ann, same)); // False: two objects

var older = ann with { Age = 31 };       // a copy with one property changed
Console.WriteLine(ann.Age);              // 30: the original did not change
```

`with` is **non-destructive mutation**: instead of changing an object, you create a changed copy. This makes records safe to share between threads and to use as dictionary keys.

## Record class and record struct

- `record` or `record class` is a **reference** type with value equality.
- `record struct` (C# 10) is a value type with the same conveniences. Its properties are mutable unless you write `readonly record struct`.

```csharp
public readonly record struct Money(decimal Amount, string Currency);
```

## Traps

**Collections inside records compare by reference.** `record Order(int Id, List<string> Items)`: two orders with equal lists of items are **not** equal, because `List<T>` itself has reference equality.

**`with` makes a shallow copy.** The copy and the original share the same list object.

**Records can inherit only from records.** Equality also checks the exact type, so a `Student` record is never equal to a `Person` record with the same fields.

## When to use what

| Type | Use for |
|---|---|
| `class` | objects with identity and behaviour that change over time: services, entities tracked by Entity Framework |
| `record` | immutable data: DTOs, API requests and responses, messages, events, value objects |
| `struct` / `record struct` | small values (up to about 16 bytes) that are copied: points, money, ranges |

## The rule

When a type is mostly data and two objects with the same data should be equal, make it a record. Keep it immutable, and change it with `with`.
