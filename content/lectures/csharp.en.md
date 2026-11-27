---
skill: csharp
title: "C# for interviews: the questions that always come up"
summary: "Value and reference types, boxing, classes vs structs vs records, interfaces and abstract classes, virtual/override/new, generics and constraints, delegates and events, exceptions, and modern pattern matching."
readingMinutes: 9
---

C# interviews start with the type system and object model, because almost every later question (performance, LINQ, async) depends on them. This lecture covers the ground a Junior or Middle candidate is expected to explain without notes.

## Value types and reference types

A **value type** (`int`, `double`, `bool`, `DateTime`, any `struct` or `enum`) holds its data directly. Assigning it copies the whole value. A **reference type** (`class`, `string`, arrays, delegates, `record`) holds a reference to an object on the managed heap. Assigning it copies the reference, so both variables see the same object.

```csharp
var a = new Point(1, 2);   // struct
var b = a; b.X = 10;       // a.X is still 1

var p = new Person("Ann"); // class
var q = p; q.Name = "Bob"; // p.Name is now "Bob"
```

"Value types live on the stack" is only half true: a value-type field of a class lives inside that object on the heap.

**Boxing** wraps a value type in an object on the heap (`object o = 42;`); **unboxing** copies it back (`int i = (int)o;`). Each box is an allocation, so boxing in a hot loop (non-generic `ArrayList`, `string.Format` with value types in old code) costs memory and GC time. Generics avoid it.

## class, struct, record

| | `class` | `struct` | `record` / `record struct` |
|---|---|---|---|
| Kind | reference | value | reference / value |
| Equality | by reference | by fields (slow reflection unless overridden) | by value, generated |
| Inheritance | yes | no | records: only from records |
| Typical use | entities, services | small immutable values | DTOs, messages, value objects |

Make structs small and immutable (`readonly struct`), otherwise copies surprise you. Records add `with` expressions: `var older = person with { Age = 31 };`.

## Interfaces vs abstract classes

An **interface** is a contract: a class can implement many. Since C# 8 it can carry default method implementations, but no instance state. An **abstract class** can hold fields, constructors and shared logic, and a class inherits only one. Rule of thumb: interface for a capability (`IComparable`, `IDisposable`), abstract base class for a family that shares code.

## virtual, override, new

`virtual` lets a derived class `override` a method, and the call is dispatched by the **runtime** type. `new` *hides* the base member instead: the call is resolved by the **compile-time** type of the variable. `sealed override` stops further overriding.

```csharp
Base b = new Derived();
b.Virt();   // Derived.Virt (override)
b.Hidden(); // Base.Hidden  (new hides, no polymorphism)
```

## Generics and constraints

Generics give type safety without boxing. Constraints say what `T` can do: `where T : class`, `struct`, `new()`, a base class, or an interface (`where T : IComparable<T>`). Variance applies to interfaces and delegates only: `out T` is covariant (`IEnumerable<string>` is an `IEnumerable<object>`), `in T` is contravariant (`Action<object>` works as `Action<string>`).

## Delegates, lambdas and events

A **delegate** is a type-safe reference to a method; `Func<>`, `Action<>` and `Predicate<>` cover most needs. A lambda that uses an outer variable **captures** it (a closure): the variable is shared, not copied. An **event** is a delegate that outside code can only `+=` and `-=`, so subscribers can't invoke it or wipe the list. Forgetting to unsubscribe from a long-lived publisher is a classic memory leak.

## Exceptions

Catch specific exceptions and only where you can handle them. `throw;` rethrows and **keeps** the stack trace; `throw ex;` resets it. `finally` always runs (except when the process dies). Exception filters (`catch (HttpRequestException e) when (e.StatusCode == 404)`) decide without unwinding the stack. Don't use exceptions for normal control flow; `TryParse` patterns exist for a reason.

## Modern C# worth mentioning

- **Nullable reference types**: `string?` vs `string`, with compiler warnings instead of `NullReferenceException` at runtime.
- **Pattern matching**: `switch` expressions, property patterns (`order is { Total: > 100, Status: Status.Paid }`), relational and list patterns.
- `using var` declarations, file-scoped namespaces, primary constructors, collection expressions (`int[] xs = [1, 2, 3];`).

## Interview checklist

- Explain value vs reference types with an assignment example, and where boxing happens.
- Pick between class, struct and record, and justify it.
- Show the difference between `override` and `new` with a base-typed variable.
- Know `throw;` vs `throw ex;` and what an exception filter is for.
- Explain a closure capture bug and an event-subscription leak.
