Write two methods that count how often each word occurs:

- `Frequency(string[] words)`: returns a `Dictionary<string, int>` from each word to the number of times it appears. Use `GroupBy`, then turn the groups into a dictionary;
- `MostCommon(string[] words)`: returns the word that appears most often. For a tie, the alphabetically first word wins.

Do not change `Main`. Expected output:

```text
3
2
3
a
```

The lines in order: the count of `a` (three times); the count of `b` (twice); the number of distinct words (`a`, `b`, `c`); and the most common word, `a`.

Hint: `words.GroupBy(w => w).ToDictionary(g => g.Key, g => g.Count())` builds the frequency table. For `MostCommon`, sort the dictionary entries by value, descending, and then by key: `OrderByDescending(kv => kv.Value).ThenBy(kv => kv.Key).First().Key`.
