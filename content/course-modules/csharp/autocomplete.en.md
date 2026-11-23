When you type in a search box, the program suggests words that start with what you have typed. With a dictionary of a million words, scanning the whole list on every keystroke would be too slow. But if the words are **sorted**, all the words with a given prefix form **one block**, and binary search finds the start of it in O(log n).

You get a sorted array of words, in the **ordinal order** (compare by character codes, `string.CompareOrdinal`). Implement two methods:

- `Suggestions(sortedWords, prefix, limit)`: a `List<string>` with **at most `limit`** words that start with `prefix`, in the sorted order. Find the first candidate with a **binary search** (the lower bound of the prefix: the first word that is not smaller than the prefix), and then walk forward while the words still start with the prefix, and the limit is not reached.
- `CountWithPrefix(sortedWords, prefix)`: **how many** words start with `prefix`, **without walking over them**. All such words are in the range between the lower bound of `prefix` and the lower bound of `prefix + "￿"`, because the character `￿` is larger than any ordinary character, so `prefix + "￿"` is just past the whole block. The answer is the difference of the two bounds.

Use `string.CompareOrdinal(a, b)`: it returns a negative number when `a` comes before `b`. To test for a prefix, use `word.StartsWith(prefix, StringComparison.Ordinal)`.

An empty prefix matches every word.

`Main` uses a dictionary of 20 words, and for each prefix prints `[prefix] count: suggestions`. Do not change `Main`. Expected output:

```text
[ba] 10: banana band bandana bar bark
[bar] 3: bar bark barn
[cat] 4: cat catalog
[z] 0:
[] 20: apple apply apricot
[app] 2: apple apply
[bat] 3: bat
```

The suggestions are limited (5, 10, 2, 3, 3, 5 and 1 words), but the count is always the total, for example, 10 words start with `ba`.

Hint: write one helper `LowerBound(words, key)`, a binary search with `string.CompareOrdinal`, and build both methods on it. The complexity is **O(log n)** for the search, plus **O(limit)** for collecting the suggestions, and **O(log n)** for the count, however large the dictionary is.
