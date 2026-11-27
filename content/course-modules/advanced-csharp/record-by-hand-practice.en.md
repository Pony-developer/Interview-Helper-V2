## Task

This practice runs on C# 7.3, which has no `record` keyword. Write by hand what the compiler would generate for

```csharp
public record Money(decimal Amount, string Currency);
```

Add to the `Money` class:

1. **`WithAmount(decimal amount)`**: a new `Money` with a different amount and the same currency (the `with` expression).
2. **`Deconstruct(out decimal amount, out string currency)`**.
3. **`Equals(Money other)`** (from `IEquatable<Money>`) and **`Equals(object obj)`**: equal when both Amount and Currency are equal; `false` for null.
4. **`GetHashCode()`**: combine both fields so that equal objects have equal hash codes.
5. **`operator ==` and `operator !=`**: null-safe. Careful: inside them, writing `left == null` would call your own operator recursively. Use `ReferenceEquals(left, null)`.
6. **`ToString()`** in record style: `Money { Amount = 10, Currency = EUR }`.

Expected output:

```
Money { Amount = 10, Currency = EUR }
Money { Amount = 25, Currency = EUR }
a == b: True, same object: False
a.Equals(c): False, a != c: True
hash equal: True
null == null: True, a == null: False
distinct: 2
EUR 25
```
