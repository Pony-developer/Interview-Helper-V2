## Task

Count word frequencies across many documents **in parallel**.

Implement **`WordCount.Top(documents, n)`**:

1. Use `Parallel.ForEach` over the documents.
2. Split each document into words: runs of letters, lower-cased (`char.IsLetter`, `char.ToLowerInvariant`); everything else is a separator.
3. Count with a shared **`ConcurrentDictionary<string, int>`** using the atomic `AddOrUpdate(word, 1, (_, c) => c + 1)`. (A plain `Dictionary` here would corrupt itself; `d[w] = d[w] + 1` on a `ConcurrentDictionary` would lose updates.)
4. After the loop, return the top `n` entries as `"word=count"`, ordered by count **descending**, then by word (ordinal) to break ties.

Expected output:

```
the=1600
dog=800
fox=800
lazy=800
quick=700
```
