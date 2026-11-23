Write `Describe(object item)`, which returns a description of any object. Use **type patterns** with `is` (`item is Circle c`), which check the type and give you a typed variable at once, instead of `as` and casts.

| The item | The description |
|---|---|
| `null` | `nothing` |
| a `Circle` with radius 0 | `a point` |
| any other `Circle` | `circle with radius R` |
| a `Rectangle` with equal sides | `square with side W` |
| any other `Rectangle` | `rectangle W x H` |
| a negative `int` | `negative number` |
| any other `int` | `number N` |
| a `string` | `text of length L` |
| anything else | `unknown: ` and the name of its type (`item.GetType().Name`) |

Do not change `Main` or the classes. Expected output:

```text
circle with radius 1
a point
square with side 2
rectangle 2 x 3
number 42
negative number
text of length 5
nothing
unknown: Double
```

Hint: `if (item is Circle c)` is true only for a non-null `Circle`, and inside the `if` the variable `c` already has the type `Circle`. Give every pattern variable its own name (`c`, `r`, `n`, `s`).

In modern C# (8 and later) the same method is one switch expression: `Circle { Radius: 0 } => "a point"`, `Circle c => ...`, `int n when n < 0 => ...`. The practice compiler (Mono) does not support patterns in `switch` yet, so here you use `is`.
