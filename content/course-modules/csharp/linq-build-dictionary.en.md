Write two methods that work with a dictionary from each word to its length:

- `LengthIndex(string[] words)`: returns a `Dictionary<string, int>` that maps each **distinct** word to its length. A word that appears twice is put in the dictionary once (a dictionary cannot hold a key twice);
- `HasWord(Dictionary<string, int> index, string word)`: returns `true` if the word is a key of the dictionary.

Do not change `Main`. Expected output:

```text
3
5
3
True
False
```

The lines in order: the number of entries (`pear`, `fig`, `apple`, with the second `pear` ignored); the length of `apple`; the length of `fig`; whether `pear` is in the index; and whether `kiwi` is.

Hint: `words.Distinct().ToDictionary(w => w, w => w.Length)` does the whole job in one line. A loop with `if (!dict.ContainsKey(w))` works too.
