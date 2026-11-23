Operators make code short, and short code can be hard to read. A good rule: **overload an operator only when it means exactly what the reader expects**.

## Good candidates

- **Value types with arithmetic:** `Vector + Vector`, `Money + Money`, `Fraction * Fraction`. Readers expect `+` to mean addition here.
- **Comparisons for an order:** `<` and `>` for a type with a natural order, such as a date or a version number. Usually `IComparable` is enough, and the operators are a convenience.
- **Equality of a value object:** `==` for a `Point` or an `Address`, so that `a == b` means "the same value".

## Bad candidates

- **Operators with unclear meaning:** `a + b` for two `Report` objects. Does it merge them, or add the page counts? Use a method with a name: `Merge`, `Combine`.
- **Operators that change their operands:** `a += b` should not change `b`, and `a + b` must not change `a`. Readers do not expect side effects from an arithmetic symbol.
- **Operators for collections:** `list + item` looks like arithmetic but usually means "add". Use `Add`.
- **Operators that throw surprising exceptions:** dividing by a zero fraction is expected, but a `+` that throws for valid inputs is not.

## A test question

Before you write an operator, ask: "If someone reads `a OP b` in the code, will they guess the result without reading the operator's code?" If not, write a method.

## Consistency rules

- If your type has `==`, it should also have a matching `Equals` and `GetHashCode` (see the lecture about `Equals`).
- Keep the pairs complete: `==` with `!=`, and `<` with `>`.
- Operators must not throw for input that the method's name would accept.

## Language note

The C# standard library uses operators sparingly. `string` has `==` and `+`, and `DateTime` has `+` and `-`. Those examples are the model: the meaning is obvious, and the result is a new value.
