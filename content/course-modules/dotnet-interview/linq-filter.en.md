## Task

Two LINQ tasks from the Senior list. Use LINQ — the point is to write them concisely and correctly.

1. **`Filter(IEnumerable<int> collection, int n)`** returns the elements divisible by `n` without a remainder, sorted **from largest to smallest**, as a `List<int>` (that is the signature from the article). Edge cases: `0` is divisible by any `n`; negative numbers work with `%` too (`-4 % 2 == 0`); `n == 0` would throw `DivideByZeroException` inside the lambda — validate it up front and throw `ArgumentException` instead.

2. **`UniqueWords(string text)`** builds a new collection from a source one: the **distinct** words of the text, case-insensitive and returned in lower case, ordered by **length** and then **alphabetically**. A word is a run of letters a–z; everything else (spaces, punctuation) separates words. Use `OrderBy(...).ThenBy(...)`.

Expected output:

```
15 12 9 6 3
2 0 -2 -4
[]
ArgumentException
dog fox the lazy over brown jumps quick sleeps
```
