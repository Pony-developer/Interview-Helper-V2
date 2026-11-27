## Task

"Implement your own `Select`, `Where` and `SelectMany` with LINQ characteristics: deferred execution and eager validation of arguments."

Complete the three extension methods of `MyLinq` without using `System.Linq`:

- **`MySelect`** projects each element with `selector`.
- **`MyWhere`** keeps the elements for which `predicate` returns `true`.
- **`MySelectMany`** flattens: for each element it yields every item of `selector(element)`.

Requirements, exactly like the real LINQ operators:

1. **Deferred execution**: nothing is read from `source` until the result is enumerated, and elements flow through one at a time (streaming). The test prints how many source items were produced after building the query (must be `0`) and then the interleaving of `yield` and `got` lines.
2. **Eager argument validation**: a `null` source or delegate throws `ArgumentNullException` **at the call**, before anything is enumerated. The test calls the methods without enumerating the result.

Hint: an iterator method (`yield return`) runs none of its body until the first `MoveNext()`, including argument checks. Split each operator into a public method that validates and a private iterator that does the work.

Expected output:

```
after building the query: 0 items produced
yield 1, yield 2, got 20, yield 3, yield 4, got 40
a b c d e
Select, null source: ArgumentNullException
Where, null predicate: ArgumentNullException
SelectMany, null selector: ArgumentNullException
```
